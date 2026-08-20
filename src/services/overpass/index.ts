import type {
  OverpassResponse,
  OverpassResponseElement,
} from "@/services/overpass/types";

// https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
// https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
// https://overpass-turbo.eu

export async function overpassRequest<T extends OverpassResponseElement>(
  query: string
) {
  // Aggiunto [timeout:25] nel preambolo Overpass QL
  const payload = `[out:json][timeout:25];${query}`;
  console.debug("Overpass API Request", payload);

  try {
    const result = await fetch(
      `/api/overpass?data=${encodeURIComponent(payload)}`
    );

    if (!result.ok) {
      console.warn(`[Overpass] Chiamata fallita con stato HTTP ${result.status}: ${result.statusText}`);
      return [] as T[];
    }

    const response: OverpassResponse<T> = await result.json();
    return response.elements || [];
  } catch (error) {
    console.error("[Overpass] Errore di rete o parsing JSON:", error);
    return [] as T[];
  }
}
