import { Module } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import RootState from '@vue-storefront/core/types/RootState'
import recommendations from '../types/recommendations'

export const module: Module<recommendations, RootState> = {
  namespaced: true,
  state: {
    user: 'Anonymous',
    session: 'a',
    showdemo: false,
    unk: [],
    all: [],
    realtime: [],
    also: [],
    sim: [],
    demo: [],
    banner: []
  },
  actions,
  mutations,
  getters
}
