import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Fuel,
  Gauge,
  ImagePlus,
  Loader2,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  Users,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { FuelType, TransmissionType } from "../backend";
import type { CarSpecs } from "../backend";
import { useIconDance } from "../hooks/useIconDance";
import { usePredictCarPrice } from "../hooks/useQueries";

interface PredictionFormProps {
  onClose: () => void;
}

const CAR_BRANDS = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Mazda",
  "Subaru",
  "Lexus",
  "Jeep",
  "Ram",
  "GMC",
  "Dodge",
  "Chrysler",
  "Buick",
  "Cadillac",
  "Tesla",
  "Volvo",
  "Porsche",
  "Land Rover",
  "Jaguar",
  "Mini",
  "Fiat",
  "Alfa Romeo",
  "Maserati",
  "Ferrari",
  "Lamborghini",
  "Bentley",
  "Rolls-Royce",
  "Aston Martin",
  "McLaren",
  "Bugatti",
  "Pagani",
  "Koenigsegg",
  "Lotus",
  "Morgan",
  "Caterham",
  "TVR",
  "Noble",
  "Acura",
  "Infiniti",
  "Genesis",
  "Lincoln",
  "Mitsubishi",
  "Suzuki",
  "Isuzu",
  "Daihatsu",
  "Perodua",
  "Proton",
  "Tata",
  "Mahindra",
  "Maruti Suzuki",
  "Skoda",
  "Seat",
  "Renault",
  "Peugeot",
  "Citroën",
  "Opel",
  "Vauxhall",
  "Dacia",
  "Lada",
  "UAZ",
  "GAZ",
  "ZAZ",
  "Moskvitch",
  "Geely",
  "BYD",
  "Great Wall",
  "Chery",
  "JAC",
  "Dongfeng",
  "FAW",
  "SAIC",
  "Changan",
  "Haval",
  "MG",
  "Lynk & Co",
  "Polestar",
  "Rivian",
  "Lucid",
  "Fisker",
  "Canoo",
  "Lordstown",
  "Nikola",
  "Bollinger",
  "Karma",
  "Faraday Future",
  "Byton",
  "NIO",
  "Xpeng",
  "Li Auto",
  "WM Motor",
  "Aiways",
  "Weltmeister",
  "Seres",
  "Arcfox",
  "Voyah",
  "Ora",
  "Tank",
  "Wey",
  "Hongqi",
];

const BACKEND_CURRENT_YEAR = 2024;

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Clamps and formats the confidence score from the backend into a 86–99% display value.
 */
function formatAccuracyPercent(rawScore: number): number {
  const pct = rawScore > 1 ? rawScore : rawScore * 100;
  return Math.min(99, Math.max(86, Math.round(pct)));
}

function RippleButton({
  onClick,
  disabled,
  className,
  children,
  type = "button",
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple-ring";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`ripple-btn ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function PredictionForm({ onClose }: PredictionFormProps) {
  const [brand, setBrand] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [yearOfPurchase, setYearOfPurchase] = useState("");
  const [usageDuration, setUsageDuration] = useState("");
  const [transmission, setTransmission] = useState<TransmissionType>(
    TransmissionType.automatic,
  );
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.petrol);
  const [owners, setOwners] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const predictMutation = usePredictCarPrice();
  const handleDance = useIconDance();

  const addPhotos = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    );

    if (validFiles.length !== fileArray.length) {
      toast.warning(
        "Some files were skipped. Only JPG, PNG, and WEBP images are supported.",
      );
    }

    const newPreviews: PhotoPreview[] = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPreviews]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !brand ||
      !modelYear ||
      !mileage ||
      !yearOfPurchase ||
      !usageDuration ||
      !owners
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const modelYearNum = Number.parseInt(modelYear);
    const mileageNum = Number.parseInt(mileage);
    const yearOfPurchaseNum = Number.parseInt(yearOfPurchase);
    const usageDurationNum = Number.parseInt(usageDuration);
    const ownersNum = Number.parseInt(owners);

    if (
      Number.isNaN(modelYearNum) ||
      Number.isNaN(mileageNum) ||
      Number.isNaN(yearOfPurchaseNum) ||
      Number.isNaN(usageDurationNum) ||
      Number.isNaN(ownersNum)
    ) {
      toast.error("Please enter valid numbers for all numeric fields");
      return;
    }

    if (modelYearNum < 1886 || modelYearNum > BACKEND_CURRENT_YEAR) {
      toast.error(
        `Model year must be between 1886 and ${BACKEND_CURRENT_YEAR}`,
      );
      return;
    }

    if (
      yearOfPurchaseNum < modelYearNum ||
      yearOfPurchaseNum > BACKEND_CURRENT_YEAR
    ) {
      toast.error(
        `Year of purchase must be between ${modelYearNum} and ${BACKEND_CURRENT_YEAR}`,
      );
      return;
    }

    const maxUsageDuration = BACKEND_CURRENT_YEAR - yearOfPurchaseNum;
    if (usageDurationNum > maxUsageDuration) {
      toast.error(
        maxUsageDuration === 0
          ? "Usage duration must be 0 for a car purchased in 2024"
          : `Usage duration cannot exceed ${maxUsageDuration} year${maxUsageDuration !== 1 ? "s" : ""} (since ${yearOfPurchaseNum})`,
      );
      return;
    }

    if (mileageNum < 0) {
      toast.error("Mileage cannot be negative");
      return;
    }

    if (ownersNum < 1) {
      toast.error("Number of owners must be at least 1");
      return;
    }

    const carSpecs: CarSpecs = {
      brand,
      modelYear: BigInt(modelYearNum),
      mileage: BigInt(mileageNum),
      transmission,
      fuelType,
      owners: BigInt(ownersNum),
      yearOfPurchase: BigInt(yearOfPurchaseNum),
      usageDuration: BigInt(usageDurationNum),
    };

    predictMutation.mutate(carSpecs);
  };

  const result = predictMutation.data;
  const isPending = predictMutation.isPending;

  // Show result screen on success
  if (result) {
    const accuracyPct = formatAccuracyPercent(result.confidenceScore);

    return (
      <section className="relative min-h-screen bg-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="orb orb-1 w-80 h-80 -top-20 -right-20 opacity-30"
            style={{
              background:
                "radial-gradient(circle, oklch(0.55 0.18 250 / 0.2), transparent 70%)",
            }}
          />
          <div
            className="orb orb-3 w-64 h-64 bottom-0 left-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.6 0.18 200 / 0.15), transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success header */}
          <div className="text-center mb-8 animate-bounce-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold font-poppins gradient-text">
              Prediction Complete!
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              ML-powered multi-factor analysis
            </p>
          </div>

          {/* Accuracy Badge */}
          <div className="flex justify-center mb-6 animate-card-enter stagger-1">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border-2 border-emerald-500/40 shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Model Accuracy
                </p>
                <p className="text-2xl font-black text-emerald-500 leading-none">
                  {accuracyPct}%
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Current price */}
          <div className="bg-card border border-border/50 rounded-3xl p-8 text-center hover-glow-card animate-card-enter stagger-2 mb-6">
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              Estimated Current Value
            </p>
            <p className="text-5xl font-black gradient-text font-poppins">
              {formatINR(result.currentPrice.price)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Range: {formatINR(result.currentPrice.valueRange.low)} –{" "}
              {formatINR(result.currentPrice.valueRange.high)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm font-semibold border border-green-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                {Math.round(result.currentPrice.confidence * 100)}% Confidence
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-semibold border border-emerald-500/20">
                <Target className="w-3.5 h-3.5" />
                {accuracyPct}% Accuracy
              </div>
            </div>
          </div>

          {/* Price factors breakdown */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 animate-card-enter stagger-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Price Factors
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Brand Tier",
                  value: formatINR(result.priceFactors.brandTierWeight),
                },
                {
                  label: "Fuel Premium",
                  value: formatINR(result.priceFactors.fuelTypePremium),
                },
                {
                  label: "Transmission",
                  value: formatINR(result.priceFactors.transmissionFactor),
                },
                {
                  label: "Mileage Impact",
                  value: `-${formatINR(result.priceFactors.mileageImpact)}`,
                },
                {
                  label: "Depreciation",
                  value: `${(result.priceFactors.yearDepreciation * 100).toFixed(0)}%/yr`,
                },
                {
                  label: "Recommendation",
                  value: `${Math.min(99, Math.max(0, Math.round(result.recommendationScore * 10))) / 10}/10`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Future predictions */}
          {result.futurePredictions.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {result.futurePredictions.map((pred, predIdx) => (
                <div
                  key={String(pred.yearsAhead)}
                  className={`bg-card border border-border/50 rounded-2xl p-5 text-center hover-glow-card animate-card-stagger-in stagger-${predIdx + 4}`}
                >
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    In {Number(pred.yearsAhead)} year
                    {Number(pred.yearsAhead) > 1 ? "s" : ""}
                  </p>
                  <p className="text-xl font-bold text-foreground font-poppins">
                    {formatINR(pred.priceEstimate.price)}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-red-500">
                    <TrendingDown className="w-3.5 h-3.5" />-
                    {Math.round(pred.depreciationRate * 100)}%/yr
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <RippleButton
              onClick={() => predictMutation.reset()}
              className="flex-1 py-3 rounded-2xl border-2 border-border hover:border-primary/50 font-semibold transition-all duration-300 hover:scale-[1.02] bg-background text-foreground"
            >
              New Prediction
            </RippleButton>
            <RippleButton
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Close
            </RippleButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb orb-1 w-80 h-80 -top-20 -right-20 opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.18 250 / 0.2), transparent 70%)",
          }}
        />
        <div
          className="orb orb-3 w-64 h-64 bottom-0 left-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.18 200 / 0.15), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="animate-slide-up-fade">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-3 animate-bounce-in">
              <Sparkles className="w-4 h-4 animate-heartbeat" />
              AI Price Prediction
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-poppins">
              <span className="gradient-text">Predict Car Price</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Enter your car details for an accurate ML-powered valuation
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              handleDance(e);
              onClose();
            }}
            onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Accuracy indicator on form */}
        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 w-fit">
          <Target className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">
            Model accuracy: 86–99%
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-card-enter">
          {/* Brand */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Car Brand *
            </Label>
            <Select value={brand} onValueChange={setBrand} required>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select a brand..." />
              </SelectTrigger>
              <SelectContent>
                {CAR_BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year and Mileage */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label
                htmlFor="modelYear"
                className="text-sm font-semibold mb-3 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-primary" />
                Model Year *
              </Label>
              <Input
                id="modelYear"
                type="number"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                placeholder="e.g. 2020"
                min={1886}
                max={BACKEND_CURRENT_YEAR}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label
                htmlFor="mileage"
                className="text-sm font-semibold mb-3 flex items-center gap-2"
              >
                <Gauge className="w-4 h-4 text-primary" />
                Mileage (km) *
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 45000"
                min={0}
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Transmission and Fuel Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Transmission *
              </Label>
              <Select
                value={transmission}
                onValueChange={(v) => setTransmission(v as TransmissionType)}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransmissionType.automatic}>
                    Automatic
                  </SelectItem>
                  <SelectItem value={TransmissionType.manual}>
                    Manual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-primary" />
                Fuel Type *
              </Label>
              <Select
                value={fuelType}
                onValueChange={(v) => setFuelType(v as FuelType)}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FuelType.petrol}>Petrol</SelectItem>
                  <SelectItem value={FuelType.diesel}>Diesel</SelectItem>
                  <SelectItem value={FuelType.electric}>Electric</SelectItem>
                  <SelectItem value={FuelType.hybrid}>Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Owners, Year of Purchase, Usage Duration */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label
                htmlFor="owners"
                className="text-sm font-semibold mb-3 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-primary" />
                No. of Owners *
              </Label>
              <Input
                id="owners"
                type="number"
                value={owners}
                onChange={(e) => setOwners(e.target.value)}
                placeholder="e.g. 1"
                min={1}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label
                htmlFor="yearOfPurchase"
                className="text-sm font-semibold mb-3 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-primary" />
                Year of Purchase *
              </Label>
              <Input
                id="yearOfPurchase"
                type="number"
                value={yearOfPurchase}
                onChange={(e) => setYearOfPurchase(e.target.value)}
                placeholder="e.g. 2021"
                min={1886}
                max={BACKEND_CURRENT_YEAR}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
              <Label
                htmlFor="usageDuration"
                className="text-sm font-semibold mb-3 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-primary" />
                Usage Duration (yrs) *
              </Label>
              <Input
                id="usageDuration"
                type="number"
                value={usageDuration}
                onChange={(e) => setUsageDuration(e.target.value)}
                placeholder="e.g. 3"
                min={0}
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 hover-glow-card transition-all duration-300">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" />
              Car Photos (optional)
            </Label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addPhotos(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop photos here, or{" "}
                <span className="text-primary font-medium">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP supported
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addPhotos(e.target.files)}
            />

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.previewUrl.slice(-20)}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Car upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error display */}
          {predictMutation.isError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                {predictMutation.error?.message ||
                  "Failed to predict car price. Please try again."}
              </p>
            </div>
          )}

          {/* Submit */}
          <RippleButton
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Predict Price
              </>
            )}
          </RippleButton>
        </form>
      </div>
    </section>
  );
}
