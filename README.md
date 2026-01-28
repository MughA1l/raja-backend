/aistudysync
├── /controllers ← Handle req/res
├── /services ← Business logic
/repositories <- Talk to db
├── /models ← Mongoose schemas
├── /routes ← Route definitions
├── /middleware ← Error handling, auth, etc.
├── /config ← DB config, constants
├── /utils ← Reusable helpers
├── server.js ← App entry
└── .env

# Architecture flow

[HTTPRequest]
↓
[ExpressRouter] (user.routes.js)
↓ Routes to
[Controller] (user.controller.js)
↓ Calls
[Service] (user.service.js)
↓ Uses
[Repository] (user.repository.js)
↓ Interacts with
[MongoDBDatabase]
