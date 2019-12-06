import { GetterTree } from 'vuex'
import recommendations from '../types/recommendations'
import RootState from '@vue-storefront/core/types/RootState'

const getters: GetterTree<recommendations, RootState> = {
  user: (state, getters, rootState, rootGetters) => rootGetters['user/isLoggedIn'] ? state.user : 'Anonymous',
  banners: (state, getters, rootState, rootGetters) => {
    if (getters.user === 'MEl' || getters.user === 'MPun') {
      return {
        mainBanners: [
          {
            image: '/assets/banners/' + state.user + '1.jpg',
            title: '',
            subtitle: '',
            link: '/c/tops-12'
          }
        ],
        smallBanners: [
          {
            image: '/assets/banners/' + state.user + '2.jpg',
            title: '',
            subtitle: '',
            link: '/c/tops-12'
          },
          {
            image: '/assets/banners/' + state.user + '3.jpg',
            title: '',
            subtitle: '',
            link: '/c/tops-12'
          }
        ]
      }
    } else {
      return false
    }
  }
}

export default getters
