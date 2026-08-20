import { transform } from "ol/proj";
import type { Coordinate } from "ol/coordinate";

export const coordinateTransform = (coordinate: Coordinate) => {
  const srcProj = process.env.NEXT_PUBLIC_EPSG_PROJECTION_SRC || "EPSG:3857";
  const dstProj = process.env.NEXT_PUBLIC_EPSG_PROJECTION_DST || "EPSG:4326";

  const transformed = transform(coordinate, srcProj, dstProj);

  console.log("%c[COORDINATE TRANSFORM]", "color: #ff79c6; font-weight: bold;", {
    inputOriginale: coordinate,
    proiezioneSorgente: srcProj,
    proiezioneDestinazione: dstProj,
    outputGpsTrasformato: transformed,
  });

  return transformed;
};