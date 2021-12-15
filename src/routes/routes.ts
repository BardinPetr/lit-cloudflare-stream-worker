import { Router } from 'sunder'
import { Env } from '../bindings'
import getAccessControlConditions from './actions/getACC'
import getInfo from './actions/getInfo'
import getThumbnail from './actions/getThumbnail'
import getToken from './actions/getToken'
import listVideos from './actions/listVideos'
import registerAccount from './actions/registerAccount'
import setupVideo from './actions/setupVideo'
import uploadVideo from './actions/uploadVideo'

export const unauthedRoutes = ['/register']

export const isUnauthedRoute = (url: URL): boolean =>
  unauthedRoutes.some((r) => url.pathname.startsWith(r))

export function registerRoutes(router: Router<Env>): void {
  router.get('/upload', uploadVideo)
  router.get('/videos', listVideos)
  router.get('/thumb/:id', getThumbnail)
  router.get('/video/:id', getToken)
  router.get('/info/:id', getInfo)
  router.post('/setup', setupVideo)
  router.post('/register', registerAccount)
  router.get('/accs', getAccessControlConditions)

  router.get('/robots.txt', (ctx) => {
    ctx.response.body = `Agent: *\nDisallow: /`
  })
}
