import { parseCenterElement } from "@/services/overpass/parsers/center";
import { getCloserNode } from "@/services/path/way/closer-node";
import { searchHeliportNearby } from "@/services/requests/heliport/nearby";
import type { Coordinate } from "ol/coordinate";

// Importiamo il nostro tipo unificato
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export async function searchCloserHeliportPoint(
  hospitalCoords: Coordinate,
  overpassData: UnifiedOverpassData // Aggiungiamo i dati in memoria
) {
  try {
    // Passiamo overpassData alla ricerca per evitare chiamate di rete
    const heliports = await searchHeliportNearby(hospitalCoords, 5000, overpassData);

    if (!heliports.length)
      throw new Error("Non sono stati trovati eliporti nelle vicinanze");

    // Scelgo il più vicino
    const heliportsCoords = heliports.map(parseCenterElement);
    const heliportNode = getCloserNode(heliportsCoords, hospitalCoords);
    return heliportNode.coordinate;
  } catch (error) {
    console.warn("Error searchCloserHeliportPoint:", error);
    throw new Error("Non è stato possibile trovare l'eliporto più vicino");
  }
}