import { useHelicopterRouteContext } from "@/contexts/route/helicopter/hooks";
import { useShowErrorMessage } from "@/hooks/error/message";
import { calculateHelicopterTimeEstimation } from "@/services/helicopter/time-estimation";
import { createRouteFeatures } from "@/services/map/features/route";
import { createWayFeatures } from "@/services/map/features/way";
import type { OpenWeatherResponse } from "@/services/openweather/types/weather";
import { calculateElevationGain } from "@/services/path/way/elevation-gain";
import { calculateWayLength } from "@/services/path/way/length";
import { searchCloserHelipadPoint } from "@/services/search/closer-helipad";
import { searchCloserHeliportPoint } from "@/services/search/closer-heliport";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere"; // Calcolo in locale

// Il nostro tipo unificato
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

// FUNZIONE HELPER: Crea linea retta simulata al posto di usare OpenRouteService
const createStraightLineGeoJSON = (start: Coordinate, end: Coordinate) => {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [start, end],
        },
      },
    ],
  };
};

export const useFindHelicopterRoute = () => {
  const showError = useShowErrorMessage();
  const {
    setHeliportCoords,
    setHelipadCoords,
    setTrailPath,
    setFlightPath,
    setTrailDuration,
    setTrailElevationGain,
    setFlightDuration,
    setFlightElevationGain,
  } = useHelicopterRouteContext();

  return async function (
    fromPoint: Coordinate,
    toPoint: Coordinate,
    weather: OpenWeatherResponse | undefined,
    overpassData: UnifiedOverpassData // Dati in ingresso
  ) {
    try {
      // Passiamo i dati ai moduli di ricerca
      const [closerHeliport, closerHelipad] = await Promise.all([
        searchCloserHeliportPoint(fromPoint, overpassData),
        searchCloserHelipadPoint(toPoint, overpassData),
      ]);

      // Definisco volo
      setHeliportCoords(closerHeliport);
      setHelipadCoords(closerHelipad);
      setFlightPath(createWayFeatures([closerHeliport, closerHelipad]));

      // MOCK ALTITUDINI: Senza chiamare Google Maps, impostiamo quote standard/nulle
      closerHeliport[2] = closerHeliport[2] || 0;
      closerHelipad[2] = closerHelipad[2] || 0;

      // Calcolo tempo di percorrenza
      const elevation = calculateElevationGain(
        closerHeliport[2],
        closerHelipad[2]
      );
      const distance = calculateWayLength(
        closerHeliport,
        closerHelipad,
        elevation
      );
      setFlightDuration(calculateHelicopterTimeEstimation(distance, weather));
      setFlightElevationGain(elevation);

      // Definisco sentiero in locale (Senza OpenRouteService)
      const footDistance = getDistance(closerHelipad, toPoint);
      const trailDirections = createStraightLineGeoJSON(closerHelipad, toPoint) as any;

      setTrailPath(createRouteFeatures(trailDirections));
      setTrailDuration(footDistance / 1.1); // Stimiamo andatura a 1.1 m/s in fuoristrada

      toPoint[2] = toPoint[2] || 0;
      setTrailElevationGain(
        calculateElevationGain(closerHelipad[2], toPoint[2])
      );
    } catch (error) {
      showError(error);
    }
  };
};