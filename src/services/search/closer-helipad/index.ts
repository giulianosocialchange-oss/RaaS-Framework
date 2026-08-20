import { parseCenterElement } from "@/services/overpass/parsers/center";
import { getCloserNode } from "@/services/path/way/closer-node";
import { searchHelipadNearby } from "@/services/requests/helipad/nearby";
import type { Coordinate } from "ol/coordinate";

// Importiamo il nostro pacchetto dati in memoria
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export async function searchCloserHelipadPoint(
  emergencyCoords: Coordinate,
  overpassData: UnifiedOverpassData // Aggiungiamo i dati
) {
  try {
    // Passiamo overpassData alla ricerca per evitare Internet
    const helipads = await searchHelipadNearby(emergencyCoords, 1000, overpassData);

    if (!helipads.length)
      throw new Error("Non sono state trovate elisuperfici nelle vicinanze");

    // Scelgo il più vicino
    const helipadsCoords = helipads.map(parseCenterElement);
    const helipadNode = getCloserNode(helipadsCoords, emergencyCoords);
    return helipadNode.coordinate;
  } catch (error) {
    console.warn("Error searchCloserHelipadPoint:", error);
    throw new Error("Non è stato possibile trovate l'elisuperfice più vicina");
  }
}