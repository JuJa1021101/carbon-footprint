<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">添加环保活动</text>
        </view>
        <view>
          <button 
            class="publish-btn text-white text-sm bg-green-500 rounded-full px-4 py-1"
            :disabled="!canPublish"
            :class="{'bg-gray-300': !canPublish}"
            @tap="publishActivity">
            发布
          </button>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="p-4">
      <!-- 活动标题 -->
      <input 
        v-model="title"
        class="w-full p-3 bg-white rounded-lg mb-4"
        placeholder="请输入活动标题"
        maxlength="100"
      />
      
      <!-- 活动描述 -->
      <textarea 
        v-model="description" 
        class="w-full p-3 bg-white rounded-lg mb-4" 
        placeholder="请输入活动描述..." 
        maxlength="1000"
        auto-height>
      </textarea>
      
      <!-- 活动时间 -->
      <view class="flex items-center w-full p-3 bg-white rounded-lg mb-4">
        <IconImage name="calendar" :size="18" class="mr-2" />
        <input 
          v-model="activityTime"
          class="flex-1"
          placeholder="请输入活动时间，如：2023-10-01 14:00至18:00"
          maxlength="100"
        />
      </view>
      
      <!-- 活动地点 -->
      <view class="flex items-center w-full p-3 bg-white rounded-lg mb-4">
        <IconImage name="location" :size="18" class="mr-2" />
        <input 
          v-model="location"
          class="flex-1"
          placeholder="请输入活动地点"
          maxlength="200"
        />
      </view>
      
      <!-- 活动状态 -->
      <view class="status-selector w-full p-3 bg-white rounded-lg mb-4">
        <picker 
          @change="onStatusChange" 
          :value="statusIndex" 
          :range="statusOptions">
          <view class="picker-content">
            <text class="picker-text">{{ statusOptions[statusIndex] }}</text>
            <IconImage name="right" :size="16" />
          </view>
        </picker>
      </view>
      
      <!-- 活动积分 -->
      <input 
        v-model="point"
        class="w-full p-3 bg-white rounded-lg mb-4"
        placeholder="请输入活动完成可获得的积分数量"
        type="number"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addActivity } from '../../services/activity.js';
import IconImage from '../../components/IconImage.vue';

// 活动信息
const title = ref('');
const description = ref('');
const activityTime = ref('');
const location = ref('');
const statusIndex = ref(0);
const statusOptions = ['报名中', '未开始', '已结束'];
const point = ref('0');

// 是否可以发布
const canPublish = computed(() => {
  return title.value.trim().length > 0 && 
         description.value.trim().length > 0 && 
         activityTime.value.trim().length > 0 && 
         location.value.trim().length > 0;
});

// 状态选择变化
const onStatusChange = (e) => {
  statusIndex.value = e.detail.value;
};

// 返回上一页
const goBack = () => {
  uni.showModal({
    title: '提示',
    content: '是否放弃发布？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};

// 发布活动
const publishActivity = async () => {
  // 验证内容
  if (!canPublish.value) {
    uni.showToast({
      title: '请完善必填信息',
      icon: 'none'
    });
    return;
  }
  
  try {
    const activityData = {
      title: title.value,
      description: description.value,
      activity_time: activityTime.value,
      location: location.value,
      status: statusOptions[statusIndex.value],
      point: parseInt(point.value) || 0
    };
    
    const result = await addActivity(activityData);
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    });
    
    // 延时返回，让用户看到发布成功提示
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.showToast({
      title: error.message || '发布失败',
      icon: 'none'
    });
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.publish-btn {
  border: none;
  min-width: 70px;
  line-height: 1.8;
}

.status-selector {
  box-sizing: border-box;
}

.picker-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-text {
  color: #333;
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.bg-green-500 { background-color: #4CAF50; }
.bg-gray-300 { background-color: #d1d5db; }
.text-white { color: #ffffff; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-900 { color: #111827; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.font-medium { font-weight: 500; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.w-full { width: 100%; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.text-center { text-align: center; }

.back-icon {
  width: 18px;
  height: 18px;
}

.mr-2 {
  margin-right: 8px;
}
</style> 