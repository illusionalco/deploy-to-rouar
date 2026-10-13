# deploy-to-rouar

A small pnpm monorepo for testing deployments to rouar: a [Flue](https://flueframework.com) agent and a Nuxt app that talks to it from the browser. rouar builds both into one server and serves them from the same URL.

The agent, `assistant`, uses the hosted model `rouar/openai/gpt-6-luna` through rouar. No model API key is needed: rouar provides the model and the database.

## Layout

```text
rouar.json                          Where the agent and the frontend are
pnpm-workspace.yaml                 Workspace with apps/*
apps/flue/                          The Flue agent
  src/agents/assistant.ts           The Assistant agent
  src/app.ts                        Mounts the agent at /agents/assistant
  flue.config.ts                    Flue configuration (Node target)
  vite.config.ts                    Vite build with the Flue plugin
apps/nuxt/                          The Nuxt app
  nuxt.config.ts                    Adds the @rouar/sdk/nuxt module
  app/app.vue                       One chat page that uses useAgent('assistant')
  server/rouar-authorize.ts         Lets browsers call the agent (test only, see below)
  server/middleware/visitor.ts      Sets the anonymous visitor cookie on page loads
  server/utils/visitor.ts           Reads or creates the visitor id
```

`rouar.json` sets `agent.root` to `apps/flue` and `frontend.root` to `apps/nuxt`. Requests under `/agents` go to the agent and every other path goes to the Nuxt app.

`@rouar/sdk` is not on npm yet. Both apps install a provisional build from the public repository [illusionalco/rouar-sdk](https://github.com/illusionalco/rouar-sdk), pinned to a tag. When rouar builds a deployment, it installs its own current SDK into both packages. `apps/flue/src/db.ts` is not in this repository; rouar adds it during the build.

## Browser access is open to anyone (testing only)

Agent routes need an access token by default. This app registers an authorize function so the browser can call the agent without one:

- On the first page load, the server sets an httpOnly cookie, `rouar_visitor`, with a random id.
- `server/rouar-authorize.ts` returns `visitor:<id>` as the principal. If the cookie is missing, it creates one.
- rouar keeps conversations separate per principal, so each browser sees only its own conversations.

There is no sign-in, so anyone who opens the site can use the agent, and the model usage is billed to the account. rouar's per-principal and per-environment send limits are the only protection. Use this for testing only; a real app should return a principal from its own sign-in session instead.

## Build locally

Requires Node.js 22.19 or later and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm --filter ./apps/flue run build                          # writes apps/flue/dist/app.mjs
cd apps/nuxt && NITRO_PRESET=node-listener pnpm exec nuxt build  # writes apps/nuxt/.output
```

rouar chooses the Nitro preset itself during a deployment, so `nuxt.config.ts` leaves `nitro.preset` unset. `NITRO_PRESET=node-listener` above only reproduces what rouar builds.

## Develop locally

Pull the development environment variables into the agent's `.env`, then run the agent and the Nuxt app side by side:

```sh
npx -p @rouar/sdk rouar env pull --file apps/flue/.env

# Terminal 1: the agent, on http://localhost:5173
cd apps/flue && pnpm exec flue dev

# Terminal 2: the Nuxt app, on http://localhost:3000
cd apps/nuxt && pnpm exec nuxt dev
```

Open http://localhost:3000. In `nuxt dev`, the module forwards `/agents/...` to the agent on port 5173 and runs the authorize function first. Conversations are not separated per principal locally.

## Try it after deploy

Open the deployment URL in a browser and send a message. The page shows the conversation and the agent's status.

You can also call the agent with an access token created in the rouar console. Each conversation has its own id in the URL. Send one `POST` per message:

```sh
curl -X POST https://<deployment>/agents/assistant/<id> \
  -H "Authorization: Bearer <access token>" \
  -H "Content-Type: application/json" \
  -d '{"kind":"user","body":"Say hello in five words or fewer."}'
```

The server answers `202` once the message is accepted, before the agent replies. Read the conversation, including the agent's reply, with `GET` on the same URL:

```sh
curl -H "Authorization: Bearer <access token>" https://<deployment>/agents/assistant/<id>
```

If deployment protection is off, the `Authorization` header is not needed.

## Update the SDK

Change the tag of `github:illusionalco/rouar-sdk#<tag>` in both `package.json` files, run `pnpm install`, and commit both `package.json` files and `pnpm-lock.yaml`.
