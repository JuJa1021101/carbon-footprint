/**
 * 地址管理服务
 */
import { getCurrentUserFromProfile } from './login.js';

/**
 * 获取用户地址列表
 * @returns {Promise} 地址列表Promise
 */
export const getAddressList = () => {
  return new Promise((resolve, reject) => {
    // 获取当前用户ID
    const currentUser = getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    
    console.log('获取地址列表，用户ID:', userId);
    
    // 调用云函数获取地址列表
    uniCloud.callFunction({
      name: 'getAddresses',
      data: {
        userId
      }
    }).then(res => {
      console.log('getAddresses云函数返回结果:', res.result);
      
      if (res.result && res.result.success) {
        // 处理地址数据，确保字段名一致
        const addresses = res.result.data.map(addr => ({
          _id: addr._id,
          name: addr.name || addr.receiver || '',
          phone: addr.phone || '',
          address: addr.address || addr.addall || '',
          region: addr.region || addr.add || '',
          isDefault: addr.is_default || addr.isDefault || false
        }));
        
        console.log('处理后的地址列表:', addresses);
        resolve(addresses);
      } else {
        console.error('获取地址列表失败:', res.result?.message || '未知错误');
        reject(new Error(res.result?.message || '获取地址列表失败'));
      }
    }).catch(err => {
      console.error('获取地址列表失败:', err);
      reject(err);
    });
  });
};

/**
 * 保存地址
 * @param {Object} address 地址信息
 * @param {Boolean} isEdit 是否为编辑模式
 * @returns {Promise} 保存结果Promise
 */
export const saveAddress = (address, isEdit = false) => {
  return new Promise((resolve, reject) => {
    // 获取当前用户ID
    const currentUser = getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    
    console.log('保存地址，用户ID:', userId);
    console.log('保存地址内容:', address);
    
    // 构建要保存的地址数据
    const addressData = {
      _id: isEdit ? address._id : undefined,
      receiver: address.receiver || address.name || '',
      phone: address.phone || '',
      add: address.add || address.region || '',
      addall: address.addall || address.address || '',
      isDefault: address.isDefault || false
    };
    
    console.log('处理后的地址数据:', addressData);
    
    // 调用云函数保存地址
    uniCloud.callFunction({
      name: 'saveAddress',
      data: {
        userId,
        address: addressData,
        isEdit
      }
    }).then(res => {
      console.log('saveAddress云函数返回结果:', res.result);
      
      if (res.result && res.result.success) {
        resolve(res.result);
      } else {
        console.error('保存地址失败:', res.result?.message || '未知错误');
        reject(new Error(res.result?.message || '保存地址失败'));
      }
    }).catch(err => {
      console.error('保存地址失败:', err);
      reject(err);
    });
  });
};

/**
 * 删除地址
 * @param {String} addressId 地址ID
 * @returns {Promise} 删除结果Promise
 */
export const deleteAddress = (addressId) => {
  return new Promise((resolve, reject) => {
    // 获取当前用户ID
    const currentUser = getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    
    console.log('删除地址，地址ID:', addressId);
    
    // 调用云函数删除地址
    uniCloud.callFunction({
      name: 'deleteAddress',
      data: {
        userId,
        addressId
      }
    }).then(res => {
      console.log('deleteAddress云函数返回结果:', res.result);
      
      if (res.result && res.result.success) {
        resolve(res.result);
      } else {
        console.error('删除地址失败:', res.result?.message || '未知错误');
        reject(new Error(res.result?.message || '删除地址失败'));
      }
    }).catch(err => {
      console.error('删除地址失败:', err);
      reject(err);
    });
  });
};