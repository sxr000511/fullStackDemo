// 挂载router
// 挂载axios实例 $http

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";

import "./style.css";

Vue.config.productionTip = false;

// 引用axios实例 $http
import http from "./http";
Vue.prototype.$http = http;

// 混入： 通用方法
// uploadurl是后台数据库接口
// getauthheader用于登录token验证
Vue.mixin({
  computed: {
    uploadUrl() {
      return this.$http.defaults.baseURL + "/upload";
    },
  },
  methods: {
    getAuthHeaders() {
      return {
        Authorization: `Bearer ${localStorage.token || ""}`,
      };
    },
  },
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
