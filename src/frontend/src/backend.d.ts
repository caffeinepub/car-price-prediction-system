import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
    profilePictureUrl?: string;
}
export interface ApiContactInfo {
    founder: string;
    contactEmail: string;
}
export interface Adjustments {
    usageDurationAdjustment: number;
    purchaseYearAdjustment: number;
}
export interface YearlyPrediction {
    year: bigint;
    predictedPrice: number;
    confidence: number;
}
export interface Range {
    low: number;
    high: number;
}
export interface TimePrediction {
    depreciationRate: number;
    priceEstimate: PriceEstimate;
    yearsAhead: bigint;
}
export interface PriceBreakdown {
    fuelTypeAdjustment: number;
    baseValue: number;
    ownerAdjustment: number;
    brandPremium: number;
    transmissionAdjustment: number;
    ageAdjustment: number;
    mileageAdjustment: number;
}
export interface CarSpecs {
    mileage: bigint;
    owners: bigint;
    transmission: TransmissionType;
    fuelType: FuelType;
    modelYear: bigint;
    brand: string;
    usageDuration: bigint;
    yearOfPurchase: bigint;
}
export interface PriceEstimate {
    valueRange: Range;
    price: number;
    confidence: number;
}
export interface PricePredictionResult {
    currentPrice: PriceEstimate;
    predictionsByYear: Array<YearlyPrediction>;
    detailedBreakdown: PriceBreakdown;
    confidenceScore: number;
    adjustments: Adjustments;
    futurePredictions: Array<TimePrediction>;
}
export enum FuelType {
    petrol = "petrol",
    hybrid = "hybrid",
    diesel = "diesel",
    electric = "electric"
}
export enum TransmissionType {
    automatic = "automatic",
    manual = "manual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    checkSystemStatus(): Promise<string>;
    getApiContactInfo(): Promise<ApiContactInfo>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<ApiContactInfo>;
    getPredictionHistory(): Promise<Array<[CarSpecs, PricePredictionResult]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCurrentUserActive(_userId: string): Promise<boolean>;
    isSubscriptionActive(_userId: string): Promise<boolean>;
    login(_userId: string): Promise<string>;
    logout(): Promise<string>;
    predictCarPrice(carSpecs: CarSpecs): Promise<PricePredictionResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
