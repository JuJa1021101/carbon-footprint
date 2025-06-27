<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" class="back-icon" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">积分商城奖品管理</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container py-10">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 内容区 -->
    <view v-else class="p-4">
      <!-- 商品数量统计 -->
      <view class="stats-bar mb-4">
        <text class="stats-text">共 {{ rewards.length }} 个商品</text>
      </view>
      
      <!-- 无商品提示 -->
      <view v-if="rewards.length === 0" class="empty-container">
        <text class="empty-text">暂无商品，点击"添加"按钮创建新商品</text>
      </view>
      
      <!-- 商品列表 -->
      <view v-else class="reward-list">
        <view 
          v-for="reward in rewards" 
          :key="reward._id"
          class="reward-item"
          @tap="navigateToEdit(reward._id)">
          <view class="reward-header">
            <text class="reward-title">{{ reward.name }}</text>
            <view class="more-btn" @tap.stop="showDeleteOption(reward)">
              <IconImage name="more" :size="16" />
            </view>
          </view>
          
          <view class="reward-content">
            <view class="reward-image-container">
              <image :src="formatImageUrl(reward.image_url)" class="reward-image" mode="aspectFill" @error="handleImageError($event, reward)" />
            </view>
            <view class="reward-info">
              <view class="info-item">
                <text class="info-label">库存:</text>
                <text class="info-text">{{ reward.stock_quantity || reward.stock || 0 }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">分类:</text>
                <text class="info-text">{{ getCategoryText(reward.category) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">积分:</text>
                <text class="info-text">{{ reward.required_points || reward.points || 0 }}</text>
              </view>
            </view>
          </view>
          
          <view class="reward-footer">
            <view class="tag" v-if="reward.is_hot">热门</view>
            <view class="tag" v-if="reward.is_limited || reward.is_limited_time">限时</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 悬浮添加按钮 -->
    <view class="float-btn" @tap="navigateToAdd">
      <view class="float-btn-inner">
        <text class="plus-text">+</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow, onLoad, onUnload } from '@dcloudio/uni-app';
import { getAllRewards, deleteReward, getRewardCount } from '../../services/mall.js';
import IconImage from '../../components/IconImage.vue';

// 商品列表
const rewards = ref([]);
const loading = ref(true);

// 格式化图片URL，确保路径正确
const formatImageUrl = (url) => {
  if (!url) return '/static/images/mall/default-product.png';
  
  // 如果不是以斜杠或http开头，添加前导斜杠
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return '/' + url;
  }
  
  return url;
};

// 处理图片加载错误
const handleImageError = (e, reward) => {
  console.error(`商品[${reward.name}]图片加载失败:`, e);
  e.target.src = '/static/images/mall/default-product.png';
};

// 获取分类显示文字
const getCategoryText = (category) => {
  const categories = {
    'daily': '日常用品',
    'plant': '绿植花卉',
    'coupon': '优惠券'
  };
  return categories[category] || category;
};

// 获取商品列表
const loadRewards = async () => {
  loading.value = true;
  try {
    const result = await getAllRewards();
    
    // 按照优先级排序：限时商品 > 热门商品 > 普通商品
    rewards.value = result.sort((a, b) => {
      // 限时商品排在最前面
      if ((a.is_limited === true || a.is_limited_time === true) && 
          (b.is_limited !== true && b.is_limited_time !== true)) {
        return -1;
      }
      if ((a.is_limited !== true && a.is_limited_time !== true) && 
          (b.is_limited === true || b.is_limited_time === true)) {
        return 1;
      }
      
      // 热门商品排在其次
      if (a.is_hot === true && b.is_hot !== true) {
        return -1;
      }
      if (a.is_hot !== true && b.is_hot === true) {
        return 1;
      }
      
      // 默认按照创建时间倒序
      const aTime = a.created_at || 0;
      const bTime = b.created_at || 0;
      return bTime - aTime;
    });
    
    // 更新dashboard页面上显示的商品数量
    updateRewardCount(rewards.value.length);
    
  } catch (error) {
    console.error('获取商品列表失败:', error);
    uni.showToast({
      title: error.message || '获取商品列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 更新商品数量缓存，用于dashboard页面显示
const updateRewardCount = (count) => {
  uni.setStorageSync('reward_count', count);
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到添加商品页面
const navigateToAdd = () => {
  uni.navigateTo({
    url: '/pages/admin/reward-add'
  });
};

// 跳转到编辑商品页面
const navigateToEdit = (rewardId) => {
  uni.navigateTo({
    url: `/pages/admin/reward-edit?id=${rewardId}`
  });
};

// 显示删除选项
const showDeleteOption = (reward) => {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#ff0000',
    success: (res) => {
      if (res.tapIndex === 0) {
        confirmDeleteReward(reward);
      }
    }
  });
};

// 确认删除商品
const confirmDeleteReward = (reward) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${reward.name}"商品吗？删除后无法恢复。`,
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        handleDeleteReward(reward._id);
      }
    }
  });
};

// 删除商品
const handleDeleteReward = async (rewardId) => {
  try {
    await deleteReward(rewardId);
    rewards.value = rewards.value.filter(reward => reward._id !== rewardId);
    
    // 更新商品数量
    updateRewardCount(rewards.value.length);
    
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
  } catch (error) {
    uni.showToast({
      title: error.message || '删除失败',
      icon: 'none'
    });
  }
};

// 处理商品更新事件
const handleRewardsUpdate = (eventData) => {
  console.log('收到商品更新事件:', eventData);
  loadRewards(); // 刷新商品列表
  
  // 显示操作成功提示
  let message = '';
  switch(eventData.type) {
    case 'add':
      message = '商品添加成功';
      break;
    case 'update':
      message = '商品更新成功';
      break;
    case 'delete':
      message = '商品删除成功';
      break;
    default:
      message = '商品信息已更新';
  }
  
  uni.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  });
};

// 页面加载
onMounted(() => {
  // 检查管理员登录状态
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    console.log('管理员未登录，跳转到登录页面');
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/admin/login'
      });
    }, 1500);
    return;
  }
  
  loadRewards();
});

// 每次显示页面时刷新列表
onShow(() => {
  console.log('商品列表页面显示，检查登录状态');
  
  // 确保每次显示时都验证登录状态
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    console.log('检测到管理员未登录，跳转到登录页面');
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/admin/login'
      });
    }, 1500);
    return;
  }
  
  // 无论如何都刷新列表，确保添加商品后能显示
  loadRewards();
  
  // 检查是否有添加或编辑操作的提示
  const actionMessage = uni.getStorageSync('reward_action_message');
  if (actionMessage) {
    // 显示提示
    uni.showToast({
      title: actionMessage,
      icon: 'success'
    });
    // 使用后清除
    uni.removeStorageSync('reward_action_message');
  }
});

// 监听页面加载和卸载
onLoad(() => {
  // 监听商品更新事件，以便刷新列表
  uni.$on('rewardsUpdated', handleRewardsUpdate);
});

onUnload(() => {
  // 清除事件监听
  uni.$off('rewardsUpdated');
});
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

.back-icon {
  width: 18px;
  height: 18px;
}

.stats-bar {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stats-text {
  font-size: 14px;
  color: #666;
}

.mb-4 {
  margin-bottom: 16px;
}

.icon-size {
  width: 16px;
  height: 16px;
}

.float-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  z-index: 100;
}

.float-btn-inner {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.plus-text {
  color: white;
  font-size: 30px;
  font-weight: bold;
  line-height: 30px;
  text-align: center;
  margin-top: -2px; /* 轻微上移调整垂直位置 */
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reward-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reward-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.more-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reward-content {
  display: flex;
  margin-bottom: 12px;
}

.reward-image-container {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  overflow: hidden;
  border-radius: 8px;
}

.reward-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reward-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-item {
  display: flex;
  font-size: 14px;
  margin-bottom: 4px;
}

.info-label {
  color: #666;
  margin-right: 6px;
}

.info-text {
  color: #333;
}

.reward-footer {
  display: flex;
  gap: 8px;
}

.tag {
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.tag:first-child {
  background-color: #ffebee;
  color: #e57373;
}

.tag:nth-child(2) {
  background-color: #e8f5e9;
  color: #81c784;
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 工具类 */
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.text-white { color: #ffffff; }
.text-lg { font-size: 18px; }
</style> 