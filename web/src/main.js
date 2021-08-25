import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

import VueAwesomeSwiper from "vue-awesome-swiper";

// import style
// import "swiper/css/swiper.css";
import "swiper/swiper-bundle.css";
Vue.use(VueAwesomeSwiper /* { default options with global component } */);
import "./assets/scss/style.scss";

import "./assets/iconfont/iconfont.css";

// listcard 和 card组件
import Card from "./components/Card.vue";
Vue.component("m-card", Card);

import ListCard from "./components/ListCard.vue";
Vue.component("m-list-card", ListCard);

import axios from "axios";
Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "/web/api",
  // baseURL: "http://localhost:3000/web/api",
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
