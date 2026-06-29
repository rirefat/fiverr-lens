export interface TosClause {
  title: string;
  description: string;
  bulletPoints?: string[];
  riskLevel?: "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
}

export interface TosSection {
  id: string;
  title: string;
  category: string;
  iconName: "BookOpen" | "User" | "TrendingUp" | "AlertTriangle" | "CreditCard" | "Scale";
  summary: string;
  clauses: TosClause[];
}

export const FIVERR_TOS_DATABASE: TosSection[] = [
  {
    id: "overview-key-terms",
    title: "1. Overview & Key Terms",
    category: "General",
    iconName: "BookOpen",
    summary: "Essential definitions and core operations of the Fiverr ecosystem, outlining how buyers, sellers, and services interact.",
    clauses: [
      {
        title: "Platform Basics",
        description: "Fiverr is an online marketplace connecting freelance service providers (Sellers) with clients who wish to purchase those services (Buyers).",
        bulletPoints: [
          "Gigs: Digital services created and offered by Sellers on Fiverr.",
          "Custom Offers: Bespoke proposals created by a Seller in response to specific Buyer requirements.",
          "Custom Orders: Agreements created when a Buyer accepts a Custom Offer from a Seller.",
          "Orders: Formal contracts between Buyers and Sellers established once a transaction is successfully paid for."
        ],
        riskLevel: "Safe"
      },
      {
        title: "User Roles & Status",
        description: "Sellers list Gigs, while Buyers browse and place orders. Users can hold both seller and buyer status under a single account.",
        bulletPoints: [
          "Users are prohibited from registering multiple Fiverr accounts to avoid account suspension.",
          "Accounts are non-transferable and may not be sold or shared with external parties.",
          "Breaching these terms can result in permanent account deactivation."
        ],
        riskLevel: "Low Risk"
      },
      {
        title: "Communication Standards",
        description: "All exchanges, communications, and files must be sent and received exclusively through the Fiverr platform messaging tool.",
        bulletPoints: [
          "Requesting or sharing contact details (e.g. Email, Skype, Phone number, WhatsApp, Discord) is strictly prohibited.",
          "Any attempt to move communication off-platform constitutes a critical violation.",
          "Messages are monitored for security and compliance to protect both parties from scam/fraud."
        ],
        riskLevel: "Critical Risk"
      }
    ]
  },
  {
    id: "seller-policies",
    title: "2. Seller Protocols & Level System",
    category: "Sellers",
    iconName: "TrendingUp",
    summary: "Rules governing Gig creation, delivery expectations, revisions, ratings, seller levels, and commercial usage rights.",
    clauses: [
      {
        title: "Gig Listings & Deliveries",
        description: "Sellers are permitted to post active Gigs offering clearly defined services with specific pricing tiers and deadlines.",
        bulletPoints: [
          "Gig descriptions, media, and search tags must accurately represent the service offered.",
          "Deliveries must be submitted through the designated 'Deliver Now' button with authentic, complete work.",
          "Using the delivery button to submit incomplete work, drafts, or placeholder messages to bypass the countdown timer is a severe violation."
        ],
        riskLevel: "High Risk"
      },
      {
        title: "Seller Levels",
        description: "Fiverr evaluates sellers periodically to award level badges (Level 1, Level 2, Top Rated Seller) based on performance metrics.",
        bulletPoints: [
          "Sellers are evaluated on active metrics: Order Completion Rate (OCR), On-Time Delivery, Response Rate, and star rating.",
          "Falling below performance thresholds (typically 90%) can result in demotion or loss of gig promotion status.",
          "Top Rated Seller status is manually reviewed by the Fiverr quality assurance team."
        ],
        riskLevel: "Low Risk"
      },
      {
        title: "Commercial Use Rights",
        description: "Unless explicitly stated otherwise in the Gig description or Custom Offer, ownership of all delivered files is granted to the Buyer upon full payment.",
        bulletPoints: [
          "Sellers may opt to offer Gigs that require an additional 'Commercial Use License' fee.",
          "If a Gig is cancelled before completion, all rights to the work remain with the Seller, and the Buyer is prohibited from using any drafts."
        ],
        riskLevel: "Safe"
      }
    ]
  },
  {
    id: "buyer-policies",
    title: "3. Buyer Conduct & Feedback Rules",
    category: "Buyers",
    iconName: "User",
    summary: "Guidelines on requesting custom quotes, placing orders, accepting deliveries, and feedback manipulation boundaries.",
    clauses: [
      {
        title: "Ordering & Briefs",
        description: "Buyers are encouraged to provide clear, detailed briefs when placing an order or requesting custom proposals.",
        bulletPoints: [
          "Buyers cannot request free work, spec work, or mockups prior to ordering.",
          "All custom requests must fall within the scope of services permitted under Fiverr's guidelines.",
          "Placing orders with the explicit intent of leaving malicious or extortive low ratings is strictly prohibited."
        ],
        riskLevel: "Medium Risk"
      },
      {
        title: "Deliveries and Revisions",
        description: "Buyers have 3 days (or 14 days for virtual shipping or complex categories) to review and accept or request revisions on a delivery.",
        bulletPoints: [
          "If no action is taken within the review window, the order automatically marks as Completed.",
          "Revision requests must align with the initial order requirements. Demanding uncontracted work under threat of bad feedback is considered extortion."
        ],
        riskLevel: "Medium Risk"
      },
      {
        title: "Feedback & Review Manipulation",
        description: "Ratings and reviews are critical to platform integrity. Manipulation or solicitation of feedback is heavily restricted.",
        bulletPoints: [
          "Sellers must not ask buyers to modify or delete their reviews.",
          "Offering refunds, discounts, or financial incentives in exchange for 5-star reviews or positive feedback is a severe violation.",
          "Buyers are forbidden from using reviews as leverage to extract unpriced revisions or free add-ons."
        ],
        riskLevel: "High Risk"
      }
    ]
  },
  {
    id: "prohibited-activities",
    title: "4. Violations, Abuse & Academic Integrity",
    category: "Compliance",
    iconName: "AlertTriangle",
    summary: "Strict boundaries on illegal, unethical, or prohibited behaviors that trigger immediate account suspension.",
    clauses: [
      {
        title: "Off-Platform Actions & Routing",
        description: "Moving communication, negotiations, or transactions off Fiverr's platform is the most common cause of permanent ban.",
        bulletPoints: [
          "Directing users to external payment gateways (PayPal, Stripe, Bank, Wise, Crypto) is strictly prohibited.",
          "Sharing direct contact lines in portfolios, sample PDFs, or screenshots is scanned and flagged automatically.",
          "Users should report any buyer or seller asking to communicate on WhatsApp, Telegram, or Skype immediately."
        ],
        riskLevel: "Critical Risk"
      },
      {
        title: "Academic Integrity Policies",
        description: "Fiverr does not tolerate services that facilitate academic dishonesty. This category carries immediate suspension risks.",
        bulletPoints: [
          "Sellers must not write or complete homework, assignments, university projects, exams, quizzes, or tests on behalf of students.",
          "Writing academic papers, theses, or dissertations for credit is strictly prohibited.",
          "Proofreading, general tutoring, and conceptual explanations are permitted as long as they do not generate graded submissions."
        ],
        riskLevel: "Critical Risk"
      },
      {
        title: "Spam, Bots, and Data Scraping",
        description: "Manipulating Fiverr's infrastructure or harvesting user data is strictly forbidden.",
        bulletPoints: [
          "Using automated bots to send messages, scrape listings, or manipulate online status is banned.",
          "Selling fake followers, social media traffic, spam backlinks, or bulk email lists violates terms.",
          "Creating multiple accounts to bypass negative ratings, promote the same gigs, or manipulate search results is penalized."
        ],
        riskLevel: "High Risk"
      }
    ]
  },
  {
    id: "financial-rules",
    title: "5. Financial Protocols & Payment Integrity",
    category: "Financials",
    iconName: "CreditCard",
    summary: "Payment processing rules, Fiverr's commission cut, withdrawal options, chargeback penalties, and dispute resolution.",
    clauses: [
      {
        title: "Commission Structure",
        description: "Fiverr operates on a standard commission model to maintain, secure, and market the platform.",
        bulletPoints: [
          "Fiverr charges Sellers a 20% platform fee on all orders, including custom offers, standard gigs, and tips.",
          "Fiverr charges Buyers a service fee on every purchase to cover payment processing and operations.",
          "Attempts to artificially discount the order price and receive separate payments externally is treated as commission bypass and leads to bans."
        ],
        riskLevel: "Medium Risk"
      },
      {
        title: "Disputes & Chargebacks",
        description: "All cancellations and dispute resolutions should be initiated through Fiverr's Resolution Center.",
        bulletPoints: [
          "Filing a payment chargeback or dispute through your bank or PayPal is a breach of terms and results in immediate, permanent account lock.",
          "Order disputes must be negotiated in the Resolution Center. If unresolved, contact Fiverr Support for mediation.",
          "Funds from cancelled orders are returned to the Buyer's Fiverr Balance rather than refunded directly to the card unless requested."
        ],
        riskLevel: "High Risk"
      },
      {
        title: "Withdrawal Regulations",
        description: "Earnings are cleared for withdrawal after a mandatory safety clearance window.",
        bulletPoints: [
          "For Top Rated Sellers and Fiverr Pro, funds clear in 7 days; for Level 1, 2, and new sellers, clearance takes 14 days.",
          "Supported withdrawal methods include PayPal, Payoneer (Fiverr Revenue Card), Wise, Direct Deposit, and Bank Transfer.",
          "Withdrawal limits and minimum withdrawal amounts apply depending on the payment provider chosen."
        ],
        riskLevel: "Low Risk"
      }
    ]
  },
  {
    id: "intellectual-property",
    title: "6. Legal Clauses & Intellectual Property",
    category: "Legal",
    iconName: "Scale",
    summary: "Copyright protections, DMCA claim handling, trademark safety, and limitation of liability clauses.",
    clauses: [
      {
        title: "Intellectual Property Ownership",
        description: "Upon delivery and full transaction completion, the Seller transfers all copyrights of the deliverables to the Buyer.",
        bulletPoints: [
          "Sellers warrant that their work is authentic and does not infringe on third-party patents, copyrights, or trademarks.",
          "Using licensed stock files is permitted only if the license terms allow redistribution or commercial use.",
          "Fiverr reserves the right to remove any Gig that is reported for copyright infringement under DMCA rules."
        ],
        riskLevel: "Medium Risk"
      },
      {
        title: "Reporting Infringements",
        description: "Copyright owners can submit official DMCA notices directly to Fiverr's legal team to take down infringing content.",
        bulletPoints: [
          "Repeated DMCA or copyright notices against a seller's Gigs will lead to account suspension.",
          "Counter-notices can be filed if a seller believes a copyright strike was made in error."
        ],
        riskLevel: "Medium Risk"
      },
      {
        title: "Limitation of Liability",
        description: "Fiverr acts as an intermediary marketplace and does not guarantee the quality, legality, or safety of any delivery.",
        bulletPoints: [
          "Fiverr is not liable for any direct, indirect, or incidental damages arising from using the platform.",
          "All disputes regarding the quality of work are between the buyer and seller, mediated through the resolution tools."
        ],
        riskLevel: "Safe"
      }
    ]
  }
];

export const OFFICIAL_LINKS = [
  {
    title: "Official Fiverr Terms of Service",
    url: "https://www.fiverr.com/terms_of_service",
    description: "The complete, legally binding platform terms governing all usage, rights, and financial rules."
  },
  {
    title: "Fiverr Community Standards",
    url: "https://www.fiverr.com/community/standards",
    description: "Fiverr's guidelines on safety, integrity, and professional conduct, detailing banned services."
  },
  {
    title: "Fiverr Payment Terms",
    url: "https://www.fiverr.com/payment-terms",
    description: "Detailed legal terms regarding purchases, balance, fees, taxes, chargebacks, and payouts."
  },
  {
    title: "Fiverr Intellectual Property Policy",
    url: "https://www.fiverr.com/intellectual-property-policy",
    description: "How Fiverr handles copyright infringement, trademarks, and DMCA claims."
  }
];
