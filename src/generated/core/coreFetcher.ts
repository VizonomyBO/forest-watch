import { generatedApiFetch } from "services/httpClient";
import { CoreContext } from "./coreContext";

const baseUrl = process.env.REACT_APP_API_CUBE_URL;

export type ErrorWrapper<TError> = TError | { status: "unknown"; payload: string };

export type CoreFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & CoreContext["fetcherOptions"];

export function coreFetch<
  TData,
  TError,
  TBody extends {} | undefined | null | FormData,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>(options: CoreFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return generatedApiFetch<TData>(baseUrl, options);
}
