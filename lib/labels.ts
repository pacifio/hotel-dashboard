import type { Bilingual, BookingSource } from "@/lib/types"

/**
 * Enum labels that are proper nouns or brand names rather than translatable
 * copy — they live here instead of the dictionary so the dictionaries stay
 * about interface language.
 */
export const SOURCE_LABEL: Record<BookingSource, Bilingual> = {
  direct: { en: "Direct", bn: "সরাসরি" },
  "booking.com": { en: "Booking.com", bn: "বুকিং ডটকম" },
  agoda: { en: "Agoda", bn: "আগোডা" },
  expedia: { en: "Expedia", bn: "এক্সপিডিয়া" },
  airbnb: { en: "Airbnb", bn: "এয়ারবিএনবি" },
  corporate: { en: "Corporate", bn: "কর্পোরেট" },
  walkIn: { en: "Walk-in", bn: "ওয়াক-ইন" },
  aiAgent: { en: "AI agent", bn: "এআই এজেন্ট" },
}

export const SOURCE_HUE: Record<
  BookingSource,
  "blue" | "teal" | "green" | "purple" | "magenta" | "amber" | "rose" | "slate"
> = {
  direct: "green",
  "booking.com": "blue",
  agoda: "magenta",
  expedia: "amber",
  airbnb: "rose",
  corporate: "purple",
  walkIn: "slate",
  aiAgent: "teal",
}
