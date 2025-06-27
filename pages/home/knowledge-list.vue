<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">环保知识与小贴士</text>
        </view>
        <view class="more-btn">
          <image src="/static/images/icons/icon-more.svg" class="more-icon" style="filter: brightness(0) invert(1);"></image>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <image src="/static/images/loading.gif" class="w-12 h-12"></image>
    </view>
    
    <!-- 错误提示 -->
    <view v-else-if="hasError" class="p-4">
      <view class="bg-white rounded-lg p-6 flex flex-col items-center">
        <text class="text-red-500 mb-2">加载失败</text>
        <text class="text-gray-500 text-sm text-center mb-4">{{ errorMessage }}</text>
        <button class="bg-green-500 text-white px-4 py-2 rounded-full text-sm" @tap="getKnowledgeList">
          重新加载
        </button>
      </view>
    </view>
    
    <!-- 知识列表 -->
    <view v-else class="p-4">
      <view v-if="knowledgeList.length === 0" class="bg-white rounded-lg p-6 flex justify-center">
        <text class="text-gray-500">暂无环保知识，敬请期待</text>
      </view>
      
      <view v-else class="knowledge-list">
        <view 
          v-for="(item, index) in knowledgeList" 
          :key="item._id" 
          class="knowledge-card bg-white mb-4 rounded-lg overflow-hidden"
          @tap="navigateToDetail(item._id)">
          <!-- 知识图片 -->
          <image 
            v-if="item.image" 
            :src="item.image" 
            mode="aspectFill" 
            class="knowledge-image w-full"
          ></image>
          
          <!-- 知识内容 -->
          <view class="p-4">
            <!-- 标题 -->
            <text class="text-lg font-bold mb-2 block">{{ item.title }}</text>
            
            <!-- 标签 -->
            <view class="flex flex-wrap mb-3">
              <text 
                v-for="(tag, tagIndex) in item.tags" 
                :key="tagIndex" 
                class="tag mr-2 mb-2">
                # {{ tag }}
              </text>
            </view>
            
            <!-- 互动统计 -->
            <view class="flex justify-between items-center">
              <view class="flex items-center">
                <!-- 浏览量 -->
                <view class="flex items-center mr-4">
                  <text class="iconfont icon-eye text-gray-400 mr-1"></text>
                  <text class="text-sm text-gray-500">{{ item.views || 0 }}</text>
                </view>
                
                <!-- 点赞 -->
                <view 
                  class="flex items-center"
                  @tap.stop="toggleLike(item)"
                >
                  <text 
                    class="iconfont mr-1"
                    :class="item.isLiked ? 'icon-like-fill text-red-500' : 'icon-like text-gray-400'"
                  ></text>
                  <text class="text-sm" :class="item.isLiked ? 'text-red-500' : 'text-gray-500'">{{ item.likes || 0 }}</text>
                </view>
              </view>
              
              <!-- 创建时间 -->
              <text class="text-xs text-gray-400">{{ formatDate(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getKnowledgeList as fetchKnowledgeList, toggleLikeKnowledge } from '../../services/knowledge.js';

// 数据
const knowledgeList = ref([]);
const loading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const userLikedIds = ref([]); // 用户已点赞的知识ID，实际应存储在本地或与用户关联

// 获取环保知识列表
const getKnowledgeList = async () => {
  loading.value = true;
  hasError.value = false;
  
  try {
    const result = await fetchKnowledgeList();
    
    // 处理点赞状态
    const userLikedIdsFromStorage = uni.getStorageSync('userLikedKnowledge') || [];
    userLikedIds.value = userLikedIdsFromStorage;
    
    // 为每个知识项添加isLiked属性
    result.forEach(item => {
      item.isLiked = userLikedIds.value.includes(item._id);
    });
    
    knowledgeList.value = result;
  } catch (error) {
    console.error('加载环保知识列表失败:', error);
    hasError.value = true;
    errorMessage.value = error.message || '加载环保知识列表失败';
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
const toggleLike = async (item) => {
  try {
    const currentLiked = item.isLiked;
    
    // 立即更新UI
    item.isLiked = !currentLiked;
    item.likes = (item.likes || 0) + (currentLiked ? -1 : 1);
    
    // 更新本地存储的点赞状态
    let likedIds = [...userLikedIds.value];
    if (currentLiked) {
      likedIds = likedIds.filter(id => id !== item._id);
    } else {
      likedIds.push(item._id);
    }
    userLikedIds.value = likedIds;
    uni.setStorageSync('userLikedKnowledge', likedIds);
    
    // 调用服务端API
    await toggleLikeKnowledge(item._id, !currentLiked);
  } catch (error) {
    console.error('更新点赞状态失败:', error);
    // 恢复原状态
    item.isLiked = !item.isLiked;
    item.likes = (item.likes || 0) + (item.isLiked ? -1 : 1);
    
    uni.showToast({
      title: '点赞失败，请稍后重试',
      icon: 'none'
    });
  }
};

// 跳转到详情页
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/home/knowledge-detail?id=${id}`
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 初始化
onMounted(() => {
  getKnowledgeList();
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
}

.bg-green {
  background-color: #4CAF50;
}

.w-24px {
  width: 24px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
}

.knowledge-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.knowledge-image {
  height: 200px;
  object-fit: cover;
}

.tag {
  font-size: 12px;
  color: #4CAF50;
}

/* 工具类 */
.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }

.text-white { color: #ffffff; }
.text-red-500 { color: #ef4444; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }

.bg-white { background-color: #ffffff; }
.bg-red-500 { background-color: #ef4444; }
.bg-green-500 { background-color: #4CAF50; }

.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }

.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mr-4 { margin-right: 16px; }

.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }

.w-full { width: 100%; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.overflow-hidden { overflow: hidden; }
.block { display: block; }

.back-icon {
  width: 18px;
  height: 18px;
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
  filter: brightness(0) invert(1); /* 将图标变为白色 */
}
</style> 