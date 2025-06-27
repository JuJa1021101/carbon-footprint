/**
 * 用户活动相关服务
 */
import { getCurrentUser } from './login.js';

// 存储用户报名和打卡状态的本地缓存键名
const USER_ACTIVITY_STATUS_KEY = 'user_activity_status';

// 添加本地备用数据，在API调用失败时使用
const FALLBACK_ACTIVITIES = [
  {
    _id: 'activity1',
    title: '城市河道清洁志愿行动',
    description: '一起行动，清洁我们的城市河道，保护水资源',
    location: '城东河滨公园',
    activity_time: '6月15日 09:00',
    status: '报名中',
    point: 100
  },
  {
    _id: 'activity2',
    title: '废旧电池回收换礼品',
    description: '回收旧电池，保护环境，还能换取环保小礼品',
    location: '市民服务中心',
    activity_time: '6月1日-30日',
    status: '进行中',
    point: 50
  },
  {
    _id: 'activity3',
    title: '图书馆整理书籍',
    description: '将书按类别归纳，放在书架上。',
    location: '东华理工大学',
    activity_time: '2025年6月19日',
    status: '未开始',
    point: 80
  }
];

/**
 * 获取所有活动列表
 * @param {Boolean} sort 是否按状态排序
 * @returns {Promise} 包含活动列表数据的Promise
 */
export const getActivities = (sort = true) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '加载中...' });
    
    // 尝试从云函数获取数据
    try {
      uniCloud.callFunction({
        name: 'getActivities',
      }).then(res => {
        uni.hideLoading();
        if (res.result && res.result.code === 0) {
          let activities = res.result.data;
          
          // 如果活动列表为空，使用备用数据
          if (!activities || activities.length === 0) {
            console.log('云函数返回的活动列表为空，使用备用数据');
            activities = FALLBACK_ACTIVITIES;
          }
          
          processActivities(activities, sort, resolve);
        } else {
          console.error('云函数返回异常:', res);
          console.log('使用备用数据');
          processActivities(FALLBACK_ACTIVITIES, sort, resolve);
        }
      }).catch(err => {
        uni.hideLoading();
        console.error('调用云函数失败:', err);
        console.log('使用备用数据');
        processActivities(FALLBACK_ACTIVITIES, sort, resolve);
      });
    } catch (error) {
      uni.hideLoading();
      console.error('调用云函数出现异常:', error);
      console.log('使用备用数据');
      processActivities(FALLBACK_ACTIVITIES, sort, resolve);
    }
  });
};

/**
 * 处理活动数据：排序和添加用户状态
 * @param {Array} activities 活动数据
 * @param {Boolean} sort 是否排序
 * @param {Function} resolve Promise的resolve函数
 */
const processActivities = (activities, sort, resolve) => {
  // 如果需要排序，按照状态排序：进行中 > 报名中 > 未开始 > 已结束 > 已完成
  if (sort && activities.length > 0) {
    // 获取用户活动状态
    const userActivityStatus = getUserActivityStatus();
    
    activities.sort((a, b) => {
      // 先检查是否已完成（已打卡）
      const aCheckedIn = userActivityStatus[a._id]?.isCheckedIn || false;
      const bCheckedIn = userActivityStatus[b._id]?.isCheckedIn || false;
      
      if (aCheckedIn && !bCheckedIn) return 1; // a已完成，排在后面
      if (!aCheckedIn && bCheckedIn) return -1; // b已完成，排在后面
      
      // 再检查是否已报名（进行中）
      const aEnrolled = userActivityStatus[a._id]?.isEnrolled || false;
      const bEnrolled = userActivityStatus[b._id]?.isEnrolled || false;
      
      if (aEnrolled && !bEnrolled) return -1; // a进行中，排在前面
      if (!aEnrolled && bEnrolled) return 1; // b进行中，排在前面
      
      // 最后按照原始状态排序
      const statusOrder = {
        '进行中': 0,
        '报名中': 1,
        '未开始': 2,
        '已结束': 3
      };
      
      const aStatusValue = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 999;
      const bStatusValue = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 999;
      
      return aStatusValue - bStatusValue;
    });
  }
  
  // 获取用户的活动状态并应用到活动列表
  const userActivityStatus = getUserActivityStatus();
  const activitiesWithStatus = activities.map(activity => {
    const status = userActivityStatus[activity._id] || {};
    return {
      ...activity,
      isEnrolled: status.isEnrolled || false,
      isCheckedIn: status.isCheckedIn || false
    };
  });
  
  resolve(activitiesWithStatus);
};

/**
 * 获取前两个活动（首页展示用）
 * @returns {Promise} 包含前两个活动的Promise
 */
export const getTopActivities = () => {
  return new Promise((resolve, reject) => {
    console.log('开始获取首页置顶活动...');
    // 获取活动列表并强制按状态和时间排序
    getActivities(true)
      .then(activities => {
        console.log('获取到活动列表，总数:', activities.length);
        
        if (!activities || activities.length === 0) {
          console.log('没有获取到活动，将使用备用数据');
          resolve(FALLBACK_ACTIVITIES.slice(0, 2));
          return;
        }
        
        // 确保活动按正确的优先级排序
        // 首先根据活动状态排序: 进行中 > 报名中 > 未开始 > 已结束
        activities.sort((a, b) => {
          // 获取状态排序优先级
          const getStatusPriority = (activity) => {
            if (activity.isEnrolled && !activity.isCheckedIn) return 0; // 进行中（已报名未打卡）
            if (activity.status === '报名中') return 1; // 报名中
            if (activity.status === '未开始') return 2; // 未开始
            if (activity.status === '已结束') return 3; // 已结束
            if (activity.isCheckedIn) return 4; // 已完成（已打卡）
            return 5; // 其他
          };
          
          const aPriority = getStatusPriority(a);
          const bPriority = getStatusPriority(b);
          
          // 优先按状态排序
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // 如果状态相同，则按活动时间排序（近期的排前面）
          if (a.activity_time && b.activity_time) {
            return new Date(a.activity_time) - new Date(b.activity_time);
          }
          
          return 0;
        });
        
        // 只返回前两个活动
        console.log('排序后的活动顺序:', activities.map(a => `${a.title} (${a.status}${a.isEnrolled ? '/已报名' : ''}${a.isCheckedIn ? '/已打卡' : ''})`));
        const topActivities = activities.slice(0, 2);
        console.log('首页将显示的活动:', topActivities.map(a => a.title));
        resolve(topActivities);
      })
      .catch(err => {
        console.error('获取活动列表失败，将使用备用数据:', err);
        resolve(FALLBACK_ACTIVITIES.slice(0, 2));
      });
  });
};

/**
 * 用户报名活动
 * @param {String} activityId 活动ID
 * @returns {Promise} 报名结果Promise
 */
export const enrollActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    // 检查用户登录状态
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('请先登录'));
      return;
    }
    
    // 获取当前用户活动状态
    const userActivityStatus = getUserActivityStatus();
    
    // 设置该活动为已报名
    userActivityStatus[activityId] = {
      ...(userActivityStatus[activityId] || {}),
      isEnrolled: true,
      enrolledAt: new Date().toISOString()
    };
    
    // 保存状态
    saveUserActivityStatus(userActivityStatus);
    
    // 模拟网络请求
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

/**
 * 用户打卡活动
 * @param {String} activityId 活动ID
 * @param {Number} points 活动积分
 * @returns {Promise} 打卡结果Promise
 */
export const checkInActivity = (activityId, points) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 检查用户登录状态
      const user = getCurrentUser();
      if (!user) {
        reject(new Error('请先登录'));
        return;
      }
      
      // 使用固定的默认用户ID
      const userId = '10086420';
      
      // 获取当前用户活动状态
      const userActivityStatus = getUserActivityStatus();
      
      // 检查是否已报名
      if (!userActivityStatus[activityId]?.isEnrolled) {
        reject(new Error('请先报名该活动'));
        return;
      }
      
      // 检查是否已打卡
      if (userActivityStatus[activityId]?.isCheckedIn) {
        reject(new Error('您已经完成打卡'));
        return;
      }
      
      // 设置该活动为已打卡
      userActivityStatus[activityId] = {
        ...userActivityStatus[activityId],
        isCheckedIn: true,
        checkedInAt: new Date().toISOString()
      };
      
      // 保存状态
      saveUserActivityStatus(userActivityStatus);
      
      // 直接调用云函数更新积分
      console.log('开始更新积分，活动ID:', activityId, '积分:', points);
      uni.showLoading({ title: '更新积分中...' });
      
      // 记录更新前的积分，以便在失败时回滚
      let originalPoints;
      try {
        const pointsStr = uni.getStorageSync('user_points');
        originalPoints = pointsStr ? parseInt(pointsStr) : 0;
      } catch (e) {
        console.error('获取原始积分失败:', e);
      }
      
      try {
        const { result } = await uniCloud.callFunction({
          name: 'updateUserPoints',
          data: {
            userId: userId, // 使用固定的默认用户ID
            pointsChange: points,
            reason: `完成活动"${activityId}"打卡`
          }
        });
        
        uni.hideLoading();
        
        if (result && result.success) {
          console.log('积分更新成功:', result);
          
          // 获取更新后的积分
          const newPoints = result.data.current_points;
          
          // 更新本地积分缓存
          try {
            uni.setStorageSync('user_points', newPoints.toString());
            console.log('本地积分已更新为:', newPoints);
            
            // 广播积分更新事件
            uni.$emit('userPointsUpdated', { points: newPoints });
          } catch (e) {
            console.error('保存积分到本地存储失败:', e);
          }
          
          resolve({ 
            success: true, 
            points: points,
            totalPoints: newPoints
          });
        } else {
          console.error('积分更新失败:', result);
          uni.showToast({
            title: '积分更新失败',
            icon: 'none'
          });
          reject(new Error('积分更新失败'));
        }
      } catch (error) {
        uni.hideLoading();
        console.error('调用云函数更新积分失败:', error);
        
        // 尝试恢复原始积分
        if (originalPoints !== undefined) {
          try {
            uni.setStorageSync('user_points', originalPoints.toString());
          } catch (e) {
            console.error('恢复原始积分失败:', e);
          }
        }
        
        uni.showToast({
          title: '积分更新失败',
          icon: 'none'
        });
        reject(new Error('积分更新失败，请稍后重试'));
      }
    } catch (error) {
      uni.hideLoading();
      console.error('打卡过程中发生错误:', error);
      reject(new Error('打卡失败，请稍后重试'));
    }
  });
};

/**
 * 获取用户活动状态
 * @returns {Object} 用户活动状态对象
 */
const getUserActivityStatus = () => {
  try {
    const statusStr = uni.getStorageSync(USER_ACTIVITY_STATUS_KEY);
    return statusStr ? JSON.parse(statusStr) : {};
  } catch (e) {
    console.error('获取用户活动状态失败', e);
    return {};
  }
};

/**
 * 保存用户活动状态
 * @param {Object} status 用户活动状态对象
 */
const saveUserActivityStatus = (status) => {
  try {
    uni.setStorageSync(USER_ACTIVITY_STATUS_KEY, JSON.stringify(status));
  } catch (e) {
    console.error('保存用户活动状态失败', e);
  }
}; 