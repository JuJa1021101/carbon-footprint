// 登录服务

/**
 * 微信小程序登录
 * @param {Object} data 登录参数
 * @param {string} data.code 登录凭证
 * @param {string} [data.encryptedData] 加密数据
 * @param {string} [data.iv] 加密算法参数
 * @returns {Promise} 登录结果Promise
 */
export const postLoginWxMin = (data) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '登录中...' });
    // 实际应该调用云函数，这里模拟
    setTimeout(() => {
      uni.hideLoading();
      // 模拟登录成功
      const result = {
        account: 'wx_' + Math.random().toString(36).slice(-8),
        avatar: '/static/images/avatars/avatar-user2.jpg',
        id: 'current_user',
        mobile: data.encryptedData ? '183****4964' : '', // 脱敏手机号
        nickname: '绿色先锋',
        token: 'token_' + Math.random().toString(36).slice(-16)
      };
      
      // 保存登录状态和用户信息
      uni.setStorageSync('login_status', 'loggedin');
      uni.setStorageSync('user_token', result.token);
      uni.setStorageSync('user_info', JSON.stringify(result));
      
      resolve(result);
    }, 1000);
  });
};

/**
 * 模拟登录（开发测试用）
 * @param {string} phoneNumber 手机号
 * @returns {Promise} 登录结果Promise
 */
export const postLoginSimple = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '登录中...' });
    
    // 验证手机号
    if (phoneNumber !== '18379364964') {
      uni.hideLoading();
      uni.showToast({ title: '请使用测试手机号登录', icon: 'none' });
      reject(new Error('请使用测试手机号登录'));
      return;
    }
    
    // 模拟请求延时
    setTimeout(() => {
      uni.hideLoading();
      // 用户信息
      const result = {
        account: 'Dawn99',
        avatar: '/static/images/avatars/avatar-user2.jpg',
        id: 'current_user',
        mobile: '18379364964',
        nickname: '绿色先锋',
        token: 'token_' + Date.now()
      };
      
      // 保存登录状态
      uni.setStorageSync('login_status', 'loggedin');
      uni.setStorageSync('user_token', result.token);
      uni.setStorageSync('user_info', JSON.stringify(result));
      
      resolve(result);
    }, 800);
  });
};

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
export const checkLoginStatus = () => {
  const status = uni.getStorageSync('login_status');
  const token = uni.getStorageSync('user_token');
  return status === 'loggedin' && !!token;
};

/**
 * 获取当前登录用户
 * @returns {Object} 当前登录用户信息
 */
export const getCurrentUser = () => {
  // 从缓存中获取用户信息
  try {
    // 首先尝试从profileUser获取
    const profileUser = uni.getStorageSync('profileUser');
    if (profileUser) {
      try {
        const user = typeof profileUser === 'string' ? JSON.parse(profileUser) : profileUser;
        console.log('getCurrentUser: 从profileUser获取用户:', user);
        return user;
      } catch (e) {
        console.error('解析profileUser失败:', e);
      }
    }
    
    // 然后尝试从userInfo获取
    const userInfoStr = uni.getStorageSync('userInfo');
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        console.log('getCurrentUser: 从userInfo获取用户:', user);
        return user;
      } catch (e) {
        console.error('解析userInfo失败:', e);
      }
    }
    
    // 最后尝试从user_info获取
    const user_info = uni.getStorageSync('user_info');
    if (user_info) {
      try {
        const user = typeof user_info === 'string' ? JSON.parse(user_info) : user_info;
        console.log('getCurrentUser: 从user_info获取用户:', user);
        return user;
      } catch (e) {
        console.error('解析user_info失败:', e);
      }
    }
  } catch (e) {
    console.error('获取用户信息失败', e);
  }
  
  // 返回默认用户信息
  const defaultUser = {
    _id: '10086420',
    id: '10086420',
    nickname: '绿色先锋',
    avatar: '/static/images/avatars/default-avatar.png',
    level: 4
  };
  console.log('getCurrentUser: 返回默认用户:', defaultUser);
  return defaultUser;
};

/**
 * 从profile页面获取用户信息（包含ID）
 * @returns {Object} 从profile页面获取的用户信息
 */
export const getCurrentUserFromProfile = () => {
  try {
    // 尝试多种可能的存储位置
    let userInfo = null;
    
    // 1. 尝试获取用户信息从profile页面
    const profileUser = uni.getStorageSync('profileUser');
    if (profileUser) {
      try {
        userInfo = typeof profileUser === 'string' ? JSON.parse(profileUser) : profileUser;
        console.log('getCurrentUserFromProfile: 从profileUser获取用户:', userInfo);
        // 确保有_id字段
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
    } catch (e) {
        console.error('解析profileUser失败:', e);
    }
  }
  
    // 2. 从userInfo获取
    const localUserInfo = uni.getStorageSync('userInfo');
    if (localUserInfo) {
    try {
        userInfo = typeof localUserInfo === 'string' ? JSON.parse(localUserInfo) : localUserInfo;
        console.log('getCurrentUserFromProfile: 从userInfo获取用户:', userInfo);
        // 确保有_id字段
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        console.error('解析userInfo失败:', e);
      }
    }
    
    // 3. 从user_info获取
    const userInfoStr = uni.getStorageSync('user_info');
    if (userInfoStr) {
      try {
        userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;
        console.log('getCurrentUserFromProfile: 从user_info获取用户:', userInfo);
        // 确保有_id字段
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        console.error('解析user_info失败:', e);
      }
    }
    
    // 4. 从member_info获取
    const memberInfo = uni.getStorageSync('member_info');
    if (memberInfo) {
      try {
        userInfo = typeof memberInfo === 'string' ? JSON.parse(memberInfo) : memberInfo;
        console.log('getCurrentUserFromProfile: 从member_info获取用户:', userInfo);
        // 确保有_id字段
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
    } catch (e) {
        console.error('解析member_info失败:', e);
    }
  }
  
    // 如果没有找到用户信息，返回默认用户
    const defaultUser = {
      _id: '10086420',
      id: '10086420',
      nickname: '绿色先锋',
      avatar: '/static/images/avatars/default-avatar.png',
      level: 4,
      points: 1000
    };
    console.log('getCurrentUserFromProfile: 返回默认用户:', defaultUser);
    return defaultUser;
  } catch (error) {
    console.error('获取用户信息失败', error);
    return {
      _id: '10086420',
      id: '10086420',
      nickname: '绿色先锋',
      avatar: '/static/images/avatars/default-avatar.png',
      level: 4,
      points: 1000
    };
  }
};

/**
 * 退出登录
 */
export const logout = () => {
  uni.removeStorageSync('login_status');
  uni.removeStorageSync('user_token');
  uni.removeStorageSync('user_info');
}; 