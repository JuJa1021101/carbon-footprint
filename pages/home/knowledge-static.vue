<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack">
          <image src="/static/images/icons/icon-back.svg" class="back-icon" style="filter: brightness(0) invert(1);"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">环保知识详情</text>
        </view>
        <view class="more-btn">
          <image src="/static/images/icons/icon-more.svg" class="more-icon"></image>
        </view>
      </view>
    </view>
    
    <!-- 知识详情 -->
    <view class="knowledge-detail">
      <!-- 内容区域 -->
      <view class="content-section">
        <!-- 环保知识标题 -->
        <view class="env-knowledge-title">
          <text>环保知识：</text>
        </view>
        
        <!-- 环保知识内容 -->
        <view class="env-knowledge-content">
          <rich-text :nodes="knowledge.content" class="content-area"></rich-text>
        </view>
      </view>
      
      <!-- 图片区域 -->
      <view class="image-section">
        <image 
          :src="knowledge.image" 
          mode="widthFix" 
          class="knowledge-image"
        ></image>
      </view>
      
      <!-- 标签和时间区域 -->
      <view class="tags-time-section">
        <view class="flex justify-between items-center">
          <!-- 标签 -->
          <view class="tags">
            <text class="tag-pill"># {{ knowledge.tag }}</text>
          </view>
          
          <!-- 创建时间 -->
          <view class="time">
            <text>{{ knowledge.time }}</text>
          </view>
        </view>
      </view>
      
      <!-- 底部工具栏 -->
      <view class="footer-section">
        <view class="flex justify-between items-center">
          <!-- 左侧工具 -->
          <view class="footer-left">
            <!-- 返回按钮 -->
            <view class="footer-btn" @tap="goBack">
              <text class="iconfont icon-left"></text>
            </view>
          </view>
          
          <!-- 中间工具 -->
          <view class="footer-center">
            <!-- 浏览量 -->
            <view class="footer-stat">
              <text class="iconfont icon-eye"></text>
              <text>{{ knowledge.views }}</text>
            </view>
            
            <!-- 点赞 -->
            <view 
              class="footer-stat"
              :class="{'liked': isLiked}"
              @tap="toggleLike"
            >
              <text class="iconfont" :class="isLiked ? 'icon-like-fill' : 'icon-like'"></text>
              <text>{{ knowledge.likes }}</text>
            </view>
          </view>
          
          <!-- 右侧工具 -->
          <view class="footer-right">
            <!-- 分享按钮 -->
            <button 
              class="share-btn"
              open-type="share">
              分享
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 两个静态知识库
const staticKnowledge = {
  garbage: {
    title: '一张图看懂家庭垃圾如何正确分类',
    content: '<div><p>随着环保意识的提高，垃圾分类已成为每个家庭必须面对的日常任务。正确的垃圾分类不仅有助于资源的回收利用，还能减少环境污染。</p><p>家庭垃圾主要分为四大类：</p><ul><li><strong>可回收物</strong>：纸类、塑料、金属、玻璃等适宜回收利用的物品</li><li><strong>有害垃圾</strong>：废电池、废灯管、废药品、废油漆等对环境或人体健康有害的垃圾</li><li><strong>厨余垃圾</strong>：剩菜剩饭、骨头、菜根菜叶等食品类废物</li><li><strong>其他垃圾</strong>：除可回收物、有害垃圾、厨余垃圾以外的其他生活废弃物</li></ul><p>通过正确分类，我们可以让垃圾得到更合理的处理，为地球环保贡献自己的一份力量。</p></div>',
    image: '/static/images/userspost/garbage-sorting.jpeg',
    tag: '垃圾分类',
    time: '3小时前',
    views: 1234,
    likes: 56
  },
  energy: {
    title: '日常用电小窍门，轻松节能30%',
    content: '<div><p>在日常生活中，通过一些简单的改变，我们可以轻松实现节能减排，既环保又省钱。</p><p>以下是几个实用的节电小窍门：</p><ol><li>选择节能电器：购买家电时，优先选择能效标识为一级或二级的产品</li><li>合理使用空调：夏季温度设置在26℃以上，冬季不高于20℃</li><li>随手关灯：离开房间时及时关灯，充分利用自然光</li><li>拔掉待机电源：电器不用时拔掉插头，避免待机耗电</li><li>洗衣机满载再洗：集中衣物一次清洗，减少洗衣机启动次数</li><li>电冰箱合理放置：远离热源，保持散热空间，减少开门次数</li><li>使用节能灯具：LED灯比传统灯泡节能80%以上</li></ol><p>通过上述方法，普通家庭可以轻松节约30%的电力消耗，为减少碳排放作出贡献。</p></div>',
    image: '/static/images/userspost/energy-saving.jpeg',
    tag: '节能减排',
    time: '昨天',
    views: 867,
    likes: 42
  }
};

// 数据
const knowledge = ref({});
const isLiked = ref(false);
const knowledgeLikeKey = ref('');

// 切换点赞状态
const toggleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    knowledge.value.likes++;
  } else {
    knowledge.value.likes--;
  }
  
  // 保存点赞状态到本地
  const likedKeys = uni.getStorageSync('likedStaticKnowledge') || [];
  if (isLiked.value) {
    likedKeys.push(knowledgeLikeKey.value);
  } else {
    const index = likedKeys.indexOf(knowledgeLikeKey.value);
    if (index > -1) {
      likedKeys.splice(index, 1);
    }
  }
  uni.setStorageSync('likedStaticKnowledge', likedKeys);
  
  // 显示提示
  uni.showToast({
    title: isLiked.value ? '点赞成功' : '已取消点赞',
    icon: 'none'
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 分享功能
uni.onShareAppMessage(() => {
  return {
    title: knowledge.value.title || '环保知识分享',
    path: `/pages/home/knowledge-static?type=${knowledgeLikeKey.value}`,
    imageUrl: knowledge.value.image || ''
  };
});

// 初始化
onLoad((options) => {
  console.log('静态知识详情页面参数:', options);
  if (options.type === 'garbage' || options.type === 'energy') {
    knowledge.value = staticKnowledge[options.type];
    knowledgeLikeKey.value = `static-${options.type}`;
    
    // 获取点赞状态
    const likedKeys = uni.getStorageSync('likedStaticKnowledge') || [];
    isLiked.value = likedKeys.includes(knowledgeLikeKey.value);
  } else {
    // 默认显示垃圾分类
    knowledge.value = staticKnowledge.garbage;
    knowledgeLikeKey.value = 'static-garbage';
  }
});
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding-top: 44px;
  padding-bottom: 12px;
  box-sizing: content-box;
  background-color: #4CAF50;
}

.knowledge-detail {
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* 为底部工具栏留出空间 */
}

.content-section {
  background-color: #fff;
  padding: 20px 16px;
  margin-bottom: 10px;
}

.env-knowledge-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.env-knowledge-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.image-section {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 10px;
}

.knowledge-image {
  width: 100%;
  border-radius: 8px;
}

.tags-time-section {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
}

.tag-pill {
  display: inline-block;
  font-size: 12px;
  color: #4CAF50;
  background-color: #e8f5e9;
  padding: 4px 12px;
  border-radius: 16px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.time {
  font-size: 12px;
  color: #999;
}

.footer-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 10px 16px;
  z-index: 100;
}

.footer-left, .footer-center, .footer-right {
  display: flex;
  align-items: center;
}

.footer-center {
  flex: 1;
  justify-content: center;
}

.footer-stat {
  display: flex;
  align-items: center;
  margin: 0 15px;
  color: #666;
}

.footer-stat.liked {
  color: #ff5252;
}

.footer-stat .iconfont {
  margin-right: 4px;
  font-size: 20px;
}

.share-btn {
  background-color: #4CAF50;
  color: #fff;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
}

/* 工具类 */
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }

.text-white { color: #ffffff; }
.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }

.bg-green { background-color: #4CAF50; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.w-24px { width: 24px; }

.more-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* 将图标变为白色 */
}

.back-icon {
  width: 18px;
  height: 18px;
}
</style> 