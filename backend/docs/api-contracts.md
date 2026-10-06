# API Contracts
- [Catalog](../src/modules/catalog/api-contracts.md)

## Auth controller

Base path: `/auth`

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create a new user account. |
| `POST` | `/auth/login` | Log in with email and password. |
| `GET` | `/auth/login/google` | Start Google authentication. |
| `GET` | `/auth/login/google/return` | Handle the Google authentication callback. |
| `GET` | `/auth/login/steam` | Start Steam authentication. |
| `GET` | `/auth/login/steam/return` | Handle the Steam authentication callback. |

## Steam controller

Base path: `/steam`

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/steam/:id/info` | Get Steam game information for the specified game ID. |
| `GET` | `/steam/:id/reviews` | Get Steam reviews for the specified game ID. |

## OpenCritic controller

Base path: `/opencritic`

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/opencritic/:id/info` | Get OpenCritic game information for the specified game ID. |
| `GET` | `/opencritic/:id/reviews` | Get OpenCritic reviews for the specified game ID. |
