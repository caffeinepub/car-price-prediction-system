import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPredictionHistory } from '../hooks/useQueries';
import { CarSpecs, PricePredictionResult, ExternalBlob, FuelType, TransmissionType } from '../backend';
import { History, TrendingUp, Camera } from 'lucide-react';

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function HistoryEntryCard({
  carSpecs,
  result,
}: {
  carSpecs: CarSpecs;
  result: PricePredictionResult;
  index: number;
}) {
  const photos: ExternalBlob[] = carSpecs.photos ?? [];
  const firstPhoto = photos.length > 0 ? photos[0] : null;
  const photoUrl = firstPhoto ? firstPhoto.getDirectURL() : null;

  const transmissionLabel =
    carSpecs.transmission === TransmissionType.automatic ? 'Automatic' : 'Manual';

  const fuelLabelMap: Record<FuelType, string> = {
    [FuelType.petrol]: 'Petrol',
    [FuelType.diesel]: 'Diesel',
    [FuelType.electric]: 'Electric',
    [FuelType.hybrid]: 'Hybrid',
  };
  const fuelLabel = fuelLabelMap[carSpecs.fuelType] ?? String(carSpecs.fuelType);

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* Photo thumbnail */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${carSpecs.brand} photo`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
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
                {Number(carSpecs.usageDuration) !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary text-sm">
                  {formatINR(result.currentPrice.price)}
                </span>
              </div>
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
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Prediction History</h2>
          </div>
          <p className="text-muted-foreground text-sm">Failed to load prediction history.</p>
        </div>
      </section>
    );
  }

  if (!history || history.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Prediction History</h2>
          </div>
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No predictions yet. Run your first prediction above!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Prediction History</h2>
          <Badge variant="secondary">{history.length}</Badge>
        </div>
        <div className="space-y-4">
          {[...history].reverse().map(([carSpecs, result], index) => (
            <HistoryEntryCard
              key={index}
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
