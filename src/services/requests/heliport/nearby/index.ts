import type { CenterOutput } from "@/services/overpass/types/center";
import type { NodeOutput } from "@/services/overpass/types/node";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere";

import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export const searchHeliportNearby = async (
  node: Coordinate,
  distance: number = 100,
  overpassData: UnifiedOverpassData
): Promise<(NodeOutput | CenterOutput)[]> => {

  const results: (NodeOutput | CenterOutput)[] = [];

  // Zittiamo TypeScript dicendogli di non controllare la struttura esatta qui
  const data = overpassData as any;

  // Controlliamo sia il plurale che il singolare per sicurezza!
  const heliportsArray = data.heliports || data.heliport || [];

  heliportsArray.forEach((element: any) => {
    const lat = element.lat || (element.center && element.center.lat);
    const lon = element.lon || (element.center && element.center.lon);

    if (lat && lon) {
      const heliportCoord: Coordinate = [lon, lat];

      const dist = getDistance(node, heliportCoord);

      if (dist <= distance) {
        results.push({
          type: element.type,
          id: element.id,
          lat: lat,
          lon: lon,
        } as NodeOutput);
      }
    }
  });

  return results;
};