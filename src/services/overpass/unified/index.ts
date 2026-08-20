import type { Coordinate } from "ol/coordinate";

export interface OverpassElementWithTags {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    geometry?: Array<{
        lat: number;
        lon: number;
        id?: number;
    }>;
    tags?: Record<string, string>;
    [key: string]: unknown;
}

export interface UnifiedOverpassData {
    highways: OverpassElementWithTags[];
    terrains: OverpassElementWithTags[];
    hospitals: OverpassElementWithTags[];
    helipads: OverpassElementWithTags[];
    heliports: OverpassElementWithTags[];
}

const TERRAIN_LANDUSE_VALUES = new Set([
    "grass",
    "meadow",
    "forest",
]);

const TERRAIN_NATURAL_VALUES = new Set([
    "grassland",
    "heath",
    "moor",
    "scrub",
    "tundra",
    "wood",
    "bare_rock",
    "blockfield",
    "scree",
]);

function isFiniteCoordinate(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isTerrainElement(element: OverpassElementWithTags): boolean {
    const landuse = element.tags?.landuse;
    const natural = element.tags?.natural;

    return (
        (typeof landuse === "string" && TERRAIN_LANDUSE_VALUES.has(landuse)) ||
        (typeof natural === "string" && TERRAIN_NATURAL_VALUES.has(natural))
    );
}

export async function fetchAllOverpassData(
    coordinate: Coordinate,
): Promise<UnifiedOverpassData> {
    const [lon, lat] = coordinate;

    if (!isFiniteCoordinate(lon) || !isFiniteCoordinate(lat)) {
        throw new Error(
            "[Overpass UNIFICATA] Coordinate non valide: attese [longitudine, latitudine]",
        );
    }

    const query = `
[out:json][timeout:25];
(
  way(around:500,${lat},${lon})[highway];

  way(around:1000,${lat},${lon})[landuse~"^(grass|meadow|forest)$"];
  way(around:1000,${lat},${lon})[natural~"^(grassland|heath|moor|scrub|tundra|wood|bare_rock|blockfield|scree)$"];

  relation(around:1000,${lat},${lon})[landuse~"^(grass|meadow|forest)$"];
  relation(around:1000,${lat},${lon})[natural~"^(grassland|heath|moor|scrub|tundra|wood|bare_rock|blockfield|scree)$"];

  nwr(around:20000,${lat},${lon})[amenity="hospital"];
  nwr(around:20000,${lat},${lon})[aeroway~"^(helipad|heliport)$"];
);
out body geom;
`.trim();

    console.debug("[Overpass UNIFICATA] Avvio caricamento dati", {
        lon,
        lat,
    });

    try {
        const params = new URLSearchParams({
            data: query,
        });


        console.log("[Overpass] query reale:", query);


        const response = await fetch(`/api/overpass?${params.toString()}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `[Overpass UNIFICATA] HTTP ${response.status}: ${errorText}`,
            );
        }

        const data: { elements?: OverpassElementWithTags[] } =
            await response.json();

        const elements = Array.isArray(data.elements) ? data.elements : [];

        const result: UnifiedOverpassData = {
            highways: elements.filter(
                (element) => typeof element.tags?.highway === "string",
            ),
            terrains: elements.filter(isTerrainElement),
            hospitals: elements.filter(
                (element) => element.tags?.amenity === "hospital",
            ),
            helipads: elements.filter(
                (element) => element.tags?.aeroway === "helipad",
            ),
            heliports: elements.filter(
                (element) => element.tags?.aeroway === "heliport",
            ),
        };

        console.info("[Overpass UNIFICATA] Dati locali caricati", {
            highways: result.highways.length,
            terrains: result.terrains.length,
            hospitals: result.hospitals.length,
            helipads: result.helipads.length,
            heliports: result.heliports.length,
        });

        return result;
    } catch (error) {
        console.error("[Overpass UNIFICATA] Errore nel caricamento", error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("[Overpass UNIFICATA] Errore sconosciuto");
    }
}