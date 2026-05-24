import { NextResponse } from "next/server";

// Open-Meteo API - free, no key required
// Using coordinates for general US location (adjust for Duffera Donuts location)
const LAT = 40.7128; // Default: NYC area
const LON = -74.0060;

export async function GET() {
  try {
    const today = new Date();
    const { searchParams } = new URL("https://api.open-meteo.com/v1/forecast");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ error: "Weather API error" }, { status: 502 });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}