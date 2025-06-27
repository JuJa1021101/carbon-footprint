<template>
  <view class="container">
    <view class="login-box">
      <!-- Logo区域 -->
      <view class="logo-area">
        <image src="/static/images/app-icon.png" mode="aspectFit" class="logo"></image>
      </view>
      
      <!-- 手机号快捷登录按钮 -->
      <view class="login-btn-area">
        <button class="phone-login-btn" @tap="navigateToHome">
          <text class="icon-phone"></text>
          <text>手机号快捷登录</text>
        </button>
      </view>
      
      <!-- 其他登录方式分割线 -->
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>
      
      <!-- 模拟登录入口 -->
      <view class="mock-login" @tap="handleMockLogin">
        <text class="icon-mobile"></text>
        <text>模拟快捷登录</text>
      </view>
    </view>
    
    <!-- 默认底部区域 -->
    <view class="footer">
      <text class="copyright">© 2024 碳足迹 All Rights Reserved</text>
    </view>
  </view>
</template>

<script>
import { postLoginSimple } from '../../services/login.js';

export default {
  data() {
    return {
      phoneNumber: '18379364964', // 默认填入测试手机号
    }
  },
  methods: {
    // 直接导航到首页（手机号快捷登录）
    navigateToHome() {
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 保存登录状态
      uni.setStorageSync('login_status', 'loggedin');
      uni.setStorageSync('user_token', 'test_token');
      uni.setStorageSync('user_info', JSON.stringify({
        account: 'wx_user',
        avatar: '/static/images/avatars/default-avatar.png',
        id: 10086,
        mobile: '183****4964',
        nickname: '环保用户'
      }));
      
      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/home'
        });
      }, 1500);
    },
    
    // 处理模拟登录
    handleMockLogin() {
      // 直接使用默认手机号登录
      uni.showLoading({ title: '登录中...' });
      
      setTimeout(() => {
        uni.hideLoading();
        
        // 保存登录状态
        uni.setStorageSync('login_status', 'loggedin');
        uni.setStorageSync('user_token', 'test_token_' + Date.now());
        uni.setStorageSync('user_info', JSON.stringify({
          account: 'test_account',
          avatar: '/static/images/avatars/default-avatar.png',
          id: 10086420,
          mobile: '18379364964',
          nickname: '测试用户'
        }));
        
        // 跳转到首页
        uni.switchTab({
          url: '/pages/home/home'
        });
      }, 800);
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 20px;
}

/* Logo区域样式 */
.logo-area {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.logo {
  width: 120px;
  height: 120px;
}

/* 登录按钮区域样式 */
.login-btn-area {
  margin-bottom: 30px;
}

.phone-login-btn {
  background-color: #0BC3A0;
  color: #fff;
  border-radius: 50px;
  height: 45px;
  line-height: 45px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-phone {
  margin-right: 8px;
  font-size: 18px;
}

/* 分割线样式 */
.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before, .divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background-color: #e0e0e0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider-text {
  display: inline-block;
  padding: 0 10px;
  font-size: 14px;
  background-color: #fff;
  color: #999;
  position: relative;
  z-index: 1;
}

/* 模拟登录入口样式 */
.mock-login {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  margin: 0 auto;
}

.icon-mobile {
  font-size: 24px;
  margin-bottom: 5px;
}

/* 底部区域样式 */
.footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
}

.copyright {
  font-size: 12px;
  color: #999;
}
</style> 