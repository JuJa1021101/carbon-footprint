// 积分商城服务
import { getCurrentUserFromProfile } from './login.js';
import { getUserPoints as getPoints, updatePointsCache } from './points.js';

/**
 * 搜索奖品
 * @param {string} query 搜索关键词
 * @param {Object} options 查询参数
 * @returns {Promise} 搜索结果Promise
 */
export const searchRewards = (query, options = {}) => {
  return new Promise(async (resolve) => {
    try {
      // 获取当前用户ID
      const currentUser = getCurrentUserFromProfile();
      let userId = currentUser && currentUser._id ? currentUser._id : null;

      console.log('Search rewards with query:', query, 'userId:', userId);

      // 调用云函数搜索奖品
      const { result } = await uniCloud.callFunction({
        name: 'searchRewards',
        data: { 
          query,
          userId,
          ...options
        }
      });

      // 处理结果
      if (result && result.success) {
        // 确保每个奖品的库存数量是安全的
        const safeData = (result.data || []).map(reward => ensureStockQuantity(reward));
        
        resolve({
          success: true,
          data: safeData,
          total: result.total || 0
        });
      } else {
        resolve({
          success: false,
          message: result?.message || '搜索失败',
          data: []
        });
      }
    } catch (error) {
      console.error('搜索奖品失败:', error);
      resolve({
        success: false,
        message: '搜索失败，请稍后重试',
        data: []
      });
    }
  });
};

/**
 * 获取用户积分
 * @param {boolean} forceRefresh 是否强制刷新
 * @returns {Promise} 用户积分Promise
 */
export const getUserPoints = (forceRefresh = false) => {
  return new Promise((resolve) => {
    try {
      // 首先尝试从本地存储获取积分
      const pointsStr = uni.getStorageSync('user_points');
      if (pointsStr) {
        const points = parseInt(pointsStr);
        console.log('mall.js - 从本地存储获取积分:', points);
        
        // 更新缓存
        updatePointsCache({ points });
        
        resolve({
          success: true,
          data: { points },
          source: 'local'
        });
        return;
      }
      
      // 如果本地存储中没有积分，则使用服务函数
      getPoints(forceRefresh).then(result => {
        // 如果从服务获取成功，立即保存到本地存储
        if (result && result.success && result.data && result.data.points) {
          try {
            uni.setStorageSync('user_points', result.data.points.toString());
            console.log('mall.js - 保存服务获取的积分到本地:', result.data.points);
          } catch (e) {
            console.error('保存积分到本地存储失败:', e);
          }
        }
        resolve(result);
      }).catch(err => {
        console.error('获取积分服务失败:', err);
        resolve({
          success: false,
          message: '获取积分失败',
          data: { points: 1000 }
        });
      });
    } catch (error) {
      console.error('获取用户积分失败:', error);
      resolve({
        success: false,
        message: '获取积分失败，使用默认值',
        data: { points: 1000 }
      });
    }
  });
};

/**
 * 确保奖品库存数量是安全的数字
 * @param {Object} reward 奖品对象
 * @returns {Object} 处理后的奖品对象
 */
export const ensureStockQuantity = (reward) => {
  if (!reward) return {};
  
  // 创建一个副本，避免修改原对象
  const safeReward = { ...reward };
  
  // 打印原始数据，便于调试
  console.log('原始商品数据库存信息:', {
    name: safeReward.name,
    stock: safeReward.stock,
    stock_quantity: safeReward.stock_quantity,
    status: safeReward.status
  });
  
  // 适配新旧字段名
  if (safeReward.stock !== undefined && safeReward.stock_quantity === undefined) {
    safeReward.stock_quantity = safeReward.stock;
  }
  
  // 适配积分字段
  if (safeReward.points !== undefined && safeReward.required_points === undefined) {
    safeReward.required_points = safeReward.points;
  }
  
  // 适配图片字段
  if (safeReward.image !== undefined && safeReward.image_url === undefined) {
    safeReward.image_url = safeReward.image;
  }
  
  // 确保stock_quantity是数字 - 更严格的转换
  let stockQuantity = 0;
  if (safeReward.stock_quantity !== undefined && safeReward.stock_quantity !== null) {
    // 尝试更严格的数字转换
    const parsedStock = Number(safeReward.stock_quantity);
    stockQuantity = !isNaN(parsedStock) ? parsedStock : 0;
    safeReward.stock_quantity = stockQuantity;
  }
  
  // 确保原始stock字段也是数字
  if (safeReward.stock !== undefined && safeReward.stock !== null) {
    const parsedStock = Number(safeReward.stock);
    const stockValue = !isNaN(parsedStock) ? parsedStock : 0;
    safeReward.stock = stockValue;
    
    // 如果stock_quantity未定义，使用stock的值
    if (safeReward.stock_quantity === undefined) {
      safeReward.stock_quantity = stockValue;
      stockQuantity = stockValue;
    }
  }
  
  // 适配状态字段
  if (safeReward.status === 'sold_out') {
    safeReward.status = 'soldout'; // 适配前端识别的状态名
  }
  
  // 如果库存是0或负数，确保状态设置为已售罄
  if (stockQuantity <= 0 && safeReward.status !== 'unavailable') {
    safeReward.status = 'soldout';
    console.log(`商品[${safeReward.name}]库存为0，设置状态为已售罄`);
  }
  
  // 如果status是已售罄，但库存大于0，保持库存值但更新显示状态
  if ((safeReward.status === 'soldout' || safeReward.status === 'sold_out') && stockQuantity > 0) {
    console.log(`警告: 商品[${safeReward.name}]状态为已售罄，但库存为${stockQuantity}`);
    // 不修改库存，但确保状态一致
  }
  
  console.log('处理后商品数据库存信息:', {
    name: safeReward.name,
    stock: safeReward.stock,
    stock_quantity: safeReward.stock_quantity,
    status: safeReward.status
  });
  
  return safeReward;
}; 

/**
 * 获取所有商品
 * @returns {Promise<Array>} 商品列表Promise
 */
export const getAllRewards = async () => {
  try {
    // 验证管理员登录状态
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      console.warn('管理员未登录，但仍尝试获取商品列表');
      // 不直接抛出错误，让调用者决定是否需要跳转
    }
    
    const { result } = await uniCloud.callFunction({
      name: 'getRewards',
      data: { showAll: true }
    });

    if (result && result.success) {
      // 确保图片路径正确
      const rewards = result.data.map(reward => {
        // 提取image_url，确保其存在
        let imageUrl = reward.image_url || '';
        
        // 检查图片路径是否有效
        if (!imageUrl || imageUrl === 'undefined') {
          console.warn(`商品[${reward.name}]无图片路径，使用默认图片`);
          imageUrl = '/static/images/mall/default-product.png';
        }
        // 确保图片路径格式正确（添加前缀如果缺失）
        else if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          console.log(`修正商品[${reward.name}]图片路径: ${imageUrl} -> /${imageUrl}`);
          imageUrl = '/' + imageUrl;
        }
        
        // 更新reward对象的image_url
        reward.image_url = imageUrl;
        
        // 确保stock_quantity字段存在
        if (reward.stock !== undefined && reward.stock_quantity === undefined) {
          reward.stock_quantity = reward.stock;
        }
        
        // 确保required_points字段存在
        if (reward.points !== undefined && reward.required_points === undefined) {
          reward.required_points = reward.points;
        }
        
        console.log(`处理后的商品[${reward.name}]图片路径: ${reward.image_url}`);
        
        return reward;
      });
      return rewards;
    } else {
      console.error('获取商品列表失败:', result?.message);
      return [];
    }
  } catch (error) {
    console.error('获取商品列表出错:', error);
    return [];
  }
};

// 验证管理员登录状态的工具函数 - 只返回状态，不自动跳转
const verifyAdminLogin = (autoRedirect = false) => {
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    if (autoRedirect) {
      console.log('管理员未登录，可能需要跳转');
    }
    return false;
  }
  return true;
};

/**
 * 上传图片到static目录 - 不检查登录状态
 * @param {String} filePath 本地临时文件路径
 * @returns {Promise<String>} 上传后的文件URL
 */
export const uploadImageToStatic = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('开始上传图片，临时路径:', filePath);
      uni.showLoading({ title: '上传中...' });
      
      // 生成文件名（使用时间戳和随机数确保唯一性）
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
      const fileName = `product_${timestamp}_${randomStr}.${fileExtension}`;
      
      // 读取文件内容并转为Base64
      try {
        // 设置更长的超时时间
        const timeout = setTimeout(() => {
          uni.hideLoading();
          console.warn('图片上传处理超时，使用默认图片');
          resolve('static/images/mall/default-product.png'); // 返回不带斜杠的路径
        }, 30000); // 30秒超时
        
        const fileContent = uni.getFileSystemManager().readFileSync(filePath, 'base64');
        
        // 调用云函数保存文件
        uniCloud.callFunction({
          name: 'saveFileToStatic',
          data: {
            fileContent: fileContent,
            fileName: fileName
          },
          timeout: 30000, // 30秒超时
          success: (res) => {
            clearTimeout(timeout);
            uni.hideLoading();
            
            if (res.result && res.result.success) {
              // 现在云函数返回的是不带前导斜杠的路径，直接使用
              const staticPath = res.result.data.url; // 不带斜杠的路径，适合存入数据库
              console.log('图片上传成功，数据库路径:', staticPath);
              resolve(staticPath);
            } else {
              console.error('保存到云端失败:', res.result);
              // 使用默认图片路径 - 不带斜杠
              resolve('static/images/mall/default-product.png');
            }
          },
          fail: (err) => {
            clearTimeout(timeout);
            uni.hideLoading();
            console.error('调用云函数失败:', err);
            // 使用默认图片路径 - 不带斜杠
            resolve('static/images/mall/default-product.png');
          }
        });
      } catch (readError) {
        uni.hideLoading();
        console.error('读取文件失败:', readError);
        // 使用默认图片路径 - 不带斜杠
        resolve('static/images/mall/default-product.png');
      }
    } catch (error) {
      uni.hideLoading();
      console.error('处理图片失败:', error);
      // 使用默认图片路径 - 不带斜杠
      resolve('static/images/mall/default-product.png');
    }
  });
};

/**
 * 添加新商品
 * @param {Object} rewardData 商品数据
 * @returns {Promise<Object>} 添加结果
 */
export const addReward = async (rewardData) => {
  try {
    console.log('添加商品，数据为:', {
      name: rewardData.name,
      image_url: rewardData.image_url,
      points: rewardData.points || rewardData.required_points,
      stock: rewardData.stock || rewardData.stock_quantity
    });
    
    // 先验证管理员登录状态
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      console.error('管理员未登录，无法添加商品');
      throw new Error('请先登录管理员账号');
    }
    
    // 保存原始管理员ID，用于后续恢复状态
    const adminId = uni.getStorageSync('admin_id') || 'admin';
    
    // 处理图片上传 - 使用默认图片代替错误处理
    let imageUrl = rewardData.image_url;
    if (imageUrl && (imageUrl.startsWith('wxfile:') || 
                   imageUrl.startsWith('http://tmp') || 
                   imageUrl.startsWith('file://') ||
                   !imageUrl.includes('static/images/mall/'))) {
      try {
        console.log('检测到临时图片路径，开始上传...');
        // 上传图片到static目录，不检查登录状态
        imageUrl = await uploadImageToStatic(imageUrl).catch(err => {
          console.error('图片上传出错，使用默认图片', err);
          return '/static/images/mall/default-product.png';
        });
        console.log('图片已上传到static目录:', imageUrl);
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        // 使用默认图片而不是抛出错误
        imageUrl = '/static/images/mall/default-product.png';
      }
    }
    
    // 构建完整的商品数据，包含已上传的图片URL
    const fullRewardData = {
      ...rewardData,
      image_url: imageUrl,
      created_by: adminId
    };
    
    let result;
    try {
      const response = await uniCloud.callFunction({
        name: 'addReward',
        data: fullRewardData
      });
      result = response.result;
    } catch (cloudError) {
      console.error('云函数调用失败:', cloudError);
      // 尝试恢复管理员状态
      if (!uni.getStorageSync('admin_login_status')) {
        uni.setStorageSync('admin_login_status', 'loggedin');
        uni.setStorageSync('admin_id', adminId);
      }
      throw new Error('网络错误，请稍后再试');
    }
    
    if (result && result.success) {
      // 确保管理员登录状态没有被意外清除
      if (!uni.getStorageSync('admin_login_status')) {
        uni.setStorageSync('admin_login_status', 'loggedin');
        uni.setStorageSync('admin_id', adminId);
      }
      
      // 触发全局商品更新事件
      uni.$emit('rewardsUpdated', {
        type: 'add',
        data: result.data
      });
      return result.data;
    } else {
      throw new Error(result?.message || '添加商品失败');
    }
  } catch (error) {
    console.error('添加商品失败:', error);
    throw error;
  }
};

/**
 * 更新商品信息
 * @param {Object} rewardData 商品数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateReward = async (rewardData) => {
  try {
    console.log('正在更新商品，数据为:', {
      id: rewardData._id,
      name: rewardData.name,
      image_url: rewardData.image_url,
      is_hot: rewardData.is_hot,
      is_limited: rewardData.is_limited
    });
    
    // 处理图片上传 - 不依赖登录状态
    let imageUrl = rewardData.image_url;
    if (imageUrl && (imageUrl.startsWith('wxfile:') || 
                   imageUrl.startsWith('http://tmp') || 
                   imageUrl.startsWith('file://') ||
                   !imageUrl.includes('static/images/mall/'))) {
      try {
        console.log('检测到临时图片路径，开始上传...');
        // 上传图片到static目录，不检查登录状态
        imageUrl = await uploadImageToStatic(imageUrl).catch(err => {
          console.error('图片上传出错，使用默认图片', err);
          return 'static/images/mall/default-product.png';
        });
        console.log('图片已上传到static目录:', imageUrl);
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        // 使用默认图片而不是抛出错误
        imageUrl = 'static/images/mall/default-product.png';
      }
    }
    
    // 确保boolean类型字段正确传递
    const normalizedData = {
      ...rewardData,
      image_url: imageUrl,
      is_hot: rewardData.is_hot === true,
      is_limited: rewardData.is_limited === true,
      is_limited_time: rewardData.is_limited === true // 保持字段一致
    };
    
    console.log('发送到云函数的数据:', {
      id: normalizedData._id,
      name: normalizedData.name,
      is_hot: normalizedData.is_hot,
      is_limited: normalizedData.is_limited,
      is_limited_time: normalizedData.is_limited_time,
      image_url: normalizedData.image_url
    });
    
    const { result } = await uniCloud.callFunction({
      name: 'updateReward',
      data: normalizedData
    });
    
    if (result && result.success) {
      // 触发全局商品更新事件
      uni.$emit('rewardsUpdated', {
        type: 'update',
        data: result.data
      });
      return result.data;
    } else {
      throw new Error(result?.message || '更新商品失败');
    }
  } catch (error) {
    console.error('更新商品失败:', error);
    throw error;
  }
};

/**
 * 删除商品
 * @param {String} rewardId 商品ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteReward = async (rewardId) => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'deleteReward',
      data: { id: rewardId }
    });
    
    if (result && result.success) {
      // 触发全局商品更新事件
      uni.$emit('rewardsUpdated', {
        type: 'delete',
        data: { id: rewardId }
      });
      return result.data;
    } else {
      throw new Error(result?.message || '删除商品失败');
    }
  } catch (error) {
    console.error('删除商品失败:', error);
    throw error;
  }
};

/**
 * 获取商品总数
 * @returns {Promise<Number>} 商品总数
 */
export const getRewardCount = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getRewards',
      data: { countOnly: true }
    });
    
    if (result && result.success) {
      return result.count || 0;
    } else {
      throw new Error(result?.message || '获取商品数量失败');
    }
  } catch (error) {
    console.error('获取商品数量失败:', error);
    return 0;
  }
}; 