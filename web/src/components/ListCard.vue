<template>
  <!-- listcard由card而来 -->
  <m-card :icon="icon" :title="title">
    <div class="nav jc-between">
      <!-- v-for循环tab，显示传入的categories -->
      <!-- 点击-》滚动-》滚动高亮 -->
      <div
        class="nav-item"
        :class="{ active: active === i }"
        v-for="(category, i) in categories"
        :key="i"
        @click="$refs.list.$swiper.slideTo(i)"
      >
        <div class="nav-link">{{ category.name }}</div>
      </div>
    </div>
    <!-- 文字slide -->
    <div class="pt-3">
      <swiper
        ref="list"
        :options="{ autoHeight: true }"
        @slide-change="() => (active = $refs.list.$swiper.realIndex)"
      >
        <swiper-slide v-for="(category, i) in categories" :key="i">
          <!-- 插槽 -->
          <!-- 作用域插槽 -->
          <!-- 绑定category(传入的单个元素) 给slot ，外部父组件用# 可以获得category -->
          <slot name="items" :category="category"></slot>
          <!--  -->
        </swiper-slide>
      </swiper>
    </div>
  </m-card>
</template>

<script>
export default {
  props: {
    // 外部传参进入
    icon: { type: String, required: true },
    title: { type: String, required: true },
    categories: { type: Array, required: true },
  },
  data() {
    return {
      // 默认0高亮
      active: 0,
    };
  },
};
</script>

<style>
</style>