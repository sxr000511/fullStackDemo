<template>
  <div>
    <div
      class="topbar w-100 bg-black pt-2 pb-1 px-3 text-white d-flex ai-center"
    >
      <img src="../assets/logo.png" alt="" height="30" />
      <!-- 一个div包裹text -->
      <div class="ml-2 flex-grow-1">
        <div>王者荣耀</div>
        <div class="text-grey fs-xs">团队成就更多</div>
      </div>
      <div class="btn bg-primary text-black">立即下载</div>
    </div>

    <div class="bg-primary pt-3 pb-2 d-flex jc-around text-white">
      <div class="nav nav-inverse">
        <div class="nav-item active">
          <router-link class="nav-link" to="/" tag="div">首页</router-link>
        </div>
      </div>
      <div class="nav nav-inverse">
        <div class="nav-item">
          <router-link class="nav-link" to="/" tag="div">攻略中心</router-link>
        </div>
      </div>
      <div class="nav nav-inverse">
        <div class="nav-item">
          <router-link class="nav-link" to="/" tag="div">赛事中心</router-link>
        </div>
      </div>
      <div class="nav nav-inverse">
        <div class="nav-item">
          <router-link class="nav-link" to="/" tag="div">IP新游</router-link>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.topbar {
  position: sticky;
  top: 0;
  z-index: 999;
}
</style>