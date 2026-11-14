# DevBridge API quick reference

Base path: /api/v1

## Authentication
- POST /signup
- POST /login
- POST /logout

## Profile
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## Discovery
- GET /feed?page=1&limit=10
- Optional filters: skill, lookingFor, availability

## Connections
- POST /request/send/:status/:toUserId
  - status: interested | ignored
- PATCH /request/review/:status/:requestId
  - status: accepted | rejected
- GET /user/requests/received
- GET /user/connections

## Account
- DELETE /users
- GET /health (not versioned; no authentication required)
