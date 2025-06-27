<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="title">环保知识详情</view>
        <view class="more-btn">
          <image src="/static/images/icons/icon-more.svg" class="more-icon" style="filter: brightness(0) invert(1);"></image>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-circle"></view>
    </view>
    
    <!-- 错误提示 -->
    <view v-else-if="hasError" class="error-container">
      <view class="error-box">
        <text class="error-text">加载失败</text>
        <text class="error-message">{{ errorMessage }}</text>
        <button class="retry-btn" @tap="getKnowledgeDetail">
          重新加载
        </button>
      </view>
    </view>
    
    <!-- 知识详情 -->
    <view v-else class="knowledge-content">
      <!-- 标题 -->
      <view class="title-section">
        <text class="knowledge-title">{{ knowledge.title }}</text>
      </view>
      
      <!-- 内容 -->
      <view class="content-section">
        <view class="content-label">
          <text>环保知识：</text>
        </view>
        <rich-text :nodes="knowledge.content" class="content-text"></rich-text>
      </view>
      
      <!-- 图片 -->
      <view v-if="knowledge.image" class="image-section">
        <image :src="knowledge.image" mode="widthFix" class="knowledge-image"></image>
      </view>
      
      <!-- 标签和时间 -->
      <view class="tags-time-section">
        <view class="tags-container" v-if="knowledge.tags && knowledge.tags.length > 0">
          <text 
            v-for="(tag, index) in knowledge.tags" 
            :key="index"
            class="tag-pill">
            # {{ tag }}
          </text>
        </view>
        <view class="time-container">
          <text class="time-text">{{ formatDate(knowledge.created_at) }}</text>
        </view>
      </view>
      
      <!-- 底部数据栏 -->
      <view class="stats-section">
        <view class="stats-container">
          <!-- 浏览量 -->
          <view class="stat-item">
            <text class="iconfont icon-eye"></text>
            <text class="stat-value">{{ knowledge.views || 0 }}</text>
          </view>
          
          <!-- 点赞 -->
          <view 
            class="stat-item"
            :class="{'liked': isLiked}"
            @tap="toggleLike"
          >
            <text class="iconfont" :class="isLiked ? 'icon-like-fill' : 'icon-like'"></text>
            <text class="stat-value">{{ knowledge.likes || 0 }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getKnowledgeDetail as fetchKnowledgeDetail, toggleLikeKnowledge } from '../../services/knowledge.js';

// 数据
const knowledgeId = ref('');
const knowledge = ref({});
const loading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const isLiked = ref(false);

// 获取知识详情
const getKnowledgeDetail = async () => {
  if (!knowledgeId.value) return;
  
  loading.value = true;
  hasError.value = false;
  
  try {
    console.log('正在获取知识详情，ID:', knowledgeId.value);
    const result = await fetchKnowledgeDetail(knowledgeId.value);
    console.log('获取知识详情结果:', result);
    
    knowledge.value = result;
    
    // 检查是否已点赞
    const userLikedIds = uni.getStorageSync('userLikedKnowledge') || [];
    isLiked.value = userLikedIds.includes(knowledgeId.value);
  } catch (error) {
    console.error('加载环保知识详情失败:', error);
    hasError.value = true;
    errorMessage.value = error.message || '加载环保知识详情失败';
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 切换点赞状态
const toggleLike = async () => {
  try {
    const currentLiked = isLiked.value;
    
    // 立即更新UI
    isLiked.value = !currentLiked;
    knowledge.value.likes = (knowledge.value.likes || 0) + (currentLiked ? -1 : 1);
    
    // 更新本地存储
    const userLikedIds = uni.getStorageSync('userLikedKnowledge') || [];
    let newLikedIds = [...userLikedIds];
    
    if (currentLiked) {
      newLikedIds = newLikedIds.filter(id => id !== knowledgeId.value);
    } else {
      newLikedIds.push(knowledgeId.value);
    }
    
    uni.setStorageSync('userLikedKnowledge', newLikedIds);
    
    // 调用服务端API
    await toggleLikeKnowledge(knowledgeId.value, !currentLiked);
  } catch (error) {
    console.error('更新点赞状态失败:', error);
    
    // 恢复原状态
    isLiked.value = !isLiked.value;
    knowledge.value.likes = (knowledge.value.likes || 0) + (isLiked.value ? 1 : -1);
    
    uni.showToast({
      title: '点赞失败，请稍后重试',
      icon: 'none'
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: function() {
      // 如果返回失败，跳转到环保知识列表页面
      uni.navigateTo({
        url: '/pages/home/knowledge-list'
      });
    }
  });
};

// 初始化
onLoad((options) => {
  console.log('知识详情页面参数:', options);
  if (options.id) {
    knowledgeId.value = options.id;
    getKnowledgeDetail();
  } else {
    hasError.value = true;
    errorMessage.value = '缺少知识ID参数';
    loading.value = false;
  }
});
</script>

<style>
.container {
  min-height: 100vh;
  padding-bottom: 20px;
  background-color: #f5f5f5;
}

.header {
  background-color: #4CAF50;
  padding: 44px 0 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  height: 56px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 18px;
  height: 18px;
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  flex: 1;
  text-align: center;
}

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
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.loading-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  border-top-color: #4CAF50;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误提示 */
.error-container {
  padding: 16px;
}

.error-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-text {
  color: #ef4444;
  margin-bottom: 8px;
}

.error-message {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
}

.retry-btn {
  background-color: #4CAF50;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  border: none;
}

/* 知识内容 */
.knowledge-content {
  padding-bottom: 70px;
}

.title-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 1px;
}

.knowledge-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
}

.content-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.content-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.content-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.image-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.knowledge-image {
  width: 100%;
  border-radius: 8px;
}

.tags-time-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
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

.time-container {
  margin-left: 10px;
}

.time-text {
  font-size: 12px;
  color: #999;
}

.stats-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 12px 16px;
}

.stats-container {
  display: flex;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  margin: 0 20px;
  color: #666;
}

.stat-item.liked {
  color: #ff5252;
}

.stat-item .iconfont {
  margin-right: 4px;
  font-size: 20px;
}

.stat-value {
  font-size: 14px;
}
</style> 