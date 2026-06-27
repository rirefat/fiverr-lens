import { ComplianceRule, fullComplianceDatabase } from "../complianceDatabase";
import { SafetyAnalysis } from "../types";

export interface TextSegment {
  text: string;
  isMatch: boolean;
  rule?: ComplianceRule;
}

export interface DisguisedForm {
  type: string;
  value: string;
}

/**
 * Splits input text into matches and non-matches against the compliance database rules.
 * This allows us to render text with highlighting, like a compiler or high-end code editor.
 * 
 * @param text The message content to analyze
 * @param rules Array of compliance rules to check against
 */
export const getSegments = (text: string, rules: ComplianceRule[]): TextSegment[] => {
  if (!rules || rules.length === 0 || !text) {
    return [{ text, isMatch: false }];
  }

  interface MatchRange {
    start: number;
    end: number;
    rule: ComplianceRule;
    matchedText: string;
  }

  const ranges: MatchRange[] = [];

  for (const rule of rules) {
    try {
      // Create a case-insensitive regular expression for the pattern
      const regex = new RegExp(`(${rule.pattern})`, "gi");
      let match;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;
        if (start === end) {
          regex.lastIndex++;
          continue;
        }
        ranges.push({
          start,
          end,
          rule,
          matchedText: match[0],
        });
      }
    } catch (e) {
      // Fallback substring search if regex is malformed
      const phrase = rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "");
      let index = text.toLowerCase().indexOf(phrase.toLowerCase());
      while (index !== -1) {
        ranges.push({
          start: index,
          end: index + phrase.length,
          rule,
          matchedText: text.substring(index, index + phrase.length),
        });
        index = text.toLowerCase().indexOf(phrase.toLowerCase(), index + 1);
      }
    }
  }

  // Sort ranges: earlier matches first. For overlapping matches, larger first.
  ranges.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.end - b.start - (a.end - a.start);
  });

  // Filter out overlapping matches (keep the first/longest)
  const activeRanges: MatchRange[] = [];
  let lastEnd = 0;
  for (const r of ranges) {
    if (r.start >= lastEnd) {
      activeRanges.push(r);
      lastEnd = r.end;
    }
  }

  // Segment the text into matching and non-matching blocks
  const segments: TextSegment[] = [];
  let currentIndex = 0;
  for (const r of activeRanges) {
    if (r.start > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, r.start),
        isMatch: false,
      });
    }
    segments.push({
      text: text.substring(r.start, r.end),
      isMatch: true,
      rule: r.rule,
    });
    currentIndex = r.end;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isMatch: false,
    });
  }

  return segments;
};

/**
 * Returns common bypass or disguised forms of sensitive terms to educate sellers 
 * on how the Fiverr automatic filters detect sneaky workarounds (like "g.m.a.i.l" or "whats app").
 * 
 * @param text Term to obfuscate
 */
export const getDisguisedForms = (text: string): DisguisedForm[] => {
  if (!text) return [];
  const lower = text.toLowerCase().trim();
  const forms: DisguisedForm[] = [];

  // Special overrides for "gmail" based on the user's explicit example
  if (lower === "gmail") {
    forms.push({ type: "Compound Space", value: "g mail" });
    forms.push({ type: "Dotted Letters", value: "g.m.a.i.l" });
    forms.push({ type: "Hyphenated Word", value: "g-mail" });
    forms.push({ type: "Spaced Letters", value: "g m a i l" });
    return forms;
  }

  if (lower === "@") {
    const atStr = " at ";
    forms.push({ type: "Compound Space", value: atStr });
    forms.push({ type: "Dotted Letters", value: atStr });
    forms.push({ type: "Hyphenated Word", value: atStr });
    forms.push({ type: "Spaced Letters", value: atStr });
    return forms;
  }

  const letters = text.split("");
  const first = letters[0] || "";
  const rest = letters.slice(1).join("");

  let compound = "";
  if (lower === "whatsapp" || lower === "whats app") {
    compound = "whats app";
  } else if (lower === "paypal" || lower === "pay pal") {
    compound = "pay pal";
  } else if (lower === "skype") {
    compound = "sky pe";
  } else if (lower === "telegram") {
    compound = "tele gram";
  } else if (lower === "discord") {
    compound = "dis cord";
  } else if (lower === "wechat" || lower === "we chat") {
    compound = "we chat";
  } else if (lower === "viber") {
    compound = "vi ber";
  } else if (lower === "linkedin") {
    compound = "linked in";
  } else if (text.length >= 4) {
    const mid = Math.floor(text.length / 2);
    compound = text.slice(0, mid) + " " + text.slice(mid);
  } else {
    compound = first + " " + rest;
  }

  const dotted = letters.join(".");

  let hyphenated = "";
  if (lower === "whatsapp" || lower === "whats app") {
    hyphenated = "whats-app";
  } else if (lower === "paypal" || lower === "pay pal") {
    hyphenated = "pay-pal";
  } else if (lower === "skype") {
    hyphenated = "sky-pe";
  } else if (lower === "telegram") {
    hyphenated = "tele-gram";
  } else if (lower === "discord") {
    hyphenated = "dis-cord";
  } else {
    hyphenated = letters.join("-");
  }

  const spaced = letters.join(" ");

  forms.push({ type: "Compound Space", value: compound });
  forms.push({ type: "Dotted Letters", value: dotted });
  forms.push({ type: "Hyphenated Word", value: hyphenated });
  forms.push({ type: "Spaced Letters", value: spaced });

  return forms;
};

/**
 * Runs local sandbox analysis when the server API is offline or as an instant local analyzer.
 * Scans the message for compliance issues, highlights matches, and computes a quality/risk score.
 * 
 * @param message Draft message to analyze
 */
export const runLocalAnalysis = (message: string): SafetyAnalysis => {
  const textLower = message.toLowerCase();
  const matchedRules: ComplianceRule[] = [];

  for (const rule of fullComplianceDatabase) {
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(textLower)) {
        matchedRules.push(rule);
      }
    } catch (err) {
      const cleanPhrase = rule.phrase
        .replace(/\s?\(Case\s?#\d+\)/gi, "")
        .toLowerCase();
      if (textLower.includes(cleanPhrase)) {
        matchedRules.push(rule);
      }
    }
  }

  let safetyScore = 100;
  let riskLevel: "Safe" | "Warning" | "High Risk" = "Safe";
  const dangerousContent: string[] = [];
  const potentialIssues: string[] = [];
  const safeElements: string[] = [];

  let clientMood = "Neutral";
  if (textLower.match(/urgent|quick|asap|fast|immediately/)) {
    clientMood = "Urgent";
  } else if (textLower.match(/interest|want|need|looking to/)) {
    clientMood = "Interested";
  } else if (textLower.match(/sad|bad|disappoint|angry|ruin|report/)) {
    clientMood = "Frustrated";
  } else if (textLower.match(/thank|great|perfect|awesome|good|love/)) {
    clientMood = "Positive";
  }

  if (matchedRules.length > 0) {
    const maxScore = Math.max(...matchedRules.map((r) => r.riskScore));
    safetyScore = Math.max(0, 100 - maxScore);

    const severities = matchedRules.map((r) => r.severity);
    if (
      severities.includes("Critical Risk") ||
      severities.includes("High Risk")
    ) {
      riskLevel = "High Risk";
    } else {
      riskLevel = "Warning";
    }

    for (const r of matchedRules) {
      const cleanPhrase = r.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "");
      const alertMsg = `${r.category}: "${cleanPhrase}" triggers ${r.severity}. Reason: ${r.explanation}`;

      if (r.severity === "Critical Risk" || r.severity === "High Risk") {
        if (!dangerousContent.includes(alertMsg)) {
          dangerousContent.push(alertMsg);
        }
      } else {
        if (!potentialIssues.includes(alertMsg)) {
          potentialIssues.push(alertMsg);
        }
      }
    }
  } else {
    safetyScore = 100;
    riskLevel = "Safe";
    safeElements.push(
      "Perfect guidelines alignment: No fee circumvention triggers or off-platform cues detected.",
    );
    safeElements.push("Fiverr safe communication guidelines respected.");
  }

  if (textLower.match(/hello|hi |hey |dear|greetings|hope you/)) {
    safeElements.push("Friendly and professional buyer greeting.");
  }
  if (textLower.match(/thank|best regards|regards|thanks|sincerely/)) {
    safeElements.push("Polite and standardized sign-off.");
  }
  if (message.length > 40) {
    safeElements.push(
      "Detailed scope details are provided to help clarify the project.",
    );
  }

  let highlighted = message;
  let corrected = message;

  const sortedMatches = [...matchedRules].sort(
    (a, b) => b.phrase.length - a.phrase.length,
  );
  for (const rule of sortedMatches) {
    try {
      const cleanPattern = rule.pattern;
      const regex = new RegExp(`(${cleanPattern})`, "gi");

      let colorClass =
        "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 px-1 py-0.5 rounded";
      if (rule.severity === "Critical Risk") {
        colorClass =
          "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-400/30";
      } else if (rule.severity === "High Risk") {
        colorClass =
          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-400/20";
      } else if (rule.severity === "Medium Risk") {
        colorClass =
          "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-500/20";
      } else if (rule.severity === "Low Risk") {
        colorClass =
          "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded border border-blue-500/20";
      }

      highlighted = highlighted.replace(
        regex,
        `<span class="${colorClass}">$1</span>`,
      );
      corrected = corrected.replace(regex, rule.rewrite);
    } catch (err) {
      // ignore
    }
  }

  if (corrected === message) {
    corrected = `Hi there!\n\nThank you so much for reaching out! I would be absolutely thrilled to assist you with this project. To ensure a 100% secure, transparent, and flawless project experience, let's keep all coordinates and exchanges directly here within our private Fiverr workspace chat.\n\nPlease share any requirements, details, or resources you have directly in this thread. Looking forward to delivering amazing results!\n\nBest regards.`;
  }

  const clarity = safetyScore > 75 ? 9 : 6;
  const professionalism = safetyScore > 85 ? 10 : 5;
  const persuasiveness = safetyScore > 70 ? 8 : 5;
  const trustworthiness = safetyScore > 85 ? 10 : 3;

  return {
    safetyScore,
    riskLevel,
    safeElements,
    potentialIssues,
    dangerousContent,
    highlightedMessage: highlighted,
    correctedMessage: corrected,
    successScore: Math.floor(Math.random() * 20) + 75,
    clientMood,
    communicationQualityScore: {
      clarity,
      professionalism,
      persuasiveness,
      trustworthiness,
    },
    matchedRules,
  };
};

/**
 * Builds a safe, Fiverr-compliant response draft client-side using pre-defined patterns 
 * if the live Gemini model is unreachable or unavailable.
 * 
 * @param thoughts Raw user thoughts or outlines
 * @param tone Tone requested (Friendly, Professional, Confident, Casual, etc.)
 */
export const runLocalCompose = (thoughts: string, tone: string): string => {
  const t = tone.toLowerCase();

  let greeting = "Hi there!";
  let signoff = "Best regards,\n[Your Name]";

  if (t === "friendly" || t === "warm") {
    greeting = "Hello! Hope you're having an amazing day.";
    signoff = "Warmly,\n[Your Name]";
  } else if (t === "persuasive" || t === "confident") {
    greeting =
      "Hello! I looked over your project details, and I'm highly confident we can achieve outstanding results together.";
    signoff = "Looking forward to partnering with you,\n[Your Name]";
  } else if (t === "casual" || t === "direct") {
    greeting = "Hey there,";
    signoff = "Thanks,\n[Your Name]";
  }

  let cleanThoughts = thoughts;
  const textLower = thoughts.toLowerCase();

  for (const rule of fullComplianceDatabase) {
    try {
      const regex = new RegExp(rule.pattern, "gi");
      if (regex.test(textLower)) {
        cleanThoughts = cleanThoughts.replace(regex, rule.rewrite);
      }
    } catch {
      // ignore
    }
  }

  return `${greeting}\n\nI'd be absolutely thrilled to assist you with this! To ensure we are fully aligned on the objectives and to adhere strictly to Fiverr's guidelines, let's keep all coordinates, project assets, and exchanges directly here in our Fiverr inbox.\n\nCould you please let me know your preferred timeline and if you have any references or specifications? I am ready to customize a secure proposal for you right here.\n\n${signoff}`;
};
