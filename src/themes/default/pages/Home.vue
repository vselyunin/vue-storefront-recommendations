<template>
  <div id="home">
    <!-- <head-image /> -->

    <promoted-offers />

    <section class="new-collection container px15"
             v-if="everythingNewCollection && everythingNewCollection.length"
    >
      <div>
        <header class="col-md-12">
          <h2 class="align-center cl-accent">
            {{ $t('Recommended for you') }}
          </h2>
        </header>
      </div>
      <div class="row center-xs">
        <product-listing columns="4"
                         :products="demo.length > 0 ? demo : everythingNewCollection"
        />
      </div>

      <div v-if="realtime.length > 0">
        <header class="col-md-12">
          <h2 class="align-center cl-accent">
            {{ $t('Based on recent activity') }}
          </h2>
        </header>
      </div>
      <div v-if="realtime.length > 0" class="row center-xs">
        <product-listing columns="4"
                         :products="realtime"
        />
      </div>
    </section>

    <section v-if="isOnline"
             class="container pb60 px15"
    >
      <div class="row center-xs">
        <header class="col-md-12"
                :class="{ pt40: everythingNewCollection && everythingNewCollection.length }"
        >
          <h2 class="align-center cl-accent">
            {{ $t('Get inspired') }}
          </h2>
        </header>
      </div>
      <tile-links />
    </section>
    <Onboard />
  </div>
</template>

<script>
// query constructor
import { prepareQuery } from '@vue-storefront/core/modules/catalog/queries/common';
import { isServer, onlineHelper } from '@vue-storefront/core/helpers';

// Core pages
import Home from '@vue-storefront/core/pages/Home';

// Theme core components
import ProductListing from 'theme/components/core/ProductListing';
import HeadImage from 'theme/components/core/blocks/MainSlider/HeadImage';

// Theme local components
import Onboard from 'theme/components/theme/blocks/Home/Onboard';
import PromotedOffers from 'theme/components/theme/blocks/PromotedOffers/PromotedOffers';
import TileLinks from 'theme/components/theme/blocks/TileLinks/TileLinks';
import { Logger } from '@vue-storefront/core/lib/logger';
import { mapGetters } from 'vuex';
import config from 'config';

import {filterByRecommendations} from '@vue-storefront/core/modules/recommendation-engine/mixins';

export default {
  mixins: [Home],
  components: {
    HeadImage,
    Onboard,
    ProductListing,
    PromotedOffers,
    TileLinks
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    categories () {
      return this.getCategories;
    },
    user () {
      return this.$store.state.user.current;
    },
    everythingNewCollection () {
      return this.$store.state.homepage.new_collection;
    },
    realtime () {
      return this.$store.state['recommendation-engine'].realtime
    },
    demo () {
      return this.$store.state['recommendation-engine'].demo
    },
    // allRecomendations () {
    //   return this.filterByRecommendations(this.everythingNewCollection, this.all)
    // },
    coolBagsCollection () {
      return this.$store.state.homepage.coolbags_collection;
    },
    isOnline () {
      return onlineHelper.isOnline;
    }
  },
  created () {
    // Load personal and shipping details for Checkout page from IndexedDB
    this.$store.dispatch('checkout/load');
  },
  async beforeMount () {
    if (this.$store.state.__DEMO_MODE__) {
      const onboardingClaim = await this.$store.dispatch('claims/check', {
        claimCode: 'onboardingAccepted'
      });
      if (!onboardingClaim) {
        // show onboarding info
        this.$bus.$emit('modal-toggle', 'modal-onboard');
        this.$store.dispatch('claims/set', {
          claimCode: 'onboardingAccepted',
          value: true
        });
      }
    }
  },
  mounted () {
    if (!this.isLoggedIn && localStorage.getItem('redirect')) {
      this.$bus.$emit('modal-show', 'modal-signup');
    }
    this.$store.dispatch('recommendation-engine/load',
      { 'useCase': 'realtime',
        'basket': null,
        'context': null,
        'count': 4
      });
    this.$store.dispatch('recommendation-engine/load',
      { 'useCase': 'demo',
        'basket': null,
        'context': null,
        'count': 4
      });
  },
  watch: {
    isLoggedIn () {
      const redirectObj = localStorage.getItem('redirect');
      if (redirectObj) this.$router.push(redirectObj);
      localStorage.removeItem('redirect');

      this.$store.dispatch('recommendation-engine/load',
        { 'useCase': 'realtime',
          'basket': null,
          'context': null,
          'count': 4
        });
      this.$store.dispatch('recommendation-engine/load',
        { 'useCase': 'demo',
          'basket': null,
          'context': null,
          'count': 4
        });
    }
  },
  async asyncData ({ store, route }) {
    // this is for SSR purposes to prefetch data
    Logger.info('Calling asyncData in Home (theme)')();

    let newProductsQuery = prepareQuery({ queryConfig: 'newProducts' });
    let coolBagsQuery = prepareQuery({ queryConfig: 'coolBags' });

    const newProductsResult = await store.dispatch('product/list', {
      query: newProductsQuery,
      size: 4,
      sort: 'created_at:desc'
    });
    if (newProductsResult) {
      store.state.homepage.new_collection = newProductsResult.items;
    }

    const coolBagsResult = await store.dispatch('product/list', {
      query: coolBagsQuery,
      size: 4,
      sort: 'created_at:desc',
      includeFields: config.entities.optimize
        ? config.products.setFirstVarianAsDefaultInURL
          ? config.entities.productListWithChildren.includeFields
          : config.entities.productList.includeFields
        : []
    });

    if (coolBagsResult) {
      store.state.homepage.coolbags_collection = coolBagsResult.items;
    }

    await store.dispatch('promoted/updateHeadImage');
    await store.dispatch('promoted/updatePromotedOffers');
  },
  beforeRouteEnter (to, from, next) {
    if (!isServer && !from.name) {
      // Loading products to cache on SSR render
      next(vm => {
        let newProductsQuery = prepareQuery({ queryConfig: 'newProducts' });
        vm.$store.dispatch('product/list', {
          query: newProductsQuery,
          size: 4,
          sort: 'created_at:desc'
        });
      });
    } else {
      next();
    }
  },
  methods: {
    filterByRecommendations
  }
};
</script>

<style lang="scss" scoped>
.new-collection {
  @media (max-width: 767px) {
    padding-top: 0;
  }
}
</style>
