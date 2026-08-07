"use client";

import { useState } from "react";
import {
  CalendarBlank,
  AirplaneTakeoff,
  Bed,
  ForkKnife,
  Camera,
  MapPin,
  Train,
} from "@phosphor-icons/react";

interface ItineraryActivity {
  time: string;
  emoji: string;
  title: string;
  detail: string;
  icon: React.ElementType;
  iconColor: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  label: string;
  activities: ItineraryActivity[];
}

function generateItinerary(origin: string, destination: string, nights: number = 5): ItineraryDay[] {
  const dest = (destination.split(",")[0] ?? destination).trim();
  const orig = (origin.split(",")[0] ?? origin).trim();

  const today = new Date();
  const days: ItineraryDay[] = [];

  const DEFAULT_ACTIVITIES: ItineraryActivity[] = [
    { time: "10:00", emoji: "🏛️", title: "City Museum", detail: `Explore the national museum`, icon: Camera, iconColor: "text-amber-400" },
    { time: "13:00", emoji: "🍜", title: "Local Cuisine Lunch", detail: "Try local specialties at a recommended restaurant", icon: ForkKnife, iconColor: "text-orange-400" },
    { time: "16:00", emoji: "🌳", title: "City Park Stroll", detail: "Relax in the botanical gardens", icon: MapPin, iconColor: "text-emerald-400" },
    { time: "20:00", emoji: "🌃", title: "Night Market Tour", detail: "Experience local street food & culture", icon: MapPin, iconColor: "text-purple-400" },
    { time: "10:30", emoji: "🎨", title: "Art Gallery", detail: "Contemporary art & exhibitions", icon: Camera, iconColor: "text-pink-400" },
    { time: "15:00", emoji: "🛍️", title: "Shopping District", detail: "Local markets and designer boutiques", icon: MapPin, iconColor: "text-sky-400" },
  ];

  let actIdx = 0;

  for (let i = 0; i < nights + 2; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });

    if (i === 0) {
      // Departure day
      days.push({
        day: 1,
        date: dateStr,
        label: "Departure Day",
        activities: [
          { time: "06:00", emoji: "⏰", title: "Early Morning Checkout", detail: "Head to airport", icon: MapPin, iconColor: "text-slate-400" },
          { time: "08:30", emoji: "✈️", title: `Fly ${orig} → ${dest}`, detail: "Boarding — please have your travel pass ready", icon: AirplaneTakeoff, iconColor: "text-[#ff5228]" },
          { time: "14:30", emoji: "🛬", title: `Arrive ${dest} Airport`, detail: "Immigration & baggage claim", icon: AirplaneTakeoff, iconColor: "text-emerald-400" },
          { time: "16:00", emoji: "🏨", title: "Hotel Check-in", detail: `Smart escrow auto-released upon check-in`, icon: Bed, iconColor: "text-amber-400" },
        ],
      });
    } else if (i === nights + 1) {
      // Return day
      days.push({
        day: nights + 2,
        date: dateStr,
        label: "Return Day",
        activities: [
          { time: "08:00", emoji: "🏨", title: "Hotel Checkout", detail: "Smart escrow settlement confirmed", icon: Bed, iconColor: "text-slate-400" },
          { time: "10:00", emoji: "🚌", title: `Transfer to ${dest} Airport`, detail: "Airport shuttle via agent booking", icon: Train, iconColor: "text-purple-400" },
          { time: "13:00", emoji: "✈️", title: `Fly ${dest} → ${orig}`, detail: "Departure gate confirmed", icon: AirplaneTakeoff, iconColor: "text-[#ff5228]" },
        ],
      });
    } else {
      // Full days at destination
      const a1 = DEFAULT_ACTIVITIES[actIdx % DEFAULT_ACTIVITIES.length];
      const a2 = DEFAULT_ACTIVITIES[(actIdx + 1) % DEFAULT_ACTIVITIES.length];
      const a3 = DEFAULT_ACTIVITIES[(actIdx + 2) % DEFAULT_ACTIVITIES.length];

      const dayActivities: ItineraryActivity[] = [
        {
          time: "08:00",
          emoji: "☕",
          title: "Breakfast at Hotel",
          detail: "Start your day with local breakfast",
          icon: ForkKnife,
          iconColor: "text-amber-300",
        },
      ];
      if (a1) dayActivities.push(a1);
      if (a2) dayActivities.push(a2);
      if (a3) dayActivities.push(a3);

      actIdx += 3;

      days.push({
        day: i + 1,
        date: dateStr,
        label: i === 1 ? `First Day in ${dest}` : i === nights ? `Last Day in ${dest}` : `Day in ${dest}`,
        activities: dayActivities,
      });
    }
  }

  return days;
}

interface ItineraryCardsProps {
  origin: string;
  destination: string;
  nights?: number;
}

export function ItineraryCards({ origin, destination, nights = 5 }: ItineraryCardsProps) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const itinerary = generateItinerary(origin, destination, nights);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarBlank size={16} className="text-[var(--color-cta)]" weight="fill" />
          <span className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            AI-Generated Itinerary
          </span>
        </div>
        <span className="font-inter rounded-full bg-[var(--color-cta)]/10 border border-[var(--color-cta)]/20 px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-cta)]">
          {itinerary.length} Days · {nights} Nights
        </span>
      </div>

      {/* Day cards */}
      <div className="flex flex-col gap-2">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="rounded-xl border border-[var(--color-border)]/60 overflow-hidden"
          >
            {/* Day header */}
            <button
              onClick={() => setExpanded(expanded === day.day ? null : day.day)}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-inter text-[10px] font-bold text-[var(--color-cta)] min-w-[28px]">
                  D{day.day}
                </span>
                <span className="font-poppins text-xs font-semibold text-[var(--color-headline)]">
                  {day.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-inter text-[10px] text-[var(--color-muted)]">{day.date}</span>
                <span className={`font-inter text-[10px] transition-transform ${expanded === day.day ? "rotate-180" : ""}`}>▾</span>
              </div>
            </button>

            {/* Activities */}
            {expanded === day.day && (
              <div className="flex flex-col divide-y divide-white/[0.04] px-3.5 pb-2">
                {day.activities.map((activity, j) => {
                  const Icon = activity.icon;
                  return (
                    <div key={j} className="flex items-start gap-3 py-2.5">
                      <span className="font-mono text-[10px] text-[var(--color-muted)] min-w-[38px] mt-0.5">
                        {activity.time}
                      </span>
                      <div className={`mt-0.5 shrink-0 ${activity.iconColor}`}>
                        <Icon size={14} weight="fill" />
                      </div>
                      <div>
                        <p className="font-poppins text-[11px] font-semibold text-[var(--color-headline)]">
                          {activity.emoji} {activity.title}
                        </p>
                        <p className="font-inter text-[10px] text-[var(--color-muted)]">{activity.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
