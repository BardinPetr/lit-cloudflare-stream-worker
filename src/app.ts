import { Router, Sunder } from 'sunder'
import { Env } from './bindings'
import { registerRoutes } from './routes/routes'
import { registerMiddlewares } from './middlewares'

export function createApp(): Sunder<Env> {
  const app = new Sunder<Env>()
  const router = new Router<Env>()

  registerRoutes(router)

  registerMiddlewares(app)
  app.use(router.middleware)

  return app
}
