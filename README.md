# DevBridge

**A collaboration-first developer networking API.**

DevBridge helps developers discover people they can build with. It matches on technical skills, complementary skills, collaboration goals, availability, and project interests. Each suggestion includes an explainable compatibility score and reasons.

This repository is a backend API built with Node.js, Express, MongoDB, and Mongoose. It extends the developer-networking idea with a collaboration-first workflow.

## What makes it different?

- **Collaboration intent:** find hackathon teammates, project collaborators, open-source contributors, learning partners, mentors, or mentees.
- **Complementary skills:** matching considers both shared skills and skills a developer wants to find in a collaborator.
- **Explainable compatibility:** suggestions include a score and human-readable reasons.
- **Intent-aware discovery:** developers you've already interacted with are removed from your feed.

## Features

- Account signup, login, and logout with cookie-based JWT authentication.
- Private profile viewing and validated profile editing.
- Password changes with current-password verification.
- Developer discovery with pagination and filters.
- Connection requests, skip actions, and recipient-only accept/reject reviews.
- Received-request and accepted-connection lists.
- Account deletion with related connection activity cleanup.
- Password hashing, environment-based secrets, and safe user serialization.

## Tech stack

- Node.js 20.19+
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- bcrypt
- validator
- Node.js built-in test runner

## Getting started

1. Install Node.js 20.19+ and MongoDB (local or Atlas).
2. Clone and install:

   ```bash
   git clone https://github.com/sujeetv-125/devTinderv.git
   cd devTinderv
   npm install
   ```

3. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

4. Set a real MongoDB URI and a random JWT secret in .env. Never commit .env.
5. Start the API:

   ```bash
   npm run dev
   ```

The default port is 7777. Visit GET /health to check whether the process is running.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| MONGODB_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Random secret with at least 32 characters |
| PORT | No | Defaults to 7777 |
| NODE_ENV | No | Set to production when deployed |

Generate a JWT secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## API reference

All endpoints are available under /api/v1. Root-level paths are temporarily retained for compatibility with the original project.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/signup | Create an account |
| POST | /api/v1/login | Log in and set an HTTP-only cookie |
| POST | /api/v1/logout | Clear the session cookie |

Signup request body:

```json
{
  "firstName": "Aarav",
  "lastName": "Sharma",
  "emailId": "aarav@example.com",
  "password": "Use-A-Strong-Password-123!"
}
```

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/profile/view | View your profile |
| PATCH | /api/v1/profile/edit | Update allowed profile fields |
| PATCH | /api/v1/profile/password | Change your password |

Supported profile fields: firstName, lastName, photoUrl, about, skills, skillsWanted, lookingFor, availability, and preferredProjects.

Example profile update:

```json
{
  "skills": ["Java", "Node.js", "MongoDB"],
  "skillsWanted": ["React", "UI/UX"],
  "lookingFor": ["hackathon-team", "open-source"],
  "availability": "weekends",
  "preferredProjects": ["developer-tools", "AI"]
}
```

Supported collaboration goals: hackathon-team, project-collaborator, open-source, learning-partner, mentor, and mentee.

Supported availability values: weekdays, weekends, evenings, and flexible.

### Developer discovery

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/feed | Discover compatible developers |

Query parameters: page, limit (maximum 30), skill, lookingFor, and availability.

Each result includes compatibilityScore (0–100) and matchReasons. This is a deterministic matching heuristic, not a machine-learning prediction.

### Connections

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/request/send/:status/:toUserId | Send interest or skip a developer |
| PATCH | /api/v1/request/review/:status/:requestId | Accept or reject a received request |
| GET | /api/v1/user/requests/received | List pending incoming requests |
| GET | /api/v1/user/connections | List accepted connections |

Send status must be interested or ignored. Review status must be accepted or rejected. Only the recipient can review a pending request.

### Account

| Method | Endpoint | Description |
|---|---|---|
| DELETE | /api/v1/users | Delete your account and connection activity |

## Matching approach

The explainable compatibility score uses the following weights:

```text
score = 0.40 × skill compatibility
      + 0.35 × collaboration-goal overlap
      + 0.15 × availability match
      + 0.10 × project-interest overlap
```

Skill compatibility is the stronger of shared-skill overlap and complementary-skill coverage. Each component is normalized from 0 to 1; the final score is an integer from 0 to 100. Match reasons explain which dimensions contributed.

## Security

- Passwords are hashed with bcrypt.
- Password fields are excluded from normal model queries and JSON responses.
- Database credentials and JWT secrets are read from environment variables.
- Authentication cookies are HTTP-only and use Secure in production.
- Profile updates use an explicit field allowlist and schema validation.
- Connection actions prevent self-interactions and duplicate interactions in either direction.

For production, use HTTPS, configure origin restrictions at your reverse proxy or API gateway, apply a distributed rate limiter, monitor database backups, and verify cookie/CORS settings against your frontend's deployment origin.

**Important:** credentials that have ever been committed to a public repository must be rotated. Removing a credential from the newest commit does not remove it from Git history. Rotate the MongoDB database user's password and the JWT secret before using this code. Consider rewriting history to remove old secrets, then force-push only after reviewing the impact on existing clones.

## Tests

Run the unit tests:

```bash
npm test
```

The current tests cover the matching algorithm and request/profile input validation. A follow-up integration-test suite should run against an isolated test database.

## Project structure

```text
src/
├── app.js
├── auth.js
├── config/
│   └── database.js
├── models/
│   ├── connectionRequest.js
│   └── user.js
├── routes/
│   ├── auth.js
│   ├── profile.js
│   ├── requests.js
│   └── users.js
└── utils/
    ├── matchingService.js
    └── validations.js
tests/
├── matchingService.test.js
└── validations.test.js
```

## Roadmap

- Frontend dashboard for discovery and collaboration profiles.
- Integration tests against an isolated MongoDB test database.
- Shared rate limiting and structured request logging.
- OpenAPI documentation and deployment pipeline.
