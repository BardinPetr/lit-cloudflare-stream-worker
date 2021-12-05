import { Sunder } from 'sunder'
import { Env } from '../bindings'
import envMiddleware from './envMiddleware'
import catchMiddleware from './errorMiddleware'
import JWTAuthMiddleware from './JWTAuthMiddleware'

export function registerMiddlewares(app: Sunder<Env>): void {
  app.use(envMiddleware)
  app.use(JWTAuthMiddleware)
  app.use(catchMiddleware)
}
