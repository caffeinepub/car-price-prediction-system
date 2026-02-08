import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Array "mo:core/Array";

module {
  type OldCarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : TransmissionType;
    fuelType : FuelType;
    owners : Nat;
  };

  type NewCarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : TransmissionType;
    fuelType : FuelType;
    owners : Nat;
    yearOfPurchase : Nat;
    usageDuration : Nat;
  };

  type TransmissionType = {
    #manual;
    #automatic;
  };

  type FuelType = {
    #petrol;
    #diesel;
    #electric;
    #hybrid;
  };

  type OldPricePredictionResult = {
    currentPrice : PriceEstimate;
    futurePredictions : [TimePrediction];
    detailedBreakdown : PriceBreakdown;
    confidenceScore : Float;
    predictionsByYear : [YearlyPrediction];
  };

  type NewPricePredictionResult = {
    currentPrice : PriceEstimate;
    futurePredictions : [TimePrediction];
    detailedBreakdown : PriceBreakdown;
    confidenceScore : Float;
    predictionsByYear : [YearlyPrediction];
    adjustments : Adjustments;
  };

  type PriceEstimate = {
    price : Float;
    confidence : Float;
    valueRange : Range;
  };

  type Range = {
    low : Float;
    high : Float;
  };

  type PriceBreakdown = {
    baseValue : Float;
    mileageAdjustment : Float;
    ownerAdjustment : Float;
    ageAdjustment : Float;
    transmissionAdjustment : Float;
    fuelTypeAdjustment : Float;
    brandPremium : Float;
  };

  type Adjustments = {
    purchaseYearAdjustment : Float;
    usageDurationAdjustment : Float;
  };

  type TimePrediction = {
    yearsAhead : Nat;
    priceEstimate : PriceEstimate;
    depreciationRate : Float;
  };

  type YearlyPrediction = {
    year : Nat;
    predictedPrice : Float;
    confidence : Float;
  };

  type OldActor = {
    predictionHistory : Map.Map<Principal, [(OldCarSpecs, OldPricePredictionResult)]>;
  };

  type NewActor = {
    predictionHistory : Map.Map<Principal, [(NewCarSpecs, NewPricePredictionResult)]>;
  };

  public func run(old : OldActor) : NewActor {
    let newPredictionHistory = old.predictionHistory.map<Principal, [(OldCarSpecs, OldPricePredictionResult)], [(NewCarSpecs, NewPricePredictionResult)]>(
      func(_principal, oldEntries) {
        oldEntries.map<(OldCarSpecs, OldPricePredictionResult), (NewCarSpecs, NewPricePredictionResult)>(
          func((oldCarSpecs, oldPredictionResult)) {
            let newCarSpecs : NewCarSpecs = {
              oldCarSpecs with
              yearOfPurchase = oldCarSpecs.modelYear;
              usageDuration = 0;
            };
            let adjustments : Adjustments = {
              purchaseYearAdjustment = 0.0;
              usageDurationAdjustment = 0.0;
            };
            let newPredictionResult : NewPricePredictionResult = {
              oldPredictionResult with
              adjustments;
            };
            (newCarSpecs, newPredictionResult);
          }
        );
      }
    );
    { predictionHistory = newPredictionHistory };
  };
};
