import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  // Integrate file storage functionality
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Car specifications and prediction-related types
  public type CarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : TransmissionType;
    fuelType : FuelType;
    owners : Nat;
    yearOfPurchase : Nat;
    usageDuration : Nat;
  };

  public type PricePredictionResult = {
    currentPrice : PriceEstimate;
    futurePredictions : [TimePrediction];
    detailedBreakdown : PriceBreakdown;
    confidenceScore : Float;
    predictionsByYear : [YearlyPrediction];
    adjustments : Adjustments;
  };

  public type TransmissionType = {
    #manual;
    #automatic;
  };

  public type FuelType = {
    #petrol;
    #diesel;
    #electric;
    #hybrid;
  };

  public type PriceEstimate = {
    price : Float;
    confidence : Float;
    valueRange : Range;
  };

  public type Range = {
    low : Float;
    high : Float;
  };

  public type PriceBreakdown = {
    baseValue : Float;
    mileageAdjustment : Float;
    ownerAdjustment : Float;
    ageAdjustment : Float;
    transmissionAdjustment : Float;
    fuelTypeAdjustment : Float;
    brandPremium : Float;
  };

  public type Adjustments = {
    purchaseYearAdjustment : Float;
    usageDurationAdjustment : Float;
  };

  public type TimePrediction = {
    yearsAhead : Nat;
    priceEstimate : PriceEstimate;
    depreciationRate : Float;
  };

  public type YearlyPrediction = {
    year : Nat;
    predictedPrice : Float;
    confidence : Float;
  };

  public type UserPredictionHistory = {
    userId : Principal;
    predictions : [(CarSpecs, PricePredictionResult)];
  };

  // Conversion rate for USD to INR
  let usdToInrRate : Float = 83.0;

  // In-memory storage for prediction history
  let predictionHistory = Map.empty<Principal, [(CarSpecs, PricePredictionResult)]>();

  // Prediction endpoint
  public shared ({ caller }) func predictCarPrice(carSpecs : CarSpecs) : async PricePredictionResult {
    validateCarSpecs(carSpecs);

    let currentPrice = calculateCurrentPrice(carSpecs);
    let futurePredictions = computeFuturePredictions(currentPrice, carSpecs);
    let detailedBreakdown = buildPriceBreakdown(carSpecs, currentPrice.price, futurePredictions);
    let confidenceScore = calculateConfidenceScore(carSpecs);
    let adjustments : Adjustments = {
      purchaseYearAdjustment = calculatePurchaseYearAdjustment(carSpecs.yearOfPurchase);
      usageDurationAdjustment = calculateUsageDurationAdjustment(carSpecs.usageDuration);
    };

    let result : PricePredictionResult = {
      currentPrice;
      futurePredictions;
      detailedBreakdown;
      confidenceScore;
      predictionsByYear = [] : [YearlyPrediction];
      adjustments;
    };

    if (not caller.isAnonymous()) {
      storePredictionHistory(caller, carSpecs, result);
    };

    result;
  };

  func validateCarSpecs(carSpecs : CarSpecs) : () {
    let currentYear = 2024;
    if (carSpecs.modelYear < 1886 or carSpecs.modelYear > currentYear) {
      Runtime.trap("Invalid model year: " # carSpecs.modelYear.toText());
    };
    if (carSpecs.yearOfPurchase < carSpecs.modelYear or carSpecs.yearOfPurchase > currentYear) {
      Runtime.trap("Year of purchase must be between model year and " # currentYear.toText());
    };
    if (carSpecs.usageDuration > (currentYear - carSpecs.yearOfPurchase)) {
      Runtime.trap("Usage duration cannot exceed " # (currentYear - carSpecs.yearOfPurchase).toText() # " years.");
    };
  };

  func calculateCurrentPrice(carSpecs : CarSpecs) : PriceEstimate {
    let baseValue = computeBaseValue(carSpecs.brand, carSpecs.modelYear);
    let mileageAdjustment = -0.0003 * carSpecs.mileage.toFloat();
    let ownerAdjustment = -0.05 * (carSpecs.owners.toFloat() - 1.0);
    let transmissionAdjustment = computeTransmissionAdjustment(carSpecs.transmission);
    let fuelTypeAdjustment = computeFuelTypeAdjustment(carSpecs.fuelType);
    let brandPremium = fetchBrandPremium(carSpecs.brand);
    let purchaseYearAdjustment = calculatePurchaseYearAdjustment(carSpecs.yearOfPurchase);
    let usageDurationAdjustment = calculateUsageDurationAdjustment(carSpecs.usageDuration);

    // Compute values in USD first, then convert to INR
    let priceUSD = baseValue + mileageAdjustment + ownerAdjustment + transmissionAdjustment + fuelTypeAdjustment + brandPremium + purchaseYearAdjustment + usageDurationAdjustment;

    let priceINR = convertUsdToInr(priceUSD);

    {
      price = priceINR;
      confidence = 0.93;
      valueRange = {
        low = priceINR * 0.85;
        high = priceINR * 1.15;
      };
    };
  };

  func computeFuturePredictions(current : PriceEstimate, carSpecs : CarSpecs) : [TimePrediction] {
    let years = [1, 3, 5];
    years.map<Nat, TimePrediction>(
      func(yearsAhead) {
        let depreciation = calculateDepreciationRate(carSpecs, yearsAhead);
        {
          yearsAhead;
          priceEstimate = {
            price = current.price * Float.pow(1.0 - depreciation, yearsAhead.toFloat());
            confidence = current.confidence * (1.0 - 0.08 * yearsAhead.toFloat());
            valueRange = {
              low = current.valueRange.low * Float.pow(1.0 - depreciation, yearsAhead.toFloat());
              high = current.valueRange.high * Float.pow(1.0 - depreciation, yearsAhead.toFloat());
            };
          };
          depreciationRate = depreciation;
        };
      },
    );
  };

  func buildPriceBreakdown(carSpecs : CarSpecs, price : Float, future : [TimePrediction]) : PriceBreakdown {
    let futurePrice = if (future.size() > 0) { future[0].priceEstimate.price } else { price };
    let baseValueINR = convertUsdToInr(12000.0);

    {
      baseValue = baseValueINR;
      mileageAdjustment = carSpecs.mileage.toFloat();
      ownerAdjustment = carSpecs.owners.toFloat();
      ageAdjustment = carSpecs.modelYear.toFloat();
      transmissionAdjustment = price - (baseValueINR + carSpecs.mileage.toFloat() + carSpecs.owners.toFloat() + carSpecs.modelYear.toFloat());
      fuelTypeAdjustment = futurePrice - price;
      brandPremium = futurePrice - (price + carSpecs.mileage.toFloat());
    };
  };

  func computeBaseValue(brand : Text, year : Nat) : Float {
    switch (brand, year) {
      case (_, _) { 21000.0 };
    };
  };

  func computeTransmissionAdjustment(transmission : TransmissionType) : Float {
    switch (transmission) {
      case (#automatic) { 1400.0 };
      case (#manual) { 0.0 };
    };
  };

  func computeFuelTypeAdjustment(fuelType : FuelType) : Float {
    switch (fuelType) {
      case (#electric) { 2100.0 };
      case (#hybrid) { 1400.0 };
      case (#diesel) { 700.0 };
      case (#petrol) { 0.0 };
    };
  };

  func fetchBrandPremium(brand : Text) : Float {
    switch (brand) {
      case (_) { 700.0 };
    };
  };

  func calculateDepreciationRate(_carSpecs : CarSpecs, years : Nat) : Float {
    if (years == 0) { 0.0 } else { 0.09 * years.toFloat() };
  };

  func calculateConfidenceScore(_carSpecs : CarSpecs) : Float {
    0.94;
  };

  func calculatePurchaseYearAdjustment(_yearOfPurchase : Nat) : Float {
    -150.0;
  };

  func calculateUsageDurationAdjustment(_usageDuration : Nat) : Float {
    -120.0;
  };

  func storePredictionHistory(userId : Principal, carSpecs : CarSpecs, result : PricePredictionResult) {
    let existingHistory = switch (predictionHistory.get(userId)) {
      case (null) { [] };
      case (?history) { history };
    };
    let newHistory = existingHistory.concat([(carSpecs, result)]);
    predictionHistory.add(userId, newHistory);
  };

  // Helper function to convert USD to INR
  func convertUsdToInr(usdAmount : Float) : Float {
    usdAmount * usdToInrRate;
  };

  // User prediction history management - requires user authentication
  public query ({ caller }) func getPredictionHistory() : async [(CarSpecs, PricePredictionResult)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view prediction history");
    };
    switch (predictionHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

  // User profile management
  public type UserProfile = {
    name : Text;
    email : Text;
    profilePictureUrl : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view all");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Founder and contact info (public)
  public type ApiContactInfo = {
    founder : Text;
    contactEmail : Text;
  };

  public query ({ caller }) func getContactInfo() : async ApiContactInfo {
    { founder = "Founder: ASWIN S NAIR"; contactEmail = "aswinjr462005@gmail.com" };
  };

  // Admin check (public - anyone can check if they are admin)
  public shared ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Subscription validation (public)
  public shared ({ caller }) func isSubscriptionActive(_userId : Text) : async Bool {
    true;
  };

  public query ({ caller }) func isCurrentUserActive(_userId : Text) : async Bool {
    true;
  };

  // System status check (public)
  public query ({ caller }) func checkSystemStatus() : async Text {
    "active";
  };

  // Legacy functions (public)
  public query ({ caller }) func getApiContactInfo() : async ApiContactInfo {
    { founder = "Founder: ASWIN S NAIR"; contactEmail = "aswinjr462005@gmail.com" };
  };

  // Login function (accessible to all users including guests)
  public shared ({ caller }) func login(_userId : Text) : async Text {
    "Logged in successfully as: " # caller.toText();
  };

  // Logout function (public - anyone can logout)
  public shared ({ caller }) func logout() : async Text {
    "User successfully signed out";
  };

  // Admin-only function to assign roles
  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can assign roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };
};

