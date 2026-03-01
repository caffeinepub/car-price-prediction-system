import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type OldCarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : { #manual; #automatic };
    fuelType : { #petrol; #diesel; #electric; #hybrid };
    owners : Nat;
    yearOfPurchase : Nat;
    usageDuration : Nat;
  };

  type NewCarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : { #manual; #automatic };
    fuelType : { #petrol; #diesel; #electric; #hybrid };
    owners : Nat;
    yearOfPurchase : Nat;
    usageDuration : Nat;
    photos : ?[Storage.ExternalBlob];
  };

  type OldActor = {
    predictionHistory : Map.Map<Principal, [(OldCarSpecs, { currentPrice : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; futurePredictions : [{ yearsAhead : Nat; priceEstimate : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; depreciationRate : Float }]; detailedBreakdown : { baseValue : Float; mileageAdjustment : Float; ownerAdjustment : Float; ageAdjustment : Float; transmissionAdjustment : Float; fuelTypeAdjustment : Float; brandPremium : Float }; confidenceScore : Float; predictionsByYear : [{ year : Nat; predictedPrice : Float; confidence : Float }]; adjustments : { purchaseYearAdjustment : Float; usageDurationAdjustment : Float } })]>;
  };

  type NewActor = {
    predictionHistory : Map.Map<Principal, [(NewCarSpecs, { currentPrice : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; futurePredictions : [{ yearsAhead : Nat; priceEstimate : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; depreciationRate : Float }]; detailedBreakdown : { baseValue : Float; mileageAdjustment : Float; ownerAdjustment : Float; ageAdjustment : Float; transmissionAdjustment : Float; fuelTypeAdjustment : Float; brandPremium : Float }; confidenceScore : Float; predictionsByYear : [{ year : Nat; predictedPrice : Float; confidence : Float }]; adjustments : { purchaseYearAdjustment : Float; usageDurationAdjustment : Float } })]>;
  };

  public func run(old : OldActor) : NewActor {
    let newHistory = old.predictionHistory.map<Principal, [(OldCarSpecs, { currentPrice : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; futurePredictions : [{ yearsAhead : Nat; priceEstimate : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; depreciationRate : Float }]; detailedBreakdown : { baseValue : Float; mileageAdjustment : Float; ownerAdjustment : Float; ageAdjustment : Float; transmissionAdjustment : Float; fuelTypeAdjustment : Float; brandPremium : Float }; confidenceScore : Float; predictionsByYear : [{ year : Nat; predictedPrice : Float; confidence : Float }]; adjustments : { purchaseYearAdjustment : Float; usageDurationAdjustment : Float } })], [(NewCarSpecs, { currentPrice : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; futurePredictions : [{ yearsAhead : Nat; priceEstimate : { price : Float; confidence : Float; valueRange : { low : Float; high : Float } }; depreciationRate : Float }]; detailedBreakdown : { baseValue : Float; mileageAdjustment : Float; ownerAdjustment : Float; ageAdjustment : Float; transmissionAdjustment : Float; fuelTypeAdjustment : Float; brandPremium : Float }; confidenceScore : Float; predictionsByYear : [{ year : Nat; predictedPrice : Float; confidence : Float }]; adjustments : { purchaseYearAdjustment : Float; usageDurationAdjustment : Float } })]>(
      func(_key, oldList) {
        oldList.map(
          func((oldCarSpecs, prediction)) {
            ({ oldCarSpecs with photos = null }, prediction);
          }
        );
      }
    );
    { predictionHistory = newHistory };
  };
};
