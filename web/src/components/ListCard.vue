<template>
  <m-card :icon="icon" :title="title">
    <div class="card-body">
      <div class="nav jc-between">
        <div
          class="nav-item"
          :class="{ active: active === index }"
          v-for="(item, index) in categories"
          :key="index"
          @click="$refs.list.$swiper.slideTo(index)"
        >
          <div class="nav-link">{{ item.name }}</div>
        </div>
      </div>

      <!-- 重点：怎么展示数据？ item传出去，外面接收到item找到对应的data通过slot传回来 -->
      <div class="mt-2">
        <swiper
          ref="list"
          @slide-change="() => (active = $refs.list.$swiper.realIndex)"
          :options="{ autoHeight: true }"
        >
          <swiper-slide v-for="(item, index) in categories" :key="index">
            <!-- category 给外面， item是内部v-for -->
            <slot name="item" :category="item"></slot>
          </swiper-slide>
        </swiper>
      </div>
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
      active: 0,
    };
  },
};
</script>

<style>
</style>