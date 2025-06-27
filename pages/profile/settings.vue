<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack">
          <icon-image name="back" size="22" color="#FFFFFF"></icon-image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">设置</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-card mb-4">
      <view class="menu-item" @tap="navigateToAddressManage">
        <view class="menu-icon bg-teal-50">
          <image src="/static/images/menu/icon-address.png" class="menu-item-icon"></image>
        </view>
        <text class="text-gray-700">地址管理</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>

      <view class="menu-item">
        <view class="menu-icon bg-blue-50">
          <image src="/static/images/menu/icon-feedback.png" class="menu-item-icon"></image>
        </view>
        <text class="text-gray-700">问题反馈</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>
      
      <view class="menu-item">
        <view class="menu-icon bg-purple-50">
          <image src="/static/images/menu/icon-about.png" class="menu-item-icon"></image>
        </view>
        <text class="text-gray-700">关于小程序</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>
      
      <view class="menu-item" @tap="navigateToAdminLogin">
        <view class="menu-icon bg-amber-50">
          <image src="/static/images/menu/icon-admin.png" class="menu-item-icon"></image>
        </view>
        <text class="text-gray-700">管理员模式</text>
        <view class="ml-auto">
          <text class="text-gray-400">></text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="px-4 mb-4">
      <button class="w-full py-3 rounded-full bg-white text-red-500" @tap="showLogoutConfirm">退出登录</button>
    </view>
    
    <!-- 版本信息 -->
    <view class="version-info text-center">
      <text class="text-gray-400 text-sm">环保先锋 v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { logout } from '../../services/login.js';
import IconImage from '../../components/IconImage.vue';

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到地址管理页面
const navigateToAddressManage = () => {
  uni.navigateTo({
    url: '/pages/profile/address'
  });
};

// 跳转到管理员登录页面
const navigateToAdminLogin = () => {
  // 预检查是否已登录，若已登录则直接跳转到控制台
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  
  // 直接跳转到登录页，简化逻辑
  uni.navigateTo({
    url: '/pages/admin/login',
    success: () => {
      console.log('成功导航到管理员登录页面');
    },
    fail: (err) => {
      console.error('导航到管理员登录页面失败:', err);
      // 导航失败时，尝试使用redirectTo
      uni.redirectTo({
        url: '/pages/admin/login',
        fail: (redirectErr) => {
          console.error('重定向到管理员登录页面也失败:', redirectErr);
          uni.showToast({
            title: '页面跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    }
  });
};

// 显示退出登录确认弹窗
const showLogoutConfirm = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出登录？',
    success: (res) => {
      if (res.confirm) {
        handleLogout();
      }
    }
  });
};

// 退出登录
const handleLogout = () => {
  // 显示加载中
  uni.showLoading({
    title: '退出中...'
  });
  
  setTimeout(() => {
    uni.hideLoading();
    
    // 调用退出登录服务
    logout();
    
    // 返回到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    });
  }, 1000);
};

onMounted(() => {
  console.log('设置页面加载');
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
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

.menu-card {
  margin-top: 20px;
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

.version-info {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
}

.bg-white { background-color: #ffffff; }
.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-700 { color: #374151; }
.text-red-500 { color: #ef4444; }
.text-teal-500 { color: #14b8a6; }
.text-blue-500 { color: #3b82f6; }
.text-purple-500 { color: #8b5cf6; }
.bg-teal-50 { background-color: #e6fffa; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-purple-50 { background-color: #faf5ff; }
.bg-amber-50 { background-color: #fff3e0; }
.bg-green-50 { background-color: #ecfdf5; }
.text-green-500 { color: #22c55e; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }

.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }

.mb-4 { margin-bottom: 16px; }
.ml-auto { margin-left: auto; }

.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.font-medium { font-weight: 500; }

.rounded-full { border-radius: 9999px; }
.w-full { width: 100%; }

.menu-item-icon {
  width: 24px;
  height: 24px;
}
</style> 