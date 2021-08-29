<template>
  <div class="card mt-3 p-3 bg-white">
    <!-- head -->
    <div class="card-header d-flex ai-center pb-3 pt-2">
      <i class="icon" :class="`icon-${icon}`"></i>
      <div class="fs-xxl flex-1 px-2">{{ title }}</div>
      <i class="icon icon-etc"></i>
    </div>
    <!-- body -->
    <div class="card-body pt-2">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" >
@import "../assets/scss/_variables.scss";
.card-header {
  border-bottom: 1px solid $border-color;
}
</style>