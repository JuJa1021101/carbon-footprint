<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">公益活动</text>
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
      <!-- 无活动提示 -->
      <view v-if="activities.length === 0" class="empty-container">
        <text class="empty-text">暂无公益活动，敬请期待</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-else>
        <view 
          v-for="(activity, index) in activities" 
          :key="activity._id"
          class="card bg-white mb-4">
          <view class="p-3">
            <view class="flex justify-between items-center mb-2">
              <text class="font-medium">{{ activity.title }}</text>
              <text 
                :class="getStatusTextClass(activity)"
                class="text-xs font-semibold">
                {{ getDisplayStatus(activity) }}
              </text>
            </view>
            
            <text class="text-gray-500 text-sm mb-3">{{ activity.description }}</text>
            
            <view class="flex items-center justify-between text-xs">
              <view class="flex items-center">
                <image src="/static/images/icons/icon-location.svg" class="icon-small mr-1"></image>
                <text>{{ activity.location }}</text>
              </view>
              <view class="flex items-center">
                <image src="/static/images/icons/icon-calendar.svg" class="icon-small mr-1"></image>
                <text>{{ activity.activity_time }}</text>
              </view>
            </view>
            
            <view class="mt-3 flex items-center">
              <text class="text-xs text-gray-500">{{ getParticipantsText(activity) }}</text>
              <button 
                :class="getActionButtonClass(activity)"
                @tap="handleActivityAction(activity)">
                {{ getActionButtonText(activity) }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getActivities, enrollActivity } from '../../services/userActivity.js';

// 活动列表
const activities = ref([]);
const loading = ref(true);

// 获取活动列表
const loadActivities = async () => {
  loading.value = true;
  try {
    const result = await getActivities();
    activities.value = result;
  } catch (error) {
    uni.showToast({
      title: error.message || '获取活动列表失败',
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

// 获取参与人数文本
const getParticipantsText = (activity) => {
  return activity.isEnrolled ? '2人已报名' : '2人已报名';
};

// 获取操作按钮文本
const getActionButtonText = (activity) => {
  if (activity.isCheckedIn) {
    return '已完成';
  } else if (activity.isEnrolled) {
    return '查看详情';
  } else if (activity.status === '未开始') {
    return '等待开始';
  } else if (activity.status === '已结束') {
    return '已结束';
  } else {
    return '立即报名';
  }
};

// 获取按钮样式类
const getActionButtonClass = (activity) => {
  if (activity.status === '未开始' || activity.status === '已结束') {
    return 'ml-auto bg-gray-200 text-gray-500 text-sm px-4 py-1 rounded-full';
  } else {
    return 'ml-auto bg-green-50 text-green-600 text-sm px-4 py-1 rounded-full';
  }
};

// 处理活动操作
const handleActivityAction = (activity) => {
  if (activity.isCheckedIn) {
    // 已完成，不做任何操作
    uni.showToast({
      title: '您已完成该活动',
      icon: 'none'
    });
  } else if (activity.isEnrolled) {
    // 已报名但未完成，跳转到详情页
    navigateToDetail(activity._id);
  } else if (activity.status === '未开始') {
    // 未开始，提示用户
    uni.showToast({
      title: '活动尚未开始，请等待',
      icon: 'none'
    });
  } else if (activity.status === '已结束') {
    // 已结束，提示用户
    uni.showToast({
      title: '该活动已结束',
      icon: 'none'
    });
  } else {
    // 未报名，弹窗确认报名
    confirmEnroll(activity);
  }
};

// 确认报名
const confirmEnroll = (activity) => {
  uni.showModal({
    title: '报名确认',
    content: `确定要报名参加"${activity.title}"活动吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '报名中...' });
          await enrollActivity(activity._id);
          uni.hideLoading();
          
          uni.showToast({
            title: '报名成功',
            icon: 'success'
          });
          
          // 重新加载活动列表
          await loadActivities();
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: error.message || '报名失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 跳转到活动详情
const navigateToDetail = (activityId) => {
  uni.navigateTo({
    url: `/pages/home/activity-detail?id=${activityId}`
  });
};

// 页面加载
onMounted(() => {
  loadActivities();
});
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-text {
  color: #9ca3af;
}

.card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 加载圈样式 */
.loading-circle {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.text-green-500 { color: #4CAF50; }
.text-green-600 { color: #3d9140; }
.text-yellow-500 { color: #f59e0b; }
.text-blue-500 { color: #3b82f6; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-900 { color: #111827; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
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
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mr-1 { margin-right: 4px; }
.ml-auto { margin-left: auto; }
.mt-3 { margin-top: 12px; }
.rounded-full { border-radius: 9999px; }
.bg-green-50 { background-color: #e8f5e9; }

.back-icon {
  width: 18px;
  height: 18px;
}

.icon-small {
  width: 14px;
  height: 14px;
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
</style> 