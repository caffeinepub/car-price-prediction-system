import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from '../camera/useCamera';
import { useRegisterFace, useMarkAttendance, useMarkLeaving, useGetAttendanceRecords } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCheck, Camera, CameraOff, UserPlus, RefreshCw, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    faceapi: any;
  }
}

interface FaceDescriptor {
  name: string;
  descriptor: Float32Array;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

function formatTime(timeNs: bigint | undefined | null): string {
  if (timeNs == null) return '—';
  // Backend returns nanoseconds; convert to milliseconds
  const ms = Number(timeNs) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(timeNs: bigint | undefined | null): string {
  if (timeNs == null) return '—';
  const ms = Number(timeNs) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AttendanceMonitor() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [registeredFaces, setRegisteredFaces] = useState<FaceDescriptor[]>([]);
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [recentlyMarked, setRecentlyMarked] = useState<Set<string>>(new Set());

  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { videoRef, canvasRef, isActive, isLoading: cameraLoading, error: cameraError, startCamera, stopCamera } = useCamera({
    facingMode: 'user',
    width: 640,
    height: 480,
  });

  const registerFaceMutation = useRegisterFace();
  const markAttendanceMutation = useMarkAttendance();
  const markLeavingMutation = useMarkLeaving();
  const { data: attendanceRecords = [], refetch: refetchRecords } = useGetAttendanceRecords();

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) return;
      setModelsLoading(true);
      setModelError(null);

      try {
        // Load face-api.js script if not already loaded
        if (!window.faceapi) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector('script[data-faceapi]');
            if (existing) {
              const check = setInterval(() => {
                if (window.faceapi) { clearInterval(check); resolve(); }
              }, 100);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
            script.setAttribute('data-faceapi', 'true');
            script.onload = () => {
              const check = setInterval(() => {
                if (window.faceapi) { clearInterval(check); resolve(); }
              }, 100);
            };
            script.onerror = () => reject(new Error('Failed to load face-api.js'));
            document.head.appendChild(script);
          });
        }

        const faceapi = window.faceapi;
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err: any) {
        setModelError(err.message || 'Failed to load face recognition models');
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Start/stop detection loop
  useEffect(() => {
    if (!detectionActive || !isActive || !modelsLoaded) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    detectionIntervalRef.current = setInterval(async () => {
      await runDetection();
    }, 1500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [detectionActive, isActive, modelsLoaded, registeredFaces]);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const overlayCanvas = canvasOverlayRef.current;
    if (!video || !overlayCanvas || !window.faceapi || video.readyState < 2) return;

    const faceapi = window.faceapi;
    const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
    faceapi.matchDimensions(overlayCanvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = overlayCanvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      const resized = faceapi.resizeResults(detections, displaySize);

      for (const detection of resized) {
        const box = detection.detection.box;

        if (registeredFaces.length > 0) {
          const labeledDescriptors = registeredFaces.map(
            (f) => new faceapi.LabeledFaceDescriptors(f.name, [f.descriptor])
          );
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
          const match = faceMatcher.findBestMatch(detection.descriptor);

          const label = match.label;
          const isUnknown = label === 'unknown';
          const color = isUnknown ? '#ef4444' : '#22c55e';

          // Draw bounding box
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw label background
          ctx.fillStyle = color;
          const textWidth = ctx.measureText(label).width + 10;
          ctx.fillRect(box.x, box.y - 24, textWidth, 22);

          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px sans-serif';
          ctx.fillText(label, box.x + 5, box.y - 7);

          // Auto-mark attendance for recognized faces
          if (!isUnknown && !recentlyMarked.has(label)) {
            setLastDetected(label);
            setRecentlyMarked((prev) => new Set([...prev, label]));
            markAttendanceMutation.mutate(label, {
              onSettled: () => {
                // Allow re-marking after 30 seconds
                setTimeout(() => {
                  setRecentlyMarked((prev) => {
                    const next = new Set(prev);
                    next.delete(label);
                    return next;
                  });
                }, 30000);
              },
            });
          }
        } else {
          // No registered faces, just draw box
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        }
      }
    } catch {
      // Silently ignore detection errors
    }
  }, [registeredFaces, recentlyMarked, markAttendanceMutation, videoRef]);

  const handleRegisterFace = async () => {
    const trimmedName = registerName.trim();
    if (!trimmedName) {
      toast.error('Please enter a name');
      return;
    }
    if (!isActive) {
      toast.error('Please start the camera first');
      return;
    }
    if (!modelsLoaded) {
      toast.error('Face recognition models are still loading');
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      toast.error('Camera not ready');
      return;
    }

    setIsRegistering(true);
    try {
      const faceapi = window.faceapi;
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected. Please position your face in the camera.');
        return;
      }

      // Store descriptor locally for real-time matching
      setRegisteredFaces((prev) => [
        ...prev.filter((f) => f.name !== trimmedName),
        { name: trimmedName, descriptor: detection.descriptor },
      ]);

      // Register in backend
      await registerFaceMutation.mutateAsync(trimmedName);
      setRegisterName('');
      toast.success(`"${trimmedName}" registered successfully!`);
    } catch (err: any) {
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleToggleCamera = async () => {
    if (isActive) {
      setDetectionActive(false);
      await stopCamera();
    } else {
      const ok = await startCamera();
      if (ok) setDetectionActive(true);
    }
  };

  const handleMarkLeaving = (recordId: bigint) => {
    markLeavingMutation.mutate(recordId);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'late': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'absent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20">
            <UserCheck className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance Monitor</h1>
            <p className="text-sm text-muted-foreground">AI-powered face recognition attendance system</p>
          </div>
        </div>

        {/* Model loading status */}
        {modelsLoading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading face recognition models…
          </div>
        )}
        {modelError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {modelError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Panel */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video preview */}
              <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasOverlayRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center text-muted-foreground">
                      <CameraOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Camera is off</p>
                    </div>
                  </div>
                )}

                {isActive && detectionActive && lastDetected && (
                  <div className="absolute bottom-2 left-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded text-center">
                    ✓ Detected: {lastDetected}
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-red-400 text-xs">{cameraError.message}</p>
              )}

              {/* Camera controls */}
              <div className="flex gap-2">
                <Button
                  onClick={handleToggleCamera}
                  disabled={cameraLoading}
                  variant={isActive ? 'destructive' : 'default'}
                  className="flex-1"
                  size="sm"
                >
                  {cameraLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  ) : isActive ? (
                    <CameraOff className="w-4 h-4 mr-1" />
                  ) : (
                    <Camera className="w-4 h-4 mr-1" />
                  )}
                  {cameraLoading ? 'Starting…' : isActive ? 'Stop Camera' : 'Start Camera'}
                </Button>

                {isActive && (
                  <Button
                    onClick={() => setDetectionActive((v) => !v)}
                    variant="outline"
                    size="sm"
                    disabled={!modelsLoaded}
                  >
                    {detectionActive ? 'Pause Detection' : 'Start Detection'}
                  </Button>
                )}
              </div>

              {/* Register face */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Register New Face</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter full name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegisterFace()}
                    className="flex-1 text-sm"
                    disabled={isRegistering}
                  />
                  <Button
                    onClick={handleRegisterFace}
                    disabled={isRegistering || !isActive || !modelsLoaded || !registerName.trim()}
                    size="sm"
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    {isRegistering ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {registeredFaces.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {registeredFaces.map((f) => (
                      <span key={f.name} className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Panel */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Present</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {registeredFaces.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Registered</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {attendanceRecords.filter((r) => r.leavingTime != null).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Left</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-2xl font-bold text-amber-400">
                    {attendanceRecords.filter((r) => r.presentTime != null && r.leavingTime == null).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Still Present</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Detection Status</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${modelsLoaded ? 'bg-green-400' : modelsLoading ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-muted-foreground">
                    {modelsLoaded ? 'Models ready' : modelsLoading ? 'Loading models…' : 'Models not loaded'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="text-muted-foreground">{isActive ? 'Camera active' : 'Camera off'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${detectionActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-muted-foreground">{detectionActive ? 'Detection running' : 'Detection paused'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records Table */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-400" />
                Attendance Records
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetchRecords()}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No attendance records yet.</p>
                <p className="text-xs mt-1">Start the camera and register faces to begin tracking.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Present Time</TableHead>
                      <TableHead>Leaving Time</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={String(record.id)}>
                        <TableCell className="text-muted-foreground text-xs">{String(record.id)}</TableCell>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(record.presentTime)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {record.presentTime != null ? (
                            <span className="text-green-400 font-mono">{formatTime(record.presentTime)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {record.leavingTime != null ? (
                            <span className="text-blue-400 font-mono">{formatTime(record.leavingTime)}</span>
                          ) : (
                            <span className="text-amber-400 text-xs">Still Present</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.leavingTime == null ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => handleMarkLeaving(record.id)}
                              disabled={markLeavingMutation.isPending}
                            >
                              {markLeavingMutation.isPending ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <LogOut className="w-3 h-3 mr-1" />
                                  Mark Leaving
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Done</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
