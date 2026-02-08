# Car Price Prediction System

## Overview
A modern machine learning-powered car price prediction website that provides accurate vehicle valuation forecasts in Indian Rupees (₹). The system uses advanced ML algorithms to predict current and future car prices based on vehicle specifications and market trends. Founded by ASWIN S NAIR, this data-driven platform serves car buyers, sellers, and automotive enthusiasts with reliable price estimation tools for the Indian automotive market.

## Website Structure

### Landing Page
- Professional ML car prediction branding and logo
- Project abstract and overview explaining the machine learning approach
- Introduction to car price forecasting capabilities for Indian market
- Clean, data-driven design with automotive and technology aesthetic
- Call-to-action directing users to the prediction tool
- Responsive layout optimized for all devices

### Car Price Prediction Tool
- **Input Form**:
  - Car brand selection dropdown
  - Model year input field
  - Mileage input field
  - Year of purchase input field
  - Duration of usage (years) input field
  - Transmission type selection (Manual/Automatic)
  - Fuel type selection (Petrol/Diesel/Electric/Hybrid)
  - Number of previous owners input
  - Predict button to generate estimates
- **Results Display**:
  - Current estimated price in Indian Rupees (₹)
  - 1-year price prediction in INR
  - 3-year price prediction in INR
  - 5-year price prediction in INR
  - Display of entered year of purchase and duration of usage values
  - Clear visualization of price trends over time with INR formatting
  - Proper Indian number formatting (e.g., ₹12,34,567)
- Form validation and error handling for all input fields including year of purchase validation (not in future) and usage duration validation (≥ 0)

### About Section
- **Founder Information**: "Founder: ASWIN S NAIR" prominently displayed
- Project overview focusing on machine learning car price prediction for Indian market
- Technology explanation and methodology
- Professional presentation of founder credentials
- Academic or technical background context

### Contact Information
- **Founder Contact Email**: aswinjr462005@gmail.com
- Contact form for technical inquiries
- Professional contact details presentation
- Clear call-to-action for project-related communications

### Footer Component
- Project branding and logo
- Contact information
- Professional links and technical details
- Clean, modern styling consistent with ML/data science theme

## Backend Requirements
- **Car Price Prediction Engine**:
  - ML simulation algorithm for price calculations in Indian Rupees
  - Currency conversion logic using fixed exchange rate (1 USD ≈ 83 INR)
  - Car specification processing and validation including year of purchase and usage duration
  - Price prediction logic incorporating year of purchase and usage duration for depreciation calculations
  - Market trend simulation and depreciation calculations for Indian market
- **Data Storage**:
  - Car brand and model reference data
  - Car specifications including year of purchase and usage duration
  - Prediction history and analytics
  - User query logging for system improvement
- **API Endpoints**:
  - Car price prediction endpoint accepting year of purchase and usage duration parameters
  - Car brand and model data retrieval
  - Prediction result processing and formatting with INR conversion

## Technical Features
- Single-page application with clean navigation
- Interactive car specification input form with year of purchase and usage duration fields
- Real-time price prediction calculations in Indian Rupees incorporating purchase year and usage duration
- Responsive design optimized for desktop and mobile
- Professional data visualization for price trends with INR formatting
- Form handling and validation for all user inputs including numeric validation for new fields
- Modern, technology-focused design with automotive branding
- Indian number formatting and currency display (₹ symbol)

## Design Requirements
- **Branding**: ML car prediction logo with automotive and technology themes
- **Color Palette**: Professional blues, grays, and modern tech colors
- **Typography**: Clean, technical fonts suitable for data-driven applications
- **Layout**: Responsive design with clear navigation and intuitive user interface
- **Visual Style**: Modern, professional aesthetic with data science and automotive focus
- **Form UI**: Clean, technical-looking forms with proper validation feedback for all fields including new purchase year and usage duration inputs
- **Results Display**: Clear, easy-to-read price predictions in INR with visual trends, proper Indian number formatting, and display of entered purchase year and usage duration values
- **Currency Display**: All prices shown with ₹ symbol and Indian number formatting (lakhs/crores style)

## Content Language
All website content will be in English.
