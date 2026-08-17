# Privileged integration boundary

The desktop build is public. Values prefixed with `REACT_APP_` are compiled into the JavaScript bundle and must never
contain service credentials.

## Planet imagery

Planet access is disabled unless `REACT_APP_INTEGRATIONS_API_PATH` contains a same-origin path such as
`/api/integrations`. Absolute and protocol-relative URLs are rejected by the client.

The server behind that path must provide:

- `GET /planet/mosaics?pageSize=1000`
- `GET /planet/tiles/:mosaic/gmap/:z/:x/:y.png?proc=cir`

The mosaics endpoint returns the Planet response shape `{ "mosaics": [...] }`. The tile endpoint returns the proxied
PNG. The server owns the Planet credential and must keep it in a secret manager or server-only environment variable,
never a `REACT_APP_` variable. It must also validate mosaic names, tile coordinates and `proc`, enforce authentication
or signed access where possible, rate limits and provider quotas, and cache successful catalog/tile responses.

If this proxy is not deployed, leave `REACT_APP_INTEGRATIONS_API_PATH` empty. The UI then receives no Planet mosaics
and makes no request to Planet.

## Share links

Exports now display the original generated URL. The browser no longer calls Bitly. If URL shortening is reintroduced,
it must be implemented by a server endpoint with the Bitly credential held server-side.

## Intentionally public browser keys

`REACT_APP_PUBLIC_MAPBOX_ACCESS_TOKEN` and `REACT_APP_PUBLIC_GOOGLE_PLACES_API_KEY` are browser-facing identifiers.
Restrict them in the provider consoles by production origins, required APIs/scopes and quotas. Rotate the previous
Bitly and Planet credentials because older builds may have exposed them.
