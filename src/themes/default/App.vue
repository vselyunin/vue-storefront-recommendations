<template>
  <div id="app" :class="{ newBackground: userRec === 'MPun' }">
    <img v-if="showSmile" src="./assets/sad-emoji.png" style="position: fixed; z-index: 1000; margin-left: 27%; margin-top:5%" alt="sad face" class="">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
const DefaultLayout = () => import(/* webpackChunkName: "vsf-layout-default" */ './layouts/Default')
const EmptyLayout = () => import(/* webpackChunkName: "vsf-layout-empty" */ './layouts/Empty')
const MinimalLayout = () => import(/* webpackChunkName: "vsf-layout-minimal" */ './layouts/Minimal')

export default {
  data () {
    return {
      ordersData: [],
      showSmile: false
    }
  },
  methods: {
    start () {
      setTimeout(() => {
        this.sadCall()
        this.start();
      }, 5000);
    },
    sadCall () {
      this.axios.post('http://172.21.131.97:8080/getsad')
        .then((res) => {
          if (JSON.parse(res.data === true)) {
            this.$store.dispatch('recommendation-engine/load',
              { 'useCase': this.$route.query.brand === 'adidas' ? 'unk' : 'demo',
                'basket': null,
                'context': null,
                'count': 4
              });
          }
          this.showSmile = JSON.parse(res.data)
        })
    }
  },
  computed: {
    ...mapState({
      overlayActive: state => state.ui.overlay
    }),
    userRec () {
      return this.$store.state['recommendation-engine'].user
    },
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    }
  },
  mounted () {
    this.$store.state['recommendation-engine'].user = this.$route.query.user || localStorage.getItem('/recommendation-engine/user') || 'Anonymous'
    if (this.$route.query.user) localStorage.setItem('/recommendation-engine/user', this.$route.query.user)
    this.start()
  },
  components: {
    DefaultLayout,
    EmptyLayout,
    MinimalLayout
  }
}
</script>
<style lang="scss" scoped>
.newBackground {
  background-image: url("./assets/punchy-background.jpg");
}
</style>
