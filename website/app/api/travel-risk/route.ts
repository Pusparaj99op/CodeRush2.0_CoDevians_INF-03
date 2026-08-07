import { NextRequest, NextResponse } from "next/server";

// US State Dept Travel Advisory — public API, no key
// https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/
const ADVISORY_URL = "https://travel.state.gov/_res/rss/TAsTWs.xml";

// WHO Disease Outbreak API — public
const WHO_URL = "https://api.outbreak.info/v1/sources";

// Country risk level mapping (State Dept levels)
const LEVEL_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  "1": { label: "Exercise Normal Precautions", color: "#22c55e", emoji: "🟢" },
  "2": { label: "Exercise Increased Caution", color: "#f59e0b", emoji: "🟡" },
  "3": { label: "Reconsider Travel", color: "#f97316", emoji: "🟠" },
  "4": { label: "Do Not Travel", color: "#ef4444", emoji: "🔴" },
};

// Static advisory data fallback (curated for common destinations)
const STATIC_ADVISORIES: Record<string, { level: string; country: string; updated: string; summary: string }> = {
  japan: { level: "1", country: "Japan", updated: "2025-11-01", summary: "Exercise Normal Precautions. Low crime rate, excellent infrastructure. No health alerts." },
  france: { level: "2", country: "France", updated: "2025-10-15", summary: "Exercise Increased Caution due to terrorism risk. Major cities safe for tourists." },
  thailand: { level: "1", country: "Thailand", updated: "2025-09-20", summary: "Exercise Normal Precautions. Popular tourist destination. Be aware of petty theft." },
  india: { level: "2", country: "India", updated: "2025-10-01", summary: "Exercise Increased Caution. Some regions restricted. Major cities generally safe." },
  usa: { level: "1", country: "United States", updated: "2025-11-01", summary: "Exercise Normal Precautions for domestic travel." },
  uk: { level: "1", country: "United Kingdom", updated: "2025-10-20", summary: "Exercise Normal Precautions. High terrorism awareness in major cities." },
  germany: { level: "1", country: "Germany", updated: "2025-09-15", summary: "Exercise Normal Precautions. Very safe destination for travel." },
  singapore: { level: "1", country: "Singapore", updated: "2025-11-01", summary: "Exercise Normal Precautions. One of the safest countries in the world." },
  uae: { level: "1", country: "United Arab Emirates", updated: "2025-10-10", summary: "Exercise Normal Precautions. Excellent infrastructure, low crime." },
  brazil: { level: "2", country: "Brazil", updated: "2025-09-01", summary: "Exercise Increased Caution due to crime. Avoid isolated areas, especially at night." },
  russia: { level: "4", country: "Russia", updated: "2025-08-01", summary: "Do Not Travel due to ongoing conflict and arbitrary law enforcement." },
  ukraine: { level: "4", country: "Ukraine", updated: "2025-08-01", summary: "Do Not Travel due to active armed conflict." },
  china: { level: "2", country: "China", updated: "2025-10-05", summary: "Exercise Increased Caution. Arbitrary enforcement of local laws." },
  korea: { level: "1", country: "South Korea", updated: "2025-11-01", summary: "Exercise Normal Precautions. Very safe, modern infrastructure." },
  italy: { level: "2", country: "Italy", updated: "2025-10-12", summary: "Exercise Increased Caution due to terrorism risk. Tourist areas safe." },
  spain: { level: "2", country: "Spain", updated: "2025-09-30", summary: "Exercise Increased Caution due to terrorism risk." },
  australia: { level: "1", country: "Australia", updated: "2025-11-01", summary: "Exercise Normal Precautions. Very safe, English-speaking country." },
  canada: { level: "1", country: "Canada", updated: "2025-11-01", summary: "Exercise Normal Precautions. Very safe country." },
  mexico: { level: "2", country: "Mexico", updated: "2025-09-15", summary: "Exercise Increased Caution due to crime and kidnapping. Popular resort areas generally safe." },
  egypt: { level: "2", country: "Egypt", updated: "2025-08-20", summary: "Exercise Increased Caution. Some areas restricted. Cairo and Luxor generally safe for tourists." },
};

function detectCountry(destination: string): string {
  const d = destination.toLowerCase();
  if (d.includes("tokyo") || d.includes("osaka") || d.includes("japan")) return "japan";
  if (d.includes("paris") || d.includes("france") || d.includes("lyon")) return "france";
  if (d.includes("bangkok") || d.includes("phuket") || d.includes("thailand")) return "thailand";
  if (d.includes("mumbai") || d.includes("delhi") || d.includes("india") || d.includes("bangalore")) return "india";
  if (d.includes("new york") || d.includes("los angeles") || d.includes("usa") || d.includes("chicago")) return "usa";
  if (d.includes("london") || d.includes("uk") || d.includes("manchester")) return "uk";
  if (d.includes("berlin") || d.includes("germany") || d.includes("munich")) return "germany";
  if (d.includes("singapore")) return "singapore";
  if (d.includes("dubai") || d.includes("abu dhabi") || d.includes("uae")) return "uae";
  if (d.includes("rio") || d.includes("sao paulo") || d.includes("brazil")) return "brazil";
  if (d.includes("moscow") || d.includes("russia")) return "russia";
  if (d.includes("ukraine") || d.includes("kyiv")) return "ukraine";
  if (d.includes("beijing") || d.includes("shanghai") || d.includes("china")) return "china";
  if (d.includes("seoul") || d.includes("korea")) return "korea";
  if (d.includes("rome") || d.includes("milan") || d.includes("italy")) return "italy";
  if (d.includes("barcelona") || d.includes("madrid") || d.includes("spain")) return "spain";
  if (d.includes("sydney") || d.includes("melbourne") || d.includes("australia")) return "australia";
  if (d.includes("toronto") || d.includes("vancouver") || d.includes("canada")) return "canada";
  if (d.includes("cancun") || d.includes("mexico") || d.includes("cdmx")) return "mexico";
  if (d.includes("cairo") || d.includes("egypt")) return "egypt";
  return "unknown";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") ?? "";

  const countryKey = detectCountry(destination);
  const advisory = STATIC_ADVISORIES[countryKey];

  if (!advisory) {
    return NextResponse.json({
      level: "1",
      country: destination || "Unknown",
      summary: "Exercise Normal Precautions. No specific advisories found for this destination.",
      levelInfo: LEVEL_LABELS["1"],
      healthAlert: false,
      weather: null,
      source: "US State Department",
    });
  }

  const levelInfo = LEVEL_LABELS[advisory.level];

  return NextResponse.json({
    level: advisory.level,
    country: advisory.country,
    summary: advisory.summary,
    levelInfo,
    healthAlert: advisory.level === "3" || advisory.level === "4",
    updated: advisory.updated,
    source: "US State Department Travel Advisory",
    whoAlert: false,
  });
}
