import type { NodeOutput } from "@/services/overpass/types/node";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere";

import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

interface GeometryPoint {
  lat: number;
  lon: number;
  id?: number;
}

export const searchTrailheadsNearby = async (
  node: Coordinate,
  distance: number,
  outFormat: string,
  overpassData: UnifiedOverpassData
): Promise<NodeOutput[]> => {

  const trailheads: NodeOutput[] = [];
  const addedCoords = new Set<string>();
  let dummyId = 1;

  overpassData.highways.forEach((way) => {
    const wayWithGeom = way as any;

    if (wayWithGeom.geometry && Array.isArray(wayWithGeom.geometry)) {
      wayWithGeom.geometry.forEach((point: GeometryPoint) => {
        const pointCoord: Coordinate = [point.lon, point.lat];

        const dist = getDistance(node, pointCoord);

        if (dist <= distance) {
          const coordKey = `${point.lat}-${point.lon}`;

          if (!addedCoords.has(coordKey)) {
            addedCoords.add(coordKey);

            // Rimosso 'tags' per rispettare l'interfaccia originale di Ferigo
            trailheads.push({
              type: "node",
              id: point.id || dummyId++,
              lat: point.lat,
              lon: point.lon
            } as NodeOutput);
          }
        }
      });
    }
  });

  return trailheads;
};