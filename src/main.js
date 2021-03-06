// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueClipboard from 'vue-clipboard2'
import './plugins/firebase'
import globalMethods from './utils/global'

Vue.config.productionTip = false
Vue.use(VueAxios,axios)
Vue.use(VueClipboard)
// グローバルメソッドのグローバルミックスイン
Vue.mixin(globalMethods)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
