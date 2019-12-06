import { createModule } from '@vue-storefront/core/lib/module'
import { module } from './store'

export const KEY = 'recommendation-engine'
export const RecommendationEngine = createModule({
  key: KEY,
  store: {modules: [{key: KEY, module}]}
})
