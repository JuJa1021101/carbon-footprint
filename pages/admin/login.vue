<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">管理员登录</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 登录区域 -->
    <view class="login-container">
      <!-- 小程序头像 -->
      <view class="logo-container">
        <image src="/static/images/app-icon.png" class="app-logo" mode="aspectFill"></image>
        <text class="app-name">环保先锋管理系统</text>
      </view>
      
      <!-- 登录表单 -->
      <view class="login-form">
        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont icon-user text-green-500"></text>
          </view>
          <input 
            type="text" 
            v-model="username" 
            placeholder="请输入管理员账号" 
            class="login-input"
            placeholder-class="placeholder"
          />
        </view>
        
        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont icon-lock text-green-500"></text>
          </view>
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入管理员密码" 
            class="login-input"
            placeholder-class="placeholder"
            password
          />
        </view>
        
        <view class="mt-8">
          <button 
            class="login-button"
            :disabled="!username || !password"
            :class="{ 'login-button-disabled': !username || !password }"
            @tap="handleLogin"
          >
            登录
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 账号密码
const username = ref('');
const password = ref('');

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 处理登录
const handleLogin = () => {
  // 验证用户名密码
  if (!username.value || !password.value) {
    uni.showToast({
      title: '请输入账号和密码',
      icon: 'none'
    });
    return;
  }
  
  // 检查是否是管理员账号
  if (username.value === 'admin' && password.value === '1021101') {
    // 保存完整的登录状态
    uni.setStorageSync('admin_login_status', 'loggedin');
    uni.setStorageSync('admin_id', 'admin');
    uni.setStorageSync('admin_username', username.value);
    uni.setStorageSync('admin_login_time', Date.now());
    
    // 显示登录成功
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });
    
    // 登录成功后跳转到管理员控制台
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/admin/dashboard'
      });
    }, 1500);
  } else {
    uni.showToast({
      title: '账号或密码错误',
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

.login-container {
  padding: 40px 30px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
}

.app-logo {
  width: 100px;
  height: 100px;
  border-radius: 20px;
}

.app-name {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.login-form {
  padding: 0 10px;
}

.input-group {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
}

.input-icon {
  margin-right: 10px;
}

.login-input {
  flex: 1;
  height: 40px;
  font-size: 16px;
}

.placeholder {
  color: #c0c0c0;
}

.login-button {
  width: 100%;
  height: 48px;
  line-height: 48px;
  text-align: center;
  background-color: #4CAF50;
  color: white;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
}

.login-button-disabled {
  background-color: #9ed1a1;
}

.text-white { color: #ffffff; }
.text-green-500 { color: #4CAF50; }

.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.text-center { text-align: center; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.mt-8 { margin-top: 32px; }

.back-icon {
  width: 18px;
  height: 18px;
}
</style> 