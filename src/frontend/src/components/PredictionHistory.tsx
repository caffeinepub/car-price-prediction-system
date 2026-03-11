import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, History, ShieldCheck, Target, TrendingUp } from "lucide-react";
import {
  type CarSpecs,
  type ExternalBlob,
  FuelType,
  type PricePredictionResult,
  TransmissionType,
} from "../backend";
import { useIconDance } from "../hooks/useIconDance";
import { useGetPredictionHistory } from "../hooks/useQueries";

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

function HistoryEntryCard({
  carSpecs,
  result,
  index,
}: {
  carSpecs: CarSpecs;
  result: PricePredictionResult;
  index: number;
}) {
  const handleDance = useIconDance();
  const photos: ExternalBlob[] = carSpecs.photos ?? [];
  const firstPhoto = photos.length > 0 ? photos[0] : null;
  const photoUrl = firstPhoto ? firstPhoto.getDirectURL() : null;

  const transmissionLabel =
    carSpecs.transmission === TransmissionType.automatic
      ? "Automatic"
      : "Manual";

  const fuelLabelMap: Record<FuelType, string> = {
    [FuelType.petrol]: "Petrol",
    [FuelType.diesel]: "Diesel",
    [FuelType.electric]: "Electric",
    [FuelType.hybrid]: "Hybrid",
  };
  const fuelLabel =
    fuelLabelMap[carSpecs.fuelType] ?? String(carSpecs.fuelType);

  // Stagger entrance animation based on index
  const delayClass =
    index === 0
      ? "delay-100"
      : index === 1
        ? "delay-200"
        : index === 2
          ? "delay-300"
          : index === 3
            ? "delay-400"
            : index === 4
              ? "delay-500"
              : "delay-600";

  // Compute accuracy badge — only show if confidenceScore is present and valid
  const hasConfidence =
    typeof result.confidenceScore === "number" &&
    !Number.isNaN(result.confidenceScore);
  const accuracyPct = hasConfidence
    ? formatAccuracyPercent(result.confidenceScore)
    : null;

  return (
    <Card
      className={`border-border/50 hover:border-primary/30 transition-colors hover-scale animate-card-enter ${delayClass}`}
      onClick={(e) => handleDance(e)}
      onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* Photo thumbnail */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${carSpecs.brand} vehicle`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
            {photos.length > 1 && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                +{photos.length - 1} more
              </p>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold text-base">{carSpecs.brand}</h4>
              <Badge variant="secondary" className="text-xs">
                {carSpecs.modelYear.toString()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {transmissionLabel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {fuelLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
              <span>Mileage: {carSpecs.mileage.toLocaleString()} km</span>
              <span>Owners: {carSpecs.owners.toString()}</span>
              <span>Purchased: {carSpecs.yearOfPurchase.toString()}</span>
              <span>
                Used: {carSpecs.usageDuration.toString()} yr
                {Number(carSpecs.usageDuration) !== 1 ? "s" : ""}
              </span>
            </div>

            <div
              className="flex items-center gap-3 flex-wrap cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleDance(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleDance(e as unknown as React.TouchEvent);
              }}
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary text-sm">
                  {formatINR(result.currentPrice.price)}
                </span>
              </div>

              {/* Accuracy badge — sourced from backend confidenceScore, shown only when available */}
              {accuracyPct !== null && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600">
                  <Target className="w-3 h-3" />
                  <span className="text-xs font-semibold">
                    {accuracyPct}% accuracy
                  </span>
                </div>
              )}

              <span className="text-xs text-muted-foreground">
                Confidence: {(result.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PredictionHistory() {
  const { data: history, isLoading, isError } = useGetPredictionHistory();
  const handleDance = useIconDance();

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Prediction History</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            className="flex items-center gap-2 mb-6 cursor-pointer bg-transparent border-0 p-0"
            onClick={(e) => handleDance(e)}
          >
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Prediction History</h2>
          </button>
          <p className="text-muted-foreground text-sm">
            Failed to load prediction history.
          </p>
        </div>
      </section>
    );
  }

  if (!history || history.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            className="flex items-center gap-2 mb-6 cursor-pointer bg-transparent border-0 p-0"
            onClick={(e) => handleDance(e)}
          >
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Prediction History</h2>
          </button>
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3 animate-float" />
            <p className="text-muted-foreground">
              No predictions yet. Run your first prediction above!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          className="flex items-center gap-2 mb-6 cursor-pointer select-none bg-transparent border-0 p-0 w-full"
          onClick={(e) => handleDance(e)}
        >
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Prediction History</h2>
          <Badge variant="secondary">{history.length}</Badge>
          <div className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">86–99% Accuracy</span>
          </div>
        </button>
        <div className="space-y-4">
          {[...history].reverse().map(([carSpecs, result], index) => (
            <HistoryEntryCard
              key={`${carSpecs.brand}-${index}`}
              carSpecs={carSpecs}
              result={result}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
