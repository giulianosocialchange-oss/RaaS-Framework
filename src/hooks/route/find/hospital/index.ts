import { useDriveRouteContext } from "@/contexts/route/drive/hooks";
import { useHelicopterRouteContext } from "@/contexts/route/helicopter/hooks";
import { useShowErrorMessage } from "@/hooks/error/message";
import type { Coordinate } from "ol/coordinate";
import { getDistance } from "ol/sphere"; // Funzione matematica nativa di OpenLayers
import type { UnifiedOverpassData } from "@/services/overpass/unified/index";

export const useFindCloserHospital = () => {
  const showError = useShowErrorMessage();
  const { setDepartureCoords } = useDriveRouteContext();
  const { setHeliportCoords } = useHelicopterRouteContext();

  // Aggiungiamo overpassData ai parametri in ingresso
  return async function (destinationCoords: Coordinate, overpassData: UnifiedOverpassData) {
    try {
      const hospitals = overpassData.hospitals;

      if (!hospitals || hospitals.length === 0) {
        throw new Error("Nessun ospedale trovato nei dati scaricati nell'area.");
      }

      let closestHospitalCoord: Coordinate | null = null;
      let minDistance = Infinity;

      // Calcoliamo la distanza di tutti gli ospedali (in RAM, è istantaneo)
      hospitals.forEach((hospital) => {
        // Overpass restituisce lat/lon direttamente (nodi) o dentro 'center' (aree/poligoni)
        const lat = hospital.lat || (hospital.center && hospital.center.lat);
        const lon = hospital.lon || (hospital.center && hospital.center.lon);

        if (lat && lon) {
          const hospitalCoord: Coordinate = [lon, lat]; // OpenLayers usa [Longitudine, Latitudine]

          // getDistance restituisce la distanza in metri (Geodetica WGS84)
          const distance = getDistance(destinationCoords, hospitalCoord);

          if (distance < minDistance) {
            minDistance = distance;
            closestHospitalCoord = hospitalCoord;
          }
        }
      });

      if (!closestHospitalCoord) {
        throw new Error("Impossibile determinare le coordinate dell'ospedale più vicino.");
      }

      // Assegno valori di partenza per le rotte
      setDepartureCoords(closestHospitalCoord);
      setHeliportCoords(closestHospitalCoord);

      // Restituisco coordinate
      return closestHospitalCoord;
    } catch (error) {
      showError(error);
      return null;
    }
  };
};