import { useWeatherContext } from "@/contexts/weather/hooks";
import { getWeatherIcon } from "@/services/openweather/icon";
import { fetchWeather } from "@/services/openweather/weather";
import type { Coordinate } from "ol/coordinate";

export const useLoadCurrentWeather = () => {
  const {
    setWeatherIcon,
    setTemperature,
    setWindSpeed,
    setWindDirection,
    setFallingRain,
    setFallingSnow,
  } = useWeatherContext();

  return async (coordinate: Coordinate) => {
    // Recupero i dati metereologici
    const weather = await fetchWeather(coordinate);

    // Controllo di sicurezza difensivo: se la chiamata API fallisce o non restituisce dati validi
    if (!weather || !weather.weather || !weather.weather[0]) {
      console.warn(
        "[Meteo API] Dati meteo non disponibili o chiave API non valida. Applico valori di fallback sicuri.",
        weather
      );

      // Valori di default per evitare il blocco della dashboard
      setWeatherIcon(getWeatherIcon("01d"));
      setTemperature(20);
      setWindSpeed(0);
      setWindDirection(0);
      setFallingRain(0);
      setFallingSnow(0);

      return weather;
    }

    // Se i dati sono presenti e validi, registro i valori reali
    setWeatherIcon(getWeatherIcon(weather.weather[0].icon || "01d"));
    setTemperature(weather.main?.temp ?? 20);

    if (weather.wind) {
      setWindSpeed(weather.wind.speed ?? 0);
      setWindDirection(weather.wind.deg ?? 0);
    }

    if (weather.rain) {
      setFallingRain(weather.rain["1h"] ?? 0);
    }

    if (weather.snow) {
      setFallingSnow(weather.snow["1h"] ?? 0);
    }

    // Restituisco i valori per confronto immediato
    return weather;
  };
};