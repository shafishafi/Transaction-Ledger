import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { accountsRoute } from './routes/accounts/index'
import { accountDetailRoute } from './routes/accounts/$id'

export const routeTree = rootRoute.addChildren([
  indexRoute,
  accountsRoute,
  accountDetailRoute,
])

