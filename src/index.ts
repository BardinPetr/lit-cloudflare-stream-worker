import { CloudflareEventFunctions } from 'sunder/application'
import { createApp } from './app'
import { Env } from './bindings'

const app = createApp()

export default {
  fetch(
    request: Request,
    env: Env,
    ctx: FetchEvent | CloudflareEventFunctions,
  ): Promise<Response> {
    return app.fetch(request, env, ctx)
  },
}
