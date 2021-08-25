// axios数据请求接口请求

import Vue from "vue";
import axios from "axios";
// 引用router
import router from "./router";

// const http = axios.create({
//   baseURL: "http://localhost:3000/admin/api",
// });

const http = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "/admin/api",
  // baseURL: 'http://localhost:3000/admin/api'
});

// request拦截
http.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    // console.log(localStorage.token);
    // 如果有token才获取
    if (localStorage.token) {
      config.headers.Authorization = "Bearer " + localStorage.token;
    }
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// response拦截
http.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    if (err.response.data.message) {
      Vue.prototype.$message({
        type: "error",
        message: err.response.data.message,
      });

      if (err.response.status === 401) {
        router.push("/login");
      }
    }
    return Promise.reject(err);
  }
);
export default http;
