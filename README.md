# deploy-to-rouar

A minimal [Flue](https://flueframework.com) agent app for testing deployments to rouar.

It has one agent, `assistant`, that uses the hosted model `rouar/openai/gpt-6-luna` through rouar. No model API key is needed: rouar provides the model and the database.

## Layout

```text
src/agents/assistant.ts  The Assistant agent
src/app.ts               Mounts the agent at /agents/assistant
flue.config.ts           Flue configuration (Node target)
vite.config.ts           Vite build with the Flue plugin
```

`@rouar/sdk` and `src/db.ts` are not in this repository. rouar adds them during the build.

## Build locally

Requires Node.js 22.19 or later and pnpm.

```sh
pnpm install
pnpm run build
```

The build writes `dist/app.mjs`, which rouar's server entry loads.

## Call the agent after deploy

Each conversation has its own id in the URL. Send one `POST` per message:

```sh
curl -X POST https://<deployment>/agents/assistant/<id> \
  -H "Authorization: Bearer <access token>" \
  -H "Content-Type: application/json" \
  -d '{"kind":"user","body":"Say hello in five words or fewer."}'
```

The server answers `202` once the message is accepted, before the agent replies. The response contains `streamUrl`, `offset`, and `submissionId`.

Read the conversation, including the agent's reply, with `GET` on the same URL:

```sh
curl -H "Authorization: Bearer <access token>" https://<deployment>/agents/assistant/<id>
```

Create the access token in the rouar console. If deployment protection is off, the `Authorization` header is not needed.
