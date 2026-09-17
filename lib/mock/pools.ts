import type { Bilingual } from "@/lib/types"

/** Bangladeshi given names, with their native spelling. */
const BD_GIVEN: Bilingual[] = [
  { en: "Adib", bn: "আদিব" },
  { en: "Nusrat", bn: "নুসরাত" },
  { en: "Tanvir", bn: "তানভীর" },
  { en: "Sadia", bn: "সাদিয়া" },
  { en: "Rifat", bn: "রিফাত" },
  { en: "Mehjabin", bn: "মেহজাবিন" },
  { en: "Arif", bn: "আরিফ" },
  { en: "Farhana", bn: "ফারহানা" },
  { en: "Shakib", bn: "সাকিব" },
  { en: "Tasnim", bn: "তাসনিম" },
  { en: "Mahmudul", bn: "মাহমুদুল" },
  { en: "Anika", bn: "অনিকা" },
  { en: "Raihan", bn: "রায়হান" },
  { en: "Sumaiya", bn: "সুমাইয়া" },
  { en: "Imran", bn: "ইমরান" },
  { en: "Jarin", bn: "জারিন" },
  { en: "Naimul", bn: "নাইমুল" },
  { en: "Sharmin", bn: "শারমিন" },
  { en: "Fahim", bn: "ফাহিম" },
  { en: "Rubaiya", bn: "রুবাইয়া" },
  { en: "Sabbir", bn: "সাব্বির" },
  { en: "Nabila", bn: "নাবিলা" },
  { en: "Zahid", bn: "জাহিদ" },
  { en: "Ishrat", bn: "ইশরাত" },
  { en: "Mushfiq", bn: "মুশফিক" },
  { en: "Rumana", bn: "রুমানা" },
  { en: "Asif", bn: "আসিফ" },
  { en: "Sanjida", bn: "সানজিদা" },
  { en: "Tareq", bn: "তারেক" },
  { en: "Lamia", bn: "লামিয়া" },
  { en: "Shuvo", bn: "শুভ" },
  { en: "Priyanka", bn: "প্রিয়াঙ্কা" },
  { en: "Rakib", bn: "রাকিব" },
  { en: "Mitali", bn: "মিতালী" },
  { en: "Sourav", bn: "সৌরভ" },
  { en: "Debashish", bn: "দেবাশীষ" },
]

const BD_FAMILY: Bilingual[] = [
  { en: "Rahman", bn: "রহমান" },
  { en: "Hossain", bn: "হোসেন" },
  { en: "Islam", bn: "ইসলাম" },
  { en: "Ahmed", bn: "আহমেদ" },
  { en: "Chowdhury", bn: "চৌধুরী" },
  { en: "Khan", bn: "খান" },
  { en: "Karim", bn: "করিম" },
  { en: "Siddique", bn: "সিদ্দিক" },
  { en: "Mahmud", bn: "মাহমুদ" },
  { en: "Haque", bn: "হক" },
  { en: "Bhuiyan", bn: "ভূঁইয়া" },
  { en: "Sarker", bn: "সরকার" },
  { en: "Das", bn: "দাশ" },
  { en: "Roy", bn: "রায়" },
  { en: "Talukder", bn: "তালুকদার" },
  { en: "Mridha", bn: "মৃধা" },
]

/** International guests — Bangla column is a faithful transliteration. */
const INTL_NAMES: Bilingual[] = [
  { en: "Isabella Sánchez", bn: "ইসাবেলা সানচেজ" },
  { en: "Muhammed Khoury", bn: "মুহাম্মদ খৌরি" },
  { en: "Trần Phương An", bn: "ত্রান ফুয়ং আন" },
  { en: "Steven Lee", bn: "স্টিভেন লি" },
  { en: "Riya Mehta", bn: "রিয়া মেহতা" },
  { en: "Ayushi Patel", bn: "আয়ুশি প্যাটেল" },
  { en: "Shakia Gbeho", bn: "শাকিয়া বেহো" },
  { en: "Hannah Lindqvist", bn: "হানা লিন্ডকভিস্ট" },
  { en: "Kenji Watanabe", bn: "কেনজি ওয়াতানাবে" },
  { en: "Amara Okonkwo", bn: "আমারা ওকোনকো" },
  { en: "Lucas Moreau", bn: "লুকাস মোরো" },
  { en: "Priya Nair", bn: "প্রিয়া নায়ার" },
  { en: "Daniel Okoro", bn: "ড্যানিয়েল ওকোরো" },
  { en: "Elif Demir", bn: "এলিফ দেমির" },
  { en: "Marco Bianchi", bn: "মার্কো বিয়াঙ্কি" },
  { en: "Yasmin Al-Harbi", bn: "ইয়াসমিন আল-হারবি" },
  { en: "Oliver Whitfield", bn: "অলিভার হুইটফিল্ড" },
  { en: "Mei Ling Chen", bn: "মেই লিং চেন" },
  { en: "Andreas Keller", bn: "আন্দ্রেয়াস কেলার" },
  { en: "Sofia Kowalski", bn: "সোফিয়া কোভালস্কি" },
]

export function bdName(gi: number, fi: number): Bilingual {
  const given = BD_GIVEN[gi % BD_GIVEN.length]
  const family = BD_FAMILY[fi % BD_FAMILY.length]
  return { en: `${given.en} ${family.en}`, bn: `${given.bn} ${family.bn}` }
}

export const NAME_POOLS = { BD_GIVEN, BD_FAMILY, INTL_NAMES }

export const NATIONALITIES: Bilingual[] = [
  { en: "Bangladesh", bn: "বাংলাদেশ" },
  { en: "India", bn: "ভারত" },
  { en: "Singapore", bn: "সিঙ্গাপুর" },
  { en: "United States", bn: "যুক্তরাষ্ট্র" },
  { en: "United Kingdom", bn: "যুক্তরাজ্য" },
  { en: "Japan", bn: "জাপান" },
  { en: "Germany", bn: "জার্মানি" },
  { en: "UAE", bn: "সংযুক্ত আরব আমিরাত" },
  { en: "Malaysia", bn: "মালয়েশিয়া" },
  { en: "Türkiye", bn: "তুরস্ক" },
  { en: "Australia", bn: "অস্ট্রেলিয়া" },
  { en: "Nigeria", bn: "নাইজেরিয়া" },
]

export const GUEST_PREFERENCES: Bilingual[] = [
  { en: "High floor", bn: "উঁচু তলা" },
  { en: "Away from lift", bn: "লিফট থেকে দূরে" },
  { en: "Extra pillows", bn: "অতিরিক্ত বালিশ" },
  { en: "Late checkout", bn: "দেরিতে চেক-আউট" },
  { en: "Halal breakfast", bn: "হালাল নাশতা" },
  { en: "Vegetarian meals", bn: "নিরামিষ খাবার" },
  { en: "Non-smoking", bn: "ধূমপানমুক্ত" },
  { en: "Airport pickup", bn: "বিমানবন্দর থেকে গাড়ি" },
  { en: "Quiet room", bn: "নিরিবিলি কক্ষ" },
  { en: "Twin beds", bn: "দুটি আলাদা বিছানা" },
  { en: "Prayer mat", bn: "জায়নামাজ" },
  { en: "Firm mattress", bn: "শক্ত গদি" },
]

export const ROOM_VIEWS: Bilingual[] = [
  { en: "City view", bn: "শহরের দৃশ্য" },
  { en: "Lake view", bn: "লেকের দৃশ্য" },
  { en: "Sea view", bn: "সমুদ্রের দৃশ্য" },
  { en: "Garden view", bn: "বাগানের দৃশ্য" },
  { en: "Pool view", bn: "পুলের দৃশ্য" },
  { en: "Courtyard", bn: "আঙিনার দৃশ্য" },
]

export const COMPANY_NAMES = [
  "Grameenphone",
  "BRAC",
  "Beximco",
  "Square Group",
  "Robi Axiata",
  "bKash",
  "Unilever Bangladesh",
  "Standard Chartered",
  "HSBC",
  "Nestlé",
  "British American Tobacco",
  "Bashundhara Group",
  "Akij Group",
  "City Bank",
  "Walton",
  "Pathao",
  "Shopup",
  "Therap BD",
  "Samsung R&D",
  "Huawei Technologies",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
  "Turkish Airlines",
  "Deloitte",
  "KPMG",
  "World Bank",
  "UNDP",
  "UNICEF",
  "Save the Children",
  "Asian Development Bank",
  "JICA",
  "Marriott Travel Desk",
  "Amex GBT",
  "ShareTrip",
  "GoZayaan",
  "Flight Expert",
  "US Embassy Dhaka",
  "Ministry of Commerce",
  "Chattogram Port Authority",
]

export const INDUSTRIES: Bilingual[] = [
  { en: "Telecom", bn: "টেলিকম" },
  { en: "Banking", bn: "ব্যাংকিং" },
  { en: "Pharmaceuticals", bn: "ঔষধ শিল্প" },
  { en: "Development", bn: "উন্নয়ন" },
  { en: "Aviation", bn: "বিমান পরিবহন" },
  { en: "Technology", bn: "প্রযুক্তি" },
  { en: "Consulting", bn: "পরামর্শ সেবা" },
  { en: "Manufacturing", bn: "উৎপাদন" },
  { en: "Retail", bn: "খুচরা বিক্রয়" },
  { en: "Government", bn: "সরকারি" },
  { en: "Hospitality", bn: "আতিথেয়তা" },
  { en: "Energy", bn: "জ্বালানি" },
]

export const STAFF_ROLES: Record<string, Bilingual[]> = {
  frontOffice: [
    { en: "Front Office Manager", bn: "ফ্রন্ট অফিস ম্যানেজার" },
    { en: "Guest Relations Officer", bn: "অতিথি সম্পর্ক কর্মকর্তা" },
    { en: "Receptionist", bn: "অভ্যর্থনাকারী" },
    { en: "Night Auditor", bn: "নাইট অডিটর" },
    { en: "Concierge", bn: "কনসিয়ার্জ" },
  ],
  housekeeping: [
    { en: "Executive Housekeeper", bn: "প্রধান হাউসকিপার" },
    { en: "Floor Supervisor", bn: "ফ্লোর সুপারভাইজার" },
    { en: "Room Attendant", bn: "কক্ষ পরিচারক" },
    { en: "Laundry Attendant", bn: "লন্ড্রি পরিচারক" },
  ],
  fnb: [
    { en: "F&B Manager", bn: "খাদ্য ও পানীয় ব্যবস্থাপক" },
    { en: "Executive Chef", bn: "প্রধান শেফ" },
    { en: "Sous Chef", bn: "সহকারী শেফ" },
    { en: "Restaurant Supervisor", bn: "রেস্তোরাঁ সুপারভাইজার" },
    { en: "Barista", bn: "বারিস্তা" },
  ],
  engineering: [
    { en: "Chief Engineer", bn: "প্রধান প্রকৌশলী" },
    { en: "Electrician", bn: "ইলেকট্রিশিয়ান" },
    { en: "HVAC Technician", bn: "এসি টেকনিশিয়ান" },
    { en: "Plumber", bn: "প্লাম্বার" },
  ],
  security: [
    { en: "Security Manager", bn: "নিরাপত্তা ব্যবস্থাপক" },
    { en: "Security Officer", bn: "নিরাপত্তা কর্মকর্তা" },
    { en: "CCTV Operator", bn: "সিসিটিভি অপারেটর" },
  ],
  sales: [
    { en: "Director of Sales", bn: "বিক্রয় পরিচালক" },
    { en: "Corporate Sales Manager", bn: "কর্পোরেট বিক্রয় ব্যবস্থাপক" },
    { en: "Revenue Manager", bn: "রাজস্ব ব্যবস্থাপক" },
    { en: "MICE Coordinator", bn: "অনুষ্ঠান সমন্বয়কারী" },
  ],
  finance: [
    { en: "Financial Controller", bn: "আর্থিক নিয়ন্ত্রক" },
    { en: "Accounts Payable", bn: "হিসাব প্রদেয়" },
    { en: "Cashier", bn: "ক্যাশিয়ার" },
  ],
  hr: [
    { en: "HR Manager", bn: "মানবসম্পদ ব্যবস্থাপক" },
    { en: "Training Officer", bn: "প্রশিক্ষণ কর্মকর্তা" },
  ],
}

export const CONTACT_TITLES: Bilingual[] = [
  { en: "Travel Manager", bn: "ভ্রমণ ব্যবস্থাপক" },
  { en: "Head of Procurement", bn: "ক্রয় বিভাগীয় প্রধান" },
  { en: "Executive Assistant", bn: "নির্বাহী সহকারী" },
  { en: "HR Director", bn: "মানবসম্পদ পরিচালক" },
  { en: "Events Lead", bn: "অনুষ্ঠান প্রধান" },
  { en: "Country Manager", bn: "কান্ট্রি ম্যানেজার" },
  { en: "Chief of Staff", bn: "চিফ অব স্টাফ" },
  { en: "Operations Head", bn: "পরিচালন প্রধান" },
]

export const INVENTORY_ITEMS: {
  name: Bilingual
  category: Bilingual
  unit: Bilingual
}[] = [
  {
    name: { en: "Bath towel", bn: "গোসলের তোয়ালে" },
    category: { en: "Linen", bn: "লিনেন" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Bed sheet (king)", bn: "বেডশিট (কিং)" },
    category: { en: "Linen", bn: "লিনেন" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Pillow case", bn: "বালিশের কভার" },
    category: { en: "Linen", bn: "লিনেন" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Shampoo 30ml", bn: "শ্যাম্পু ৩০ মিলি" },
    category: { en: "Amenities", bn: "সুবিধাদি" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Body lotion 30ml", bn: "বডি লোশন ৩০ মিলি" },
    category: { en: "Amenities", bn: "সুবিধাদি" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Slippers", bn: "স্লিপার" },
    category: { en: "Amenities", bn: "সুবিধাদি" },
    unit: { en: "pairs", bn: "জোড়া" },
  },
  {
    name: { en: "Mineral water 500ml", bn: "মিনারেল ওয়াটার ৫০০ মিলি" },
    category: { en: "Beverage", bn: "পানীয়" },
    unit: { en: "bottles", bn: "বোতল" },
  },
  {
    name: { en: "Arabica beans", bn: "অ্যারাবিকা কফি বিন" },
    category: { en: "Beverage", bn: "পানীয়" },
    unit: { en: "kg", bn: "কেজি" },
  },
  {
    name: { en: "Basmati rice", bn: "বাসমতি চাল" },
    category: { en: "Kitchen", bn: "রান্নাঘর" },
    unit: { en: "kg", bn: "কেজি" },
  },
  {
    name: { en: "Hilsa fish", bn: "ইলিশ মাছ" },
    category: { en: "Kitchen", bn: "রান্নাঘর" },
    unit: { en: "kg", bn: "কেজি" },
  },
  {
    name: { en: "Chicken breast", bn: "মুরগির বুকের মাংস" },
    category: { en: "Kitchen", bn: "রান্নাঘর" },
    unit: { en: "kg", bn: "কেজি" },
  },
  {
    name: { en: "Olive oil", bn: "জলপাই তেল" },
    category: { en: "Kitchen", bn: "রান্নাঘর" },
    unit: { en: "L", bn: "লিটার" },
  },
  {
    name: { en: "Floor cleaner", bn: "ফ্লোর ক্লিনার" },
    category: { en: "Cleaning", bn: "পরিচ্ছন্নতা" },
    unit: { en: "L", bn: "লিটার" },
  },
  {
    name: { en: "Disinfectant spray", bn: "জীবাণুনাশক স্প্রে" },
    category: { en: "Cleaning", bn: "পরিচ্ছন্নতা" },
    unit: { en: "bottles", bn: "বোতল" },
  },
  {
    name: { en: "LED bulb 9W", bn: "এলইডি বাল্ব ৯ ওয়াট" },
    category: { en: "Engineering", bn: "প্রকৌশল" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "AC filter", bn: "এসি ফিল্টার" },
    category: { en: "Engineering", bn: "প্রকৌশল" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Key card blank", bn: "খালি কি-কার্ড" },
    category: { en: "Front office", bn: "ফ্রন্ট অফিস" },
    unit: { en: "pcs", bn: "পিস" },
  },
  {
    name: { en: "Guest stationery set", bn: "অতিথি স্টেশনারি সেট" },
    category: { en: "Front office", bn: "ফ্রন্ট অফিস" },
    unit: { en: "sets", bn: "সেট" },
  },
]

/** Fictional local vendors, so they carry a native name too. */
export const SUPPLIER_NAMES: Bilingual[] = [
  { en: "Meghna Linen House", bn: "মেঘনা লিনেন হাউস" },
  { en: "Padma Foods Ltd.", bn: "পদ্মা ফুডস লিমিটেড" },
  { en: "Dhaka Hygiene Supply", bn: "ঢাকা হাইজিন সাপ্লাই" },
  { en: "Chattogram Seafood Co.", bn: "চট্টগ্রাম সি-ফুড কোং" },
  { en: "Rangpur Rice Traders", bn: "রংপুর রাইস ট্রেডার্স" },
  { en: "Bengal Amenities", bn: "বেঙ্গল অ্যামেনিটিজ" },
  { en: "Aroma Coffee Importers", bn: "অ্যারোমা কফি ইমপোর্টার্স" },
  { en: "Sylhet Tea Estate", bn: "সিলেট টি এস্টেট" },
  { en: "Prime Electricals", bn: "প্রাইম ইলেকট্রিক্যালস" },
  { en: "Nova Housekeeping Supplies", bn: "নোভা হাউসকিপিং সাপ্লাইস" },
]

export const MAINTENANCE_ISSUES: Bilingual[] = [
  { en: "AC not cooling", bn: "এসি ঠান্ডা হচ্ছে না" },
  { en: "Leaking shower head", bn: "শাওয়ার থেকে পানি পড়ছে" },
  { en: "Door lock jammed", bn: "দরজার তালা আটকে গেছে" },
  { en: "TV remote not working", bn: "টিভি রিমোট কাজ করছে না" },
  { en: "Flickering corridor light", bn: "করিডোরের বাতি জ্বলছে-নিভছে" },
  { en: "Wi-Fi access point down", bn: "ওয়াই-ফাই অ্যাক্সেস পয়েন্ট বন্ধ" },
  { en: "Minibar not cooling", bn: "মিনিবার ঠান্ডা হচ্ছে না" },
  { en: "Curtain rail loose", bn: "পর্দার রেল আলগা" },
  { en: "Lift making noise", bn: "লিফট থেকে শব্দ আসছে" },
  { en: "Water heater fault", bn: "গিজার নষ্ট" },
]

export const MAINTENANCE_AREAS: Bilingual[] = [
  { en: "Guest room", bn: "অতিথি কক্ষ" },
  { en: "Lobby", bn: "লবি" },
  { en: "Corridor", bn: "করিডোর" },
  { en: "Kitchen", bn: "রান্নাঘর" },
  { en: "Rooftop pool", bn: "ছাদের সুইমিং পুল" },
  { en: "Banquet hall", bn: "ব্যাঙ্কুয়েট হল" },
  { en: "Gym", bn: "জিম" },
  { en: "Parking", bn: "পার্কিং" },
]

export const HOUSEKEEPING_NOTES: Bilingual[] = [
  { en: "Departure clean", bn: "প্রস্থান পরিষ্কার" },
  { en: "Stayover refresh", bn: "অবস্থানকালীন পরিচ্ছন্নতা" },
  { en: "Deep clean requested", bn: "গভীর পরিচ্ছন্নতার অনুরোধ" },
  { en: "VIP arrival setup", bn: "ভিআইপি আগমনের প্রস্তুতি" },
  { en: "Extra bed requested", bn: "অতিরিক্ত বিছানার অনুরোধ" },
  { en: "Turn-down service", bn: "টার্ন-ডাউন সেবা" },
]

export const AUDIT_ACTIONS: Bilingual[] = [
  { en: "Updated rate plan", bn: "ভাড়া পরিকল্পনা হালনাগাদ" },
  { en: "Overrode room rate", bn: "কক্ষ ভাড়া পরিবর্তন" },
  { en: "Cancelled reservation", bn: "সংরক্ষণ বাতিল" },
  { en: "Issued refund", bn: "ফেরত প্রদান" },
  { en: "Changed user role", bn: "ব্যবহারকারীর ভূমিকা পরিবর্তন" },
  { en: "Exported guest data", bn: "অতিথি তথ্য রপ্তানি" },
  { en: "Connected channel", bn: "চ্যানেল সংযুক্ত" },
  { en: "Closed night audit", bn: "নাইট অডিট সম্পন্ন" },
  { en: "Approved purchase order", bn: "ক্রয় আদেশ অনুমোদন" },
  { en: "Enabled AI autopilot", bn: "এআই অটোপাইলট সক্রিয়" },
]

export const VISITOR_COMPANIES: Bilingual[] = [
  { en: "Sundarban Courier", bn: "সুন্দরবন কুরিয়ার" },
  { en: "Pathao Food", bn: "পাঠাও ফুড" },
  { en: "Daraz Express", bn: "দারাজ এক্সপ্রেস" },
  { en: "Robi Axiata", bn: "রবি আজিয়াটা" },
  { en: "Prime Electricals", bn: "প্রাইম ইলেকট্রিক্যালস" },
  { en: "Bengal Florists", bn: "বেঙ্গল ফ্লোরিস্টস" },
  { en: "Grameenphone", bn: "গ্রামীণফোন" },
  { en: "DHL Bangladesh", bn: "ডিএইচএল বাংলাদেশ" },
  { en: "Sheba Technologies", bn: "সেবা টেকনোলজিস" },
  { en: "Independent TV", bn: "ইনডিপেনডেন্ট টিভি" },
]

/* ------------------------------------------------------------------ *
 * Visitor management
 * ------------------------------------------------------------------ */

export const GATE_LABELS: Record<string, Bilingual> = {
  mainLobby: { en: "Main lobby", bn: "প্রধান লবি" },
  porte: { en: "Porte-cochère", bn: "গাড়িবারান্দা" },
  service: { en: "Service gate", bn: "সার্ভিস গেট" },
  basement: { en: "Basement ramp", bn: "বেসমেন্ট র‍্যাম্প" },
  banquet: { en: "Banquet entrance", bn: "ব্যাঙ্কুয়েট প্রবেশপথ" },
  staff: { en: "Staff entrance", bn: "কর্মী প্রবেশপথ" },
}

export const LUGGAGE_LOCATIONS: Bilingual[] = [
  { en: "Left luggage room A", bn: "লাগেজ রুম এ" },
  { en: "Left luggage room B", bn: "লাগেজ রুম বি" },
  { en: "Concierge desk", bn: "কনসিয়ার্জ ডেস্ক" },
  { en: "Screening bay", bn: "স্ক্রিনিং বে" },
  { en: "Banquet cloakroom", bn: "ব্যাঙ্কুয়েট ক্লোকরুম" },
  { en: "Security office", bn: "নিরাপত্তা অফিস" },
]

export const VEHICLE_MAKES = [
  "Toyota Premio",
  "Toyota Hiace",
  "Honda Vezel",
  "Nissan X-Trail",
  "Mitsubishi Pajero",
  "Mercedes-Benz E-Class",
  "BMW 5 Series",
  "Hyundai Staria",
  "Suzuki Ciaz",
  "Tata Ace",
  "Bajaj Pulsar",
  "Ashok Leyland",
]

export const VEHICLE_COLOURS: Bilingual[] = [
  { en: "White", bn: "সাদা" },
  { en: "Black", bn: "কালো" },
  { en: "Silver", bn: "রূপালি" },
  { en: "Navy", bn: "গাঢ় নীল" },
  { en: "Grey", bn: "ধূসর" },
  { en: "Maroon", bn: "মেরুন" },
]

export const CAMERA_ZONES: Bilingual[] = [
  { en: "Lobby", bn: "লবি" },
  { en: "Entrances", bn: "প্রবেশপথ" },
  { en: "Parking", bn: "পার্কিং" },
  { en: "Corridors", bn: "করিডোর" },
  { en: "Back of house", bn: "অভ্যন্তরীণ এলাকা" },
  { en: "Perimeter", bn: "সীমানা" },
]

export const CAMERA_NAMES: { name: Bilingual; zone: number; gate?: string }[] = [
  { name: { en: "Lobby — reception", bn: "লবি — অভ্যর্থনা" }, zone: 0, gate: "mainLobby" },
  { name: { en: "Lobby — seating", bn: "লবি — বসার স্থান" }, zone: 0 },
  { name: { en: "Lobby — lift bank", bn: "লবি — লিফট" }, zone: 0 },
  { name: { en: "Porte-cochère", bn: "গাড়িবারান্দা" }, zone: 1, gate: "porte" },
  { name: { en: "Main entrance", bn: "প্রধান প্রবেশপথ" }, zone: 1, gate: "mainLobby" },
  { name: { en: "Banquet entrance", bn: "ব্যাঙ্কুয়েট প্রবেশপথ" }, zone: 1, gate: "banquet" },
  { name: { en: "Service gate", bn: "সার্ভিস গেট" }, zone: 1, gate: "service" },
  { name: { en: "Staff entrance", bn: "কর্মী প্রবেশপথ" }, zone: 1, gate: "staff" },
  { name: { en: "Basement ramp", bn: "বেসমেন্ট র‍্যাম্প" }, zone: 2, gate: "basement" },
  { name: { en: "Parking — level B1", bn: "পার্কিং — বি১" }, zone: 2 },
  { name: { en: "Parking — level B2", bn: "পার্কিং — বি২" }, zone: 2 },
  { name: { en: "Valet stand", bn: "ভ্যালে স্ট্যান্ড" }, zone: 2 },
  { name: { en: "Corridor — floor 3", bn: "করিডোর — তৃতীয় তলা" }, zone: 3 },
  { name: { en: "Corridor — floor 9", bn: "করিডোর — নবম তলা" }, zone: 3 },
  { name: { en: "Executive lounge", bn: "এক্সিকিউটিভ লাউঞ্জ" }, zone: 3 },
  { name: { en: "Kitchen pass", bn: "রান্নাঘর পাস" }, zone: 4 },
  { name: { en: "Loading dock", bn: "লোডিং ডক" }, zone: 4, gate: "service" },
  { name: { en: "Left luggage room", bn: "লাগেজ রুম" }, zone: 4 },
  { name: { en: "Perimeter — north", bn: "সীমানা — উত্তর" }, zone: 5 },
  { name: { en: "Perimeter — south", bn: "সীমানা — দক্ষিণ" }, zone: 5 },
  { name: { en: "Rooftop pool deck", bn: "ছাদের পুল ডেক" }, zone: 5 },
  { name: { en: "Emergency stair 2", bn: "জরুরি সিঁড়ি ২" }, zone: 4 },
]

export const MOVEMENT_FLAGS: Bilingual[] = [
  { en: "Overstayed expected departure", bn: "প্রত্যাশিত প্রস্থানের সময় পার" },
  { en: "Unscreened bag carried in", bn: "স্ক্রিনিং ছাড়া ব্যাগ প্রবেশ" },
  { en: "Badge used at a second gate", bn: "দ্বিতীয় গেটে একই ব্যাজ ব্যবহার" },
  { en: "Escort not present", bn: "সঙ্গী উপস্থিত নেই" },
  { en: "Plate not on the day's list", bn: "আজকের তালিকায় নেই এমন গাড়ি" },
]
