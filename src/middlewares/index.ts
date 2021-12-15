import { Sunder } from 'sunder'
import { Env } from '../bindings'
import corsMiddleware from './corsMiddleware'
import envMiddleware from './envMiddleware'
import catchMiddleware from './errorMiddleware'
import JWTAuthMiddleware from './JWTAuthMiddleware'

export function registerMiddlewares(app: Sunder<Env>): void {
  app.use(catchMiddleware)
  app.use(corsMiddleware)
  app.use(envMiddleware)
  app.use(JWTAuthMiddleware)
}
