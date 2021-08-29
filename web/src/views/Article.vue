<template>
  <div class="article" v-if="article">
    <div class="d-flex ai-center py-3 px-1">
      <a href="/"></a>
      <strong class="flex-1 ml-2">{{ article.title }}</strong>
    </div>
    <div v-html="article.body" class="content w-100 px-3 py-2"></div>
  </div>
</template>

<script>
export default {
  props: {
    id: { type: String, requried: true },
  },
  data() {
    return {
      article: null,
    };
  },
  methods: {
    async initArticle() {
      const res = await this.$http.get(`/articles/${this.id}`);
      this.article = res.data;
    },
  },
  created() {
    this.initArticle();
  },
};
</script>

<style lang="scss">
.article a {
  background: url(https://game.gtimg.cn/images/yxzj/m/m201606/cp/backBg.png)
    no-repeat center;
  background-size: 8px 14px;
  width: 8px;
  height: 14px;
}

.content {
  p {
    font-size: 1.2rem;
  }
  img {
    width: 100%;
  }
}
</style>