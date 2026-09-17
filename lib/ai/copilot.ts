import type { Bilingual } from "@/lib/types"

export type ToolCall = {
  id: string
  name: string
  args: Bilingual
  latencyMs: number
  rows?: number
  render:
    | { kind: "chart"; series: "occupancy" | "revenue" | "adr"; days: number }
    | { kind: "table"; columns: Bilingual[]; rows: (string | number)[][] }
    | { kind: "availability"; nights: number }
    | {
        kind: "metric"
        labelKey: string
        value: number
        delta: number
        money?: boolean
      }
}

export type CopilotAnswer = {
  id: string
  /** Keywords in either language that route a prompt to this answer */
  match: string[]
  prompt: Bilingual
  thinking: Bilingual
  tools: ToolCall[]
  answer: Bilingual
  sources: Bilingual[]
  followUps: Bilingual[]
}

/**
 * The copilot is fully scripted — no model, no network. Each answer carries the
 * tool calls it "made", so the transcript shows the agent querying the ERP and
 * rendering live components from this property's real (generated) data.
 */
export const COPILOT_ANSWERS: CopilotAnswer[] = [
  {
    id: "occupancy-trend",
    match: ["occupancy", "trend", "অকুপেন্সি", "প্রবণতা", "কেমন চলছে"],
    prompt: {
      en: "How is occupancy trending this month?",
      bn: "এই মাসে অকুপেন্সি কেমন চলছে?",
    },
    thinking: {
      en: "Pulling 30 days of room-night data and comparing to the prior period…",
      bn: "৩০ দিনের কক্ষ-রাতের তথ্য নিয়ে আগের সময়ের সাথে তুলনা করছি…",
    },
    tools: [
      {
        id: "t1",
        name: "erp.reservations.aggregate",
        args: {
          en: "period=last_30d, group_by=day, metric=occupancy",
          bn: "period=last_30d, group_by=day, metric=occupancy",
        },
        latencyMs: 412,
        rows: 30,
        render: { kind: "chart", series: "occupancy", days: 30 },
      },
    ],
    answer: {
      en: "Occupancy is holding well above your rolling average, with the lift concentrated on Thursday–Saturday. Weekday midweek nights are the soft spot — Tuesday and Wednesday sit roughly 14 points below the weekend peak, which is where the recoverable revenue is. Two things are driving the weekend strength: direct bookings are up and the AI agent is converting WhatsApp enquiries faster than the old email-only flow.",
      bn: "অকুপেন্সি আপনার চলমান গড়ের বেশ ওপরে আছে, বিশেষ করে বৃহস্পতি থেকে শনিবার। দুর্বল জায়গা হলো সপ্তাহের মাঝামাঝি — মঙ্গল ও বুধবার সপ্তাহান্তের সর্বোচ্চের চেয়ে প্রায় ১৪ পয়েন্ট নিচে, এখানেই পুনরুদ্ধারযোগ্য রাজস্ব লুকিয়ে আছে। সপ্তাহান্তের শক্তির পেছনে দুটি কারণ: সরাসরি বুকিং বেড়েছে এবং এআই এজেন্ট আগের শুধু-ইমেইল প্রক্রিয়ার চেয়ে দ্রুত হোয়াটসঅ্যাপ অনুসন্ধান রূপান্তর করছে।",
    },
    sources: [
      { en: "Reservations · last 30 days", bn: "সংরক্ষণ · গত ৩০ দিন" },
      { en: "Channel mix report", bn: "চ্যানেল মিশ্রণ প্রতিবেদন" },
    ],
    followUps: [
      { en: "Which nights should I discount?", bn: "কোন রাতগুলোতে ছাড় দেব?" },
      {
        en: "Compare to the same month last year",
        bn: "গত বছরের একই মাসের সাথে তুলনা করুন",
      },
    ],
  },
  {
    id: "pricing",
    match: ["price", "rate", "pricing", "deluxe", "ভাড়া", "দাম", "মূল্য"],
    prompt: {
      en: "What should I price Deluxe at this weekend?",
      bn: "এই সপ্তাহান্তে ডিলাক্সের ভাড়া কত রাখা উচিত?",
    },
    thinking: {
      en: "Checking forward demand, comp-set rates and your historical price elasticity…",
      bn: "ভবিষ্যৎ চাহিদা, প্রতিযোগীদের ভাড়া এবং আপনার ঐতিহাসিক মূল্য-সংবেদনশীলতা যাচাই করছি…",
    },
    tools: [
      {
        id: "t1",
        name: "erp.rates.forward_demand",
        args: {
          en: "room_type=deluxe, window=fri..sun",
          bn: "room_type=deluxe, window=fri..sun",
        },
        latencyMs: 288,
        rows: 3,
        render: {
          kind: "metric",
          labelKey: "dashboard.adr",
          value: 0,
          delta: 8.4,
          money: true,
        },
      },
      {
        id: "t2",
        name: "market.compset.rates",
        args: { en: "radius=2km, stars=5", bn: "radius=2km, stars=5" },
        latencyMs: 640,
        rows: 6,
        render: {
          kind: "table",
          columns: [
            { en: "Property", bn: "সম্পত্তি" },
            { en: "Fri", bn: "শুক্র" },
            { en: "Sat", bn: "শনি" },
            { en: "Availability", bn: "প্রাপ্যতা" },
          ],
          rows: [
            ["Comp A", "22,400", "24,900", "Sold out"],
            ["Comp B", "20,100", "22,600", "4 left"],
            ["Comp C", "18,900", "21,200", "Open"],
            ["Comp D", "24,500", "26,800", "Sold out"],
          ],
        },
      },
    ],
    answer: {
      en: "Push Deluxe to the top of your band for Friday and Saturday. Three of the four comparable properties within two kilometres are already sold out for Saturday, and your own pickup curve for that night is running eleven days ahead of pace. An 8% lift keeps you under the two sold-out properties while clearing the remaining inventory. I would leave Sunday alone — demand there is genuinely price-sensitive and the same increase historically costs you more in cancellations than it earns.",
      bn: "শুক্র ও শনিবারের জন্য ডিলাক্সের ভাড়া আপনার সীমার সর্বোচ্চে নিন। দুই কিলোমিটারের মধ্যে চারটি তুলনীয় হোটেলের তিনটিই শনিবারের জন্য পূর্ণ, আর সেই রাতে আপনার নিজের বুকিং গতি স্বাভাবিকের চেয়ে এগারো দিন এগিয়ে। ৮% বাড়ালেও আপনি দুটি পূর্ণ হোটেলের নিচে থাকবেন এবং বাকি কক্ষগুলোও বিক্রি হবে। রবিবার অপরিবর্তিত রাখুন — সেখানে চাহিদা সত্যিই মূল্য-সংবেদনশীল এবং একই বৃদ্ধিতে অতীতে বাতিলের ক্ষতি আয়ের চেয়ে বেশি হয়েছে।",
    },
    sources: [
      { en: "Rate plan · BAR", bn: "ভাড়া পরিকল্পনা · বিএআর" },
      { en: "Comp-set feed", bn: "প্রতিযোগী তথ্যপ্রবাহ" },
      { en: "Pickup curve · 90d", bn: "বুকিং গতি · ৯০ দিন" },
    ],
    followUps: [
      { en: "Apply this rate change", bn: "এই ভাড়া পরিবর্তন প্রয়োগ করুন" },
      { en: "What about Executive?", bn: "এক্সিকিউটিভের ক্ষেত্রে কী?" },
    ],
  },
  {
    id: "availability",
    match: [
      "available",
      "availability",
      "free room",
      "খালি",
      "প্রাপ্যতা",
      "রুম আছে",
    ],
    prompt: {
      en: "Show me rooms free for 3 nights from Friday",
      bn: "শুক্রবার থেকে ৩ রাতের জন্য খালি কক্ষ দেখান",
    },
    thinking: {
      en: "Scanning the room rack for uninterrupted 3-night windows…",
      bn: "টানা ৩ রাতের খালি সময় খুঁজতে কক্ষ র‍্যাক স্ক্যান করছি…",
    },
    tools: [
      {
        id: "t1",
        name: "erp.rooms.availability",
        args: { en: "from=friday, nights=3", bn: "from=friday, nights=3" },
        latencyMs: 236,
        render: { kind: "availability", nights: 3 },
      },
    ],
    answer: {
      en: "Here are the rooms with a clean three-night window. I have ordered them by rate so you can quote from the top down, and excluded anything currently flagged out of service or with a pending work order.",
      bn: "এখানে টানা তিন রাত খালি আছে এমন কক্ষগুলো দেওয়া হলো। ভাড়া অনুযায়ী সাজিয়েছি যাতে ওপর থেকে দর দিতে পারেন, এবং সেবার বাইরে থাকা বা মেরামতের অপেক্ষায় থাকা কক্ষগুলো বাদ দিয়েছি।",
    },
    sources: [{ en: "Room rack · live", bn: "কক্ষ র‍্যাক · লাইভ" }],
    followUps: [
      {
        en: "Hold the best one for 24 hours",
        bn: "সেরাটি ২৪ ঘণ্টার জন্য রাখুন",
      },
      { en: "What if they need 5 nights?", bn: "৫ রাত লাগলে কী হবে?" },
    ],
  },
  {
    id: "corporate",
    match: [
      "corporate",
      "accounts",
      "top clients",
      "কর্পোরেট",
      "অ্যাকাউন্ট",
      "ক্লায়েন্ট",
    ],
    prompt: {
      en: "Who are my top corporate accounts?",
      bn: "আমার শীর্ষ কর্পোরেট অ্যাকাউন্ট কারা?",
    },
    thinking: {
      en: "Ranking accounts by room nights and realised revenue…",
      bn: "কক্ষ-রাত ও অর্জিত রাজস্ব অনুযায়ী অ্যাকাউন্ট সাজাচ্ছি…",
    },
    tools: [
      {
        id: "t1",
        name: "crm.companies.rank",
        args: {
          en: "order_by=room_nights, limit=6",
          bn: "order_by=room_nights, limit=6",
        },
        latencyMs: 318,
        rows: 6,
        render: {
          kind: "table",
          columns: [
            { en: "Account", bn: "অ্যাকাউন্ট" },
            { en: "Room nights", bn: "কক্ষ-রাত" },
            { en: "Value", bn: "মূল্য" },
            { en: "Trend", bn: "প্রবণতা" },
          ],
          rows: [],
        },
      },
    ],
    answer: {
      en: "Your top six accounts carry most of the corporate base. Two of them are worth watching: their room nights are flat but their enquiry volume is down, which historically precedes a contract lapse by about a quarter. I would get a renewal conversation on the calendar with both before the end of the month.",
      bn: "আপনার শীর্ষ ছয়টি অ্যাকাউন্টই কর্পোরেট ভিত্তির বেশিরভাগ ধরে রেখেছে। এর মধ্যে দুটির দিকে নজর দেওয়া দরকার: তাদের কক্ষ-রাত স্থির থাকলেও অনুসন্ধানের পরিমাণ কমছে, যা অতীতে প্রায় এক প্রান্তিক আগেই চুক্তি শেষ হওয়ার ইঙ্গিত দিয়েছে। মাস শেষ হওয়ার আগেই দুজনের সাথে নবায়ন আলোচনা নির্ধারণ করুন।",
    },
    sources: [
      { en: "CRM · companies", bn: "সিআরএম · প্রতিষ্ঠান" },
      { en: "Folios · 12 months", bn: "ফোলিও · ১২ মাস" },
    ],
    followUps: [
      { en: "Draft a renewal email", bn: "নবায়নের ইমেইল খসড়া করুন" },
      { en: "Which accounts are at risk?", bn: "কোন অ্যাকাউন্টগুলো ঝুঁকিতে?" },
    ],
  },
  {
    id: "ai-performance",
    match: ["ai agent", "autopilot", "bot", "এআই", "অটোপাইলট", "এজেন্ট"],
    prompt: {
      en: "How is the AI agent performing?",
      bn: "এআই এজেন্ট কেমন কাজ করছে?",
    },
    thinking: {
      en: "Reading agent run traces and conversation outcomes…",
      bn: "এজেন্ট রান ও কথোপকথনের ফলাফল পড়ছি…",
    },
    tools: [
      {
        id: "t1",
        name: "ai.agents.metrics",
        args: { en: "window=7d", bn: "window=7d" },
        latencyMs: 194,
        render: {
          kind: "metric",
          labelKey: "inbox.aiHandled",
          value: 0,
          delta: 12.6,
        },
      },
    ],
    answer: {
      en: "The agent is handling the clear majority of inbound threads end to end, and median first-reply time is under thirty seconds across every text channel. Escalations cluster in two places: group enquiries above fifteen rooms, which is by design, and repeat complaints on a room that already has an open work order. The second one is worth keeping — a human should be answering those.",
      bn: "এজেন্ট আগত থ্রেডের স্পষ্ট সংখ্যাগরিষ্ঠ অংশ শুরু থেকে শেষ পর্যন্ত সামলাচ্ছে, এবং সব টেক্সট চ্যানেলে প্রথম উত্তরের গড় সময় ত্রিশ সেকেন্ডের কম। হস্তান্তর মূলত দুই জায়গায়: পনেরোর বেশি কক্ষের গ্রুপ অনুসন্ধান — যা ইচ্ছাকৃত, এবং যে কক্ষে ইতিমধ্যে মেরামতের কাজ চলছে সেখানে পুনরাবৃত্ত অভিযোগ। দ্বিতীয়টি রেখে দেওয়াই ভালো — ওগুলোর উত্তর মানুষেরই দেওয়া উচিত।",
    },
    sources: [
      { en: "Agent runs · 7 days", bn: "এজেন্ট রান · ৭ দিন" },
      { en: "Inbox · conversations", bn: "ইনবক্স · কথোপকথন" },
    ],
    followUps: [
      {
        en: "Show me the escalated threads",
        bn: "হস্তান্তরিত থ্রেডগুলো দেখান",
      },
      {
        en: "Raise the autopilot room limit",
        bn: "অটোপাইলটের কক্ষসীমা বাড়ান",
      },
    ],
  },
  {
    id: "revenue-drop",
    match: ["revpar", "drop", "down", "why", "কমেছে", "কেন", "রেভপার"],
    prompt: {
      en: "Why did RevPAR dip last week?",
      bn: "গত সপ্তাহে রেভপার কেন কমল?",
    },
    thinking: {
      en: "Decomposing RevPAR into rate and occupancy contributions…",
      bn: "রেভপারকে ভাড়া ও অকুপেন্সির অবদানে ভাগ করছি…",
    },
    tools: [
      {
        id: "t1",
        name: "erp.metrics.decompose",
        args: {
          en: "metric=revpar, window=last_7d",
          bn: "metric=revpar, window=last_7d",
        },
        latencyMs: 522,
        rows: 7,
        render: { kind: "chart", series: "revenue", days: 21 },
      },
    ],
    answer: {
      en: "Almost none of it was rate — your ADR barely moved. The dip is an occupancy story, and it traces to two specific nights where a corporate block released late and the rooms did not get back into general inventory fast enough to resell. That is a process gap rather than a demand problem: tightening the release window on corporate blocks from 48 hours to 7 days would have recovered most of it.",
      bn: "এর প্রায় কিছুই ভাড়ার কারণে নয় — আপনার গড় দৈনিক ভাড়া প্রায় অপরিবর্তিত। পতনটি অকুপেন্সির, এবং এর উৎস নির্দিষ্ট দুটি রাত যেখানে একটি কর্পোরেট ব্লক দেরিতে ছাড়া হয়েছিল এবং কক্ষগুলো পুনরায় বিক্রির জন্য সময়মতো সাধারণ ইনভেন্টরিতে ফেরেনি। এটি চাহিদার সমস্যা নয়, প্রক্রিয়ার ফাঁক: কর্পোরেট ব্লক ছাড়ার সময়সীমা ৪৮ ঘণ্টা থেকে ৭ দিনে আনলে এর বেশিরভাগই পুনরুদ্ধার হতো।",
    },
    sources: [
      { en: "Night audit · 7 days", bn: "নাইট অডিট · ৭ দিন" },
      { en: "Block release log", bn: "ব্লক ছাড়ের লগ" },
    ],
    followUps: [
      { en: "Change the release window", bn: "ছাড়ের সময়সীমা পরিবর্তন করুন" },
      {
        en: "Which accounts released late?",
        bn: "কোন অ্যাকাউন্টগুলো দেরিতে ছেড়েছে?",
      },
    ],
  },
  {
    id: "housekeeping",
    match: [
      "housekeeping",
      "clean",
      "staff",
      "roster",
      "হাউসকিপিং",
      "কর্মী",
      "রোস্টার",
    ],
    prompt: {
      en: "Are we staffed properly for tomorrow?",
      bn: "আগামীকালের জন্য কর্মী পর্যাপ্ত আছে?",
    },
    thinking: {
      en: "Matching tomorrow's departures against the housekeeping roster…",
      bn: "আগামীকালের প্রস্থানের সাথে হাউসকিপিং রোস্টার মেলাচ্ছি…",
    },
    tools: [
      {
        id: "t1",
        name: "erp.housekeeping.forecast",
        args: { en: "date=tomorrow", bn: "date=tomorrow" },
        latencyMs: 267,
        render: {
          kind: "table",
          columns: [
            { en: "Shift", bn: "শিফট" },
            { en: "Rostered", bn: "রোস্টারে" },
            { en: "Required", bn: "প্রয়োজন" },
            { en: "Gap", bn: "ঘাটতি" },
          ],
          rows: [
            ["Morning", 9, 12, "-3"],
            ["Evening", 7, 6, "+1"],
            ["Night", 3, 3, "0"],
          ],
        },
      },
    ],
    answer: {
      en: "The morning shift is three attendants short against tomorrow's departure load, while the evening shift has one spare. Shifting two evening attendants to an early start closes most of the gap without any overtime. If you would rather not touch the roster, stagger check-out by an hour for the two floors with the heaviest departures.",
      bn: "আগামীকালের প্রস্থানের চাপের বিপরীতে সকালের শিফটে তিনজন পরিচারক কম, আর সন্ধ্যার শিফটে একজন বাড়তি আছে। সন্ধ্যার দুজনকে আগে শুরু করালে ওভারটাইম ছাড়াই ঘাটতির বেশিরভাগ মিটে যায়। রোস্টার পরিবর্তন না করতে চাইলে, সবচেয়ে বেশি প্রস্থানের দুটি তলায় চেক-আউট এক ঘণ্টা পিছিয়ে দিন।",
    },
    sources: [
      { en: "Roster · tomorrow", bn: "রোস্টার · আগামীকাল" },
      { en: "Departures forecast", bn: "প্রস্থান পূর্বাভাস" },
    ],
    followUps: [
      { en: "Adjust the roster for me", bn: "আমার হয়ে রোস্টার সমন্বয় করুন" },
      { en: "Show the departure list", bn: "প্রস্থানের তালিকা দেখান" },
    ],
  },
]

export const FALLBACK_ANSWER: CopilotAnswer = {
  id: "fallback",
  match: [],
  prompt: { en: "", bn: "" },
  thinking: {
    en: "Searching reservations, folios, CRM records and agent traces…",
    bn: "সংরক্ষণ, ফোলিও, সিআরএম রেকর্ড ও এজেন্ট ট্রেস খুঁজছি…",
  },
  tools: [
    {
      id: "t1",
      name: "erp.search",
      args: { en: "scope=all, limit=50", bn: "scope=all, limit=50" },
      latencyMs: 380,
      rows: 50,
      render: { kind: "chart", series: "occupancy", days: 21 },
    },
  ],
  answer: {
    en: "I pulled the last three weeks across reservations, folios and the CRM for that. Nothing in the data contradicts what you would expect — occupancy and rate are both tracking their seasonal shape, and no single account or channel is distorting the picture. If you tell me which metric or which account you care about, I can go a level deeper.",
    bn: "এর জন্য আমি সংরক্ষণ, ফোলিও ও সিআরএম থেকে গত তিন সপ্তাহের তথ্য নিয়েছি। প্রত্যাশার বিপরীতে কিছু পাওয়া যায়নি — অকুপেন্সি ও ভাড়া দুটোই তাদের মৌসুমি ধরন অনুসরণ করছে, এবং কোনো একক অ্যাকাউন্ট বা চ্যানেল চিত্রটি বিকৃত করছে না। কোন মেট্রিক বা কোন অ্যাকাউন্ট নিয়ে জানতে চান বললে আরও গভীরে যেতে পারি।",
  },
  sources: [{ en: "ERP · full scope", bn: "ইআরপি · সম্পূর্ণ পরিসর" }],
  followUps: [
    { en: "How is occupancy trending?", bn: "অকুপেন্সি কেমন চলছে?" },
    { en: "Who are my top accounts?", bn: "শীর্ষ অ্যাকাউন্ট কারা?" },
  ],
}

export function routeAnswer(prompt: string): CopilotAnswer {
  const normalized = prompt.toLowerCase()
  const scored = COPILOT_ANSWERS.map((answer) => ({
    answer,
    score: answer.match.filter((keyword) =>
      normalized.includes(keyword.toLowerCase())
    ).length,
  })).sort((a, b) => b.score - a.score)

  return scored[0].score > 0 ? scored[0].answer : FALLBACK_ANSWER
}

export const SUGGESTED_PROMPTS = COPILOT_ANSWERS.slice(0, 6).map(
  (a) => a.prompt
)
