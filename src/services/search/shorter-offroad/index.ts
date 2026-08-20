import { OFFROAD_NODES_BREADTH, OFFROAD_NODES_DISTANCE } from "@/const/offroad";
import { calculatePathAStarBidirectional } from "@/services/graph/calculate/path/a-star/bidirectional";
import { calculatePathAStarFromTop } from "@/services/graph/calculate/path/a-star/from-top";
import { createGraphFrom2Points } from "@/services/graph/create/from-points";
import { sortNodesByDistance } from "@/services/path/nodes/sort-by-distance";
import { searchCloserNodes } from "@/services/search/closer-nodes";
import { searchTerrainPolygons } from "@/services/search/terrain-polygons";
import type { Coordinate } from "ol/coordinate";
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

// Graph matrix
const distanceGap = OFFROAD_NODES_DISTANCE;
const altNodes = OFFROAD_NODES_BREADTH;
const altRoutes = 3;

export async function searchShorterOffroad(
  destination: Coordinate,
  maxDistance: number = 1000,
  overpassData: UnifiedOverpassData
) {
  try {
    // Cerco sentieri vicini (seleziono nodi più vicini)
    const [closerNodes, terrainPolygons] = await Promise.all([
      searchCloserNodes(destination, maxDistance, overpassData),
      searchTerrainPolygons(destination, maxDistance + 500, overpassData),
    ]);

    // 2. Ordinamento nodi per distanza (accetta Coordinate[] e restituisce Coordinate[])
    const nodesByDistance = sortNodesByDistance(
      closerNodes,
      destination,
      altRoutes
    );

    // 3. Generazione grafi (passiamo direttamente la coordinata [lon, lat, quota])
    const archWithNodes = await Promise.all(
      nodesByDistance.map(async (node) => {
        const startPoint: Coordinate = [node[0], node[1], node[2] || 0];

        console.log("createGraphFrom2Points");
        const graph = await createGraphFrom2Points(
          startPoint,
          destination,
          distanceGap,
          altNodes
        );

        const bestPathAStar = calculatePathAStarFromTop(graph, terrainPolygons);
        const bestPathBidirectional = calculatePathAStarBidirectional(
          graph,
          terrainPolygons
        );

        return [
          {
            ...bestPathAStar,
            graph,
          },
          {
            ...bestPathBidirectional,
            graph,
          },
        ];
      })
    );

    // 4. Ordinamento soluzioni ottimali
    const shorterArchsAStandard = archWithNodes
      .sort((a, b) => a[0].duration - b[0].duration)
      .map((archs) => archs[0]);

    const shorterArchsABidirectional = archWithNodes
      .sort((a, b) => a[1].duration - b[1].duration)
      .map((archs) => archs[1]);

    console.debug(
      "Offroad Paths: stima accurata",
      "(a-star)",
      shorterArchsAStandard,
      "(a-bidir)",
      shorterArchsABidirectional
    );

    return [shorterArchsAStandard, shorterArchsABidirectional];
  } catch (error) {
    console.warn("Error searchShorterOffroad:", error);
    throw new Error("Non è stato possibile calcolare il percorso offroad");
  }
}