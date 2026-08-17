import { UsersContext } from "./usersContext";
import { generatedApiFetch } from "services/httpClient";

const baseUrl = `${process.env.REACT_APP_API_CUBE_URL}/v1/users`;

export type ErrorWrapper<TError> = TError | { status: "unknown"; payload: string };

export type UsersFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & UsersContext["fetcherOptions"];

export async function usersFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal
}: UsersFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return generatedApiFetch<TData>(baseUrl, { url, method, body, headers, pathParams, queryParams, signal });
}
