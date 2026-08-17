declare module "@mapbox/geojson-area" {
  import type { Geometry } from "geojson";

  export function geometry(geometry: Geometry): number;
  export function ring(coordinates: number[][]): number;
}
