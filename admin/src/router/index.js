import Vue from "vue";
import VueRouter from "vue-router";
import Main from "../views/Main.vue";
import CategoryEdit from "../views/CategoryEdit.vue";
import CategoryList from "../views/CategoryList.vue";
import ItemEdit from "../views/ItemEdit.vue";
import ItemList from "../views/ItemList.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Main",
    component: Main,
    children: [
      // 分类 categories
      {
        path: "/categories/create",
        component: CategoryEdit,
      },
      {
        path: "/categories/edit/:id",
        component: CategoryEdit,
        // url参数注入到子组件
        props: true,
      },
      {
        path: "/categories/list",
        component: CategoryList,
      },
      // 装备
      {
        path: "/items/create",
        component: ItemEdit,
      },
      {
        path: "/items/edit/:id",
        component: ItemEdit,
        // url参数注入到子组件
        props: true,
      },
      {
        path: "/items/list",
        component: ItemList,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

export default router;
