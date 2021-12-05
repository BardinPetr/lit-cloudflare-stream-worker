import { Router } from 'sunder'
import { Env } from '../bindings'
import getInfo from './actions/getInfo'
import getToken from './actions/getToken'
import setupVideo from './actions/setupVideo'

export function registerRoutes(router: Router<Env>): void {
  router.get('/video/:id', getToken)
  router.get('/info/:id', getInfo)
  router.post('/setup', setupVideo)

  router.get('/robots.txt', (ctx) => {
    ctx.response.body = `Agent: *\nDisallow: /`
  })
}
