<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">活动详情</text>
        </view>
        <view class="more-btn">
          <image src="/static/images/icons/icon-more.svg" class="more-icon"></image>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <view class="loading-circle"></view>
    </view>
    
    <!-- 内容区 -->
    <view v-else class="p-4">
      <view v-if="activity" class="detail-card bg-white rounded-lg shadow-sm">
        <!-- 活动标题 -->
        <view class="p-4 border-b">
          <view class="flex justify-between items-center mb-2">
            <text class="text-lg font-medium">{{ activity.title }}</text>
            <text 
              :class="getStatusTextClass(activity)"
              class="text-xs font-semibold">
              {{ getDisplayStatus(activity) }}
            </text>
          </view>
        </view>
        
        <!-- 活动信息 -->
        <view class="p-4">
          <view class="mb-4">
            <text class="text-gray-700 mb-2 block">活动介绍</text>
            <text class="text-gray-600 text-sm leading-relaxed">{{ activity.description }}</text>
          </view>
          
          <view class="info-row mb-3 flex items-center">
            <image src="/static/images/icons/icon-location.svg" class="info-icon mr-2"></image>
            <text class="text-gray-600">{{ activity.location }}</text>
          </view>
          
          <view class="info-row mb-3 flex items-center">
            <image src="/static/images/icons/icon-calendar.svg" class="info-icon mr-2"></image>
            <text class="text-gray-600">{{ activity.activity_time }}</text>
          </view>
          
          <view class="info-row mb-3 flex items-center">
            <image src="/static/images/icons/icon-like.svg" class="info-icon mr-2"></image>
            <text class="text-gray-600">完成打卡可获得 {{ activity.point }} 积分</text>
          </view>
        </view>
      </view>
      
      <!-- 找不到活动 -->
      <view v-else class="flex justify-center py-10">
        <text class="text-gray-500">未找到该活动信息</text>
      </view>
    </view>
    
    <!-- 打卡按钮 -->
    <view 
      v-if="activity && activity.isEnrolled && !activity.isCheckedIn"
      class="checkin-btn" 
      @tap="handleCheckIn">
      <text class="text-white text-xl">打卡</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getActivities, checkInActivity } from '../../services/userActivity.js';

// 活动ID
const activityId = ref('');
// 活动信息
const activity = ref(null);
const loading = ref(true);

// 获取活动详情
const loadActivityDetail = async (id) => {
  loading.value = true;
  try {
    const activities = await getActivities(false); // 不排序
    const found = activities.find(item => item._id === id);
    
    if (found) {
      activity.value = found;
    } else {
      uni.showToast({
        title: '未找到活动信息',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '获取活动信息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 获取状态文本样式类
const getStatusTextClass = (activity) => {
  if (activity.isCheckedIn) {
    return 'text-gray-500'; // 已完成打卡，显示灰色
  } else if (activity.isEnrolled) {
    return 'text-green-500'; // 已报名但未打卡，显示绿色
  }
  
  switch (activity.status) {
    case '报名中':
      return 'text-yellow-500'; // 报名中，显示橙色
    case '未开始':
      return 'text-blue-500'; // 未开始，显示蓝色
    case '已结束':
      return 'text-gray-500'; // 已结束，显示灰色
    default:
      return 'text-gray-500';
  }
};

// 获取用户端显示的状态文本
const getDisplayStatus = (activity) => {
  if (activity.isCheckedIn) {
    return '已完成'; // 已完成打卡
  } else if (activity.isEnrolled) {
    return '进行中'; // 已报名但未打卡
  }
  
  return activity.status; // 否则显示原始状态
};

// 处理打卡
const handleCheckIn = () => {
  if (!activity.value) return;
  
  uni.showModal({
    title: '打卡确认',
    content: `确定要为"${activity.value.title}"活动打卡吗？完成后将获得${activity.value.point}积分`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '打卡中...' });
          const result = await checkInActivity(activity.value._id, activity.value.point);
          uni.hideLoading();
          
          uni.showToast({
            title: `打卡成功，获得${result.points}积分`,
            icon: 'success'
          });
          
          // 重新加载活动信息
          await loadActivityDetail(activityId.value);
          
          // 延时返回
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: error.message || '打卡失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 页面加载
onMounted(() => {
  // 获取页面参数
  const page = getCurrentPages().pop();
  const options = page.options || {};
  
  if (options.id) {
    activityId.value = options.id;
    loadActivityDetail(options.id);
  } else {
    uni.showToast({
      title: '缺少活动ID',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.back-icon {
  width: 18px;
  height: 18px;
}

.info-icon {
  width: 16px;
  height: 16px;
}

.info-row {
  display: flex;
  align-items: center;
}

.leading-relaxed {
  line-height: 1.6;
}

.checkin-btn {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #3d8c40 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

.loading-circle {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* 工具类 */
.bg-white { background-color: #ffffff; }
.text-green-500 { color: #4CAF50; }
.text-yellow-500 { color: #f59e0b; }
.text-blue-500 { color: #3b82f6; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.text-white { color: #ffffff; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-xl { font-size: 20px; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }
.w-24px { width: 24px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mr-2 { margin-right: 8px; }
.rounded-lg { border-radius: 8px; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
</style> 