import { addMinutes, demoToday } from "@/lib/demo-time"
import type {
  Bilingual,
  ChannelId,
  Conversation,
  Guest,
  Message,
  RoomType,
  StaffMember,
  Tenant,
} from "@/lib/types"
import type { Rng } from "./rng"

type ScriptTurn = {
  author: Message["author"]
  body: Bilingual
  confidence?: number
  attachment?: Message["attachment"]
}

type Script = {
  channel: ChannelId
  subject: Bilingual
  state: Conversation["state"]
  autopilot: boolean
  turns: ScriptTurn[]
}

/**
 * Hand-written threads — this is the headline feature, so the AI's voice has to
 * read like a competent front-office agent in both languages rather than
 * filler text.
 */
const SCRIPTS: Script[] = [
  {
    channel: "whatsapp",
    subject: { en: "Two nights this weekend", bn: "এই সপ্তাহান্তে দুই রাত" },
    state: "aiHandled",
    autopilot: true,
    turns: [
      {
        author: "guest",
        body: {
          en: "Hi! Do you have a room for 2 adults this Friday and Saturday?",
          bn: "হ্যালো! এই শুক্র ও শনিবার দুজনের জন্য কোনো রুম আছে?",
        },
      },
      {
        author: "ai",
        confidence: 0.96,
        body: {
          en: "Yes — we have both Deluxe and Executive rooms open for Fri–Sun, 2 nights. Deluxe is ৳19,400/night and Executive ৳27,800/night, both including breakfast for two.",
          bn: "জি — শুক্র থেকে রবি, ২ রাতের জন্য ডিলাক্স ও এক্সিকিউটিভ দুটোই খালি আছে। ডিলাক্স প্রতি রাত ৳১৯,৪০০ এবং এক্সিকিউটিভ ৳২৭,৮০০, দুজনের নাশতাসহ।",
        },
      },
      {
        author: "guest",
        body: {
          en: "Deluxe works. Can we get a high floor away from the lift?",
          bn: "ডিলাক্সই ঠিক আছে। লিফট থেকে দূরে উঁচু তলায় পাওয়া যাবে?",
        },
      },
      {
        author: "ai",
        confidence: 0.94,
        body: {
          en: "Noted — I've flagged high floor, away from lift on the booking. Room 1108 fits both. Shall I confirm it?",
          bn: "লিখে নিয়েছি — বুকিংয়ে উঁচু তলা ও লিফট থেকে দূরে চিহ্নিত করা হয়েছে। ১১০৮ নম্বর কক্ষটি দুটোই মেলে। নিশ্চিত করব?",
        },
      },
      {
        author: "guest",
        body: { en: "Yes please, confirm it.", bn: "হ্যাঁ, নিশ্চিত করে দিন।" },
      },
      {
        author: "ai",
        confidence: 0.98,
        body: {
          en: "Done. Your reservation is confirmed and a payment link is on its way.",
          bn: "সম্পন্ন। আপনার সংরক্ষণ নিশ্চিত হয়েছে এবং পেমেন্ট লিংক পাঠানো হচ্ছে।",
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
    ],
  },
  {
    channel: "voice",
    subject: {
      en: "Missed call — rate enquiry",
      bn: "মিসড কল — ভাড়া সংক্রান্ত",
    },
    state: "aiHandled",
    autopilot: true,
    turns: [
      {
        author: "system",
        body: {
          en: "Inbound call answered by AI concierge · 1m 48s",
          bn: "এআই কনসিয়ার্জ কল ধরেছে · ১ মি ৪৮ সে",
        },
      },
      {
        author: "ai",
        confidence: 0.91,
        body: {
          en: "Caller asked about corporate rates for a 12-person team in November. I quoted the BAR-minus-10 corporate tier and offered to send a rate sheet over WhatsApp.",
          bn: "কলার নভেম্বরে ১২ জনের দলের জন্য কর্পোরেট ভাড়া জানতে চেয়েছেন। আমি কর্পোরেট স্তরের (বিএআর থেকে ১০% কম) ভাড়া জানিয়েছি এবং হোয়াটসঅ্যাপে ভাড়ার তালিকা পাঠানোর প্রস্তাব দিয়েছি।",
        },
      },
      {
        author: "guest",
        body: {
          en: "Send it to this number please.",
          bn: "এই নম্বরেই পাঠিয়ে দিন।",
        },
      },
      {
        author: "ai",
        confidence: 0.89,
        body: {
          en: "Rate sheet sent. I've also created a CRM enquiry against the account so sales can follow up on Monday.",
          bn: "ভাড়ার তালিকা পাঠানো হয়েছে। সিআরএম-এ একটি অনুসন্ধানও তৈরি করেছি যাতে বিক্রয় দল সোমবার যোগাযোগ করতে পারে।",
        },
      },
    ],
  },
  {
    channel: "email",
    subject: {
      en: "Group booking — 40 rooms, March",
      bn: "গ্রুপ বুকিং — ৪০টি কক্ষ, মার্চ",
    },
    state: "needsHuman",
    autopilot: false,
    turns: [
      {
        author: "guest",
        body: {
          en: "We're planning our annual sales conference and need 40 rooms for 3 nights in March, plus a banquet hall for 120 people. Could you share availability and a quote?",
          bn: "আমরা বার্ষিক বিক্রয় সম্মেলনের পরিকল্পনা করছি — মার্চে ৩ রাতের জন্য ৪০টি কক্ষ এবং ১২০ জনের ভোজসভার হল প্রয়োজন। প্রাপ্যতা ও দরপত্র পাঠাতে পারবেন?",
        },
      },
      {
        author: "ai",
        confidence: 0.58,
        body: {
          en: "This exceeds the 15-room autopilot ceiling, so I've drafted a reply and escalated to the sales desk with a pre-filled CRM deal.",
          bn: "এটি অটোপাইলটের ১৫ কক্ষের সীমা ছাড়িয়ে গেছে, তাই আমি একটি খসড়া উত্তর তৈরি করে সিআরএম চুক্তিসহ বিক্রয় ডেস্কে পাঠিয়েছি।",
        },
      },
      {
        author: "agent",
        body: {
          en: "Thanks for reaching out. March 12–15 works — I'm holding 40 rooms and the Padma Ballroom for you until Friday. Quote attached.",
          bn: "যোগাযোগের জন্য ধন্যবাদ। ১২–১৫ মার্চ সম্ভব — শুক্রবার পর্যন্ত আপনার জন্য ৪০টি কক্ষ ও পদ্মা বলরুম আটকে রাখছি। দরপত্র সংযুক্ত।",
        },
      },
    ],
  },
  {
    channel: "instagram",
    subject: {
      en: "Is the rooftop pool open?",
      bn: "ছাদের সুইমিং পুল কি খোলা?",
    },
    state: "resolved",
    autopilot: true,
    turns: [
      {
        author: "guest",
        body: {
          en: "Saw your reel — is the rooftop pool open to non-guests?",
          bn: "আপনাদের রিল দেখলাম — ছাদের পুল কি বাইরের অতিথিদের জন্য খোলা?",
        },
      },
      {
        author: "ai",
        confidence: 0.93,
        body: {
          en: "It is, on weekdays from 7am–8pm with a day pass at ৳2,500 which includes a towel and one beverage. Weekends are guests-only.",
          bn: "জি, কর্মদিবসে সকাল ৭টা থেকে রাত ৮টা পর্যন্ত — ডে পাস ৳২,৫০০, যাতে তোয়ালে ও একটি পানীয় অন্তর্ভুক্ত। সপ্তাহান্তে কেবল অতিথিদের জন্য।",
        },
      },
      {
        author: "guest",
        body: { en: "Perfect, thanks!", bn: "চমৎকার, ধন্যবাদ!" },
      },
    ],
  },
  {
    channel: "sms",
    subject: { en: "Late arrival tonight", bn: "আজ রাতে দেরিতে পৌঁছাব" },
    state: "aiHandled",
    autopilot: true,
    turns: [
      {
        author: "guest",
        body: {
          en: "My flight is delayed, I'll reach around 2am. Will my room be held?",
          bn: "আমার ফ্লাইট দেরি হচ্ছে, রাত ২টার দিকে পৌঁছাব। রুমটা রাখা হবে তো?",
        },
      },
      {
        author: "ai",
        confidence: 0.97,
        body: {
          en: "Yes — I've marked your arrival as late check-in, so the room is held all night and the night desk has been notified. A cold platter will be left in your room.",
          bn: "জি — আপনার আগমন দেরিতে চেক-ইন হিসেবে চিহ্নিত করেছি, তাই সারারাত কক্ষটি সংরক্ষিত থাকবে এবং নাইট ডেস্ককে জানানো হয়েছে। কক্ষে হালকা খাবার রেখে দেওয়া হবে।",
        },
      },
    ],
  },
  {
    channel: "webchat",
    subject: {
      en: "Airport pickup + early check-in",
      bn: "বিমানবন্দর থেকে গাড়ি ও আগাম চেক-ইন",
    },
    state: "aiHandled",
    autopilot: true,
    turns: [
      {
        author: "guest",
        body: {
          en: "Landing at 6:40am on the 14th. Can I check in early and do you do airport pickup?",
          bn: "১৪ তারিখ সকাল ৬:৪০-এ নামছি। আগাম চেক-ইন করা যাবে? আর বিমানবন্দর থেকে গাড়ির ব্যবস্থা আছে?",
        },
      },
      {
        author: "ai",
        confidence: 0.88,
        body: {
          en: "Pickup is ৳3,200 one way in a sedan. Early check-in at 7am is subject to availability — right now the 13th shows 78% occupancy, so I'd rate your chances good. Want me to add both?",
          bn: "সেডানে একমুখী পরিবহন ৳৩,২০০। সকাল ৭টায় আগাম চেক-ইন প্রাপ্যতার ওপর নির্ভরশীল — ১৩ তারিখে অকুপেন্সি ৭৮%, তাই সম্ভাবনা ভালো। দুটোই যোগ করে দেব?",
        },
      },
      {
        author: "guest",
        body: { en: "Yes, add both.", bn: "হ্যাঁ, দুটোই যোগ করুন।" },
      },
      {
        author: "ai",
        confidence: 0.95,
        body: {
          en: "Added. Your driver's details will arrive 12 hours before landing.",
          bn: "যোগ করা হয়েছে। অবতরণের ১২ ঘণ্টা আগে চালকের তথ্য পাঠানো হবে।",
        },
      },
    ],
  },
  {
    channel: "messenger",
    subject: { en: "Complaint — AC in 904", bn: "অভিযোগ — ৯০৪ নম্বরের এসি" },
    state: "needsHuman",
    autopilot: false,
    turns: [
      {
        author: "guest",
        body: {
          en: "The AC in 904 has been noisy all night. This is the second time.",
          bn: "৯০৪-এর এসি সারারাত শব্দ করেছে। এটা দ্বিতীয়বার।",
        },
      },
      {
        author: "ai",
        confidence: 0.44,
        body: {
          en: "Repeat complaint detected on the same room within 30 days — routing to the duty manager rather than answering automatically. Work order WO-3145 raised.",
          bn: "৩০ দিনের মধ্যে একই কক্ষে পুনরাবৃত্ত অভিযোগ শনাক্ত — স্বয়ংক্রিয় উত্তর না দিয়ে ডিউটি ম্যানেজারের কাছে পাঠানো হচ্ছে। কার্যাদেশ WO-3145 তৈরি।",
        },
      },
      {
        author: "agent",
        body: {
          en: "I'm so sorry. Engineering is on the way now, and I've moved you to 1012 with a suite upgrade for the rest of your stay.",
          bn: "আন্তরিকভাবে দুঃখিত। প্রকৌশল দল এখনই যাচ্ছে, এবং বাকি সময়ের জন্য আপনাকে ১০১২-এ স্যুট আপগ্রেডসহ স্থানান্তর করেছি।",
        },
      },
    ],
  },
  {
    channel: "whatsapp",
    subject: { en: "Honeymoon package", bn: "হানিমুন প্যাকেজ" },
    state: "aiHandled",
    autopilot: true,
    turns: [
      {
        author: "guest",
        body: {
          en: "Do you have anything special for honeymooners?",
          bn: "নবদম্পতিদের জন্য বিশেষ কিছু আছে?",
        },
      },
      {
        author: "ai",
        confidence: 0.92,
        body: {
          en: "We do — the Honeymoon Suite package includes a sea-facing suite, candlelit dinner, couples' spa hour and late checkout at 4pm, from ৳46,900/night.",
          bn: "জি আছে — হানিমুন স্যুট প্যাকেজে রয়েছে সমুদ্রমুখী স্যুট, মোমবাতির আলোয় নৈশভোজ, যুগল স্পা এবং বিকেল ৪টা পর্যন্ত দেরিতে চেক-আউট, প্রতি রাত ৳৪৬,৯০০ থেকে।",
        },
        attachment: {
          kind: "roomOptions",
          payload: { options: 3, from: 46900 },
        },
      },
    ],
  },
]

const FILLER_SUBJECTS: Bilingual[] = [
  { en: "Invoice copy needed", bn: "চালানের অনুলিপি প্রয়োজন" },
  { en: "Parking availability", bn: "পার্কিং প্রাপ্যতা" },
  { en: "Extend stay by one night", bn: "আরও এক রাত বাড়ানো" },
  { en: "Halal menu question", bn: "হালাল মেনু সংক্রান্ত প্রশ্ন" },
  { en: "Lost item — grey scarf", bn: "হারানো জিনিস — ধূসর স্কার্ফ" },
  { en: "Wedding hall walkthrough", bn: "বিবাহ হল পরিদর্শন" },
  { en: "Loyalty points not credited", bn: "লয়্যালটি পয়েন্ট জমা হয়নি" },
  { en: "Visa support letter", bn: "ভিসা সহায়তা পত্র" },
  { en: "Airport shuttle timing", bn: "বিমানবন্দর শাটলের সময়" },
  { en: "Corporate rate renewal", bn: "কর্পোরেট ভাড়া নবায়ন" },
  { en: "Pet policy", bn: "পোষা প্রাণী নীতি" },
  { en: "Meeting room for 8", bn: "৮ জনের সভাকক্ষ" },
]

const FILLER_REPLIES: Bilingual[] = [
  {
    en: "Sent across — let me know if anything else is needed.",
    bn: "পাঠিয়ে দিয়েছি — আর কিছু লাগলে জানাবেন।",
  },
  {
    en: "Checked availability and held it for you for 24 hours.",
    bn: "প্রাপ্যতা দেখে ২৪ ঘণ্টার জন্য আপনার নামে রেখে দিয়েছি।",
  },
  {
    en: "Confirmed with the team — yes, that's included.",
    bn: "দলের সাথে নিশ্চিত হয়েছি — জি, এটি অন্তর্ভুক্ত।",
  },
  {
    en: "I've raised this with housekeeping and will update you shortly.",
    bn: "হাউসকিপিংকে জানিয়েছি, শীঘ্রই আপনাকে জানাব।",
  },
  {
    en: "Applied the correction to your folio; the balance is updated.",
    bn: "আপনার ফোলিওতে সংশোধন প্রয়োগ করেছি; বকেয়া হালনাগাদ হয়েছে।",
  },
]

const CHANNELS: ChannelId[] = [
  "whatsapp",
  "messenger",
  "instagram",
  "sms",
  "email",
  "voice",
  "webchat",
]

export function buildConversations(
  rng: Rng,
  tenant: Tenant,
  guests: Guest[],
  staff: StaffMember[],
  roomTypes: RoomType[]
): Conversation[] {
  const today = demoToday()
  const frontOffice = staff.filter((s) => s.department === "frontOffice")
  const assignees = frontOffice.length ? frontOffice : staff.slice(0, 5)
  const conversations: Conversation[] = []

  SCRIPTS.forEach((script, index) => {
    const guest = guests[(index * 7) % guests.length]
    const startedAt = addMinutes(today, -rng.int(20, 60 * 26))
    const messages: Message[] = script.turns.map((turn, i) => ({
      id: `msg_${index}_${i}`,
      author: turn.author,
      body: turn.body,
      at: addMinutes(startedAt, i * rng.int(1, 6)).toISOString(),
      confidence: turn.confidence,
      attachment: turn.attachment,
    }))

    conversations.push({
      id: `conv_${index + 1}`,
      channel: script.channel,
      guestId: guest.id,
      subject: script.subject,
      preview: script.turns[script.turns.length - 1].body,
      state: script.state,
      unread: script.state === "needsHuman" ? rng.int(1, 3) : 0,
      autopilot: script.autopilot,
      slaSeconds:
        script.state === "needsHuman"
          ? rng.int(120, 2400)
          : rng.int(3000, 28000),
      updatedAt: messages[messages.length - 1].at,
      assigneeId: script.autopilot ? undefined : rng.pick(assignees).id,
      messages,
    })
  })

  for (let i = 0; i < 26; i++) {
    const guest = guests[(i * 13 + 5) % guests.length]
    const subject = rng.pick(FILLER_SUBJECTS)
    const startedAt = addMinutes(today, -rng.int(60, 60 * 24 * 9))
    const state = rng.weighted<Conversation["state"]>([
      ["aiHandled", 52],
      ["resolved", 33],
      ["needsHuman", 15],
    ])
    const reply = rng.pick(FILLER_REPLIES)
    const messages: Message[] = [
      {
        id: `fmsg_${i}_0`,
        author: "guest",
        body: subject,
        at: startedAt.toISOString(),
      },
      {
        id: `fmsg_${i}_1`,
        author: state === "needsHuman" ? "agent" : "ai",
        body: reply,
        at: addMinutes(startedAt, rng.int(1, 14)).toISOString(),
        confidence: state === "needsHuman" ? undefined : rng.float(0.72, 0.99),
      },
    ]

    conversations.push({
      id: `conv_f${i + 1}`,
      channel: rng.pick(CHANNELS),
      guestId: guest.id,
      subject,
      preview: reply,
      state,
      unread:
        state === "needsHuman"
          ? rng.int(1, 4)
          : rng.weighted([
              [0, 80],
              [1, 20],
            ]),
      autopilot: state !== "needsHuman",
      slaSeconds: rng.int(60, 40000),
      updatedAt: messages[1].at,
      assigneeId: state === "needsHuman" ? rng.pick(assignees).id : undefined,
      messages,
    })
  }

  return conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
