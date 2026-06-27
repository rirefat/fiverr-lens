export interface PlaybookItem {
  title: string;
  badge: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  text: string;
  dangerWords: string[];
  alternatives: {
    label: string;
    original: string;
    safe: string;
  }[];
  strategy: string;
}

export const playbookData: Record<string, PlaybookItem> = {
  payment: {
    title: "Payments & Invoices",
    badge: "External Payments",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    text: "Requesting payment via PayPal, CashApp, or direct wire bypasses Fiverr's secure payment escrow, leading to immediate account flags or suspension.",
    dangerWords: [
      "PayPal",
      "CashApp",
      "Direct Invoice",
      "Bank transfer",
      "Crypto",
      "BTC",
    ],
    alternatives: [
      {
        label: "Secure Milestone Offer",
        original:
          "Send me payment on PayPal so we avoid the 20% commission fee.",
        safe: "I will set up structured, secure payment milestones directly here on Fiverr for this project.",
      },
      {
        label: "Fiverr Escrow Checkout",
        original: "Pay me half directly via bank transfer first, then I start.",
        safe: "I have prepared a secure custom order proposal on Fiverr. You can confirm it to safely fund the escrow.",
      },
    ],
    strategy:
      "Keep all financial discussion tied to custom offers. Escrow funding guarantees you are paid upon successful completion of your deliveries.",
  },
  meeting: {
    title: "Meetings & Calls",
    badge: "Off-Platform Calls",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/25",
    text: "Exchanging Skype usernames, WhatsApp numbers, or personal Discord tags before an order is placed triggers immediate automated Fiverr filter warnings.",
    dangerWords: [
      "Skype username",
      "WhatsApp number",
      "Add my Discord",
      "Personal phone number",
      "Google Meet link",
    ],
    alternatives: [
      {
        label: "Native Video Call",
        original: "Let's talk on Skype or WhatsApp to details requirements.",
        safe: "Let's schedule an official Fiverr video consultation right here in our inbox to clarify project requirements.",
      },
      {
        label: "Audio Handoff Notes",
        original: "Give me your phone number so we can have a quick call.",
        safe: "We can securely use Fiverr's built-in voice call scheduler inside our order thread once the order is active.",
      },
    ],
    strategy:
      "Pre-order external links are strictly forbidden. Did you know Fiverr provides built-in high-quality video call schedulers directly inside client chat?",
  },
  review: {
    title: "Ratings & Anti-Coercion",
    badge: "Review Manipulation",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    text: "Demanding 5-star feedback, offering discounts in exchange for positive reviews, or withholding delivery source files violates feedback integrity rules.",
    dangerWords: [
      "give 5 stars",
      "positive review for discount",
      "change rating to refund",
      "5-star rating hold",
    ],
    alternatives: [
      {
        label: "Neutral Evaluation",
        original:
          "Please write a 5-star rating for me so my gig stays ranked high.",
        safe: "I have delivered the final project files. Your honest thoughts on this order are highly appreciated!",
      },
      {
        label: "Neutral Review Reminder",
        original:
          "I will send the source assets after you leave me a good review.",
        safe: "Once you have reviewed the deliverables, you are welcome to leave your honest comments and rating on the order page.",
      },
    ],
    strategy:
      "Fiverr's AI filter flags combinations of 'review', 'rating', '5 stars', and 'positive'. Always ask for satisfaction and honest thoughts, never ratings.",
  },
  assets: {
    title: "File Sharing & Portfolios",
    badge: "External Links",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    text: "Sharing personal portfolio websites containing direct emails, or unauthorized external file-transfer tools (WeTransfer links, etc.) can flag your messages.",
    dangerWords: [
      "WeTransfer link",
      "My Instagram link",
      "Personal portfolio email",
      "Direct website link",
    ],
    alternatives: [
      {
        label: "Approved Repositories",
        original:
          "Check my personal website portfolio to see all my past work.",
        safe: "You can view samples of my previous projects directly on my official Fiverr gig portfolio page.",
      },
      {
        label: "Fiverr Large Attachments",
        original: "Send the project files to my email address or WeTransfer.",
        safe: "I have attached the source assets directly to this Fiverr message thread for your review.",
      },
    ],
    strategy:
      "Fiverr supports file uploads of up to 5GB directly in chat. Approved third-party domains include Google Drive, GitHub, Loom, YouTube, and Flickr.",
  },
};
