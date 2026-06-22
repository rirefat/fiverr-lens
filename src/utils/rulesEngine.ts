export interface Violation {
  word: string;
  category: string;
  severity: "danger" | "caution";
  description: string;
  index: number;
  length: number;
}

export interface RuleCategory {
  id: string;
  name: string;
  severity: "danger" | "caution";
  description: string;
  keywords: string[];
}

export const RULE_CATEGORIES: RuleCategory[] = [
  {
    id: "off_platform_contact",
    name: "Off-Platform Communication",
    severity: "danger",
    description: "Fiverr strictly bans sharing email and contact details before an active contract is opened to prevent bypass transactions and scams.",
    keywords: [
      "email", "whatsapp", "skype", "telegram", "discord", "instagram", "gmail", "outlook", 
      "phone number", "call me", "contact me outside", "outside contact", "zoom", "zoom meeting", 
      "skpe", "watsapp", "anydesk", "teamviewer", "viber", "wechat", "phone", "number"
    ]
  },
  {
    id: "off_platform_payment",
    name: "Off-Platform Payment",
    severity: "danger",
    description: "Asking for or accepting payments outside of Fiverr's system is a major TOS violation and is the #1 cause of immediate, lifetime account bans.",
    keywords: [
      "pay outside", "pay you outside", "paypal", "crypto", "bitcoin", "btc", "usdt", 
      "western union", "bank transfer", "cashapp", "zelle", "venmo", "cheaper outside", 
      "payment outside", "direct payment", "pay directly", "outside payment", "crypto wallet"
    ]
  },
  {
    id: "academic_fraud",
    name: "Academic Work (Homework/Exams)",
    severity: "danger",
    description: "Fiverr forbids doing academic homework, exams, theses, or assignments on behalf of clients. Helping a student cheat violates global student conduct codes.",
    keywords: [
      "homework", "exam", "assignment", "test", "university paper", "thesis", "blackboard", 
      "canvas portal", "school project", "essay help", "academy cheat", "midterm", "quiz", "grade improvement"
    ]
  },
  {
    id: "review_manipulation",
    name: "Review & Feedback Manipulation",
    severity: "danger",
    description: "Buying, selling, or exchanging feedback/reviews is highly illegal on Fiverr and heavily monitored by their fraud detection bots.",
    keywords: [
      "buy 5 stars", "exchange reviews", "fake review", "give me 5 stars", "feedback exchange", 
      "review swap", "buy review", "leave review", "rate 5", "five star rating", "swap feedback"
    ]
  },
  {
    id: "free_work",
    name: "Free Work Demands",
    severity: "caution",
    description: "Requests for free samples or trials are often borderline exploitative. Be careful; suggest a paid micro-gig or portfolio viewing instead.",
    keywords: [
      "free sample", "do it for free first", "free trial", "free demo", "unpaid test", 
      "free work", "do a sample first", "work for free", "test task for free"
    ]
  }
];

export interface ScanResult {
  text: string;
  violations: Violation[];
  safetyScore: number; // 0 to 100
  overallStatus: "safe" | "caution" | "danger";
  summaryText: string;
}

/**
 * Parses client text and returns all matching violations, calculating a dynamic score.
 */
export function scanMessage(text: string): ScanResult {
  if (!text || !text.trim()) {
    return {
      text: "",
      violations: [],
      safetyScore: 100,
      overallStatus: "safe",
      summaryText: "No message text provided to analyze."
    };
  }

  const lowercaseText = text.toLowerCase();
  const violations: Violation[] = [];

  // Scan for keywords per category
  for (const category of RULE_CATEGORIES) {
    for (const keyword of category.keywords) {
      // Use regex to locate boundaries or precise substrings
      // To catch variations, we will look for exact matches or word-boundaries where appropriate.
      // Let's escape special characters in the keyword first
      const escapedKwd = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      
      // We look for word boundary triggers or simple safe boundary checks
      // e.g., \bkeyword\b or general boundary
      const regex = new RegExp(`\\b${escapedKwd}\\b|${escapedKwd}`, "gi");
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Guard against duplicate matches at the exact same index
        const index = match.index;
        const matchedStr = match[0];
        
        const exists = violations.some(v => v.index === index || (index >= v.index && index < (v.index + v.word.length)));
        
        if (!exists) {
          violations.push({
            word: matchedStr,
            category: category.name,
            severity: category.severity,
            description: category.description,
            index: index,
            length: matchedStr.length
          });
        }
      }
    }
  }

  // Sort violations by index to keep highlighting ordered
  violations.sort((a, b) => a.index - b.index);

  // Deduplicate overlapping bounds (e.g. if "email" matched "email address", keep the longer/first one)
  const deduped: Violation[] = [];
  for (const v of violations) {
    const isOverlapped = deduped.some(d => {
      const dEnd = d.index + d.length;
      const vEnd = v.index + v.length;
      return (v.index >= d.index && v.index < dEnd) || (d.index >= v.index && d.index < vEnd);
    });
    if (!isOverlapped) {
      deduped.push(v);
    }
  }

  // Calculate score
  let score = 100;
  let hasDanger = false;
  let hasCaution = false;

  for (const v of deduped) {
    if (v.severity === "danger") {
      score -= 22; // Quick drop for each major violation
      hasDanger = true;
    } else {
      score -= 10; // Medium drop for caution items
      hasCaution = true;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let overallStatus: "safe" | "caution" | "danger" = "safe";
  if (hasDanger) {
    overallStatus = "danger";
  } else if (hasCaution || score < 90) {
    overallStatus = "caution";
  }

  let summaryText = "";
  if (overallStatus === "danger") {
    summaryText = `Warning! We detected ${deduped.length} critical Terms of Service violations. Replying directly to these requests or sharing details will put your Fiverr account at high risk of a permanent ban.`;
  } else if (overallStatus === "caution") {
    summaryText = `Caution: There are potential safety risks in this message (such as demands for free work, trials, or mildly suspicious patterns). Proceed with caution.`;
  } else {
    summaryText = `This message appears completely clean and policy-compliant! No forbidden communication terms, off-platform payments, or academic scam markers were detected.`;
  }

  return {
    text,
    violations: deduped,
    safetyScore: score,
    overallStatus,
    summaryText
  };
}
