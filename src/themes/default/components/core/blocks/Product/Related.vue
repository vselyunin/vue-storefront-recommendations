<template>
  <section class="py20 new-collection container px15"
           v-if="product.related[type] && product.related[type].length > 0 && show"
  >
    <div>
      <header class="col-md-12">
        <h2 class="align-center cl-accent">
          {{ heading }}
        </h2>
      </header>
    </div>
    <div class="row center-xs">
      <product-listing columns="4"
                       :products="recomendedProducts(product.related[type])"
      />
    </div>
  </section>
</template>

<script>
import {filterByRecommendations} from '@vue-storefront/core/modules/recommendation-engine/mixins';
import ProductListing from 'theme/components/core/ProductListing';
import { mapGetters } from 'vuex';
import { prepareRelatedQuery } from '@vue-storefront/core/modules/catalog/queries/related';
import i18n from '@vue-storefront/i18n';
import config from 'config';

export default {
  name: 'Related',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    recommendations: {
      type: Array,
      required: true
    },
    heading: {
      type: String,
      required: false,
      default: i18n.t('Similar products')
    },
    useCase: {
      type: String,
      required: true
    }
  },
  components: {
    ProductListing
  },
  beforeMount () {
    this.$bus.$on('product-after-load', this.refreshList);

    if (config.usePriceTiers) {
      this.$bus.$on('user-after-loggedin', this.refreshList);
      this.$bus.$on('user-after-logout', this.refreshList);
    }

    this.refreshList();
  },
  beforeDestroy () {
    if (config.usePriceTiers) {
      this.$bus.$off('user-after-loggedin', this.refreshList);
      this.$bus.$off('user-after-logout', this.refreshList);
    }
  },
  destroyed () {
    this.$bus.$off('product-after-load', this.refreshList);
  },
  methods: {
    filterByRecommendations,
    recomendedProducts (products) {
      // return this.useCase === 'also' ? this.recommendations : products
      return this.recommendations.length > 0 ? this.recommendations : products
      // return filterByRecommendations(products, this.recommendations)
    },
    getRecommendations (user) {
      this.$store.dispatch('recommendation-engine/load',
        { 'useCase': this.useCase,
          'basket': [this.product.original.id],
          'context': null,
          'count': 4
        });
    },
    refreshList () {
      let sku = this.productLinks
        ? this.productLinks
          .filter(pl => pl.link_type === this.type)
          .map(pl => pl.linked_product_sku)
        : null;

      let key = 'sku';
      if (sku === null || sku.length === 0) {
        sku = this.product.current.category.map(cat => cat.category_id);
        key = 'category_ids';
      }
      let relatedProductsQuery = prepareRelatedQuery(key, sku);

      this.$store
        .dispatch('product/list', {
          query: relatedProductsQuery,
          size: 4,
          prefetchGroupProducts: false,
          updateState: false
        })
        .then(response => {
          if (response) {
            this.$store.dispatch('product/related', {
              key: this.type,
              items: response.items
            });
            this.$forceUpdate();
          }
        });
    }
  },
  watch: {
    isLoggedIn () {
      this.getRecommendations();
    }
  },
  mounted () {
    this.getRecommendations();
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    user () {
      return this.$store.state.user.current;
    },
    product () {
      return this.$store.state.product;
    },
    productLinks () {
      return this.product.current.product_links;
    }
  }
};
</script>
