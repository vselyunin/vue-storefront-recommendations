import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import recommendations from '../types/recommendations'
const mutations: MutationTree<recommendations> = {
  [types.RECOMMENDATIONS_LOAD] (state, obj) {
    state[obj.useCase] = obj.recommendations || []
  }

}

export default mutations
