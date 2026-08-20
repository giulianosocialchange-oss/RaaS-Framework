import { useOffroadRouteContext } from "@/contexts/route/offroad/hooks";
import { useShowErrorMessage } from "@/hooks/error/message";
import { calculateElevationGain } from "@/services/path/way/elevation-gain";
import { searchShorterOffroad } from "@/services/search/shorter-offroad";
import type { Coordinate } from "ol/coordinate";
// Nuovo import richiesto per i dati unificati
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export const useFindOffroadRoute = () => {
  const showError = useShowErrorMessage();
  const {
    setDestinationCoords,
    setTrailEndCoords,
    setOffroadGraph,
    setOffroadElevationGain,

    setOffroadNodesAStandard,
    setOffroadArchsAStandard,
    setOffroadDistanceAStandard,
    setOffroadDurationAStandard,

    setOffroadNodesABidirectional,
    setOffroadArchsABidirectional,
    setOffroadDistanceABidirectional,
    setOffroadDurationABidirectional,
  } = useOffroadRouteContext();

  // Aggiunto overpassData ai parametri in ingresso
  return async function (
    destinationCoords: Coordinate,
    overpassData: UnifiedOverpassData
  ) {
    try {
      // Passiamo i dati di Overpass già in memoria alla funzione di calcolo
      const [offroadNodesAStandard, offroadNodesABidirectional] =
        await searchShorterOffroad(destinationCoords, 500, overpassData);

      const shorterOffroadAStandard = offroadNodesAStandard[0];
      const trailEndCoords = shorterOffroadAStandard.nodes[0];

      // Assengo estremi del sentiero
      setDestinationCoords(destinationCoords);
      setTrailEndCoords(trailEndCoords);
      setOffroadElevationGain(
        calculateElevationGain(trailEndCoords[2], destinationCoords[2])
      );
      setOffroadGraph(shorterOffroadAStandard.graph);

      // Definisco percorso fuori sentiero
      setOffroadNodesAStandard([
        ...shorterOffroadAStandard.nodes,
        destinationCoords,
      ]);
      setOffroadDistanceAStandard(shorterOffroadAStandard.distance);
      setOffroadDurationAStandard(shorterOffroadAStandard.duration);
      setOffroadArchsAStandard(shorterOffroadAStandard.archs);

      // (Salvo dati alternativi)
      const shorterOffroadABidirectional = offroadNodesABidirectional[0];
      setOffroadNodesABidirectional(shorterOffroadABidirectional.nodes);
      setOffroadArchsABidirectional(shorterOffroadABidirectional.archs);
      setOffroadDistanceABidirectional(shorterOffroadABidirectional.distance);
      setOffroadDurationABidirectional(shorterOffroadABidirectional.duration);

      // Restituisco coordinate ultimo punto sul sentiero
      return trailEndCoords;
    } catch (error) {
      showError(error);
    }
  };
};