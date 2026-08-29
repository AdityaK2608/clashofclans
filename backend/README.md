# Clash Command Center API

This small Node/Express service proxies the Clash of Clans player endpoint and adds CORS for the GitHub Pages frontend.

## Important CoC API requirement

Clash of Clans API keys are tied to allowed public IP address(es). The IP that calls `api.clashofclans.com` must be one of the IPs configured for the token. A browser-to-cloud proxy therefore cannot simply reuse a token created for your home/office IP. Create the production token for the **static public IP of this backend host**. This is a requirement of the CoC API, not of this project.

## Environment

- `PORT` — server port; defaults to `8787`.
- `ALLOWED_ORIGIN` — frontend origin; defaults to `https://adityak2608.github.io`.

The user token is supplied at request time in the `Authorization` header. The server does not persist it and does not log request headers.

## Run locally

```bash
npm install
npm start
```

Then set the GitHub Pages `config.js` value to the HTTPS URL of the deployed backend.

## Production deployment

Use a host with a stable public outbound IPv4 address. Add that IPv4 address to the API key in the Clash of Clans Developer Portal, deploy this service, and set `ALLOWED_ORIGIN` to the exact GitHub Pages origin.

Do not commit an API token, password, `.env` file, or private credentials to this repository.
