export interface SafetyIssue {
  category: string;
  severity: "low" | "medium" | "high";
  matchedText: string;
  explanation: string;
  alternativeSuggestion: string;
}

export interface SafetyAnalysisResponse {
  safetyScore: number; // 0-100
  riskLevel: "Safe" | "Warning" | "High Risk";
  safeElements: string[];
  potentialIssues: string[];
  dangerousContent: string[];
  highlightedMessage: string; // HTML-safe text with <mark> tags or similar for risk heatmap
  correctedMessage: string;
  successScore: number; // 0-100
  clientMood: "Positive" | "Neutral" | "Frustrated" | "Urgent" | "Interested";
  communicationQualityScore: {
    clarity: number; // 1-10
    professionalism: number; // 1-10
    persuasiveness: number; // 1-10
    trustworthiness: number; // 1-10
  };
}

export interface ChatMessageResponse {
  generatedMessage: string;
}

export interface ConversationAnalysisResponse {
  sentiment: string;
  opportunityScore: number; // 0-100
  communicationQuality: string;
  clientIntent: string;
  recommendations: string[];
  nextSuggestedResponses: string[];
  negotiationStrategy: string;
  upsellOpportunities: string[];
}

export interface Template {
  id: string;
  title: string;
  category: "Inquiry" | "Discovery" | "Follow-Up" | "Delivery" | "Revision" | "Refund" | "Upselling" | "Custom Offers";
  content: string;
  isFavorite?: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  industry: string;
  preferences: string[];
  communicationStyle: string;
  budgetRange: string;
  pastProjects: number;
  notes: string;
  mood?: "Positive" | "Neutral" | "Frustrated" | "Urgent" | "Interested";
}

export interface DeliveryAssistantResponse {
  deliveryMessage: string;
  documentation: string;
  usageInstructions: string;
  clientHandoffNotes: string;
}

export interface ProposalResponse {
  personalizedProposal: string;
  strongOpening: string;
  valueProposition: string;
  callToAction: string;
}

export interface RevisionResponse {
  replyMessage: string;
  nextSteps: string[];
  boundariesMaintained: string[];
}

export interface AnalyticsStats {
  messagesCheckedCount: number;
  risksPreventedCount: number;
  repliesGeneratedCount: number;
  timeSavedMinutes: number;
  communicationScoreHistory: { date: string; score: number }[];
  mostUsedTemplateCategory: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: "Best Practices" | "Compliance Guides" | "Proposal Writing" | "Retention Strategies" | "Negotiation";
  summary: string;
  content: string;
}

import { ComplianceRule } from "./complianceDatabase";

export interface SafetyAnalysis {
  safetyScore: number;
  riskLevel: "Safe" | "Warning" | "High Risk";
  safeElements: string[];
  potentialIssues: string[];
  dangerousContent: string[];
  highlightedMessage: string;
  correctedMessage: string;
  successScore: number;
  clientMood: string;
  communicationQualityScore: {
    clarity: number;
    professionalism: number;
    persuasiveness: number;
    trustworthiness: number;
  };
  matchedRules?: ComplianceRule[];
}

export interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  usageCount?: number;
}

export interface InspectorVersion {
  id: string;
  text: string;
  timestamp: number;
}

