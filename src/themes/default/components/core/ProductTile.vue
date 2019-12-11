<template>
  <div
    class="product align-center w-100 pb20"
    @click="sendDataToRecomendations()"
    v-observe-visibility="visibilityChanged"
  >
    <router-link

      class="block no-underline product-link"
      :to="productLink"
      data-testid="productLink"
    >
      <div
        class="product-image relative bg-cl-secondary"
        :class="[{ rec: labelsActive && isRec }, { sale: labelsActive && isOnSale }, { new: labelsActive && isNew }]"
      >
        <img style="width: 60px; margin-top: 3%; margin-left: 26%; position: absolute;" src="../../assets/604px-Adidas_Logo.svg.png" alt="">

        <!-- <product-image
          class="product-image__content"
          :image="thumbnailObj"
          :alt="product.name | htmlDecode"
          data-testid="productImage"
        /> -->
        <product-image
          class="product-image__content"
          :image="fg(product, thumbnailObj)"
          :alt="product.name | htmlDecode"
          data-testid="productImage"
        />
      </div>

      <p class="mb0 cl-accent mt10" v-if="!onlyImage">
        {{ product.id }}{{ product.name | htmlDecode }}
      </p>

      <span
        class="price-original mr5 lh30 cl-secondary"
        v-if="product.special_price && parseFloat(product.originalPriceInclTax) > 0 && !onlyImage"
      >
        {{ product.originalPriceInclTax | price }}
      </span>

      <span
        class="price-special lh30 cl-accent weight-700"
        v-if="product.special_price && parseFloat(product.special_price) > 0 && !onlyImage"
      >
        {{ product.priceInclTax | price }}
      </span>

      <span
        class="lh30 cl-secondary"
        v-if="!product.special_price && parseFloat(product.priceInclTax) > 0 && !onlyImage"
      >
        {{ product.priceInclTax | price }}
      </span>
    </router-link>
  </div>
</template>

<script>
import rootStore from '@vue-storefront/core/store'
import { ProductTile } from '@vue-storefront/core/modules/catalog/components/ProductTile.ts'
import config from 'config'
import ProductImage from './ProductImage'
import { mapGetters } from 'vuex';

export default {
  mixins: [ProductTile],
  components: {
    ProductImage
  },
  props: {
    labelsActive: {
      type: Boolean,
      default: true
    },
    onlyImage: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    thumbnailObj () {
      return {
        src: this.thumbnail,
        loading: this.thumbnail
      }
    }
  },
  methods: {
    fg (product, thumbnailObj) {
      var globalRegex = RegExp('https', 'g');
      if (globalRegex.test(product.image)) {
        return { src: product.image, loading: product.image }
      } else {
        return thumbnailObj
      }
    },
    sendDataToRecomendations () {
      this.$store.dispatch('recommendation-engine/load',
        { 'useCase': 'also',
          'basket': [this.product.id],
          'context': null,
          'count': 4
        });
      this.$store.dispatch('recommendation-engine/load',
        { 'useCase': 'sim',
          'basket': [this.product.id],
          'context': null,
          'count': 4
        });
      this.$store.dispatch('recommendation-engine/ingest',
        { item: this.product.id });
    },
    onProductPriceUpdate (product) {
      if (product.sku === this.product.sku) {
        Object.assign(this.product, product)
      }
    },
    visibilityChanged (isVisible, entry) {
      if (isVisible) {
        if (config.products.configurableChildrenStockPrefetchDynamic && rootStore.products.filterUnavailableVariants) {
          const skus = [this.product.sku]
          if (this.product.type_id === 'configurable' && this.product.configurable_children && this.product.configurable_children.length > 0) {
            for (const confChild of this.product.configurable_children) {
              const cachedItem = rootStore.state.stock.cache[confChild.id]
              if (typeof cachedItem === 'undefined' || cachedItem === null) {
                skus.push(confChild.sku)
              }
            }
            if (skus.length > 0) {
              rootStore.dispatch('stock/list', { skus: skus }) // store it in the cache
            }
          }
        }
      }
    }
  },
  beforeMount () {
    this.$bus.$on('product-after-priceupdate', this.onProductPriceUpdate)
  },
  beforeDestroy () {
    this.$bus.$off('product-after-priceupdate', this.onProductPriceUpdate)
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/animations/transitions';
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';

$bg-secondary: color(secondary, $colors-background);
$border-secondary: color(secondary, $colors-border);
$color-white: color(white);

.product {
  @media (max-width: 767px) {
    padding-bottom: 10px;
  }
}

.price-original {
  text-decoration: line-through;
}

%label {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  padding-right: 10px;
  padding-left: 10px;
  height: 40px;
  background-color: $border-secondary;
  text-transform: uppercase;
  color: $color-white;
  font-size: 12px;
}

.product-image{
  overflow: hidden;
  width:100%;
  height: 100%;
  max-height: 300px;

  &:hover{
    .product-image__content{
      opacity: 1;
      transform: scale(1.1);
    }
    &.sale::after
    &.rec::after
    &.new::after{
      opacity: .8;
    }
  }
  &__content{

    padding-bottom: calc(300% / (257 / 100));
    mix-blend-mode: darken;
    opacity: .8;
    transform: scale(1);
    will-change: transform;
    transition: .3s opacity $motion-main, .3s transform $motion-main;
    @media (min-width: 768px) {
      padding-bottom: calc(208% / (168 / 100));
    }
    @media (min-width: 1200px) {
      padding-bottom: calc(300% / (276 / 100));
    }
  }

  &.sale{
    &::after {
      @extend %label;
      content: 'Sale';
    }
  }
  &.new{
    &::after {
      @extend %label;
      content: 'New';
    }
  }
  &.rec{
    &::after {
      @extend %label;
      content: 'Recommend';
    }
  }
}
</style>
