<template>
  <view class="icon-wrapper" :style="{ width: size + 'px', height: size + 'px' }" :class="{'active-icon': active && (name === 'heart' || name === 'like')}">
    <image :src="iconUrl" :style="{ width: size + 'px', height: size + 'px' }" mode="aspectFit" class="icon-img"></image>
  </view>
</template>

<script>
export default {
  name: 'IconImage',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconUrl() {
      // 根据激活状态选择不同的图标
      if (this.active && (this.name === 'like' || this.name === 'heart')) {
        return `/static/images/icons/icon-${this.name}-active.svg`;
      }
      // 从静态资源目录获取SVG图标
      return `/static/images/icons/icon-${this.name}.svg`;
    }
  }
}
</script>

<style>
.icon-wrapper {
  display: inline-block;
  vertical-align: middle;
}
.icon-img {
  display: block;
}
.active-icon {
  color: #ef4444; /* 红色 */
}
</style> 