import makeServiceWorkerEnv from 'service-worker-mock'

declare let global: any

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })
})
