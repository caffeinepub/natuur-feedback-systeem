import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContextStats {
    averageInteractionMethod: number;
    totalEntries: bigint;
    averagePedagogicalAlignment: number;
    averageKnowledgeTransfer: number;
    averageSensoryExperience: number;
}
export type Timestamp = bigint;
export interface Activity {
    id: bigint;
    school: string;
    name: string;
    description: string;
    targetClass: string;
}
export interface ContextExample {
    id: bigint;
    exampleText: string;
    school: string;
    targetClass: string;
}
export type Score = bigint;
export interface Question {
    id: bigint;
    title: string;
    description: string;
}
export interface FeedbackEntry {
    id: bigint;
    pedagogicalAlignment: bigint;
    additionalComments: string;
    school: string;
    knowledgeTransfer: bigint;
    timestamp: bigint;
    sensoryExperience: bigint;
    environmentalContribution: string;
    impactMoment: string;
    targetClass: string;
    interactionMethod: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addActivity(token: string, school: string, targetClass: string, name: string, description: string): Promise<void>;
    addContextExample(token: string, school: string, targetClass: string, exampleText: string): Promise<void>;
    addQuestion(token: string, title: string, description: string): Promise<void>;
    adminLogin(username: string, password: string): Promise<string | null>;
    adminLogout(token: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeAdminPassword(token: string, newUsername: string, newPassword: string): Promise<boolean>;
    deleteActivity(token: string, id: bigint): Promise<void>;
    deleteContextExample(token: string, id: bigint): Promise<void>;
    deleteQuestion(token: string, id: bigint): Promise<void>;
    getActivitiesBySchoolAndClass(school: string, targetClass: string): Promise<Array<Activity>>;
    getActivityById(id: bigint): Promise<Activity | null>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllContextExamples(): Promise<Array<ContextExample>>;
    getAllFeedback(token: string): Promise<Array<FeedbackEntry>>;
    getAllQuestions(): Promise<Array<Question>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryStatsBySchool(school: string): Promise<ContextStats | null>;
    getContextExampleById(id: bigint): Promise<ContextExample | null>;
    getContextExamplesBySchoolAndClass(school: string, targetClass: string): Promise<Array<ContextExample>>;
    getFeedbackByCategory(category: string): Promise<Array<FeedbackEntry>>;
    getFeedbackByClass(school: string, targetClass: string): Promise<Array<FeedbackEntry>>;
    getFeedbackByDateRange(startTimestamp: Timestamp, endTimestamp: Timestamp): Promise<Array<FeedbackEntry>>;
    getFeedbackBySchool(school: string): Promise<Array<FeedbackEntry>>;
    getFeedbackByScoreRange(minScore: Score, maxScore: Score): Promise<Array<FeedbackEntry>>;
    getQuestionById(id: bigint): Promise<Question | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isSessionValid(token: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedInitialData(token: string): Promise<void>;
    submitFeedback(school: string, targetClass: string, pedagogicalAlignment: Score, interactionMethod: Score, sensoryExperience: Score, knowledgeTransfer: Score, impactMoment: string, environmentalContribution: string, additionalComments: string): Promise<void>;
    updateActivity(token: string, id: bigint, school: string, targetClass: string, name: string, description: string): Promise<void>;
    updateContextExample(token: string, id: bigint, school: string, targetClass: string, exampleText: string): Promise<void>;
    updateQuestion(token: string, id: bigint, title: string, description: string): Promise<void>;
}
