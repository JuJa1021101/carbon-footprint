<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" class="back-icon" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">环保活动管理</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <image src="/static/images/loading.gif" class="w-12 h-12"></image>
    </view>
    
    <!-- 内容区 -->
    <view v-else class="p-4">
      <!-- 无活动提示 -->
      <view v-if="activities.length === 0" class="empty-container">
        <text class="empty-text">暂无环保活动，点击"添加"按钮创建新活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-else class="activity-list">
        <view 
          v-for="(activity, index) in activities" 
          :key="activity._id"
          class="activity-item"
          @tap="navigateToEdit(activity._id)">
          <view class="activity-header">
            <text class="activity-title">{{ activity.title }}</text>
            <view class="more-btn" @tap.stop="showDeleteOption(activity)">
              <IconImage name="more" :size="16" />
            </view>
          </view>
          
          <view class="activity-content">
            <text class="activity-desc">{{ formatDescription(activity.description) }}</text>
          </view>
          
          <view class="activity-footer">
            <view class="activity-info">
              <view class="info-item">
                <IconImage name="location" :size="14" class="mr-1" />
                <text class="info-text">{{ activity.location }}</text>
              </view>
              <view class="info-item">
                <IconImage name="calendar" :size="14" class="mr-1" />
                <text class="info-text">{{ activity.activity_time }}</text>
              </view>
            </view>
            <view class="activity-status" :class="getStatusClass(activity.status)">
              <text>{{ activity.status }}</text>
            </view>
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
import { onShow } from '@dcloudio/uni-app';
import { getActivities, deleteActivity } from '../../services/activity.js';
import IconImage from '../../components/IconImage.vue';

// 活动列表
const activities = ref([]);
const loading = ref(true);

// 获取活动列表
const loadActivities = async () => {
  loading.value = true;
  try {
    const result = await getActivities();
    console.log('原始活动列表:', result.map(a => `${a.title} (${a.status})`));
    
    // 按状态排序：未开始 > 报名中 > 已结束
    const sortedActivities = result.sort((a, b) => {
      const statusOrder = {
        '未开始': 1,
        '报名中': 2,
        '已结束': 3
      };
      
      const statusA = statusOrder[a.status] || 999;
      const statusB = statusOrder[b.status] || 999;
      
      return statusA - statusB;
    });
    
    console.log('排序后活动列表:', sortedActivities.map(a => `${a.title} (${a.status})`));
    activities.value = sortedActivities;
  } catch (error) {
    console.error('获取活动列表失败:', error);
    uni.showToast({
      title: error.message || '获取活动列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 格式化描述文本（截取前50个字符）
const formatDescription = (description) => {
  if (!description) return '';
  if (description.length <= 50) return description;
  return description.substring(0, 50) + '...';
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到添加活动页面
const navigateToAdd = () => {
  uni.navigateTo({
    url: '/pages/admin/activity-add'
  });
};

// 跳转到编辑活动页面
const navigateToEdit = (activityId) => {
  uni.navigateTo({
    url: `/pages/admin/activity-edit?id=${activityId}`
  });
};

// 显示删除选项
const showDeleteOption = (activity) => {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#ff0000',
    success: (res) => {
      if (res.tapIndex === 0) {
        confirmDeleteActivity(activity);
      }
    }
  });
};

// 确认删除活动
const confirmDeleteActivity = (activity) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${activity.title}"活动吗？删除后无法恢复。`,
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        handleDeleteActivity(activity._id);
      }
    }
  });
};

// 删除活动
const handleDeleteActivity = async (activityId) => {
  try {
    await deleteActivity(activityId);
    activities.value = activities.value.filter(activity => activity._id !== activityId);
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

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case '报名中':
      return 'status-enrolling';
    case '未开始':
      return 'status-not-started';
    case '已结束':
      return 'status-ended';
    default:
      return '';
  }
};

// 获取参与人数
const getParticipantsCount = (activity) => {
  return activity.enrollCount || 0;
};

// 初始化加载活动列表
onMounted(() => {
  // 检查管理员登录状态
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/admin/login'
      });
    }, 1500);
    return;
  }
  
  loadActivities();
});

// 每次显示页面时刷新活动列表
onShow(() => {
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus === 'loggedin') {
    loadActivities();
  }
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

.add-button {
  position: fixed;
  right: 30rpx;
  bottom: 50rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4CD964;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 10rpx rgba(76, 217, 100, 0.3);
  color: white;
  font-size: 40rpx;
  z-index: 100;
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-title {
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

.activity-content {
  margin-bottom: 12px;
}

.activity-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-text {
  font-size: 12px;
  color: #666;
}

.activity-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-enrolling {
  background-color: #e8f5e9;
  color: #4CAF50;
}

.status-not-started {
  background-color: #e3f2fd;
  color: #2196F3;
}

.status-ended {
  background-color: #eeeeee;
  color: #757575;
}

/* 工具类 */
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.text-white { color: #ffffff; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.font-medium { font-weight: 500; }
.bg-green-600 { background-color: #3d9140; }
.rounded-full { border-radius: 9999px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.p-4 { padding: 16px; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }

.back-icon {
  width: 18px;
  height: 18px;
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

.icon-size {
  width: 16px;
  height: 16px;
}

.info-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.mr-1 {
  margin-right: 4px;
}
</style> 