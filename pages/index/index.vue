<template>
  <view class="container">
    <!-- 自动跳转到首页 -->
  </view>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 自动跳转到首页
  uni.switchTab({
    url: '/pages/home/home'
  });
});
</script>

<style>
.container {
  width: 100%;
  height: 100%;
}
</style>
