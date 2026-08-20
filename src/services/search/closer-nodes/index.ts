import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere";
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export async function searchCloserNodes(
  destination: Coordinate,
  maxDistance: number = 1000,
  overpassData: UnifiedOverpassData
): Promise<Coordinate[]> {
  try {
    const nodes: Coordinate[] = [];
    const addedCoords = new Set<string>();

    const data = overpassData as any;
    const highways = data.highways || [];

    // Estraiamo e filtriamo i punti direttamente dalle strade in memoria
    highways.forEach((way: any) => {
      if (way.geometry && Array.isArray(way.geometry)) {
        way.geometry.forEach((point: any) => {
          if (point.lon !== undefined && point.lat !== undefined) {
            const pointCoord: Coordinate = [point.lon, point.lat];
            const dist = getDistance(destination, pointCoord);

            if (dist <= maxDistance) {
              const coordKey = `${point.lat.toFixed(6)}-${point.lon.toFixed(6)}`;
              if (!addedCoords.has(coordKey)) {
                addedCoords.add(coordKey);
                // Inseriamo la coordinata [lon, lat, quota]
                nodes.push([point.lon, point.lat, 0]);
              }
            }
          }
        });
      }
    });

    if (!nodes.length) {
      // Fallback: se nessun nodo stradale rientra nel raggio, usiamo il punto di destinazione stesso
      nodes.push([destination[0], destination[1], destination[2] || 0]);
    }

    return nodes;
  } catch (error) {
    console.warn("Error searchCloserNodes:", error);
    throw new Error("Non è stato possibile recuperare i nodi più vicini");
  }
}