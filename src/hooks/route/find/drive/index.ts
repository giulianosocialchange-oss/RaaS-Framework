import { useDriveRouteContext } from "@/contexts/route/drive/hooks";
import { useShowErrorMessage } from "@/hooks/error/message";
import { createRouteFeatures } from "@/services/map/features/route";
import { searchShorterRoute } from "@/services/search/shorter-route";
import type { Coordinate } from "ol/coordinate";

// Nuovo import per i dati in memoria
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export const useFindDriveRoute = () => {
  const showError = useShowErrorMessage();
  const {
    setTrailheadCoords,
    setTrailPath,
    setTrailDuration,
    setRoadPath,
    setRoadDuration,
  } = useDriveRouteContext();

  // Aggiungiamo overpassData come terzo parametro
  return async function (
    fromPoint: Coordinate,
    toPoint: Coordinate,
    overpassData: UnifiedOverpassData
  ) {
    try {
      // Passiamo i dati di Overpass già in memoria alla funzione di calcolo
      const { shorterPath } = await searchShorterRoute(fromPoint, toPoint, overpassData);

      // Definisco sentiero
      setTrailheadCoords(shorterPath.trailheadPoint);
      setTrailPath(createRouteFeatures(shorterPath.trailDirections));
      setTrailDuration(shorterPath.trailDuration);

      // Definisco strata fino ad attacco sentiero
      setRoadPath(createRouteFeatures(shorterPath.roadDirections));
      setRoadDuration(shorterPath.roadDuration);
    } catch (error) {
      showError(error);
    }
  };
};