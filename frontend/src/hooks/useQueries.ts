import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { CarSpecs, UserProfile, AttendanceRecord } from '../backend';

// User Profile Hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Contact Info Hook
export function useGetContactInfo() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['contactInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

// Car Price Prediction Hook
export function usePredictCarPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carSpecs: CarSpecs) => {
      if (!actor) throw new Error('Actor not available');
      return actor.predictCarPriceWithAdvancedFactors(carSpecs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictionHistory'] });
      toast.success('Price prediction completed!');
    },
    onError: (error: Error) => {
      toast.error(`Prediction failed: ${error.message}`);
    },
  });
}

// Prediction History Hook
export function useGetPredictionHistory() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['predictionHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPredictionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

// Attendance Hooks

export function useRegisterFace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerFace(name);
    },
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      toast.success(`Face registered for "${name}"!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to register face: ${error.message}`);
    },
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markPresent(name);
    },
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      toast.success(`Attendance marked for "${name}"!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });
}

export function useMarkLeaving() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markLeaving(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      toast.success('Leaving time recorded!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark leaving: ${error.message}`);
    },
  });
}

export function useGetAttendanceRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceRecords();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}
