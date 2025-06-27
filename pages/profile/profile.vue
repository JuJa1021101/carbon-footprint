<template>
  <view class="container">
    <!-- 顶部个人信息卡片 -->
    <view class="card bg-white px-4 pt-10 pb-6 mb-5">
      <view class="flex items-center mb-4">
        <view class="avatar-container" @tap="chooseAvatar">
          <image :src="userInfo.avatar || '/static/images/user-avatar.jpg'" alt="用户头像" class="avatar-large"></image>
          <view class="avatar-edit-hint">
            <text class="text-xs text-white">点击修改头像</text>
          </view>
        </view>
        <view class="ml-4">
          <view class="flex items-center mb-1">
            <text class="text-lg font-bold mr-2">{{userInfo.nickname || '绿色先锋'}}</text>
            <view class="badge">Lv.{{userInfo.level || 4}}</view>
          </view>
          <text class="text-gray-500 text-sm">ID: {{userInfo.id || '10086420'}}</text>
        </view>
        <view class="ml-auto">
          <view class="flex px-3 py-0-5 rounded-full bg-gray-50" @tap="navigateToEdit">
            <text class="iconfont icon-edit text-gray-500"></text>
            <text class="text-sm text-gray-500 ml-2">编辑</text>
          </view>
        </view>
      </view>

      <view class="flex justify-around text-center mb-2 mt-2">
        <view>
          <text class="font-semibold">{{userInfo.ecoDays || 138}}</text>
          <view class="text-xs text-gray-500">环保日</view>
        </view>
        <view>
          <text class="font-semibold">{{userInfo.points || 485}}</text>
          <view class="text-xs text-gray-500">积分</view>
        </view>
        <view>
          <text class="font-semibold">{{userInfo.activities || 42}}</text>
          <view class="text-xs text-gray-500">活动</view>
        </view>
        <view>
          <text class="font-semibold">{{userInfo.followers || 89}}</text>
          <view class="text-xs text-gray-500">粉丝</view>
        </view>
      </view>
    </view>

    <!-- 环保证书 -->
    <view class="card bg-white px-4 py-3 mb-4">
      <view class="flex justify-between items-center mb-3">
        <text class="font-medium">我的环保证书</text>
        <view class="flex items-center">
          <text class="text-sm text-gray-500">查看全部</text>
          <text class="text-gray-400 ml-1">></text>
        </view>
      </view>

      <view class="flex justify-between">
        <view class="certificate-item">
          <view class="certificate-icon bg-green-50 text-green-500">
            <text class="iconfont icon-leaf"></text>
          </view>
          <text class="text-xs mt-1">垃圾分类</text>
        </view>
        
        <view class="certificate-item">
          <view class="certificate-icon bg-blue-50 text-blue-500">
            <text class="iconfont icon-water-drop"></text>
          </view>
          <text class="text-xs mt-1">节水达人</text>
        </view>
        
        <view class="certificate-item">
          <view class="certificate-icon bg-yellow-50 text-yellow-500">
            <text class="iconfont icon-bulb"></text>
          </view>
          <text class="text-xs mt-1">节能减排</text>
        </view>
        
        <view class="certificate-item">
          <view class="certificate-icon bg-purple-50 text-purple-500">
            <text class="iconfont icon-bicycle"></text>
          </view>
          <text class="text-xs mt-1">低碳出行</text>
        </view>
        
        <view class="certificate-item">
          <view class="certificate-icon bg-red-50 text-gray-300">
            <text class="iconfont icon-heart"></text>
          </view>
          <text class="text-xs mt-1">待解锁</text>
        </view>
      </view>
    </view>

    <!-- 环保成就 -->
    <view class="card bg-white px-4 py-3 mb-4">
      <view class="flex justify-between items-center mb-3">
        <text class="font-medium">我的环保成就</text>
        <view class="flex items-center">
          <text class="text-sm text-gray-500">查看全部</text>
          <text class="text-gray-400 ml-1">></text>
        </view>
      </view>

      <view class="bg-gray-50 p-3 rounded-lg">
        <view class="flex justify-between mb-1">
          <text class="text-sm">碳足迹减少量</text>
          <text class="text-sm font-medium">84.2kg</text>
        </view>
        <view class="progress-bar mb-3">
          <view class="progress" style="width: 75%"></view>
        </view>
        <text class="text-xs text-gray-500">您的减碳量超过了全市86%的用户</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card mb-4">
      <view class="menu-item" @tap="navigateToCheckinRecord">
        <view class="menu-icon bg-green-50">
          <image src="/static/images/menu/icon-checkin.png" class="menu-item-icon"></image>
        </view>
        <text>我的打卡</text>
        <view class="flex items-center ml-auto">
          <text class="text-gray-400 text-sm mr-1">已连续打卡28天</text>
          <text class="text-gray-400">></text>
        </view>
      </view>

      <view class="menu-item" @tap="navigateToAchievements">
        <view class="menu-icon bg-blue-50">
          <image src="/static/images/menu/icon-medal.png" class="menu-item-icon"></image>
        </view>
        <text>成就勋章</text>
        <view class="flex items-center ml-auto">
          <view class="badge-count mr-2">3</view>
          <text class="text-gray-400">></text>
        </view>
      </view>

      <view class="menu-item" @tap="navigateToOrders">
        <view class="menu-icon bg-yellow-50">
          <image src="/static/images/menu/icon-order.png" class="menu-item-icon"></image>
        </view>
        <text>订单管理</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @tap="navigateToFAQ">
        <view class="menu-icon bg-purple-50">
          <image src="/static/images/menu/icon-faq.png" class="menu-item-icon"></image>
        </view>
        <text>常见问题</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>

      <view class="menu-item" @tap="contactService">
        <view class="menu-icon bg-teal-50">
          <image src="/static/images/menu/icon-service.png" class="menu-item-icon"></image>
        </view>
        <text>联系客服</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>

      <view class="menu-item" @tap="navigateToSettings">
        <view class="menu-icon bg-gray-50">
          <image src="/static/images/menu/icon-settings.png" class="menu-item-icon"></image>
        </view>
        <text>设置</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { getUserPoints, getCurrentPoints } from '../../services/points.js';
import IconImage from '../../components/IconImage.vue';

// 用户信息数据
const userInfo = reactive({
  avatar: '/static/images/user-avatar.jpg',
  nickname: '绿色先锋',
  level: 4,
  id: '10086420',
  ecoDays: 138,
  points: getCurrentPoints(), // 使用积分服务的同步方法获取初始值
  activities: 42,
  followers: 89
});

// 选择头像
const chooseAvatar = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  });
};

// 上传头像到服务器（模拟）
const uploadAvatar = (filePath) => {
  // 实际开发中，这里应该调用上传接口将头像上传到服务器
  console.log('上传头像:', filePath);
  // 上传成功后更新用户信息
  uni.showToast({
    title: '头像更新成功',
    icon: 'success'
  });
};

// 跳转到编辑个人信息页面
const navigateToEdit = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  });
};

// 初始化用户信息
const initUserInfo = async () => {
  // 尝试从本地获取用户信息
  const localUserInfo = uni.getStorageSync('userInfo');
  if (localUserInfo) {
    try {
      const parsedInfo = JSON.parse(localUserInfo);
      Object.assign(userInfo, parsedInfo);
      
      // 在profile专用存储中保存用户信息，包含用户ID
      saveProfileUserInfo(userInfo);
    } catch (e) {
      console.error('解析本地用户信息失败', e);
    }
  } else {
    // 从数据库获取
    uniCloud.callFunction({
      name: 'getProfile',
      data: { account: userInfo.account }
    }).then(res => {
      if (res.result && res.result.code === 0 && res.result.data.userInfo) {
        const dbUserInfo = res.result.data.userInfo;
        
        // 更新本地用户信息
        userInfo.nickname = dbUserInfo.nickname || userInfo.nickname;
        userInfo.gender = dbUserInfo.gender || userInfo.gender;
        userInfo.avatar = dbUserInfo.avatar || userInfo.avatar;
        
        // 其他信息更新
        if (dbUserInfo.level) userInfo.level = dbUserInfo.level;
        if (dbUserInfo.id) userInfo.id = dbUserInfo.id;
        // 保存到本地
        uni.setStorageSync('userInfo', JSON.stringify(userInfo));
        
        // 在profile专用存储中保存用户信息，包含用户ID
        saveProfileUserInfo(userInfo);
      }
    }).catch(err => {
      console.error('获取用户信息失败', err);
    });
  }
  
  // 加载用户积分
  await loadUserPoints();
};

// 加载用户积分
const loadUserPoints = async () => {
  try {
    // 从积分服务获取最新积分
    const result = await getUserPoints(true); // 强制刷新
    if (result && result.success && result.data) {
      userInfo.points = result.data.points;
      console.log('个人页面更新积分:', userInfo.points);
    }
  } catch (error) {
    console.error('获取积分失败:', error);
  }
};

// 保存用户信息到profile专用存储
const saveProfileUserInfo = (userInfo) => {
  try {
    // 确保用户信息包含_id字段，以便其他页面可以使用
    const profileUser = {
      ...userInfo,
      _id: userInfo.id || '10086420',  // 使用id作为_id
      id: userInfo.id || '10086420'
    };
    
    // 保存到profileUser专用存储
    uni.setStorageSync('profileUser', JSON.stringify(profileUser));
    console.log('Saved user info to profileUser storage:', profileUser);
  } catch (error) {
    console.error('保存用户信息到profileUser失败:', error);
  }
};

// 监听用户信息更新事件
const handleUserInfoUpdate = (updatedInfo) => {
  if (updatedInfo) {
    Object.assign(userInfo, updatedInfo);
    // 更新profile专用存储
    saveProfileUserInfo(userInfo);
  }
};

// 监听积分更新事件
const handlePointsUpdate = (pointsData) => {
  if (pointsData && typeof pointsData.points !== 'undefined') {
    console.log('收到积分更新事件:', pointsData);
    userInfo.points = pointsData.points;
  }
};

onMounted(() => {
  initUserInfo();
  // 确保立即保存一次，以便其他页面可以使用
  saveProfileUserInfo(userInfo);
  // 监听全局的用户信息更新事件
  uni.$on('userInfoUpdated', handleUserInfoUpdate);
  // 监听积分更新事件
  uni.$on('userPointsUpdated', handlePointsUpdate);
});

onBeforeUnmount(() => {
  // 组件销毁前移除事件监听
  uni.$off('userInfoUpdated', handleUserInfoUpdate);
  uni.$off('userPointsUpdated', handlePointsUpdate);
});

// 跳转到设置页面
const navigateToSettings = () => {
  uni.navigateTo({
    url: '/pages/profile/settings'
  });
};

// 跳转到打卡记录页面
const navigateToCheckinRecord = () => {
  uni.navigateTo({
    url: '/pages/profile/checkin-record'
  });
};

// 跳转到成就勋章页面
const navigateToAchievements = () => {
  uni.navigateTo({
    url: '/pages/profile/achievements'
  });
};

// 跳转到订单管理页面
const navigateToOrders = () => {
  uni.navigateTo({
    url: '/pages/profile/orders'
  });
};

// 跳转到常见问题页面
const navigateToFAQ = () => {
  uni.navigateTo({
    url: '/pages/profile/faq'
  });
};

// 联系客服
const contactService = () => {
  // 微信小程序可使用微信客服接口
  uni.showToast({
    title: '正在接入客服',
    icon: 'none'
  });
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

.avatar-container {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-large {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar-edit-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px;
  text-align: center;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-edit-hint {
  opacity: 1;
}

.badge {
  border-radius: 16px;
  background-color: #4CAF50;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  font-weight: 500;
  display: inline-block;
}

.badge-count {
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

.menu-card {
  border-radius: 16px;
  background-color: white;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.certificate-item {
  text-align: center;
  padding: 0 4px;
}

.certificate-icon {
  font-size: 16px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.progress-bar {
  height: 6px;
  border-radius: 3px;
  background-color: rgba(76, 175, 80, 0.2);
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 3px;
  background-color: #4CAF50;
}

.space-left {
  margin-left: 12px;
}

/* 工具类 */
.px-4 { padding-left: 16px; padding-right: 16px; }
.pt-10 { padding-top: 40px; }
.pb-6 { padding-bottom: 24px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.p-3 { padding: 12px; }
.pb-2 { padding-bottom: 8px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-1-5 { padding-left: 6px; padding-right: 6px; }
.py-0-5 { padding-top: 2px; padding-bottom: 2px; }

.mb-5 { margin-bottom: 20px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.mr-2 { margin-right: 8px; }
.mr-1 { margin-right: 4px; }
.ml-4 { margin-left: 16px; }
.ml-2 { margin-left: 8px; }
.ml-auto { margin-left: auto; }
.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }
.mx-auto { margin-left: auto; margin-right: auto; }

.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-50 { background-color: #f0fdf4; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-yellow-50 { background-color: #fffbeb; }
.bg-purple-50 { background-color: #faf5ff; }
.bg-red-50 { background-color: #fef2f2; }
.bg-teal-50 { background-color: #e6fffa; }

.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-green-500 { color: #4CAF50; }
.text-blue-500 { color: #3b82f6; }
.text-yellow-500 { color: #f59e0b; }
.text-purple-500 { color: #8b5cf6; }
.text-red-500 { color: #ef4444; }
.text-teal-500 { color: #14b8a6; }
.text-white { color: #ffffff; }

.flex { display: flex; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-grow { flex-grow: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-center { justify-content: center; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.text-center { text-align: center; }

.relative { position: relative; }
.whitespace-nowrap { white-space: nowrap; }

.menu-item-icon {
  width: 24px;
  height: 24px;
}
</style> 