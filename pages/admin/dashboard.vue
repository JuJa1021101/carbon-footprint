<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view class="w-24px"></view> <!-- 为了居中标题的左侧占位 -->
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">管理员控制台</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的右侧占位 -->
      </view>
    </view>
    
    <!-- 欢迎信息 -->
    <view class="welcome-container">
      <view class="welcome-card">
        <text class="welcome-title">欢迎访问管理员控制台</text>
        <text class="welcome-subtitle">您可以在这里管理环保先锋小程序的核心内容</text>
        <view class="welcome-stats">
          <view class="stat-item">
            <text class="stat-value">
              <text v-if="loading">...</text>
              <text v-else>{{ activityCount }}</text>
            </text>
            <text class="stat-label">活动数量</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">6</text>
            <text class="stat-label">用户数量</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">
              <text v-if="loading">...</text>
              <text v-else>{{ rewardCount }}</text>
            </text>
            <text class="stat-label">商品数量</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 功能区域 -->
    <view class="function-container">
      <view class="function-title">管理功能</view>
      
      <view class="function-buttons">
        <!-- 环保活动信息管理 -->
        <view class="function-button" @tap="navigateToActivityManagement">
          <view class="button-icon bg-blue-50">
            <text class="iconfont icon-calendar text-blue-500 text-xl"></text>
          </view>
          <text class="button-text">环保活动信息管理</text>
        </view>
        
        <!-- 环保知识和小贴士 -->
        <view class="function-button" @tap="navigateToKnowledgeManagement">
          <view class="button-icon bg-amber-50">
            <text class="iconfont icon-bulb text-amber-500 text-xl"></text>
          </view>
          <text class="button-text">环保知识和小贴士</text>
        </view>
        
        <!-- 积分商城奖品管理 -->
        <view class="function-button" @tap="navigateToRewardsManagement">
          <view class="button-icon bg-green-50">
            <text class="iconfont icon-shopping-bag text-green-500 text-xl"></text>
          </view>
          <text class="button-text">积分商城奖品管理</text>
        </view>

        <!-- 积分系统重置 -->
        <view class="function-button" @tap="navigateToResetPoints">
          <view class="button-icon bg-red-50">
            <text class="iconfont icon-refresh text-red-500 text-xl"></text>
          </view>
          <text class="button-text">积分系统重置</text>
        </view>
      </view>
    </view>
    
    <!-- 退出按钮 -->
    <view class="logout-container">
      <button class="logout-button" @tap="handleLogout">退出管理员账号</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getActivityCount } from '../../services/activity.js';
import { getRewardCount } from '../../services/mall.js';

// 统计数据
const activityCount = ref(0);
const rewardCount = ref(0);
const loading = ref(true);
const hasError = ref(false);

// 加载统计数据
const loadStats = async () => {
  loading.value = true;
  hasError.value = false;
  
  try {
    // 先使用缓存数据快速渲染
    const cachedActivityCount = uni.getStorageSync('activity_count') || 0;
    const cachedRewardCount = uni.getStorageSync('reward_count') || 0;
    activityCount.value = cachedActivityCount;
    rewardCount.value = cachedRewardCount;
    
    // 然后再异步获取最新数据
    Promise.all([
      getActivityCount(),
      getRewardCount()
    ]).then(([countActivity, countRewards]) => {
      activityCount.value = countActivity;
      rewardCount.value = countRewards;
      
      // 只有在数据有变化时才更新缓存
      if (cachedActivityCount !== countActivity) {
        uni.setStorageSync('activity_count', countActivity);
      }
      if (cachedRewardCount !== countRewards) {
        uni.setStorageSync('reward_count', countRewards);
      }
      
      loading.value = false;
    }).catch(error => {
      console.error('获取统计数据失败:', error);
      hasError.value = true;
      loading.value = false;
    });
    
  } catch (error) {
    console.error('统计数据初始化失败:', error);
    hasError.value = true;
    // 使用兜底数据
    if (!activityCount.value) activityCount.value = 3;
    if (!rewardCount.value) rewardCount.value = 10;
    loading.value = false;
  }
};

// 检查管理员登录状态
onMounted(() => {
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    
    // 立即跳转到登录页，不使用setTimeout延迟
    uni.navigateTo({
      url: '/pages/admin/login'
    });
  } else {
    // 加载统计数据
    loadStats();
  }
});

// 跳转到活动管理页面
const navigateToActivityManagement = () => {
  uni.navigateTo({
    url: '/pages/admin/activity-list'
  });
};

// 跳转到环保知识管理页面
const navigateToKnowledgeManagement = () => {
  uni.navigateTo({
    url: '/pages/admin/knowledge-list'
  });
};

// 跳转到积分商城奖品管理页面
const navigateToRewardsManagement = () => {
  uni.navigateTo({
    url: '/pages/admin/reward-list'
  });
};

// 跳转到积分系统重置页面
const navigateToResetPoints = () => {
  uni.navigateTo({
    url: '/pages/admin/reset-points'
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '退出提示',
    content: '确认退出管理员账号？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录状态
        uni.removeStorageSync('admin_login_status');
        
        // 返回设置页面
        uni.navigateBack({
          delta: 2  // 返回两级，跳过登录页面直接回到设置页面
        });
      }
    }
  });
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
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

.welcome-container {
  padding: 20px;
}

.welcome-card {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.welcome-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #4CAF50;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.function-container {
  padding: 0 20px 20px;
}

.function-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.function-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.function-button {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.button-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.button-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.logout-container {
  padding: 20px;
  margin-top: 20px;
}

.logout-button {
  width: 100%;
  height: 48px;
  line-height: 48px;
  text-align: center;
  background-color: white;
  color: #f44336;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid #f0f0f0;
}

/* 工具类 */
.text-white { color: #ffffff; }
.text-green-500 { color: #4CAF50; }
.text-blue-500 { color: #3b82f6; }
.text-amber-500 { color: #f59e0b; }
.text-red-500 { color: #ef4444; }

.bg-green-50 { background-color: #e8f5e9; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-amber-50 { background-color: #fffbeb; }
.bg-red-50 { background-color: #fef2f2; }

.text-lg { font-size: 18px; }
.text-xl { font-size: 22px; }
.font-medium { font-weight: 500; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.text-center { text-align: center; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
</style> 