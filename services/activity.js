/**
 * 活动管理相关服务
 */

/**
 * 获取所有活动列表
 * @returns {Promise} 包含活动列表数据的Promise
 */
export const getActivities = () => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '加载中...' });
    
    uniCloud.callFunction({
      name: 'getActivities',
    }).then(res => {
      uni.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || '获取活动列表失败'));
      }
    }).catch(err => {
      uni.hideLoading();
      reject(new Error(err.message || '获取活动列表失败'));
    });
  });
};

/**
 * 获取活动总数
 * @returns {Promise} 包含活动总数的Promise
 */
export const getActivityCount = () => {
  return new Promise((resolve, reject) => {
    uniCloud.callFunction({
      name: 'getActivities',
      data: { count_only: true }
    }).then(res => {
      if (res.result.code === 0) {
        resolve(res.result.data.total);
      } else {
        reject(new Error(res.result.message || '获取活动数量失败'));
      }
    }).catch(err => {
      reject(new Error(err.message || '获取活动数量失败'));
    });
  });
};

/**
 * 添加活动
 * @param {Object} activityData 活动数据
 * @returns {Promise} 添加结果Promise
 */
export const addActivity = (activityData) => {
  return new Promise((resolve, reject) => {
    // 检查管理员登录状态
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      reject(new Error('管理员未登录'));
      return;
    }
    
    // 获取管理员ID
    const adminId = uni.getStorageSync('admin_id') || 'admin';
    
    // 显示加载状态
    uni.showLoading({ title: '添加中...' });
    
    // 调用云函数添加活动
    uniCloud.callFunction({
      name: 'addActivity',
      data: {
        ...activityData,
        created_by: adminId
      }
    }).then(res => {
      uni.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || '添加活动失败'));
      }
    }).catch(err => {
      uni.hideLoading();
      reject(new Error(err.message || '添加活动失败'));
    });
  });
};

/**
 * 更新活动
 * @param {Object} activityData 活动数据
 * @returns {Promise} 更新结果Promise
 */
export const updateActivity = (activityData) => {
  return new Promise((resolve, reject) => {
    // 检查管理员登录状态
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      reject(new Error('管理员未登录'));
      return;
    }
    
    // 显示加载状态
    uni.showLoading({ title: '更新中...' });
    
    // 调用云函数更新活动
    uniCloud.callFunction({
      name: 'updateActivity',
      data: activityData
    }).then(res => {
      uni.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || '更新活动失败'));
      }
    }).catch(err => {
      uni.hideLoading();
      reject(new Error(err.message || '更新活动失败'));
    });
  });
};

/**
 * 删除活动
 * @param {String} activityId 活动ID
 * @returns {Promise} 删除结果Promise
 */
export const deleteActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    // 检查管理员登录状态
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      reject(new Error('管理员未登录'));
      return;
    }
    
    // 显示加载状态
    uni.showLoading({ title: '删除中...' });
    
    // 调用云函数删除活动
    uniCloud.callFunction({
      name: 'deleteActivity',
      data: { _id: activityId }
    }).then(res => {
      uni.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || '删除活动失败'));
      }
    }).catch(err => {
      uni.hideLoading();
      reject(new Error(err.message || '删除活动失败'));
    });
  });
}; 