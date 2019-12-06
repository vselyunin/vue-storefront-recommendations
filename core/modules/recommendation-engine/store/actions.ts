import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import { getRecommendations, ingest } from '../http/index';
import RootState from '@vue-storefront/core/types/RootState'
import recommendations from '../types/recommendations'
import { prepareQuery } from '@vue-storefront/core/modules/catalog/queries/common';
import { rejects } from 'assert';

const actions: ActionTree<recommendations, RootState> = {
  load ({dispatch, commit, state, getters, rootGetters}, obj) {
    return new Promise((resolve, reject) => {
      let body = {
        'user': getters.user,
        'session': state.session,
        'useCase': state.showdemo ? 'demo' : obj.useCase,
        'basket': obj.basket,
        'context': null,
        'count': obj.count
      }
      getRecommendations(body).then((res) => {
        const recIds = res.data.map(rec =>
          rec.itemId
        );
        let recProductsQuery = prepareQuery({ filters: [{
          'key': 'id',
          'value': {'eq': recIds}
        }],
        hideVSFQuerry: true })
        dispatch('product/list', {
          query: recProductsQuery,
          size: 4,
          sort: 'created_at:desc'
        }, {root: true}).then(res => {
          let r = res.items
          r.forEach(el => {
            el.rec = '1'
          })
          resolve(r)
          commit(types.RECOMMENDATIONS_LOAD, {recommendations: r, useCase: obj.useCase});
        });
      })
    })
  },
  ingest ({dispatch, commit, state, getters, rootGetters}, obj) {
    let body = {
      'item': obj.item,
      'scope': '1',
      'time': Date.now(),
      'type': 'view',
      'user': getters.user,
      'value': 1
    }
    ingest(body)
  }
}

export default actions
