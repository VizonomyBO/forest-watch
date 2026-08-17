import { INTEGRATIONS_API_PATH } from "constants/global";

interface ILinks {
  _self: string;
  quads: string;
  tiles: string;
}

interface IGrid {
  quad_size: number;
  resolution: number;
}

export interface IMosaic {
  _links: ILinks;
  bbox: number[];
  coordinate_system: string;
  datatype: string;
  first_acquired: string;
  grid: IGrid;
  id: string;
  interval: string;
  item_types: string[];
  last_acquired: string;
  level: number;
  name: string;
  product_type: string;
  quad_download: boolean;
}

export interface IMosaicsResponse {
  mosaics: IMosaic[];
}

export function normalizeIntegrationsApiPath(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "";
  return path.replace(/\/+$/, "");
}

export function getPlanetTileUrl(name: string, proc: string, apiPath = INTEGRATIONS_API_PATH): string | null {
  const basePath = normalizeIntegrationsApiPath(apiPath);
  if (!basePath) return null;

  const query = proc ? `?proc=${encodeURIComponent(proc)}` : "";
  return `${basePath}/planet/tiles/${encodeURIComponent(name)}/gmap/{z}/{x}/{y}.png${query}`;
}

export class BasemapService {
  private readonly apiPath: string;

  constructor(apiPath = INTEGRATIONS_API_PATH) {
    this.apiPath = normalizeIntegrationsApiPath(apiPath);
  }

  get isConfigured() {
    return Boolean(this.apiPath);
  }

  async getPlanetBasemaps(): Promise<IMosaicsResponse> {
    if (!this.apiPath) return { mosaics: [] };

    const response = await fetch(`${this.apiPath}/planet/mosaics?pageSize=1000`, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) throw Error("Unable to load Planet basemaps through the integrations API");
    return response.json();
  }
}

export const basemapService = new BasemapService();
