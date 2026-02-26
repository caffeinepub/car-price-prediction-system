# 🚗 Car Price Prediction - Complete Python Mega Code for Google Colab
# Copy this entire file into ONE Google Colab code cell and run it!
# Author: ASWIN S NAIR
# Contact: aswinjr462005@gmail.com

# ============================================================================
# STEP 1: Install Required Libraries
# ============================================================================
print("📦 Installing required libraries...")
import sys
!{sys.executable} -m pip install scikit-learn pandas numpy matplotlib seaborn ipywidgets --quiet
print("✅ Libraries installed successfully!\n")

# ============================================================================
# STEP 2: Import Libraries
# ============================================================================
print("📚 Importing libraries...")
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns
import ipywidgets as widgets
from IPython.display import display, HTML
import warnings
warnings.filterwarnings('ignore')

print("✅ All libraries imported successfully!\n")

# ============================================================================
# STEP 3: Generate Synthetic Car Dataset
# ============================================================================
print("🔧 Generating synthetic car dataset...")

np.random.seed(42)

# Car brands with different price ranges
brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 
          'Kia', 'Nissan', 'Volkswagen', 'Chevrolet', 'Mazda']

# Generate 1000 car records
n_samples = 1000

data = {
    'brand': np.random.choice(brands, n_samples),
    'model_year': np.random.randint(2010, 2024, n_samples),
    'mileage': np.random.randint(5000, 150000, n_samples),
    'transmission': np.random.choice(['manual', 'automatic'], n_samples, p=[0.3, 0.7]),
    'fuel_type': np.random.choice(['petrol', 'diesel', 'electric', 'hybrid'], n_samples, p=[0.5, 0.3, 0.1, 0.1]),
    'owners': np.random.randint(1, 5, n_samples),
    'year_of_purchase': np.random.randint(2010, 2024, n_samples),
}

# Calculate usage duration
data['usage_duration'] = 2024 - data['year_of_purchase']

# Generate realistic prices based on features
base_prices = {
    'Toyota': 20000, 'Honda': 19000, 'Ford': 18000, 'BMW': 35000,
    'Mercedes': 40000, 'Audi': 38000, 'Hyundai': 16000, 'Kia': 17000,
    'Nissan': 18000, 'Volkswagen': 22000, 'Chevrolet': 19000, 'Mazda': 20000
}

prices = []
for i in range(n_samples):
    base = base_prices[data['brand'][i]]
    age = 2024 - data['model_year'][i]
    
    # Price adjustments
    price = base
    price -= age * 1200  # Depreciation per year
    price -= data['mileage'][i] * 0.05  # Mileage impact
    price -= (data['owners'][i] - 1) * 1500  # Multiple owners penalty
    price += 2000 if data['transmission'][i] == 'automatic' else 0
    price += 3000 if data['fuel_type'][i] == 'electric' else 0
    price += 1500 if data['fuel_type'][i] == 'hybrid' else 0
    
    # Add some random variation
    price += np.random.normal(0, 2000)
    
    # Ensure price is positive
    price = max(price, 3000)
    
    prices.append(price)

data['price'] = prices

df = pd.DataFrame(data)

print(f"✅ Generated {len(df)} car records")
print(f"📊 Dataset shape: {df.shape}")
print(f"\n🔍 First few records:")
print(df.head())
print(f"\n📈 Dataset statistics:")
print(df.describe())
print()

# ============================================================================
# STEP 4: Data Preprocessing & Feature Engineering
# ============================================================================
print("🔨 Preprocessing data and engineering features...")

# Create a copy for processing
df_processed = df.copy()

# Feature engineering
df_processed['car_age'] = 2024 - df_processed['model_year']
df_processed['mileage_per_year'] = df_processed['mileage'] / (df_processed['car_age'] + 1)
df_processed['price_per_year'] = df_processed['price'] / (df_processed['usage_duration'] + 1)

# Encode categorical variables
label_encoders = {}
categorical_cols = ['brand', 'transmission', 'fuel_type']

for col in categorical_cols:
    le = LabelEncoder()
    df_processed[col + '_encoded'] = le.fit_transform(df_processed[col])
    label_encoders[col] = le

# Select features for modeling
feature_cols = ['model_year', 'mileage', 'owners', 'year_of_purchase', 'usage_duration',
                'car_age', 'mileage_per_year', 'brand_encoded', 'transmission_encoded', 
                'fuel_type_encoded']

X = df_processed[feature_cols]
y = df_processed['price']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=feature_cols)

print("✅ Data preprocessing completed!")
print(f"📊 Features shape: {X_scaled.shape}")
print(f"🎯 Target shape: {y.shape}\n")

# ============================================================================
# STEP 5: Train-Test Split
# ============================================================================
print("✂️ Splitting data into train and test sets...")

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

print(f"✅ Training set: {X_train.shape[0]} samples")
print(f"✅ Test set: {X_test.shape[0]} samples\n")

# ============================================================================
# STEP 6: Train Multiple ML Models
# ============================================================================
print("🤖 Training multiple machine learning models...\n")

models = {
    'Linear Regression': LinearRegression(),
    'Ridge Regression': Ridge(alpha=1.0),
    'Lasso Regression': Lasso(alpha=1.0),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, max_depth=15),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5)
}

results = {}
trained_models = {}

for name, model in models.items():
    print(f"🔄 Training {name}...")
    
    # Train model
    model.fit(X_train, y_train)
    trained_models[name] = model
    
    # Make predictions
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    # Calculate metrics
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_mae = mean_absolute_error(y_test, y_pred_test)
    
    # Cross-validation score
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
    
    results[name] = {
        'Train R²': train_r2,
        'Test R²': test_r2,
        'Train RMSE': train_rmse,
        'Test RMSE': test_rmse,
        'Test MAE': test_mae,
        'CV R² Mean': cv_scores.mean(),
        'CV R² Std': cv_scores.std()
    }
    
    print(f"   ✅ Test R² Score: {test_r2:.4f}")
    print(f"   ✅ Test RMSE: ${test_rmse:.2f}")
    print(f"   ✅ Test MAE: ${test_mae:.2f}")
    print(f"   ✅ CV R² Score: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})\n")

# ============================================================================
# STEP 7: Model Comparison & Visualization
# ============================================================================
print("📊 Comparing model performance...\n")

# Create results dataframe
results_df = pd.DataFrame(results).T
print(results_df.round(4))
print()

# Find best model
best_model_name = results_df['Test R²'].idxmax()
best_model = trained_models[best_model_name]
print(f"🏆 Best Model: {best_model_name} (Test R² = {results_df.loc[best_model_name, 'Test R²']:.4f})\n")

# Visualizations
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 1. Model Comparison - R² Scores
ax1 = axes[0, 0]
model_names = list(results.keys())
test_r2_scores = [results[name]['Test R²'] for name in model_names]
colors = ['#3b82f6' if name == best_model_name else '#94a3b8' for name in model_names]
ax1.barh(model_names, test_r2_scores, color=colors)
ax1.set_xlabel('R² Score', fontsize=12)
ax1.set_title('Model Comparison - Test R² Scores', fontsize=14, fontweight='bold')
ax1.set_xlim(0, 1)
for i, v in enumerate(test_r2_scores):
    ax1.text(v + 0.01, i, f'{v:.4f}', va='center')

# 2. Model Comparison - RMSE
ax2 = axes[0, 1]
test_rmse_scores = [results[name]['Test RMSE'] for name in model_names]
ax2.barh(model_names, test_rmse_scores, color=colors)
ax2.set_xlabel('RMSE ($)', fontsize=12)
ax2.set_title('Model Comparison - Test RMSE', fontsize=14, fontweight='bold')
for i, v in enumerate(test_rmse_scores):
    ax2.text(v + 100, i, f'${v:.0f}', va='center')

# 3. Actual vs Predicted (Best Model)
ax3 = axes[1, 0]
y_pred_best = best_model.predict(X_test)
ax3.scatter(y_test, y_pred_best, alpha=0.5, color='#3b82f6')
ax3.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
ax3.set_xlabel('Actual Price ($)', fontsize=12)
ax3.set_ylabel('Predicted Price ($)', fontsize=12)
ax3.set_title(f'Actual vs Predicted - {best_model_name}', fontsize=14, fontweight='bold')
ax3.grid(True, alpha=0.3)

# 4. Residuals Plot
ax4 = axes[1, 1]
residuals = y_test - y_pred_best
ax4.scatter(y_pred_best, residuals, alpha=0.5, color='#3b82f6')
ax4.axhline(y=0, color='r', linestyle='--', lw=2)
ax4.set_xlabel('Predicted Price ($)', fontsize=12)
ax4.set_ylabel('Residuals ($)', fontsize=12)
ax4.set_title(f'Residuals Plot - {best_model_name}', fontsize=14, fontweight='bold')
ax4.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Feature Importance (for tree-based models)
if best_model_name in ['Random Forest', 'Gradient Boosting']:
    print(f"\n📊 Feature Importance - {best_model_name}:")
    feature_importance = pd.DataFrame({
        'Feature': feature_cols,
        'Importance': best_model.feature_importances_
    }).sort_values('Importance', ascending=False)
    
    print(feature_importance.to_string(index=False))
    
    plt.figure(figsize=(10, 6))
    plt.barh(feature_importance['Feature'], feature_importance['Importance'], color='#3b82f6')
    plt.xlabel('Importance Score', fontsize=12)
    plt.title(f'Feature Importance - {best_model_name}', fontsize=14, fontweight='bold')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.show()

print("\n" + "="*80)
print("✅ MODEL TRAINING COMPLETED SUCCESSFULLY!")
print("="*80 + "\n")

# ============================================================================
# STEP 8: Interactive Prediction Form (ipywidgets)
# ============================================================================
print("🎨 Creating interactive prediction form...\n")

# Create widgets
brand_widget = widgets.Dropdown(
    options=sorted(brands),
    value='Toyota',
    description='Brand:',
    style={'description_width': '150px'}
)

model_year_widget = widgets.IntSlider(
    value=2020,
    min=2010,
    max=2024,
    step=1,
    description='Model Year:',
    style={'description_width': '150px'}
)

mileage_widget = widgets.IntText(
    value=30000,
    description='Mileage (km):',
    style={'description_width': '150px'}
)

transmission_widget = widgets.Dropdown(
    options=['manual', 'automatic'],
    value='automatic',
    description='Transmission:',
    style={'description_width': '150px'}
)

fuel_type_widget = widgets.Dropdown(
    options=['petrol', 'diesel', 'electric', 'hybrid'],
    value='petrol',
    description='Fuel Type:',
    style={'description_width': '150px'}
)

owners_widget = widgets.IntSlider(
    value=1,
    min=1,
    max=4,
    step=1,
    description='Owners:',
    style={'description_width': '150px'}
)

year_of_purchase_widget = widgets.IntSlider(
    value=2020,
    min=2010,
    max=2024,
    step=1,
    description='Purchase Year:',
    style={'description_width': '150px'}
)

usage_duration_widget = widgets.IntSlider(
    value=4,
    min=0,
    max=14,
    step=1,
    description='Usage (years):',
    style={'description_width': '150px'}
)

predict_button = widgets.Button(
    description='🚀 Predict Price',
    button_style='success',
    layout=widgets.Layout(width='200px', height='40px')
)

output_widget = widgets.Output()

def predict_price(b):
    with output_widget:
        output_widget.clear_output()
        
        # Get input values
        brand = brand_widget.value
        model_year = model_year_widget.value
        mileage = mileage_widget.value
        transmission = transmission_widget.value
        fuel_type = fuel_type_widget.value
        owners = owners_widget.value
        year_of_purchase = year_of_purchase_widget.value
        usage_duration = usage_duration_widget.value
        
        # Validate inputs
        if year_of_purchase < model_year:
            print("❌ Error: Purchase year cannot be before model year!")
            return
        
        if usage_duration > (2024 - year_of_purchase):
            print(f"❌ Error: Usage duration cannot exceed {2024 - year_of_purchase} years!")
            return
        
        # Prepare input data
        car_age = 2024 - model_year
        mileage_per_year = mileage / (car_age + 1)
        price_per_year_dummy = 0  # Will be calculated after prediction
        
        input_data = pd.DataFrame({
            'model_year': [model_year],
            'mileage': [mileage],
            'owners': [owners],
            'year_of_purchase': [year_of_purchase],
            'usage_duration': [usage_duration],
            'car_age': [car_age],
            'mileage_per_year': [mileage_per_year],
            'brand_encoded': [label_encoders['brand'].transform([brand])[0]],
            'transmission_encoded': [label_encoders['transmission'].transform([transmission])[0]],
            'fuel_type_encoded': [label_encoders['fuel_type'].transform([fuel_type])[0]]
        })
        
        # Scale input
        input_scaled = scaler.transform(input_data)
        
        # Predict with best model
        predicted_price = best_model.predict(input_scaled)[0]
        
        # Convert to INR (1 USD = 83 INR)
        predicted_price_inr = predicted_price * 83
        
        # Calculate future predictions (1, 3, 5 years)
        depreciation_rate = 0.09
        future_predictions = []
        for years in [1, 3, 5]:
            future_price = predicted_price_inr * ((1 - depreciation_rate) ** years)
            future_predictions.append((years, future_price))
        
        # Display results
        print("="*80)
        print("🎯 CAR PRICE PREDICTION RESULTS")
        print("="*80)
        print(f"\n📋 Vehicle Details:")
        print(f"   • Brand: {brand}")
        print(f"   • Model Year: {model_year}")
        print(f"   • Mileage: {mileage:,} km")
        print(f"   • Transmission: {transmission.capitalize()}")
        print(f"   • Fuel Type: {fuel_type.capitalize()}")
        print(f"   • Number of Owners: {owners}")
        print(f"   • Year of Purchase: {year_of_purchase}")
        print(f"   • Usage Duration: {usage_duration} years")
        print(f"   • Car Age: {car_age} years")
        
        print(f"\n💰 Current Estimated Price:")
        print(f"   ₹{predicted_price_inr:,.2f} INR")
        print(f"   (${predicted_price:,.2f} USD)")
        
        print(f"\n📈 Future Price Predictions:")
        for years, price in future_predictions:
            print(f"   • After {years} year(s): ₹{price:,.2f} INR")
        
        print(f"\n🎯 Model Used: {best_model_name}")
        print(f"📊 Model Accuracy (R²): {results[best_model_name]['Test R²']:.4f}")
        print(f"📉 Model Error (RMSE): ${results[best_model_name]['Test RMSE']:.2f}")
        
        print("\n" + "="*80)
        print("✅ Prediction completed successfully!")
        print("="*80)

predict_button.on_click(predict_price)

# Display form
print("="*80)
print("🚗 INTERACTIVE CAR PRICE PREDICTION FORM")
print("="*80)
print("\nEnter your car details below and click 'Predict Price' to get an estimate:\n")

display(HTML("<h3 style='color: #3b82f6;'>🚗 Car Price Prediction Form</h3>"))
display(widgets.VBox([
    brand_widget,
    model_year_widget,
    mileage_widget,
    transmission_widget,
    fuel_type_widget,
    owners_widget,
    year_of_purchase_widget,
    usage_duration_widget,
    predict_button,
    output_widget
]))

print("\n" + "="*80)
print("✅ ALL SETUP COMPLETE! Use the form above to predict car prices.")
print("="*80)
print("\n📝 Instructions:")
print("   1. Fill in the car details using the form above")
print("   2. Click the '🚀 Predict Price' button")
print("   3. View the predicted price and future valuations below the form")
print("\n💡 Tip: Try different combinations to see how features affect the price!")
print("\n👨‍💻 Created by: ASWIN S NAIR")
print("📧 Contact: aswinjr462005@gmail.com")
print("="*80)
