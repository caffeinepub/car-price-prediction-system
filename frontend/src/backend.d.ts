import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface InsuranceInfo {
    provider: string;
    expirationDate: Time;
    policyNumber: string;
}
export type Time = bigint;
export interface ServiceRecord {
    cost: number;
    date: Time;
    description: string;
}
export interface PriceFactors {
    mileageImpact: number;
    fuelTypePremium: number;
    brandTierWeight: number;
    transmissionFactor: number;
    yearDepreciation: number;
}
export interface YearlyPrediction {
    year: bigint;
    predictedPrice: number;
    confidence: number;
}
export interface ApiContactInfo {
    founder: string;
    contactEmail: string;
}
export interface Adjustments {
    usageDurationAdjustment: number;
    purchaseYearAdjustment: number;
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
export interface ServiceHistory {
    serviceRecords?: Array<ServiceRecord>;
    lastServiceDate?: Time;
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
    purchasePrice?: number;
    mileage: bigint;
    owners: bigint;
    insuranceDetails?: InsuranceInfo;
    transmission: TransmissionType;
    fuelType: FuelType;
    modelYear: bigint;
    brand: string;
    usageDuration: bigint;
    serviceHistory?: ServiceHistory;
    location?: string;
    photos?: Array<ExternalBlob>;
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
    priceFactors: PriceFactors;
    futurePredictions: Array<TimePrediction>;
    recommendationScore: number;
}
export interface AttendanceRecord {
    id: bigint;
    status: AttendanceStatus;
    leavingTime?: Time;
    name: string;
    presentTime?: Time;
}
export interface UserProfile {
    name: string;
    email: string;
    profilePictureUrl?: string;
}
export enum AttendanceStatus {
    present = "present",
    late = "late",
    absent = "absent"
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
    getAttendanceRecords(): Promise<Array<AttendanceRecord>>;
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
    markLeaving(recordId: bigint): Promise<void>;
    markPresent(name: string): Promise<void>;
    predictCarPriceWithAdvancedFactors(carSpecs: CarSpecs): Promise<PricePredictionResult>;
    registerFace(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
