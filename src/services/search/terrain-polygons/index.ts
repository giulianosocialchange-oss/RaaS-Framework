import type { GeomOutput } from "@/services/overpass/types/geom";
import type { RelationOutput } from "@/services/overpass/types/rel";
import { aggregateRelModules } from "@/services/path/rel/aggregate";
import { createTerrainPolygon } from "@/services/terrain/create-polygon";
import { createTerrainRelPolygon } from "@/services/terrain/create-polygon/rel";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere";
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export async function searchTerrainPolygons(
  coordinate: Coordinate,
  maxDistance: number,
  overpassData: UnifiedOverpassData
) {
  try {
    const data = overpassData as any;
    const terrainsArray = data.terrains || data.terrain || [];

    const terrainWays: GeomOutput[] = [];
    const terrainRelations: RelationOutput[] = [];
    const terrainRelWays: GeomOutput[] = [];

    console.log("[filtriamo i terreni ]size [%c]]", terrainsArray.length);

    // Filtriamo i terreni
    terrainsArray.forEach((element: any) => {
      const firstPoint =
        (element.geometry && element.geometry[0]) ||
        element.center ||
        { lon: element.lon, lat: element.lat };

      console.log("[firstPoint] %c ", firstPoint);
      console.log("[firstPoint.lat] %c ", firstPoint.lat);

      if (firstPoint && firstPoint.lon !== undefined && firstPoint.lat !== undefined) {
        const elCoord: Coordinate = [firstPoint.lon, firstPoint.lat];
        const dist = getDistance(coordinate, elCoord);
        console.log("[dist] %c ", dist);


        if (dist <= maxDistance) {
          console.log("[in range] %c ", dist);
          if (element.type === "relation") {
            console.log("[relation]");
            terrainRelations.push(element as RelationOutput);
          } else {
            console.log("[relation PUT]");
            terrainWays.push(element as GeomOutput);
            terrainRelWays.push(element as GeomOutput);
          }
        }
      }
    });

    if (!terrainWays.length && !terrainRelations.length)
      throw new Error("Non sono stati trovati terreni nelle vicinanze");

    // Genero i poligoni che definiscono i terreni
    return [
      ...terrainWays.map(createTerrainPolygon),
      ...terrainRelations.map((rel) =>
        createTerrainRelPolygon(aggregateRelModules(rel, terrainRelWays))
      ),
    ];
  } catch (error) {
    console.warn("Error searchTerrainPolygons:", error);
    throw new Error(
      "Non è stato possibile recuperare i tipi di terreni nella zona"
    );
  }
}