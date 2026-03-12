import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EvidenceRecord {
    id: EvidenceID;
    owner: Principal;
    description: string;
    notes?: string;
    timestamp: bigint;
    incidentType: string;
}
export interface Updates {
    displayName: string;
    pinEnabled: boolean;
    pinHash: string;
}
export type LegalArticleID = bigint;
export interface EmergencyContact {
    id: EmergencyContactID;
    owner: Principal;
    name: string;
    phoneNumber: string;
}
export interface LegalArticle {
    id: LegalArticleID;
    title: string;
    content: string;
    category: string;
}
export type EmergencyContactID = bigint;
export interface UserProfile {
    sosTimestamp?: bigint;
    displayName: string;
    user: Principal;
    isSosActive: boolean;
    pinEnabled: boolean;
    pinHash?: string;
}
export type EvidenceID = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContact(name: string, phoneNumber: string): Promise<EmergencyContactID>;
    addEvidenceRecord(incidentType: string, description: string, notes: string | null): Promise<EvidenceID>;
    addLegalArticle(title: string, category: string, content: string): Promise<LegalArticleID>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSOS(): Promise<void>;
    deleteEvidenceRecord(evidenceID: EvidenceID): Promise<void>;
    getAllLegalArticles(): Promise<Array<LegalArticle>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentSOSState(): Promise<boolean>;
    getDisplayName(): Promise<string>;
    getLegalArticle(articleID: LegalArticleID): Promise<LegalArticle>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUserContacts(): Promise<Array<EmergencyContact>>;
    listUserEvidenceRecords(): Promise<Array<EvidenceRecord>>;
    removeContact(contactID: EmergencyContactID): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDefaultLegalArticles(): Promise<void>;
    triggerSOS(): Promise<void>;
    updateDisplayName(displayName: string): Promise<void>;
    upsertSettings(updates: Updates): Promise<void>;
}
