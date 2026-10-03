import type { Weather } from "@/lib/types";

export async function getWeather(city: string | undefined, fixtureDate: string): Promise<Weather | undefined> {
  if (!city) return undefined;
  try {
    const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, {
      next: { revalidate: 86400 }
    });
    if (!geoResp.ok) return undefined;
    const geo = await geoResp.json();
    const place = geo.results?.[0];
    if (!place) return undefined;

    const kickoff = new Date(fixtureDate);
    const day = fixtureDate.slice(0, 10);
    const forecastResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m&timezone=auto&start_date=${day}&end_date=${day}`,
      { next: { revalidate: 3600 } }
    );
    if (!forecastResp.ok) return undefined;
    const data = await forecastResp.json();
    const times: string[] = data.hourly?.time ?? [];
    if (!times.length) return undefined;

    let best = 0;
    let bestDiff = Infinity;
    times.forEach((time, i) => {
      const diff = Math.abs(new Date(time).getTime() - kickoff.getTime());
      if (diff < bestDiff) { best = i; bestDiff = diff; }
    });

    const temperature = data.hourly?.temperature_2m?.[best];
    const precipitationProbability = data.hourly?.precipitation_probability?.[best];
    const windSpeed = data.hourly?.wind_speed_10m?.[best];
    return {
      temperature,
      precipitationProbability,
      windSpeed,
      label: `${temperature ?? "?"}°C · mưa ${precipitationProbability ?? "?"}% · gió ${windSpeed ?? "?"} km/h`
    };
  } catch {
    return undefined;
  }
}
