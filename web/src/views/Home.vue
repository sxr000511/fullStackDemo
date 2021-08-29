<template>
  <div>
    <swiper :options="swiperOption">
      <swiper-slide
        ><img
          class="w-100"
          src=" https://ossweb-img.qq.com/upload/adw/image/20210825/0917d2f330db8541107193b3a8fa3f33.jpeg"
          alt=""
      /></swiper-slide>
      <swiper-slide
        ><img
          class="w-100"
          src="https://ossweb-img.qq.com/upload/adw/image/20210828/432a0c3e81e978fb5361ee28ac033909.jpeg"
          alt=""
      /></swiper-slide>
      <swiper-slide
        ><img
          class="w-100"
          src=" https://ossweb-img.qq.com/upload/adw/image/20210827/a13a71416cd0bcb6d16070120a4b19af.jpeg"
          alt=""
      /></swiper-slide>
      <div
        class="swiper-pagination pagination-home text-right px-3 pb-1"
        slot="pagination"
      ></div>
    </swiper>

    <!-- 精灵图导航 -->
    <div
      class="nav-icons bg-white text-center mt-3"
      :class="{ open: open === true }"
    >
      <div class="small-nav pt-3">
        <div class="boxclass">
          <div class="nav-item mb-3">
            <div class="sprite sprite-blz"></div>
            <div>爆料站</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-gsz"></div>
            <div>故事站</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-zbsc"></div>
            <div>周边商城</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-tyf"></div>
            <div>体验服</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-xrzq"></div>
            <div>新人专区</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-rycc"></div>
            <div>荣耀传承</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-wzyd"></div>
            <div>王者营地</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-gzh"></div>
            <div>公众号</div>
          </div>
        </div>
      </div>
      <div class="big-nav">
        <div class="d-flex flex-wrap pt-3">
          <div class="nav-item mb-3">
            <div class="sprite sprite-blz"></div>
            <div>爆料站</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-gsz"></div>
            <div>故事站</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-zbsc"></div>
            <div>周边商城</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-tyf"></div>
            <div>体验服</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-xrzq"></div>
            <div>新人专区</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-rycc"></div>
            <div>荣耀传承</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-wzyd"></div>
            <div>王者营地</div>
          </div>
          <div class="nav-item mb-3">
            <div class="sprite sprite-gzh"></div>
            <div>公众号</div>
          </div>
        </div>
      </div>

      <!-- 【收起】边框 -->
      <div
        class="bg-light py-2 fs-sm"
        @click="
          () => {
            open = !open;
          }
        "
      >
        <div class="sprite sprite-arrow mr-1"></div>
        <span>{{ open ? "收起" : "展开" }}</span>
      </div>
    </div>

    <!-- 作用域插槽-》其他实例 -->
    <m-list-card icon="news" title="新闻列表" :categories="newsCats">
      <!-- 父组件监听子组件绑定的category 找到数据通过slot具名插槽传回去 -->
      <template v-slot:item="{ category }">
        <!-- 循环对照数据结构 -->
        <!-- 复用组件只需要修改这个部分 -->
        <router-link
          tag="div"
          :to="`/articles/${news._id}`"
          class="py-2 d-flex"
          v-for="(news, index) in category.newsList"
          :key="index"
        >
          <!-- 这个[]是个样式 -->
          <span class="text-info">[{{ news.categoryName }}]</span>
          <span class="px-2">|</span>
          <span class="flex-1 text-dark-1 text-ellipsis pr-2">{{
            news.title
          }}</span>
          <span class="text-grey-1 fs-sm">{{ news.createdAt | date }}</span>
        </router-link>
      </template>
    </m-list-card>

    <m-list-card icon="hero" title="英雄列表" :categories="herosCats">
      <template v-slot:item="{ category }">
        <!-- 循环对照数据结构 -->
        <!-- 复用组件只需要修改这个部分 -->
        <div class="d-flex flex-wrap" style="margin: 0 -0.5rem">
          <router-link
            :to="`/heroes/${hero._id}`"
            tag="div"
            v-for="(hero, index) in category.heroList"
            :key="index"
            class="p-2 text-center"
            style="width: 20%"
          >
            <!-- 一定要加冒号 动态绑定！！！ -->

            <img :src="hero.avatar" alt="" class="w-100" />
            <div>{{ hero.name }}</div>
          </router-link>
        </div>
      </template>
    </m-list-card>
  </div>
</template>

<script>
import Swiper2, { Navigation, Pagination } from "swiper";
Swiper2.use([Navigation, Pagination]);

import dayjs from "dayjs";
export default {
  data() {
    return {
      swiperOption: {
        pagination: {
          el: ".pagination-home",
        },
      },
      open: false,
      newsCats: [],
      herosCats: [],
    };
  },
  filters: {
    date(val) {
      return dayjs(val).format("MM/DD");
    },
  },
  methods: {
    async initNews() {
      const res = await this.$http.get("news/list");
      this.newsCats = res.data;
    },
    async initHeros() {
      const res = await this.$http.get("heroes/list");
      this.herosCats = res.data;
      console.log(this.herosCats);
    },
  },
  created() {
    this.initNews();
    this.initHeros();
  },
};
</script>


<style lang="scss">
@import "../assets/scss/variables";
.pagination-home {
  .swiper-pagination-bullet {
    opacity: 1;
    border-radius: 0.1538rem;
    background: map-get($colors, "white");
    &.swiper-pagination-bullet-active {
      background: map-get($colors, "info");
    }
  }
}

.nav-icons {
  width: 100%;
  position: relative;
  .big-nav {
    position: absolute;
    transform: translateY(-14.25rem);
    .nav-item {
      width: 25%;
      border-right: solid 0.125rem $border-color;
      &:nth-child(4n) {
        border: none;
      }
    }
  }
  .small-nav {
    width: 100%;
    overflow: hidden;
    .boxclass {
      height: 4rem;
      display: inline-flex;
      .nav-item {
        width: (375.2/4) * 1px;
        float: left;
        border-right: solid 0.125rem $border-color;
        &:nth-child(4n) {
          border: none;
        }
      }
    }
  }
  .sprite.sprite-arrow {
    transform: rotate(-180deg);
  }
}
.nav-icons.open {
  width: 100%;
  position: relative;
  .big-nav {
    transform: translateY(0);
    position: static;
    .nav-item {
      width: 25%;
      border-right: solid 0.125rem $border-color;
      &:nth-child(4n) {
        border: none;
      }
    }
  }
  .small-nav {
    position: absolute;
    width: 100%;
    overflow: hidden;
    .boxclass {
      height: 4rem;
      display: inline-flex;
      .nav-item {
        width: 375.2/4 * 1px;
        float: left;
        border-right: solid 0.125rem $border-color;
        &:nth-child(4n) {
          border: none;
        }
      }
    }
  }

  .sprite.sprite-arrow {
    transform: rotate(0);
  }
}
</style>