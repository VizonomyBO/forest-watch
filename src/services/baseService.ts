import { httpRequest, parseHttpResponse } from "./httpClient";

export class BaseService {
  _token = "";
  baseUrl = "";
  _response: null | Response = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  fetch = async (url: string, config?: RequestInit | undefined) => {
    const response = await httpRequest(`${this.baseUrl}${url}`, {
      ...config,
      token: this.token || undefined
    });
    this._response = response;
    return response;
  };

  fetchJSON = async <T = any>(url: string, config?: RequestInit | undefined): Promise<T> => {
    const response = await this.fetch(url, config);

    return parseHttpResponse<T>(response);
  };

  fetchBlob = async (url: string, config?: RequestInit | undefined) => {
    const response = await this.fetch(url, config);

    return response.blob();
  };

  get token() {
    return this._token;
  }

  set token(value) {
    this._token = value;
  }

  get lastResponse() {
    return this._response;
  }
}
