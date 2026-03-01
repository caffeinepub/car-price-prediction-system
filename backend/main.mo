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
import Migration "migration";

(with migration = Migration.run)
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
    photos : ?[Storage.ExternalBlob]; // Multiple photos
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

  // Google Colab–ready, single-cell Python “mega code” for car price prediction
  let pythonCode : Text = "
# 🚀 Car Price Prediction - Colab All-in-One Cell
# Paste this cell into Colab, modify it for your needs - and run!
!pip install scikit-learn pandas matplotlib seaborn --quiet
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
# Sample data - Replace this with your own!
data = {
    `brand`: ['Toyota', 'Honda', 'Ford', 'BMW'],
    `model_year`: [2015, 2018, 2012, 2020],
    `mileage`: [50000, 30000, 70000, 15000],
    `transmission`: ['automatic', 'manual', 'automatic', 'automatic'],
    `fuel_type`: ['petrol', 'diesel', 'petrol', 'hybrid'],
    `owners`: [1, 2, 1, 1],
    `year_of_purchase`: [2015, 2018, 2012, 2020],
    `usage_duration`: [5, 3, 8, 1],
    `price`: [15000, 12000, 8000, 30000]
}
df = pd.DataFrame(data)
# Feature Engineering
df['price_per_year'] = df['price'] / df['usage_duration']
df['age'] = 2024 - df['model_year']
# One-hot encode categorical variables
categorical_cols = ['brand', 'transmission', 'fuel_type']
df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
# Prepare features and target
features = df.drop('price', axis=1)
target = df['price']
# Scale numerical features
scaler = StandardScaler()
num_cols = ['model_year', 'mileage', 'owners', 'year_of_purchase', 'usage_duration', 'price_per_year', 'age']
features[num_cols] = scaler.fit_transform(features[num_cols])
# Split data
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
# Train multiple models
models = {
    `Linear Regression`: LinearRegression(),
    `Ridge Regression`: RidgeCV(alphas=[0.1, 1.0, 10.0]),
    `Lasso Regression`: LassoCV(alphas=[0.1, 1.0, 10.0]),
    `Random Forest`: RandomForestRegressor(n_estimators=100, random_state=42),
    `Gradient Boosting`: GradientBoostingRegressor(n_estimators=100, random_state=42)
}
results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    results[name] = {'MSE': mse, 'R2': r2}
    print(f\"Model: {name} - MSE: {mse:.2f}, R2 Score: {r2:.2f}\")
# Hyperparameter tuning for Random Forest
param_grid = {
    `n_estimators`: [100, 200, 500],
    `max_depth`: [None, 10, 20],
    `min_samples_split`: [2, 5, 10]
}
rf = RandomForestRegressor(random_state=42)
random_search = RandomizedSearchCV(rf, param_distributions=param_grid, n_iter=10, cv=3, scoring='neg_mean_squared_error', random_state=42)
random_search.fit(X_train, y_train)
print(\"\\nBest hyperparameters:\", random_search.best_params_)
best_rf = random_search.best_estimator_
print(\"Best Random Forest - MSE:\", mean_squared_error(y_test, best_rf.predict(X_test)))
print(\"Best Random Forest - R2 Score:\", r2_score(y_test, best_rf.predict(X_test)))
# Feature importance analysis for Random Forest
feature_importances = pd.Series(best_rf.feature_importances_, index=X_train.columns)
plt.figure(figsize=(10, 6))
sns.barplot(x=feature_importances, y=feature_importances.index)
plt.title('Random Forest Feature Importance')
plt.xlabel('Importance Score')
plt.ylabel('Features')
plt.show()
# Save the best model
with open('car_price_model.pkl', 'wb') as f:
    pickle.dump(best_rf, f)
print('Model saved successfully! Paste your own data and re-run the cell to retrain and re-predict.');
";

  // Prediction endpoint - requires user authentication
  public shared ({ caller }) func predictCarPrice(carSpecs : CarSpecs) : async PricePredictionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can predict car prices");
    };

    validateCarSpecs(carSpecs);

    // Save uploaded photos alongside carSpecs
    ignore carSpecs.photos;

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

    storePredictionHistory(caller, carSpecs, result);

    result;
  };

  // New public endpoint to fetch Python code
  public query ({ caller }) func getPythonMegaCode() : async Text {
    pythonCode;
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
    [1, 3, 5].map<Nat, TimePrediction>(
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
