import { Router, Sunder } from 'sunder'
import JWTAuthMiddleware from './auth/middleware'
import { Env } from './bindings'
import { registerRoutes } from './routes'

export function createApp(): Sunder<Env> {
  const app = new Sunder<Env>()
  const router = new Router<Env>()

  registerRoutes(router)

  app.use(JWTAuthMiddleware)
  app.use(router.middleware)

  return app
}
