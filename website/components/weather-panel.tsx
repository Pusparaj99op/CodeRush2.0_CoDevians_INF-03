"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Drop,
} from "@phosphor-icons/react";

interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  weatherCode: number;
}

interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
}

interface WeatherData {
  current: CurrentWeather;
  daily: WeatherDay[];
  timezone: string;
}

const WMO_DESCRIPTIONS: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  61: { label: "Slight rain", emoji: "🌧️" },
  63: { label: "Moderate rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "⛈️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Moderate snow", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  99: { label: "Severe thunderstorm", emoji: "🌩️" },
};

function getWeatherInfo(code: number) {
  // Find closest code
  const keys = Object.keys(WMO_DESCRIPTIONS).map(Number).sort((a, b) => a - b);
  let match: number = keys[0] ?? 0;
  for (const k of keys) {
    if (k <= code) match = k;
  }
  return WMO_DESCRIPTIONS[match] ?? { label: "Unknown", emoji: "🌡️" };
}

function WeatherIcon({ code, size = 20 }: { code: number; size?: number }) {
  if (code <= 1) return <Sun size={size} className="text-amber-400" weight="fill" />;
  if (code <= 3) return <Cloud size={size} className="text-slate-400" weight="fill" />;
  if (code <= 67) return <CloudRain size={size} className="text-blue-400" weight="fill" />;
  if (code <= 77) return <CloudSnow size={size} className="text-cyan-300" weight="fill" />;
  return <CloudLightning size={size} className="text-yellow-400" weight="fill" />;
}

interface WeatherPanelProps {
  lat: number;
  lng: number;
  cityName: string;
}

export function WeatherPanel({ lat, lng, cityName }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setWeather(null);

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
      `&timezone=auto&forecast_days=7`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const daily: WeatherDay[] = (data.daily?.time ?? []).map((date: string, i: number) => ({
          date,
          maxTemp: Math.round(data.daily?.temperature_2m_max?.[i] ?? 0),
          minTemp: Math.round(data.daily?.temperature_2m_min?.[i] ?? 0),
          precipitation: data.daily?.precipitation_sum?.[i] ?? 0,
          weatherCode: data.daily?.weather_code?.[i] ?? 0,
        }));
        setWeather({
          current: {
            temperature: Math.round(data.current.temperature_2m),
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
          },
          daily,
          timezone: data.timezone_abbreviation ?? "UTC",
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-xs text-[var(--color-muted)] font-poppins">
        <span className="h-4 w-4 rounded-full border-2 border-[var(--color-cta)] border-t-transparent animate-spin" />
        Fetching weather for {cityName.split(",")[0] ?? cityName}...
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-xs text-[var(--color-muted)] font-poppins">
        🌍 Weather unavailable for this location
      </div>
    );
  }

  const current = weather.current;
  const currentInfo = getWeatherInfo(current.weatherCode);
  const shortCity = cityName.split(",")[0] ?? cityName;
  const today = weather.daily[0] ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
      {/* Header + Current */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            {currentInfo.emoji} {shortCity} Weather
          </p>
          <p className="font-inter text-[10px] text-[var(--color-muted)]">
            {currentInfo.label} · {weather.timezone}
          </p>
        </div>
        <div className="text-right">
          <p className="font-poppins text-2xl font-bold text-[var(--color-headline)]">
            {current.temperature}°C
          </p>
          <p className="font-inter text-[10px] text-[var(--color-muted)]">
            {today?.minTemp}° / {today?.maxTemp}°
          </p>
        </div>
      </div>

      {/* Current stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
          <Wind size={12} className="text-blue-400" />
          <span className="font-inter text-[11px] text-[var(--color-body)]">{current.windSpeed} km/h</span>
        </div>
        {today && today.precipitation > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
            <Drop size={12} className="text-sky-400" weight="fill" />
            <span className="font-inter text-[11px] text-[var(--color-body)]">{today.precipitation.toFixed(1)} mm</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
          <Thermometer size={12} className="text-[var(--color-cta)]" />
          <span className="font-inter text-[11px] text-[var(--color-body)]">
            {today?.minTemp}–{today?.maxTemp}°C today
          </span>
        </div>
      </div>

      {/* 7-Day Forecast Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {weather.daily.map((day, i) => {
          const info = getWeatherInfo(day.weatherCode);
          const date = new Date(day.date);
          const label = i === 0 ? "Today" : date.toLocaleDateString("en", { weekday: "short" });
          return (
            <div
              key={day.date}
              className="flex min-w-[52px] flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-2 flex-shrink-0"
            >
              <span className="font-inter text-[9px] font-bold uppercase text-[var(--color-muted)]">{label}</span>
              <span className="text-base">{info.emoji}</span>
              <span className="font-inter text-[10px] font-semibold text-[var(--color-headline)]">{day.maxTemp}°</span>
              <span className="font-inter text-[9px] text-[var(--color-muted)]">{day.minTemp}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
