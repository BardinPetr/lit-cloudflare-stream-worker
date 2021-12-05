import { Router } from 'sunder'
import { Env } from '../bindings'
import getInfo from './actions/getInfo'
import getThumbnail from './actions/getThumbnail'
import getToken from './actions/getToken'
import listVideos from './actions/listVideos'
import setupVideo from './actions/setupVideo'

export function registerRoutes(router: Router<Env>): void {
  router.get('/videos', listVideos)
  router.get('/thumb/:id', getThumbnail)
  router.get('/video/:id', getToken)
  router.get('/info/:id', getInfo)
  router.post('/setup', setupVideo)

  router.get('/robots.txt', (ctx) => {
    ctx.response.body = `Agent: *\nDisallow: /`
  })
}
