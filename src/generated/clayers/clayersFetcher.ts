import { generatedApiFetch } from "services/httpClient";
import { ClayersContext } from "./clayersContext";

const baseUrl = process.env.REACT_APP_API_CUBE_URL;

export type ErrorWrapper<TError> = TError | { status: "unknown"; payload: string };

export type ClayersFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & ClayersContext["fetcherOptions"];

export function clayersFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>(options: ClayersFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return generatedApiFetch<TData>(baseUrl, options);
}
