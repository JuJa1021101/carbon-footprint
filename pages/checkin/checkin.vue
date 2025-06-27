<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="px-4 pt-10 pb-4 bg-white">
      <view class="flex items-center justify-between mb-4">
        <text class="text-xl font-bold">环保打卡</text>
        <view class="relative">
          <text class="iconfont icon-history text-gray-500"></text>
          <text class="badge-dot">3</text>
        </view>
      </view>
    </view>

    <!-- 环保积分状态 -->
    <view class="p-4 bg-white">
      <view class="flex items-center justify-between mb-4">
        <view>
          <text class="text-sm text-gray-500">我的环保积分</text>
          <view class="flex items-baseline">
            <text class="text-3xl font-bold mr-2">{{ userPoints }}</text>
            <text class="text-xs text-red-500">+{{ todayPoints }}</text>
          </view>
        </view>
        <view class="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs">
          {{ userLevel }}
        </view>
      </view>

      <view class="mb-2">
        <view class="flex justify-between text-sm mb-1">
          <text>升级进度</text>
          <text class="text-green-500">{{ userPoints }}/{{ nextLevelPoints }}</text>
        </view>
        <view class="progress-bar">
          <view class="progress" :style="{ width: progressWidth + '%' }"></view>
        </view>
      </view>
      <text class="text-xs text-gray-500">再获得{{ pointsNeeded }}积分即可升级到{{ nextLevel }}</text>
    </view>

    <!-- 标签筛选 -->
    <view class="px-4 py-3 bg-white border-b mt-2">
      <view class="flex justify-around">
        <view class="tab-btn active font-medium">
          <text>行为打卡</text>
          <view class="tab-indicator"></view>
        </view>
        <view class="tab-btn text-gray-500">我的记录</view>
      </view>
    </view>

    <!-- 打卡选项 -->
    <view class="p-4">
      <text class="text-lg font-semibold mb-4">今日可打卡项目</text>

      <!-- 垃圾分类打卡项 -->
      <view class="card bg-white shadow-sm mb-4">
        <view class="p-4 flex">
          <view class="badge-large mr-4">
            <text class="iconfont icon-trash text-2xl"></text>
            <text class="text-xs mt-1">+5分</text>
          </view>
          <view class="flex-grow">
            <text class="font-medium mb-1">垃圾分类打卡</text>
            <text class="text-sm text-gray-500 mb-2">拍照上传今日垃圾分类情况</text>
            <view class="flex">
              <text class="tag">日常任务</text>
              <text class="tag space-left">每日一次</text>
            </view>
          </view>
          <button class="btn-checkin text-sm self-center" @tap="handleCheckin(5, '垃圾分类')">打卡</button>
        </view>
      </view>

      <!-- 资源回收打卡项 -->
      <view class="card bg-white shadow-sm mb-4">
        <view class="p-4 flex">
          <view class="badge-large mr-4">
            <text class="iconfont icon-recycle text-2xl"></text>
            <text class="text-xs mt-1">+10分</text>
          </view>
          <view class="flex-grow">
            <text class="font-medium mb-1">资源回收打卡</text>
            <text class="text-sm text-gray-500 mb-2">可回收物品(纸箱、塑料瓶等)回收</text>
            <view class="flex">
              <text class="tag">进阶任务</text>
              <text class="tag space-left">每周三次</text>
            </view>
          </view>
          <button class="btn-checkin text-sm self-center" @tap="handleCheckin(10, '资源回收')">打卡</button>
        </view>
      </view>

      <!-- 低碳出行打卡项 -->
      <view class="card bg-white shadow-sm mb-4">
        <view class="p-4 flex">
          <view class="badge-large mr-4">
            <text class="iconfont icon-bicycle text-2xl"></text>
            <text class="text-xs mt-1">+15分</text>
          </view>
          <view class="flex-grow">
            <text class="font-medium mb-1">低碳出行打卡</text>
            <text class="text-sm text-gray-500 mb-2">选择步行、自行车或公共交通出行</text>
            <view class="flex">
              <text class="tag">进阶任务</text>
              <text class="tag space-left">每日一次</text>
            </view>
          </view>
          <button class="btn-checkin-outline text-sm self-center">已打卡</button>
        </view>
      </view>

      <!-- 节能减排打卡项 -->
      <view class="card bg-white shadow-sm mb-4">
        <view class="p-4 flex">
          <view class="badge-large-disabled mr-4">
            <text class="iconfont icon-bolt text-2xl"></text>
            <text class="text-xs mt-1">+8分</text>
          </view>
          <view class="flex-grow">
            <text class="font-medium text-gray-400 mb-1">节能减排打卡</text>
            <text class="text-sm text-gray-400 mb-2">一小时不使用电器，节约用电</text>
            <view class="flex">
              <text class="tag-disabled">日常任务</text>
              <text class="tag-disabled space-left">每日一次</text>
            </view>
          </view>
          <text class="text-xs text-gray-400 self-center">明日可打卡</text>
        </view>
      </view>

      <!-- 查看更多按钮 -->
      <view class="text-center mt-6">
        <button class="text-green-500 border border-green-500 rounded-full px-6 py-2 text-sm">
          查看更多打卡项目
          <text class="iconfont icon-down ml-1"></text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getUserPoints, updatePointsCache } from '../../services/points.js';

// 用户积分
const userPoints = ref(300);
const todayPoints = ref(15);

// 用户等级信息
const userLevelInfo = {
  1: { name: '环保新手 Lv.1', nextLevel: '环保学徒Lv.2', threshold: 100 },
  2: { name: '环保学徒 Lv.2', nextLevel: '环保达人Lv.3', threshold: 300 },
  3: { name: '环保达人 Lv.3', nextLevel: '环保先锋Lv.4', threshold: 500 },
  4: { name: '环保先锋 Lv.4', nextLevel: '环保大使Lv.5', threshold: 800 },
  5: { name: '环保大使 Lv.5', nextLevel: '环保使者Lv.6', threshold: 1200 }
};

// 计算当前等级
const currentLevel = computed(() => {
  if (userPoints.value < 100) return 1;
  if (userPoints.value < 300) return 2;
  if (userPoints.value < 500) return 3;
  if (userPoints.value < 800) return 4;
  return 5;
});

// 用户等级显示
const userLevel = computed(() => {
  return userLevelInfo[currentLevel.value].name;
});

// 下一等级名称
const nextLevel = computed(() => {
  return userLevelInfo[currentLevel.value].nextLevel;
});

// 下一等级所需积分
const nextLevelPoints = computed(() => {
  return userLevelInfo[currentLevel.value].threshold;
});

// 升级还需积分
const pointsNeeded = computed(() => {
  return Math.max(0, nextLevelPoints.value - userPoints.value);
});

// 进度条宽度百分比
const progressWidth = computed(() => {
  // 当前等级的起始积分
  let startPoints = 0;
  if (currentLevel.value > 1) {
    startPoints = userLevelInfo[currentLevel.value - 1].threshold;
  }
  
  // 计算在当前等级内的进度百分比
  const levelRange = nextLevelPoints.value - startPoints;
  const currentProgress = userPoints.value - startPoints;
  return Math.min(100, Math.max(0, (currentProgress / levelRange) * 100));
});

// 初始化数据
onMounted(async () => {
  // 加载用户积分
  await loadUserPoints();
  
  // 监听积分更新事件
  uni.$on('userPointsUpdated', handlePointsUpdate);
});

onBeforeUnmount(() => {
  // 组件销毁前移除事件监听
  uni.$off('userPointsUpdated', handlePointsUpdate);
});

// 加载用户积分
const loadUserPoints = async () => {
  try {
    const result = await getUserPoints(true); // 强制刷新
    if (result && result.success && result.data) {
      userPoints.value = result.data.points;
      console.log('打卡页面更新积分:', userPoints.value);
    }
  } catch (error) {
    console.error('获取积分失败:', error);
  }
};

// 监听积分更新事件
const handlePointsUpdate = (pointsData) => {
  if (pointsData && typeof pointsData.points !== 'undefined') {
    console.log('打卡页面收到积分更新事件:', pointsData);
    userPoints.value = pointsData.points;
  }
};

// 处理打卡
const handleCheckin = async (points, type) => {
  try {
    uni.showLoading({ title: '正在打卡...' });
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新今日获取的积分
    todayPoints.value += points;
    
    // 调用积分更新云函数
    const { result } = await uniCloud.callFunction({
      name: 'updateUserPoints',
      data: {
        userId: '10086420', // 使用固定的默认用户ID
        pointsChange: points,
        reason: `${type}打卡`
      }
    });
    
    uni.hideLoading();
    
    if (result && result.success) {
      console.log('打卡成功，积分更新结果:', result);
      
      // 使用云函数返回的积分值更新本地显示
      if (result.data && result.data.current_points !== undefined) {
        const newPoints = result.data.current_points;
    userPoints.value = newPoints;
    
    // 更新积分缓存，这会自动广播到其他页面
    updatePointsCache({ points: newPoints });
    
        // 更新本地存储中的积分
        try {
          uni.setStorageSync('user_points', newPoints.toString());
          console.log('打卡后更新本地积分存储:', newPoints);
        } catch (e) {
          console.error('保存积分到本地存储失败:', e);
        }
      }
      
    uni.showToast({
      title: '打卡成功',
      icon: 'success'
    });
    } else {
      console.error('打卡失败，积分更新失败:', result);
      uni.showToast({
        title: '打卡失败，请重试',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('打卡失败:', error);
    uni.showToast({
      title: '打卡失败，请重试',
      icon: 'none'
    });
  }
};
</script>

<style>
.container {
  background-color: #f8f9fa;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: #333;
  padding-bottom: 80px;
}

.card {
  border-radius: 16px;
  overflow: hidden;
}

.badge-large {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f1f9f2;
  color: #4CAF50;
}

.badge-large-disabled {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #9ca3af;
}

.badge-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background-color: #ef4444;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar {
  height: 6px;
  border-radius: 3px;
  background-color: #e9ecef;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 3px;
  background-color: #4CAF50;
}

.tab-btn {
  position: relative;
  padding-bottom: 10px;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #4CAF50;
  border-radius: 3px;
}

.btn-checkin {
  background-color: #4CAF50;
  color: white;
  border-radius: 24px;
  padding: 12px 32px;
  font-weight: 600;
}

.btn-checkin-outline {
  border: 1px solid #4CAF50;
  color: #4CAF50;
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 600;
  background-color: white;
}

.tag {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  display: inline-block;
}

.tag-disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  display: inline-block;
}

.space-left {
  margin-left: 8px;
}

/* 工具类 */
.px-4 { padding-left: 16px; padding-right: 16px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }

.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.mr-4 { margin-right: 16px; }
.mr-2 { margin-right: 8px; }
.mr-1 { margin-right: 4px; }
.ml-auto { margin-left: auto; }
.ml-1 { margin-left: 4px; }
.mt-6 { margin-top: 24px; }
.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-50 { background-color: #f0fdf4; }

.text-3xl { font-size: 30px; }
.text-2xl { font-size: 24px; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-green-500 { color: #4CAF50; }
.text-green-600 { color: #4CAF50; }
.text-red-500 { color: #ef4444; }
.text-white { color: #ffffff; }

.flex { display: flex; }
.flex-grow { flex-grow: 1; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-center { justify-content: center; }
.self-center { align-self: center; }

.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
.border { border-width: 1px; border-style: solid; }
.border-green-500 { border-color: #4CAF50; }

.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 8px; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.relative { position: relative; }
.absolute { position: absolute; }
.top-0 { top: 0; }
.right-0 { right: 0; }
</style> 