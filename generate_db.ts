import fs from 'fs';

const categories = {
  offPlatform: "Off-Platform Communication",
  finance: "Off-Platform Transactions & Finance",
  academic: "Academic Integrity Violations",
  reviews: "Feedback & Review Manipulation",
  prohibited: "Prohibited Services & High-Risk Content"
};

const severities = {
  critical: "Critical Risk",
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk"
};

const database = [
  // 1. Off-Platform Communication
  { word: "whatsapp", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "telegram", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "discord", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "skype", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "slack", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "viber", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "wechat", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "facebook", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "instagram", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "linkedin", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Social/chat app.", rew: "the Fiverr workspace" },
  { word: "email", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "mail", cat: categories.offPlatform, sev: severities.high, score: 90, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "phone number", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "cell", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "mobile", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "digits", cat: categories.offPlatform, sev: severities.high, score: 90, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "address", cat: categories.offPlatform, sev: severities.high, score: 90, exp: "Contact detail.", rew: "the Fiverr workspace" },
  { word: "zoom", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Meeting platform.", rew: "the Fiverr native call" },
  { word: "google meet", cat: categories.offPlatform, sev: severities.high, score: 95, exp: "Meeting platform.", rew: "the Fiverr native call" },
  { word: "teams", cat: categories.offPlatform, sev: severities.high, score: 90, exp: "Meeting platform.", rew: "the Fiverr native call" },
  { word: "outside of fiverr", cat: categories.offPlatform, sev: severities.critical, score: 100, exp: "The ultimate trap phrase.", rew: "here on Fiverr" },
  { word: "off-platform", cat: categories.offPlatform, sev: severities.critical, score: 100, exp: "The ultimate trap phrase.", rew: "here on Fiverr" },
  
  // 2. Off-Platform Transactions & Finance
  { word: "paypal", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "stripe", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "payoneer", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "wise", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "transferwise", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "western union", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "bank transfer", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "cash", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "crypto", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "bitcoin", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "usdt", cat: categories.finance, sev: severities.critical, score: 100, exp: "Payment service.", rew: "the Fiverr order page" },
  { word: "pay", cat: categories.finance, sev: severities.high, score: 90, exp: "Financial action.", rew: "order" },
  { word: "payment", cat: categories.finance, sev: severities.high, score: 90, exp: "Financial action.", rew: "order" },
  { word: "invoice", cat: categories.finance, sev: severities.high, score: 90, exp: "Financial action.", rew: "custom offer" },
  { word: "send money", cat: categories.finance, sev: severities.critical, score: 100, exp: "Financial action.", rew: "place an order" },
  { word: "direct deposit", cat: categories.finance, sev: severities.critical, score: 100, exp: "Financial action.", rew: "Fiverr payment" },
  { word: "fee", cat: categories.finance, sev: severities.high, score: 85, exp: "Financial action.", rew: "budget" },
  { word: "commission", cat: categories.finance, sev: severities.high, score: 85, exp: "Financial action.", rew: "price" },

  // 3. Academic Dishonesty
  { word: "homework", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "study guide" },
  { word: "assignment", cat: categories.academic, sev: severities.high, score: 95, exp: "Academic dishonesty.", rew: "project" },
  { word: "exam", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "prep materials" },
  { word: "test", cat: categories.academic, sev: severities.high, score: 90, exp: "Academic dishonesty.", rew: "review sheet" },
  { word: "quiz", cat: categories.academic, sev: severities.high, score: 90, exp: "Academic dishonesty.", rew: "practice questions" },
  { word: "university project", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "personal project" },
  { word: "academic paper", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "research summary" },
  { word: "thesis", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "research outline" },
  { word: "dissertation", cat: categories.academic, sev: severities.critical, score: 100, exp: "Academic dishonesty.", rew: "independent study" },

  // 4. Review Manipulation
  { word: "review", cat: categories.reviews, sev: severities.high, score: 95, exp: "Review manipulation.", rew: "honest feedback" },
  { word: "5 stars", cat: categories.reviews, sev: severities.high, score: 95, exp: "Review manipulation.", rew: "honest feedback" },
  { word: "five stars", cat: categories.reviews, sev: severities.high, score: 95, exp: "Review manipulation.", rew: "honest feedback" },
  { word: "positive review", cat: categories.reviews, sev: severities.high, score: 95, exp: "Review manipulation.", rew: "honest feedback" },
  { word: "feedback", cat: categories.reviews, sev: severities.medium, score: 70, exp: "Review manipulation context.", rew: "thoughts" },
  { word: "rating", cat: categories.reviews, sev: severities.high, score: 85, exp: "Review manipulation.", rew: "experience" },
  { word: "thumbs up", cat: categories.reviews, sev: severities.high, score: 85, exp: "Review manipulation.", rew: "approval" },

  // 5. Prohibited Services & High-Risk Content
  { word: "scrape", cat: categories.prohibited, sev: severities.high, score: 90, exp: "Growth exploit.", rew: "gather public data" },
  { word: "bot", cat: categories.prohibited, sev: severities.high, score: 90, exp: "Growth exploit.", rew: "automation script" },
  { word: "fake followers", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Growth exploit.", rew: "organic marketing strategy" },
  { word: "bulk emails", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Growth exploit.", rew: "newsletter management" },
  { word: "spam", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Growth exploit.", rew: "outreach" },
  { word: "create accounts", cat: categories.prohibited, sev: severities.high, score: 95, exp: "Growth exploit.", rew: "manage your account" },
  { word: "adult", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Adult/Sensitive Content.", rew: "general" },
  { word: "nsfw", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Adult/Sensitive Content.", rew: "safe for work" },
  { word: "dating", cat: categories.prohibited, sev: severities.high, score: 90, exp: "Adult/Sensitive Content.", rew: "networking" },
  { word: "nude", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Adult/Sensitive Content.", rew: "appropriate" },
  { word: "sexy", cat: categories.prohibited, sev: severities.critical, score: 100, exp: "Adult/Sensitive Content.", rew: "appealing" }
];

let out = `export interface ComplianceRule {
  id: string;
  phrase: string;
  riskScore: number;
  category: "Off-Platform Communication" | "External Payments" | "Fiverr Fee Circumvention" | "Personal Contact Information" | "Phishing & Suspicious Language" | "Academic Integrity Violations" | "Feedback & Review Manipulation" | "Harassment & Unprofessional" | "Prohibited & Illegal Services" | "Employment & Recruitment Off-Platform" | "Off-Platform Transactions & Finance";
  severity: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
  pattern: string;
  rewrite: string;
  explanation: string;
}

export const complianceDatabase: ComplianceRule[] = [
`;

database.forEach((item, index) => {
  out += `  {
    id: "tos_${String(index + 1).padStart(3, '0')}",
    phrase: "${item.word}",
    riskScore: ${item.score},
    category: "${item.cat}" as any,
    severity: "${item.sev}" as any,
    pattern: "\\\\b${item.word.replace(/[.*+?^$\\{\\}()|\\[\\]\\\\]/g, '\\\\$&')}\\\\b",
    rewrite: "${item.rew}",
    explanation: "${item.exp}"
  },
`;
});

out += `];

export const fullComplianceDatabase: ComplianceRule[] = [...complianceDatabase];
`;

fs.writeFileSync('src/complianceDatabase.ts', out);
