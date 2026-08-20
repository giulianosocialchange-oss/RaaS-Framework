import type { MapComponentProps } from "@/components/map/types";
import { useDriveRouteContext } from "@/contexts/route/drive/hooks";
import { useHelicopterRouteContext } from "@/contexts/route/helicopter/hooks";
import { useOffroadRouteContext } from "@/contexts/route/offroad/hooks";
import { useMap } from "@/hooks/map";
import { useVectorLayer } from "@/hooks/map/layers/vector";
import { useFindDriveRoute } from "@/hooks/route/find/drive";
import { useFindHelicopterRoute } from "@/hooks/route/find/helicopter";
import { useFindCloserHospital } from "@/hooks/route/find/hospital";
import { useFindOffroadRoute } from "@/hooks/route/find/offroad";
import { useLoadCurrentWeather } from "@/hooks/weather/current";
import { coordinateTransform } from "@/services/map/coordinate/transform";
import { createNodeFeatures } from "@/services/map/features/node";
import { setFeaturesStyle } from "@/services/map/features/style";
import { createWayFeatures } from "@/services/map/features/way";
import { fetchAllOverpassData } from "@/services/overpass/unified/index";
import {
  helipadPointStyle,
  heliportPointStyle,
  offroadNodeStyle,
  offroadPointStyle,
  pointStyle,
  trailheadPointStyle,
} from "@/services/map/layer/style/point";
import {
  flightRouteStyle,
  offroadRouteStyle,
  roadRouteStyle,
  routeStyle,
} from "@/services/map/layer/style/route";
import { thunderforestCycleTileLayer } from "@/services/map/layer/thunderforest/cycle";
import { createVectorSource } from "@/services/map/source/vector";
import type { Feature } from "ol";
import type { Geometry } from "ol/geom";
// @ts-ignore
import "ol/ol.css";
import { useEffect } from "react";

const MapComponent = ({
  center,
  zoom,
  searching,
  showABidirectional,
  onSearchStart,
  onSearchEnd,
}: MapComponentProps) => {
  const {
    destinationCoords,
    trailEndCoords,
    offroadGraph,
    offroadNodesAStandard,
    offroadNodesABidirectional,
  } = useOffroadRouteContext();
  const {
    trailheadCoords,
    departureCoords,
    trailPath: driveTrailPath,
    roadPath,
  } = useDriveRouteContext();
  const {
    heliportCoords,
    helipadCoords,
    trailPath: helicopterTrailPath,
    flightPath,
  } = useHelicopterRouteContext();

  const findOffroadRoute = useFindOffroadRoute();
  const findCloserHospital = useFindCloserHospital();
  const findDriveRoute = useFindDriveRoute();
  const findHelicopterRoute = useFindHelicopterRoute();

  const loadCurrentWeather = useLoadCurrentWeather();

  // Definisco data-layer della mappa
  const nodesLayer = useVectorLayer(pointStyle, 10);
  const routesLayer = useVectorLayer(routeStyle, 5);
  const graphLayer = useVectorLayer(offroadNodeStyle);

  // Impostazione della mappa
  const ref = useMap({
    center,
    zoom,
    layers: [thunderforestCycleTileLayer, nodesLayer, routesLayer, graphLayer],
    onClick(e) {
      if (searching) return;
      onSearchStart();

      // 1. Log coordinate grezze della mappa (OpenLayers)
      console.log("%c[MAP CLICK] Coordinate grezze OpenLayers (EPSG:3857):", "color: #00ffff; font-weight: bold;", e.coordinate);

      // Ripristino mappa
      nodesLayer.getSource()?.clear();
      routesLayer.getSource()?.clear();
      graphLayer.getSource()?.clear();

      // 2. Trasformazione coordinate
      const emergencyCoords = coordinateTransform(e.coordinate);
      console.log("%c[MAP CLICK] Coordinate trasformate per API esterne:", "color: #32cd32; font-weight: bold;", {
        longitudine_X: emergencyCoords[0],
        latitudine_Y: emergencyCoords[1],
        arrayCompleto: emergencyCoords,
      });

      // Avvio chiamate asincrone
      // 1. Una sola chiamata Overpass + Meteo OpenWeather
      Promise.all([
        fetchAllOverpassData(emergencyCoords),
        loadCurrentWeather(emergencyCoords),
      ])
        .then(async ([overpassData, weather]) => {
          console.log("%c[DATI UNIFICATI IN MEMORIA]", "color: #00ff00", overpassData);

          // 2. Troviamo i punti di raccordo passando i dati già scaricati
          const trailEndCoords = await findOffroadRoute(emergencyCoords, overpassData);
          const hospitalCoords = await findCloserHospital(emergencyCoords, overpassData);

          // 3. Calcoliamo i percorsi finali con i nodi appena trovati
          return Promise.all([
            findDriveRoute(hospitalCoords!, trailEndCoords!, overpassData),
            findHelicopterRoute(
              hospitalCoords!,
              trailEndCoords!,
              weather || undefined,
              overpassData
            ),
          ]);
        })
        .catch((err) => console.error("[ROUTING ERROR]", err))
        .finally(() => onSearchEnd());
    },
  });

  // Rappresento nodi e percorsi sulla mappa
  useEffect(() => {
    if (!searching) {
      // Mostro nodi sulla mappa
      const nodesFeatures = [];
      if (destinationCoords) {
        nodesFeatures.push(...createNodeFeatures(destinationCoords));
      }
      if (departureCoords) {
        nodesFeatures.push(...createNodeFeatures(departureCoords));
      }
      if (trailEndCoords) {
        nodesFeatures.push(
          ...setFeaturesStyle(
            createNodeFeatures(trailEndCoords),
            offroadPointStyle
          )
        );
      }
      if (trailheadCoords) {
        nodesFeatures.push(
          ...setFeaturesStyle(
            createNodeFeatures(trailheadCoords),
            trailheadPointStyle
          )
        );
      }
      if (heliportCoords) {
        nodesFeatures.push(
          ...setFeaturesStyle(
            createNodeFeatures(heliportCoords),
            heliportPointStyle
          )
        );
      }
      if (helipadCoords) {
        nodesFeatures.push(
          ...setFeaturesStyle(
            createNodeFeatures(helipadCoords),
            helipadPointStyle
          )
        );
      }
      nodesLayer.setSource(createVectorSource(nodesFeatures));

      // Percorsi sulla mappa
      const routesFeatures = [];
      // Switch offroad nodes showABidirectional
      if (offroadNodesAStandard && !showABidirectional) {
        routesFeatures.push(
          ...setFeaturesStyle(
            createWayFeatures(offroadNodesAStandard),
            offroadRouteStyle
          )
        );
      }
      if (offroadNodesABidirectional && showABidirectional) {
        routesFeatures.push(
          ...setFeaturesStyle(
            createWayFeatures(offroadNodesABidirectional),
            offroadRouteStyle
          )
        );
      }
      if (driveTrailPath) {
        routesFeatures.push(...setFeaturesStyle(driveTrailPath, routeStyle));
      }
      if (helicopterTrailPath) {
        routesFeatures.push(
          ...setFeaturesStyle(helicopterTrailPath, routeStyle)
        );
      }
      if (roadPath) {
        routesFeatures.push(...setFeaturesStyle(roadPath, roadRouteStyle));
      }
      if (flightPath) {
        routesFeatures.push(...setFeaturesStyle(flightPath, flightRouteStyle));
      }
      routesLayer.setSource(createVectorSource(routesFeatures));

      // Grafi sulla mappa
      const graphFeatures: Feature<Geometry>[] = [];
      if (offroadGraph) {
        offroadGraph.forEach((offroadLevel) => {
          offroadLevel.forEach((alternativeNodeCoords) => {
            graphFeatures.push(...createNodeFeatures(alternativeNodeCoords));
          });
        });
      }
      graphLayer.setSource(createVectorSource(graphFeatures));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, showABidirectional]);

  return <div ref={ref} className="w-full flex-1 md:h-screen" />;
};

export default MapComponent;
