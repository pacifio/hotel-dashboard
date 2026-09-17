import { addMinutes, demoToday } from "@/lib/demo-time"
import type {
  Bilingual,
  CallRecord,
  CallTurn,
  Guest,
  Tenant,
} from "@/lib/types"
import type { Rng } from "./rng"

type ScriptTurn = { speaker: "ai" | "caller"; text: Bilingual; gapMs: number }

/**
 * The flagship demo call: a Bangladeshi caller books a room entirely in Bangla,
 * code-switching into English the way people actually do on the phone. The `en`
 * column is the live English translation the transcript panel shows when the
 * interface is in English.
 */
const BANGLA_BOOKING_CALL: ScriptTurn[] = [
  {
    speaker: "ai",
    gapMs: 600,
    text: {
      bn: "আসসালামু আলাইকুম, সারিনা রেসিডেন্সিতে আপনাকে স্বাগতম। আমি অবার্জ, আপনার এআই কনসিয়ার্জ। কীভাবে সাহায্য করতে পারি?",
      en: "Assalamu alaikum, welcome to Sarina Residency. I'm Auberge, your AI concierge. How can I help?",
    },
  },
  {
    speaker: "caller",
    gapMs: 2400,
    text: {
      bn: "হ্যাঁ ভাই, আমি একটা রুম বুক করতে চাচ্ছিলাম। আগামী বৃহস্পতিবার থেকে।",
      en: "Yes, I wanted to book a room. Starting from this coming Thursday.",
    },
  },
  {
    speaker: "ai",
    gapMs: 1200,
    text: {
      bn: "অবশ্যই। বৃহস্পতিবার মানে ১৯ তারিখ। কয় রাতের জন্য থাকবেন?",
      en: "Of course. Thursday would be the 19th. How many nights will you be staying?",
    },
  },
  {
    speaker: "caller",
    gapMs: 1900,
    text: {
      bn: "তিন রাত। শনিবার চেক আউট করব।",
      en: "Three nights. I'll check out on Saturday.",
    },
  },
  {
    speaker: "ai",
    gapMs: 1400,
    text: {
      bn: "ঠিক আছে — ১৯ থেকে ২২ তারিখ, তিন রাত। কতজন থাকবেন?",
      en: "Understood — the 19th to the 22nd, three nights. How many guests?",
    },
  },
  {
    speaker: "caller",
    gapMs: 1700,
    text: {
      bn: "আমি আর আমার স্ত্রী। আর যদি একটু উপরের ফ্লোরে হয় ভালো হয়।",
      en: "My wife and myself. And a higher floor would be good if possible.",
    },
  },
  {
    speaker: "ai",
    gapMs: 1500,
    text: {
      bn: "লিখে নিলাম। দুজনের জন্য ডিলাক্স রুম আছে — প্রতি রাত ১৯ হাজার ৪০০ টাকা, নাশতা সহ। নয় তলার ৯১২ নম্বর রুমটা খালি আছে। নেব?",
      en: "Noted. I have a Deluxe room for two — ৳19,400 per night including breakfast. Room 912 on the ninth floor is available. Shall I take it?",
    },
  },
  {
    speaker: "caller",
    gapMs: 2100,
    text: {
      bn: "হ্যাঁ, নিয়ে নেন। আর এয়ারপোর্ট থেকে গাড়ির ব্যবস্থা হবে?",
      en: "Yes, take it. And can you arrange a car from the airport?",
    },
  },
  {
    speaker: "ai",
    gapMs: 1300,
    text: {
      bn: "হবে। সেডানে একমুখী ৩ হাজার ২০০ টাকা। ফ্লাইট নম্বরটা পরে হোয়াটসঅ্যাপে পাঠালেই হবে। আপনার নামটা বলবেন?",
      en: "Yes. A sedan is ৳3,200 one way. You can send the flight number on WhatsApp later. May I have your name?",
    },
  },
  {
    speaker: "caller",
    gapMs: 1800,
    text: {
      bn: "তানভীর হোসেন। নম্বর এটাই রাখেন।",
      en: "Tanvir Hossain. Keep this number.",
    },
  },
  {
    speaker: "ai",
    gapMs: 1600,
    text: {
      bn: "ধন্যবাদ তানভীর সাহেব। বুকিং কনফার্ম — রেফারেন্স এস আর ১২৪৮। মোট ৬১ হাজার ৪০০ টাকা, চেক-ইনের সময় পরিশোধ করতে পারবেন। কনফার্মেশন হোয়াটসঅ্যাপে পাঠিয়ে দিচ্ছি।",
      en: "Thank you, Mr. Tanvir. Booking confirmed — reference SR1248. The total is ৳61,400, payable at check-in. I'm sending the confirmation on WhatsApp now.",
    },
  },
  {
    speaker: "caller",
    gapMs: 1500,
    text: { bn: "ধন্যবাদ ভাই। রাখছি।", en: "Thank you. Goodbye." },
  },
]

const ENGLISH_ENQUIRY_CALL: ScriptTurn[] = [
  {
    speaker: "ai",
    gapMs: 600,
    text: {
      en: "Good evening, thank you for calling. This is Auberge, the AI concierge. How may I help?",
      bn: "শুভ সন্ধ্যা, কল করার জন্য ধন্যবাদ। আমি অবার্জ, এআই কনসিয়ার্জ। কীভাবে সাহায্য করতে পারি?",
    },
  },
  {
    speaker: "caller",
    gapMs: 2200,
    text: {
      en: "Hi, I'm organising an offsite for about thirty people in February. Do you handle that kind of thing?",
      bn: "হ্যালো, ফেব্রুয়ারিতে প্রায় ত্রিশ জনের একটি অফসাইটের আয়োজন করছি। আপনারা এ ধরনের আয়োজন করেন?",
    },
  },
  {
    speaker: "ai",
    gapMs: 1400,
    text: {
      en: "We do. Thirty rooms puts you past our automatic booking limit, so I'll collect the details and hand this to our group sales desk — they'll come back within the hour. Which dates in February?",
      bn: "জি করি। ত্রিশটি কক্ষ আমাদের স্বয়ংক্রিয় বুকিং সীমার বাইরে, তাই আমি তথ্য নিয়ে গ্রুপ সেলস ডেস্কে পাঠিয়ে দেব — তারা এক ঘণ্টার মধ্যে যোগাযোগ করবে। ফেব্রুয়ারির কোন তারিখ?",
    },
  },
  {
    speaker: "caller",
    gapMs: 2000,
    text: {
      en: "The tenth to the twelfth. We'd also need a conference room with AV.",
      bn: "দশ থেকে বারো তারিখ। সাথে এভি সুবিধাসহ একটি সম্মেলন কক্ষও লাগবে।",
    },
  },
  {
    speaker: "ai",
    gapMs: 1500,
    text: {
      en: "Noted — 10th to 12th February, thirty rooms, one conference room with AV. I've created deal record D-2291 and flagged it high priority. You'll get a call from Nusrat on the sales desk shortly.",
      bn: "লিখে নিলাম — ১০ থেকে ১২ ফেব্রুয়ারি, ত্রিশটি কক্ষ, এভিসহ একটি সম্মেলন কক্ষ। চুক্তি রেকর্ড D-2291 তৈরি করে উচ্চ অগ্রাধিকার দিয়েছি। শীঘ্রই বিক্রয় ডেস্কের নুসরাত আপনাকে কল করবেন।",
    },
  },
]

const INTENTS: Bilingual[] = [
  { en: "New reservation", bn: "নতুন সংরক্ষণ" },
  { en: "Rate enquiry", bn: "ভাড়া সংক্রান্ত অনুসন্ধান" },
  { en: "Modify booking", bn: "বুকিং পরিবর্তন" },
  { en: "Group enquiry", bn: "গ্রুপ অনুসন্ধান" },
  { en: "Cancellation", bn: "বাতিলকরণ" },
  { en: "Airport transfer", bn: "বিমানবন্দর পরিবহন" },
  { en: "Complaint", bn: "অভিযোগ" },
  { en: "Lost and found", bn: "হারানো ও প্রাপ্তি" },
]

function toTurns(script: ScriptTurn[], prefix: string): CallTurn[] {
  let atMs = 0
  return script.map((turn, i) => {
    atMs += turn.gapMs
    return {
      id: `${prefix}_${i}`,
      speaker: turn.speaker,
      text: turn.text,
      atMs,
    }
  })
}

export const LIVE_CALL_SCRIPTS = {
  bn: toTurns(BANGLA_BOOKING_CALL, "live_bn"),
  en: toTurns(ENGLISH_ENQUIRY_CALL, "live_en"),
}

export function buildCalls(
  rng: Rng,
  tenant: Tenant,
  guests: Guest[]
): CallRecord[] {
  const today = demoToday()

  // The two featured calls are hand-written and name their caller out loud, so
  // pin those guest records to match the transcript.
  const bnCaller = guests[3]
  const enCaller = guests[8]
  bnCaller.name = { en: "Tanvir Hossain", bn: "তানভীর হোসেন" }
  enCaller.name = { en: "Oliver Whitfield", bn: "অলিভার হুইটফিল্ড" }

  const featured: CallRecord[] = [
    {
      id: "call_live_bn",
      guestId: bnCaller.id,
      direction: "inbound",
      language: "bn",
      startedAt: addMinutes(today, -14).toISOString(),
      durationSeconds: 108,
      outcome: "booked",
      sentiment: 0.82,
      intent: INTENTS[0],
      turns: LIVE_CALL_SCRIPTS.bn,
    },
    {
      id: "call_live_en",
      guestId: enCaller.id,
      direction: "inbound",
      language: "en",
      startedAt: addMinutes(today, -96).toISOString(),
      durationSeconds: 87,
      outcome: "escalated",
      sentiment: 0.64,
      intent: INTENTS[3],
      turns: LIVE_CALL_SCRIPTS.en,
    },
  ]

  const history: CallRecord[] = Array.from({ length: 30 }, (_, i) => {
    const language = rng.bool(0.62) ? "bn" : "en"
    return {
      id: `call_${i + 1}`,
      guestId: guests[(i * 11) % guests.length].id,
      direction: rng.bool(0.86) ? "inbound" : "outbound",
      language,
      startedAt: addMinutes(today, -rng.int(120, 60 * 24 * 6)).toISOString(),
      durationSeconds: rng.int(28, 420),
      outcome: rng.weighted([
        ["booked", 38],
        ["enquiry", 34],
        ["escalated", 20],
        ["missed", 8],
      ]),
      sentiment: Number(rng.float(0.18, 0.96).toFixed(2)),
      intent: rng.pick(INTENTS),
      turns: [],
    }
  })

  return [...featured, ...history]
}
