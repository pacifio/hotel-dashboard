import type { Bilingual } from "@/lib/types"

export type ScriptedReply = {
  match: string[]
  body: Bilingual
  confidence: number
  attachment?: {
    kind: "booking" | "roomOptions" | "invoice"
    payload: Record<string, string | number>
  }
}

/**
 * What the autopilot says when the demo user types into a thread. Keyword
 * routed, bilingual, and one branch produces the reservation card inline.
 */
export const SCRIPTED_REPLIES: ScriptedReply[] = [
  {
    match: [
      "book",
      "reserve",
      "room for",
      "available",
      "বুক",
      "রুম",
      "খালি",
      "সংরক্ষণ",
    ],
    confidence: 0.96,
    body: {
      en: "I can hold that for you right now. Deluxe is open for those dates at ৳19,400 a night including breakfast for two, and I've noted a high floor on the profile. Confirming the reservation.",
      bn: "এখনই আপনার জন্য রেখে দিতে পারি। ওই তারিখগুলোতে ডিলাক্স খালি আছে — প্রতি রাত ৳১৯,৪০০, দুজনের নাশতাসহ, এবং প্রোফাইলে উঁচু তলার কথা লিখে রেখেছি। সংরক্ষণ নিশ্চিত করছি।",
    },
    attachment: {
      kind: "booking",
      payload: {
        room: "1108",
        roomType: "deluxe",
        nights: 2,
        adults: 2,
        rate: 19400,
        total: 38800,
      },
    },
  },
  {
    match: ["price", "rate", "cost", "how much", "ভাড়া", "দাম", "কত"],
    confidence: 0.93,
    body: {
      en: "For those dates: Deluxe ৳19,400, Executive ৳27,800 and Suite ৳46,900 per night, all including breakfast for two and airport pickup on stays of three nights or more.",
      bn: "ওই তারিখগুলোর জন্য: ডিলাক্স ৳১৯,৪০০, এক্সিকিউটিভ ৳২৭,৮০০ এবং স্যুট ৳৪৬,৯০০ প্রতি রাত — সবগুলোতেই দুজনের নাশতা এবং তিন রাত বা তার বেশি থাকলে বিমানবন্দর থেকে গাড়ি অন্তর্ভুক্ত।",
    },
    attachment: { kind: "roomOptions", payload: { options: 3, from: 19400 } },
  },
  {
    match: ["cancel", "refund", "বাতিল", "ফেরত"],
    confidence: 0.61,
    body: {
      en: "I can cancel this free of charge up to 48 hours before arrival. You're inside that window, so there would be a one-night charge — I'd rather a colleague confirm that with you before I action it.",
      bn: "আগমনের ৪৮ ঘণ্টা আগে পর্যন্ত বিনামূল্যে বাতিল করা যায়। আপনি সেই সময়সীমার ভেতরে আছেন, তাই এক রাতের চার্জ প্রযোজ্য হবে — কাজটি করার আগে একজন সহকর্মী আপনার সাথে বিষয়টি নিশ্চিত করলে ভালো হয়।",
    },
  },
  {
    match: ["late", "delay", "flight", "দেরি", "ফ্লাইট"],
    confidence: 0.97,
    body: {
      en: "No problem at all — I've marked this as a late check-in, so the room is held all night and the night desk knows to expect you. A cold platter will be waiting in the room.",
      bn: "কোনো সমস্যা নেই — এটি দেরিতে চেক-ইন হিসেবে চিহ্নিত করেছি, তাই সারারাত কক্ষটি সংরক্ষিত থাকবে এবং নাইট ডেস্ক আপনার জন্য অপেক্ষা করবে। কক্ষে হালকা খাবার রাখা থাকবে।",
    },
  },
  {
    match: ["thank", "thanks", "ধন্যবাদ"],
    confidence: 0.99,
    body: {
      en: "My pleasure. I'll be here if anything changes before your arrival.",
      bn: "আমার আনন্দ। আগমনের আগে কিছু পরিবর্তন হলে আমাকে জানাবেন।",
    },
  },
]

export const DEFAULT_REPLY: ScriptedReply = {
  match: [],
  confidence: 0.86,
  body: {
    en: "Thanks for that — I've pulled up your profile and past stays. Let me check with the front office and come back to you in a moment with a firm answer.",
    bn: "ধন্যবাদ — আপনার প্রোফাইল ও পূর্ববর্তী অবস্থানের তথ্য দেখে নিয়েছি। ফ্রন্ট অফিসের সাথে যাচাই করে একটু পরেই নিশ্চিত উত্তর জানাচ্ছি।",
  },
}

export function routeReply(text: string): ScriptedReply {
  const normalized = text.toLowerCase()
  return (
    SCRIPTED_REPLIES.find((reply) =>
      reply.match.some((keyword) => normalized.includes(keyword.toLowerCase()))
    ) ?? DEFAULT_REPLY
  )
}
