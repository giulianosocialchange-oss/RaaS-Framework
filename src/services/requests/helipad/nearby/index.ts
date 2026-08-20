import type { CenterOutput } from "@/services/overpass/types/center";
import type { NodeOutput } from "@/services/overpass/types/node";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere";

// Importiamo il nostro tipo unificato
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export const searchHelipadNearby = async (
  node: Coordinate,
  distance: number = 100,
  overpassData: UnifiedOverpassData
): Promise<(NodeOutput | CenterOutput)[]> => {

  const results: (NodeOutput | CenterOutput)[] = [];

  // Peschiamo gli eliporti direttamente dai dati già in memoria
  overpassData.helipads.forEach((element) => {
    // Aggiriamo i controlli rigidi di TypeScript
    const el = element as any;

    // Estraiamo latitudine e longitudine
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon || (el.center && el.center.lon);

    if (lat && lon) {
      const heliportCoord: Coordinate = [lon, lat];

      // Calcoliamo la distanza
      const dist = getDistance(node, heliportCoord);

      // Se è dentro il raggio, lo aggiungiamo
      if (dist <= distance) {
        results.push({
          type: el.type,
          id: el.id,
          lat: lat,
          lon: lon,
        } as NodeOutput);
      }
    }
  });

  return results;
};