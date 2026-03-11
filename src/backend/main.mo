import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import List "mo:core/List";
import Time "mo:core/Time";

// Add migration import for upgrade


// Use migration for upgrades

actor {
  // Integrate file storage functionality
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Updated Attendance record to include present and leaving time as options
  public type AttendanceRecord = {
    id : Nat;
    name : Text;
    presentTime : ?Time.Time;
    leavingTime : ?Time.Time;
    status : AttendanceStatus;
  };

  public type AttendanceStatus = {
    #present;
    #late;
    #absent;
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

  public type CarSpecs = {
    brand : Text;
    modelYear : Nat;
    mileage : Nat;
    transmission : TransmissionType;
    fuelType : FuelType;
    owners : Nat;
    yearOfPurchase : Nat;
    usageDuration : Nat;
    photos : ?[Storage.ExternalBlob];
    purchasePrice : ?Float;
    serviceHistory : ?ServiceHistory;
    location : ?Text;
    insuranceDetails : ?InsuranceInfo;
  };

  public type ServiceHistory = {
    lastServiceDate : ?Time.Time;
    serviceRecords : ?[ServiceRecord];
  };

  public type ServiceRecord = {
    date : Time.Time;
    description : Text;
    cost : Float;
  };

  public type InsuranceInfo = {
    provider : Text;
    policyNumber : Text;
    expirationDate : Time.Time;
  };

  public type PricePredictionResult = {
    currentPrice : PriceEstimate;
    futurePredictions : [TimePrediction];
    detailedBreakdown : PriceBreakdown;
    confidenceScore : Float;
    predictionsByYear : [YearlyPrediction];
    adjustments : Adjustments;
    priceFactors : PriceFactors;
    recommendationScore : Float;
  };

  public type PriceFactors = {
    brandTierWeight : Float;
    yearDepreciation : Float;
    mileageImpact : Float;
    fuelTypePremium : Float;
    transmissionFactor : Float;
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

  let predictionHistory = Map.empty<Principal, [(CarSpecs, PricePredictionResult)]>();

  let brandPriceBrackets : [(Text, (Float, Float))] = [
    ("Toyota", (8000.0, 30000.0)), // USD
    ("Honda", (8500.0, 28000.0)),
    ("Ford", (7000.0, 27000.0)),
    ("BMW", (20000.0, 80000.0)),
    ("Hyundai", (6000.0, 25000.0)),
    ("Tata", (5000.0, 22000.0)),
    ("Suzuki", (5500.0, 23000.0)),
    ("Volkswagen", (9000.0, 32000.0)),
    ("Kia", (7500.0, 26000.0)),
    ("Toyota", (8500.0, 28000.0)),
    ("Renault", (6500.0, 24000.0)),
    ("Chevrolet", (7000.0, 26000.0)),
    ("Mazda", (8000.0, 27000.0)),
    ("Skoda", (9000.0, 28000.0)),
  ];

  public shared ({ caller }) func predictCarPriceWithAdvancedFactors(carSpecs : CarSpecs) : async PricePredictionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can predict car prices");
    };

    validateCarSpecs(carSpecs);

    let brandTierWeight = computeBrandTierWeight(carSpecs.brand, carSpecs.modelYear);
    let yearDepreciation = calculateYearDepreciation(carSpecs.modelYear);
    let mileageImpact = calculateMileageImpact(carSpecs.mileage, carSpecs.transmission);
    let fuelTypePremium = calculateFuelTypePremium(carSpecs.fuelType);
    let transmissionFactor = calculateTransmissionFactor(carSpecs.transmission);

    let futurePredictions = computeFuturePredictions(carSpecs, brandTierWeight);
    let predictedPrice = calculateWeightedPrice(brandTierWeight, yearDepreciation, mileageImpact, fuelTypePremium, transmissionFactor);
    let priceRange = {
      low = predictedPrice * 0.93;
      high = predictedPrice * 1.07;
    };

    let confidenceScore = computeCombinedConfidence(brandTierWeight, yearDepreciation, fuelTypePremium);

    let priceFactors : PriceFactors = {
      brandTierWeight;
      yearDepreciation;
      mileageImpact;
      fuelTypePremium;
      transmissionFactor;
    };

    let result : PricePredictionResult = {
      currentPrice = {
        price = predictedPrice;
        confidence = confidenceScore;
        valueRange = priceRange;
      };
      futurePredictions;
      detailedBreakdown = buildPriceBreakdown(carSpecs, predictedPrice, futurePredictions);
      confidenceScore;
      predictionsByYear = [] : [YearlyPrediction];
      adjustments = {
        purchaseYearAdjustment = 0.0;
        usageDurationAdjustment = 0.0;
      };
      priceFactors;
      recommendationScore = calculateRecommendationScore(carSpecs, confidenceScore, futurePredictions);
    };

    storePredictionHistory(caller, carSpecs, result);

    result;
  };

  func storePredictionHistory(userId : Principal, carSpecs : CarSpecs, result : PricePredictionResult) {
    let existingHistory = switch (predictionHistory.get(userId)) {
      case (null) { [] };
      case (?history) { history };
    };
    let newHistory = existingHistory.concat([(carSpecs, result)]);
    predictionHistory.add(userId, newHistory);
  };

  func validateCarSpecs(carSpecs : CarSpecs) : () {
    let currentYear = 2024;
    if (carSpecs.modelYear < 1886 or carSpecs.modelYear > currentYear) {
      Runtime.trap("Invalid model year: " # carSpecs.modelYear.toText());
    };
    if (carSpecs.yearOfPurchase < carSpecs.modelYear or carSpecs.yearOfPurchase > currentYear) {
      Runtime.trap("Year of purchase must be between model year and " # currentYear.toText());
    };

    let allowedDuration = (currentYear - carSpecs.yearOfPurchase : Nat);
    if (carSpecs.usageDuration > allowedDuration) {
      Runtime.trap("Usage duration cannot exceed " # allowedDuration.toText() # " years.");
    };
  };

  func computeBrandTierWeight(brand : Text, modelYear : Nat) : Float {
    for (entry in brandPriceBrackets.values()) {
      let (b, range) = entry;
      if (Text.equal(b, brand)) {
        let ageFactor = 1.0 - (2024.0 - modelYear.toFloat()) / 25.0;
        let baseUsd = range.0 + (range.1 - range.0) * ageFactor;
        return convertUsdToInr(baseUsd);
      };
    };
    // Default to lowest range if brand not present, and older year
    let defaultOldAgeFactor = 0.25;
    convertUsdToInr(8000.0 * defaultOldAgeFactor);
  };

  func calculateWeightedPrice(b : Float, y : Float, m : Float, f : Float, t : Float) : Float {
    let weights = {
      b = 0.30;
      y = 0.15;
      m = 0.18;
      f = 0.1;
      t = 0.20;
    };

    let total = b * weights.b + y * weights.y + m * weights.m + f * weights.f + t * weights.t;
    let fallbackOldAgeFactor = 0.18;
    if (total <= 0) {
      return 150000.0 * fallbackOldAgeFactor;
    };
    total;
  };

  func calculateYearDepreciation(modelYear : Nat) : Float {
    let currentYear = 2024;
    let age = currentYear - modelYear;
    if (age <= 0) { 0.0 }
    else if (age < 5) { 0.04 }
    else if (age < 10) { 0.07 }
    else { 0.13 };
  };

  func calculateMileageImpact(mileage : Nat, trans : TransmissionType) : Float {
    let base = if (mileage <= 30000) {
      0.0;
    } else if (mileage <= 100000) {
      ((mileage - 30000).toFloat() / 1000.0) * 650.0;
    } else if (mileage <= 200000) {
      let midRangeImpact = ((100000.0 - 30000.0) / 1000.0) * 650.0;
      let highRangeImpact = ((mileage - 100000).toFloat() / 10000.0) * 2000.0;
      highRangeImpact + midRangeImpact;
    } else {
      ((mileage - 200000).toFloat() / 10000.0) * 4000.0;
    };
    base * improveTransmissionWeight(trans);
  };

  func improveTransmissionWeight(trans : TransmissionType) : Float {
    switch (trans) {
      case (#automatic) { 1.2 };
      case (#manual) { 1.4 };
    };
  };

  func calculateFuelTypePremium(fuelType : FuelType) : Float {
    // Brand-level INR improvements
    switch (fuelType) {
      case (#electric) { 55000.0 };
      case (#hybrid) { 36000.0 };
      case (#diesel) { 17500.0 };
      case (#petrol) { 0.0 };
    };
  };

  func calculateTransmissionFactor(transmission : TransmissionType) : Float {
    let basePremium = switch (transmission) {
      case (#automatic) { 21000.0 };
      case (#manual) { 0.0 };
    };

    // Mild depreciation
    let mileagePenalty = 15000.0;
    basePremium - mileagePenalty;
  };

  func computeFuturePredictions(_carSpecs : CarSpecs, brandTierWeight : Float) : [TimePrediction] {
    let timePoints = List.fromArray<Nat>([1, 3, 5]);

    timePoints.map<Nat, TimePrediction>(
      func(yearsAhead) {
        let depreciation = calculateDepreciationRate(yearsAhead);
        {
          yearsAhead;
          priceEstimate = {
            price = brandTierWeight * Float.pow(1.0 - depreciation, yearsAhead.toFloat());
            confidence = 0.75 * (1.0 - 0.08 * yearsAhead.toFloat());
            valueRange = {
              low = brandTierWeight * Float.pow(1.0 - depreciation, yearsAhead.toFloat()) * 0.82;
              high = brandTierWeight * Float.pow(1.0 - depreciation, yearsAhead.toFloat()) * 1.12;
            };
          };
          depreciationRate = depreciation;
        };
      }
    ).toArray();
  };

  func calculateDepreciationRate(years : Nat) : Float {
    if (years == 0) { 0.0 } else { 0.10 * years.toFloat() };
  };

  func computeCombinedConfidence(brandTierWeight : Float, yearDepreciation : Float, fuelTypePremium : Float) : Float {
    let adjustedBrandWeight = Float.min(brandTierWeight, 400000.0) / 12000.0;
    0.80 + adjustedBrandWeight + (0.15 - (yearDepreciation + fuelTypePremium) * 0.2);
  };

  // Helper function to convert USD to INR
  func convertUsdToInr(usdAmount : Float) : Float {
    usdAmount * usdToInrRate;
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

  func calculateRecommendationScore(carSpecs : CarSpecs, confidenceScore : Float, futurePredictions : [TimePrediction]) : Float {
    let baseScore = 0.50 + (carSpecs.modelYear.toFloat() - 2019.0) * 0.12;
    let finalScore = baseScore + carSpecs.owners.toFloat() * 0.07 + carSpecs.mileage.toFloat() * 0.02 + Float.min(confidenceScore, 0.95);
    if (futurePredictions.size() > 2) {
      finalScore * 0.8;
    } else {
      finalScore;
    };
  };

  public query ({ caller }) func getPredictionHistory() : async [(CarSpecs, PricePredictionResult)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view prediction history");
    };
    switch (predictionHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

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

  public type ApiContactInfo = {
    founder : Text;
    contactEmail : Text;
  };

  public query ({ caller }) func getContactInfo() : async ApiContactInfo {
    { founder = "Founder: ASWIN S NAIR"; contactEmail = "aswinjr462005@gmail.com" };
  };

  public shared ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func isSubscriptionActive(_userId : Text) : async Bool {
    true;
  };

  public query ({ caller }) func isCurrentUserActive(_userId : Text) : async Bool {
    true;
  };

  public query ({ caller }) func checkSystemStatus() : async Text {
    "active";
  };

  public query ({ caller }) func getApiContactInfo() : async ApiContactInfo {
    { founder = "Founder: ASWIN S NAIR"; contactEmail = "aswinjr462005@gmail.com" };
  };

  public shared ({ caller }) func login(_userId : Text) : async Text {
    "Logged in successfully as: " # caller.toText();
  };

  public shared ({ caller }) func logout() : async Text {
    "User successfully signed out";
  };

  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can assign roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Attendance System
  let registeredFaces = Map.empty<Text, Text>(); // personId -> name
  var nextAttendanceId = 1;
  let attendanceRecords = Map.empty<Principal, [AttendanceRecord]>();

  // Register a new face/human - requires authenticated user
  public shared ({ caller }) func registerFace(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register faces");
    };
    if (name.isEmpty()) {
      Runtime.trap("Name cannot be empty for face registration");
    };
    registeredFaces.add(name, name);
  };

  // Mark present time - requires authenticated user, must be called first
  public shared ({ caller }) func markPresent(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark attendance");
    };
    if (name.isEmpty()) {
      Runtime.trap("Name cannot be empty");
    };

    switch (registeredFaces.get(name)) {
      case (null) {
        Runtime.trap("Face not registered. Please register before marking attendance.");
      };
      case (?_) {
        let attendanceId = nextAttendanceId;

        let record : AttendanceRecord = {
          id = attendanceId;
          name;
          presentTime = ?Time.now();
          leavingTime = null;
          status = #present;
        };

        let currentRecords = attendanceRecords.get(caller);
        let newRecordArray = switch (currentRecords) {
          case (null) { [record] };
          case (?records) { [record].concat(records) };
        };
        attendanceRecords.add(caller, newRecordArray);
        nextAttendanceId += 1;
      };
    };
  };

  // Mark leaving time - requires authenticated user, must be called after present time
  public shared ({ caller }) func markLeaving(recordId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark leaving time");
    };

    let currentRecords = attendanceRecords.get(caller);
    switch (currentRecords) {
      case (null) { Runtime.trap("No attendance records found for user") };
      case (?records) {
        let updatedRecords = records.map(
          func(record) {
            if (record.id == recordId and record.leavingTime == null) {
              { record with leavingTime = ?Time.now() };
            } else {
              record;
            };
          }
        );
        attendanceRecords.add(caller, updatedRecords);
      };
    };
  };

  // Retrieve all attendance records for the caller - requires authenticated user
  public query ({ caller }) func getAttendanceRecords() : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance records");
    };
    switch (attendanceRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };
};
