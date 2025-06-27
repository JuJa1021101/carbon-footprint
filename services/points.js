// 积分服务 - 统一管理用户积分信息
import { getCurrentUserFromProfile } from './login.js';

// 全局积分缓存
let cachedUserPoints = null;
let lastFetchTime = 0;

/**
 * 获取用户积分
 * @param {boolean} forceRefresh 是否强制刷新
 * @returns {Promise} 用户积分Promise
 */
export const getUserPoints = (forceRefresh = false) => {
  return new Promise(async (resolve) => {
    try {
      // 使用固定的默认用户ID
      const userId = '10086420';
      
      // 如果不是强制刷新，首先尝试从本地存储获取积分
      if (!forceRefresh) {
        try {
          const pointsStr = uni.getStorageSync('user_points');
          if (pointsStr) {
            const points = parseInt(pointsStr);
            console.log('从本地存储获取积分:', points);
            
            // 更新缓存
            cachedUserPoints = { points };
            lastFetchTime = Date.now();
            
            // 返回本地积分数据
            resolve({
              success: true,
              data: { points },
              source: 'local'
            });
            return;
          }
        } catch (localError) {
          console.error('从本地存储获取积分失败:', localError);
        }
        
        // 如果本地没有积分数据，但有缓存且未强制刷新且缓存时间小于30秒，直接返回缓存
      const now = Date.now();
      if (!forceRefresh && cachedUserPoints && (now - lastFetchTime < 30000)) {
        console.log('使用缓存的积分数据:', cachedUserPoints);
        resolve({
          success: true,
          data: cachedUserPoints,
          cached: true
        });
        return;
      }
      }
      
      // 从云数据库获取积分
      try {
        console.log('从云端获取积分，用户ID:', userId);
      // 调用云函数获取用户积分
      const { result } = await uniCloud.callFunction({
        name: 'getUserPoints',
        data: { userId }
      });

      if (result && result.success) {
          const cloudPoints = result.data.points || 1000;
          console.log('从云端获取的积分:', cloudPoints);
        
          // 更新本地缓存
          cachedUserPoints = { points: cloudPoints };
          lastFetchTime = Date.now();
          
          // 保存到本地存储
          try {
            uni.setStorageSync('user_points', cloudPoints.toString());
            console.log('云端积分已保存到本地:', cloudPoints);
          } catch (e) {
            console.error('保存积分到本地存储失败:', e);
          }
          
          // 广播积分更新
          uni.$emit('userPointsUpdated', { points: cloudPoints });
            
            resolve({
              success: true,
            data: { points: cloudPoints },
            source: 'cloud'
            });
            return;
        } else {
          console.error('云函数获取积分失败:', result);
          }
      } catch (cloudError) {
        console.error('调用云函数获取积分失败:', cloudError);
        }
        
      // 如果云端获取失败，使用默认值
      const defaultPoints = { points: 1000 };
      cachedUserPoints = defaultPoints;
      lastFetchTime = Date.now();
      
      // 保存默认积分到本地
      try {
        uni.setStorageSync('user_points', '1000');
        console.log('默认积分已保存到本地');
      } catch (e) {
        console.error('保存默认积分到本地失败:', e);
      }
      
      resolve({
        success: true,
        message: '使用默认积分',
        data: defaultPoints
        });
    } catch (error) {
      console.error('获取用户积分失败:', error);
      const fallbackData = cachedUserPoints || { points: 1000 };
      resolve({
        success: false,
        message: '获取积分失败，使用默认值',
        data: fallbackData
      });
    }
  });
};

/**
 * 更新用户积分缓存
 * @param {Object} pointsData 积分数据
 */
export const updatePointsCache = (pointsData) => {
  if (pointsData && typeof pointsData.points !== 'undefined') {
    cachedUserPoints = { ...pointsData };
    lastFetchTime = Date.now();
    console.log('积分缓存已更新:', cachedUserPoints);
    
    // 保存到本地存储，确保不同页面之间的一致性
    try {
      uni.setStorageSync('user_points', pointsData.points.toString());
      console.log('积分已保存到本地存储:', pointsData.points);
    } catch (e) {
      console.error('保存积分到本地存储失败:', e);
    }
    
    // 广播积分更新事件
    broadcastPointsUpdate(pointsData);
    
    return true;
  }
  return false;
};

/**
 * 广播积分更新事件
 * @param {Object} pointsData 积分数据
 */
const broadcastPointsUpdate = (pointsData) => {
  if (pointsData && typeof pointsData.points !== 'undefined') {
    // 通过全局事件通知所有页面积分已更新
    uni.$emit('userPointsUpdated', pointsData);
    console.log('已广播积分更新事件:', pointsData);
    
    // 同时更新用户信息中的积分
    try {
      // 获取当前用户
      const currentUser = getCurrentUserFromProfile();
      if (currentUser) {
        // 更新用户积分
        const updatedUser = { 
          ...currentUser, 
          points: pointsData.points 
        };
        
        // 保存回存储
        uni.setStorageSync('profileUser', JSON.stringify(updatedUser));
        console.log('用户信息中的积分已更新:', updatedUser);
        
        // 通知用户信息更新
        uni.$emit('userInfoUpdated', updatedUser);
      }
    } catch (error) {
      console.error('更新用户信息中的积分失败:', error);
    }
  }
};

/**
 * 获取当前用户积分（同步方法）
 * @returns {number} 用户积分
 */
export const getCurrentPoints = () => {
  // 首先尝试从本地存储获取积分
  try {
    const pointsStr = uni.getStorageSync('user_points');
    if (pointsStr) {
      return parseInt(pointsStr);
    }
  } catch (e) {
    console.error('从本地存储获取积分失败:', e);
  }
  
  // 尝试从缓存获取
  if (cachedUserPoints && typeof cachedUserPoints.points !== 'undefined') {
    return cachedUserPoints.points;
  }
  
  // 尝试从用户信息中获取
  try {
    const currentUser = getCurrentUserFromProfile();
    if (currentUser && typeof currentUser.points !== 'undefined') {
      return currentUser.points;
    }
  } catch (error) {
    console.error('从用户信息获取积分失败:', error);
  }
  
  // 返回默认值
  return 1000;
}; 