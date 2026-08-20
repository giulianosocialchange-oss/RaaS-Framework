// src/services/openweather/weather.ts

import type { OpenWeatherResponse } from "@/services/openweather/types/weather";
import type { Coordinate } from "ol/coordinate";

export async function fetchWeather(coordinate: Coordinate): Promise<OpenWeatherResponse | null> {
  const [lon, lat] = coordinate;
  const targetUrl = `/api/openweather/weather?lat=${lat}&lon=${lon}&units=metric`;

  // 1. Log della richiesta e parametri in ingresso
  console.log("%c[Meteo FETCH REQUEST]", "color: #00bfff; font-weight: bold;", {
    url: targetUrl,
    params: {
      latitudine: lat,
      longitudine: lon,
      coordinateRaw: coordinate,
      units: "metric",
    },
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await fetch(targetUrl);

    // 2. Log dell'esito HTTP (status code e stato di rete)
    console.log(
      `%c[Meteo FETCH RESPONSE STATUS: ${result.status} ${result.statusText}]`,
      result.ok ? "color: #32cd32; font-weight: bold;" : "color: #ff4500; font-weight: bold;",
      {
        ok: result.ok,
        status: result.status,
        statusText: result.statusText,
      }
    );

    const response: OpenWeatherResponse = await result.json();

    // 3. Log del payload/dati ricevuti
    console.log("%c[Meteo FETCH DATA PAYLOAD]", "color: #ffd700; font-weight: bold;", response);

    return response;
  } catch (error) {
    // Gestione ed evidenziazione di errori di rete
    console.error("%c[Meteo FETCH NETWORK ERROR]", "color: #ff0000; font-weight: bold;", {
      url: targetUrl,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
}