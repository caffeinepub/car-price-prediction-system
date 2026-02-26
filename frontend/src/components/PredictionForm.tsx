import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePredictCarPrice } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, TrendingUp, Calendar, Gauge, Settings, Fuel, Users, X, ArrowRight, Clock } from 'lucide-react';
import { CarSpecs, FuelType, TransmissionType } from '../backend';

interface PredictionFormProps {
  onClose: () => void;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
  'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Jeep', 'Ram', 'GMC', 'Dodge', 'Chrysler',
  'Buick', 'Cadillac', 'Tesla', 'Volvo', 'Porsche', 'Land Rover', 'Jaguar', 'Mini', 'Fiat',
  'Alfa Romeo', 'Maserati', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin',
  'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg', 'Lotus', 'Morgan', 'Caterham', 'TVR', 'Noble',
  'Acura', 'Infiniti', 'Genesis', 'Lincoln', 'Mitsubishi', 'Suzuki', 'Isuzu', 'Daihatsu',
  'Perodua', 'Proton', 'Tata', 'Mahindra', 'Maruti Suzuki', 'Skoda', 'Seat', 'Renault',
  'Peugeot', 'Citroën', 'Opel', 'Vauxhall', 'Dacia', 'Lada', 'UAZ', 'GAZ', 'ZAZ', 'Moskvitch',
  'Geely', 'BYD', 'Great Wall', 'Chery', 'JAC', 'Dongfeng', 'FAW', 'SAIC', 'Changan', 'Haval',
  'MG', 'Lynk & Co', 'Polestar', 'Rivian', 'Lucid', 'Fisker', 'Canoo', 'Lordstown', 'Nikola',
  'Bollinger', 'Karma', 'Faraday Future', 'Byton', 'NIO', 'Xpeng', 'Li Auto', 'WM Motor',
  'Aiways', 'Weltmeister', 'Seres', 'Arcfox', 'Voyah', 'Ora', 'Tank', 'Wey', 'Hongqi'
];

export function PredictionForm({ onClose }: PredictionFormProps) {
  const [brand, setBrand] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [yearOfPurchase, setYearOfPurchase] = useState('');
  const [usageDuration, setUsageDuration] = useState('');
  const [transmission, setTransmission] = useState<TransmissionType>(TransmissionType.automatic);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.petrol);
  const [owners, setOwners] = useState('');

  const predictMutation = usePredictCarPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand || !modelYear || !mileage || !yearOfPurchase || !usageDuration || !owners) {
      toast.error('Please fill in all fields');
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(modelYear);
    const mileageNum = parseInt(mileage);
    const purchaseYearNum = parseInt(yearOfPurchase);
    const usageDurationNum = parseInt(usageDuration);
    const ownersNum = parseInt(owners);

    if (yearNum < 1886 || yearNum > currentYear) {
      toast.error('Please enter a valid model year');
      return;
    }

    if (purchaseYearNum < yearNum || purchaseYearNum > currentYear) {
      toast.error(`Year of purchase must be between ${yearNum} and ${currentYear}`);
      return;
    }

    if (mileageNum < 0) {
      toast.error('Please enter a valid mileage');
      return;
    }

    if (usageDurationNum < 0) {
      toast.error('Usage duration must be 0 or greater');
      return;
    }

    const maxUsageDuration = currentYear - purchaseYearNum;
    if (usageDurationNum > maxUsageDuration) {
      toast.error(`Usage duration cannot exceed ${maxUsageDuration} years`);
      return;
    }

    if (ownersNum < 0) {
      toast.error('Please enter a valid number of owners');
      return;
    }

    const carSpecs: CarSpecs = {
      brand,
      modelYear: BigInt(yearNum),
      mileage: BigInt(mileageNum),
      yearOfPurchase: BigInt(purchaseYearNum),
      usageDuration: BigInt(usageDurationNum),
      transmission,
      fuelType,
      owners: BigInt(ownersNum),
    };

    try {
      await predictMutation.mutateAsync(carSpecs);
      toast.success('Price prediction completed!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to predict price. Please try again.');
    }
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="w-full max-w-6xl relative z-10">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="relative">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl font-bold text-center">Car Price Prediction</CardTitle>
            <CardDescription className="text-center text-base">
              Enter vehicle details to get current and future price estimates in Indian Rupees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Car Brand
                  </Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger id="brand" className="h-12">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CAR_BRANDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelYear" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Model Year
                  </Label>
                  <Input
                    id="modelYear"
                    type="number"
                    placeholder="e.g., 2020"
                    value={modelYear}
                    onChange={(e) => setModelYear(e.target.value)}
                    disabled={predictMutation.isPending}
                    className="h-12"
                    min="1886"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    Mileage (km)
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="e.g., 50000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    disabled={predictMutation.isPending}
                    className="h-12"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfPurchase" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Year of Purchase
                  </Label>
                  <Input
                    id="yearOfPurchase"
                    type="number"
                    placeholder="e.g., 2021"
                    value={yearOfPurchase}
                    onChange={(e) => setYearOfPurchase(e.target.value)}
                    disabled={predictMutation.isPending}
                    className="h-12"
                    min="1886"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usageDuration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Duration of Usage (Years)
                  </Label>
                  <Input
                    id="usageDuration"
                    type="number"
                    placeholder="e.g., 3"
                    value={usageDuration}
                    onChange={(e) => setUsageDuration(e.target.value)}
                    disabled={predictMutation.isPending}
                    className="h-12"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission" className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Transmission
                  </Label>
                  <Select value={transmission} onValueChange={(v) => setTransmission(v as TransmissionType)}>
                    <SelectTrigger id="transmission" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TransmissionType.manual}>Manual</SelectItem>
                      <SelectItem value={TransmissionType.automatic}>Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType" className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-primary" />
                    Fuel Type
                  </Label>
                  <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                    <SelectTrigger id="fuelType" className="h-12">
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

                <div className="space-y-2">
                  <Label htmlFor="owners" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Number of Owners
                  </Label>
                  <Input
                    id="owners"
                    type="number"
                    placeholder="e.g., 1"
                    value={owners}
                    onChange={(e) => setOwners(e.target.value)}
                    disabled={predictMutation.isPending}
                    className="h-12"
                    min="0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={predictMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6 gap-2"
                  size="lg"
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      Predict Price
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Results Display */}
              <div className="space-y-6">
                {predictMutation.data ? (
                  <>
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Current Estimated Price</h3>
                      </div>
                      <p className="text-4xl font-bold text-primary mb-2">
                        {formatINR(predictMutation.data.currentPrice.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(predictMutation.data.currentPrice.confidence * 100).toFixed(1)}%
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Range: {formatINR(predictMutation.data.currentPrice.valueRange.low)} - {formatINR(predictMutation.data.currentPrice.valueRange.high)}
                        </p>
                      </div>
                    </div>

                    {/* Vehicle Details Summary */}
                    <Card className="border-border/50 bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3 text-sm">Vehicle Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Year of Purchase</p>
                            <p className="font-medium">{yearOfPurchase}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Duration of Usage</p>
                            <p className="font-medium">{usageDuration} {parseInt(usageDuration) === 1 ? 'year' : 'years'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-accent" />
                        Future Price Predictions
                      </h3>
                      {predictMutation.data.futurePredictions.map((pred) => (
                        <Card key={pred.yearsAhead.toString()} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-lg">
                                  {pred.yearsAhead.toString()} Year{Number(pred.yearsAhead) > 1 ? 's' : ''}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Depreciation: {(pred.depreciationRate * 100).toFixed(1)}%
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-accent">
                                {formatINR(pred.priceEstimate.price)}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confidence: {(pred.priceEstimate.confidence * 100).toFixed(1)}%
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        Overall Confidence Score: {(predictMutation.data.confidenceScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div>
                      <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Enter vehicle details and click "Predict Price" to see results
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
