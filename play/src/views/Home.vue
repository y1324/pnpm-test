<template>
  <div class="home">
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <el-button @click="show = !show">视频显示</el-button>
    <div class="video-box">
      <fle-hik-video v-model="show"></fle-hik-video>
    </div>
  </div>
</template>

<script>
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  data() {
    return {
      show: false,
    };
  },
  components: {
    HelloWorld,
  },
};
</script>

<style lang="less">
.video-box {
  width: 100%;
}
</style>
