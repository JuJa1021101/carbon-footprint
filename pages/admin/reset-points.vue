<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">积分系统重置</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 内容区 -->
    <view class="content-container">
      <view class="card">
        <view class="card-header">
          <text class="card-title">积分系统重置</text>
        </view>
        <view class="card-body">
          <text class="warning-text">警告：此操作将删除所有积分记录，并创建一个统一的默认用户积分记录。此操作不可逆，请谨慎操作！</text>
          
          <view class="info-box">
            <view class="info-item">
              <text class="info-label">当前默认积分:</text>
              <text class="info-value">{{ currentPoints }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">默认用户ID:</text>
              <text class="info-value">10086420</text>
            </view>
            <view class="info-item">
              <text class="info-label">重置后积分:</text>
              <text class="info-value">1000</text>
            </view>
          </view>
          
          <button class="reset-button" @tap="confirmReset" :disabled="isResetting">
            {{ isResetting ? '重置中...' : '重置积分系统' }}
          </button>
        </view>
      </view>
      
      <view class="card mt-4">
        <view class="card-header">
          <text class="card-title">刷新积分</text>
        </view>
        <view class="card-body">
          <text class="text-gray-600">从云端获取最新积分数据</text>
          <button class="refresh-button mt-3" @tap="refreshPoints" :disabled="isRefreshing">
            {{ isRefreshing ? '刷新中...' : '刷新积分' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentPoints = ref(0);
const isResetting = ref(false);
const isRefreshing = ref(false);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 检查管理员登录状态
onMounted(() => {
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    uni.showToast({
      title: '请先登录管理员账号',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/admin/login'
      });
    }, 1500);
    return;
  }
  
  // 加载当前积分
  loadPoints();
});

// 加载当前积分
const loadPoints = async (force = false) => {
  isRefreshing.value = true;
  try {
    // 使用固定的默认用户ID
    const userId = '10086420';
    
    const { result } = await uniCloud.callFunction({
      name: 'getUserPoints',
      data: { userId }
    });
    
    if (result && result.success) {
      currentPoints.value = result.data.points;
      console.log('当前积分:', currentPoints.value);
    } else {
      console.error('获取积分失败:', result);
      uni.showToast({
        title: '获取积分失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取积分失败:', error);
    uni.showToast({
      title: '获取积分失败',
      icon: 'none'
    });
  } finally {
    isRefreshing.value = false;
  }
};

// 刷新积分
const refreshPoints = async () => {
  await loadPoints(true);
  
  uni.showToast({
    title: '积分已刷新',
    icon: 'success'
  });
};

// 确认重置
const confirmReset = () => {
  uni.showModal({
    title: '警告',
    content: '此操作将删除所有积分记录，并创建一个新的默认积分记录。此操作不可逆，是否继续？',
    success: (res) => {
      if (res.confirm) {
        resetPointsSystem();
      }
    }
  });
};

// 重置积分系统
const resetPointsSystem = async () => {
  isResetting.value = true;
  
  try {
    uni.showLoading({ title: '重置中...' });
    
    const { result } = await uniCloud.callFunction({
      name: 'resetPointsSystem'
    });
    
    uni.hideLoading();
    
    if (result && result.success) {
      uni.showToast({
        title: '重置成功',
        icon: 'success'
      });
      
      // 刷新积分
      await loadPoints(true);
      
      // 通知积分更新
      uni.$emit('userPointsUpdated', { points: currentPoints.value });
    } else {
      uni.showToast({
        title: '重置失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('重置积分系统失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '重置失败',
      icon: 'none'
    });
  } finally {
    isResetting.value = false;
  }
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

.content-container {
  padding: 20px;
}

.card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card-body {
  padding: 16px;
}

.warning-text {
  color: #ef4444;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.info-box {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.reset-button {
  width: 100%;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #ef4444;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

.refresh-button {
  width: 100%;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

/* 工具类 */
.text-white { color: #ffffff; }
.text-gray-600 { color: #4b5563; }
.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.text-center { text-align: center; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }

.back-icon {
  width: 18px;
  height: 18px;
}
</style> 