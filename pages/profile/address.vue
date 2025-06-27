<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack">
          <icon-image name="back" size="22" color="#FFFFFF"></icon-image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">收货地址</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 无地址提示 -->
    <view v-if="addressList.length === 0" class="empty-address flex flex-col items-center justify-center">
      <image src="/static/images/empty-address.png" mode="aspectFit" class="empty-image"></image>
      <text class="text-gray-500 mb-4">暂无收货地址</text>
    </view>
    
    <!-- 加载中提示 -->
    <view v-else-if="loading" class="loading flex flex-col items-center justify-center">
      <view class="spinner"></view>
      <text class="text-gray-500 mt-3">加载中...</text>
    </view>
    
    <!-- 错误提示 -->
    <view v-else-if="hasError" class="error flex flex-col items-center justify-center">
      <text class="iconfont icon-warning text-red-500 text-4xl"></text>
      <text class="text-gray-500 mt-2">{{errorMessage || '加载失败'}}</text>
      <button class="retry-btn mt-4" @tap="loadAddressList">重新加载</button>
    </view>
    
    <!-- 地址列表 -->
    <view v-else class="address-list">
      <view 
        v-for="(item, index) in addressList" 
        :key="index" 
        class="address-card mb-3 bg-white"
      >
        <view class="p-4">
          <view class="flex justify-between mb-2">
            <view class="flex">
              <text class="font-medium">{{item.name}}</text>
              <text class="ml-2 text-gray-500">{{item.phone}}</text>
            </view>
            <view v-if="item.isDefault" class="default-tag">默认</view>
          </view>
          
          <view class="address-location">
            <text class="text-gray-600">{{item.region}}</text>
            <text class="text-gray-700 address-detail">{{item.address}}</text>
          </view>
          
          <view class="flex justify-between mt-3 pt-3 border-t border-gray-100">
            <view class="flex items-center" @tap="toggleDefault(index)">
              <view class="check-icon-wrapper">
                <icon-image v-if="item.isDefault" name="check-circle" size="20" color="#4CAF50"></icon-image>
                <icon-image v-else name="circle" size="20" color="#d1d5db"></icon-image>
              </view>
              <text class="text-sm ml-2">设为默认</text>
            </view>
            
            <view class="flex">
              <view class="address-action flex items-center mr-4" @tap="editAddress(index)">
                <icon-image name="edit" size="18" color="#6b7280"></icon-image>
                <text class="text-sm ml-1">编辑</text>
              </view>
              <view class="address-action flex items-center" @tap="deleteAddress(index)">
                <icon-image name="delete" size="18" color="#6b7280"></icon-image>
                <text class="text-sm ml-1">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加新地址按钮 -->
    <view class="fixed-bottom">
      <view class="p-4">
        <button class="w-full py-3 rounded-full bg-green text-white" @tap="navigateToAddAddress">+ 新增收货地址</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAddressList, saveAddress, deleteAddress as deleteAddressService } from '../../services/address.js';
import IconImage from '../../components/IconImage.vue';

// 地址列表数据
const addressList = ref([]);
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// 加载地址列表
const loadAddressList = async () => {
  loading.value = true;
  hasError.value = false;
  
  console.log('开始加载地址列表');
  
  try {
    const addresses = await getAddressList();
    console.log('获取到地址列表:', addresses);
    addressList.value = addresses;
    
    if (addresses.length === 0) {
      console.log('地址列表为空');
    }
  } catch (error) {
    console.error('加载地址列表失败:', error);
    hasError.value = true;
    errorMessage.value = error.message || '加载地址列表失败';
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 设置默认地址
const toggleDefault = async (index) => {
  if (addressList.value[index].isDefault) {
    return; // 已经是默认地址，不做操作
  }
  
  try {
    uni.showLoading({ title: '设置中...' });
    
    const address = { ...addressList.value[index] };
    address.isDefault = true;
    
    // 使用服务设置默认地址
    await saveAddress(address, true);
    
    // 更新本地地址列表
    addressList.value.forEach((item, i) => {
      item.isDefault = i === index;
    });
    
    uni.hideLoading();
    uni.showToast({
      title: '设置默认地址成功',
      icon: 'success'
    });
  } catch (error) {
    uni.hideLoading();
    console.error('设置默认地址失败:', error);
    uni.showToast({
      title: '设置失败，请稍后重试',
      icon: 'none'
    });
  }
};

// 编辑地址
const editAddress = (index) => {
  // 确保有地址数据
  if (!addressList.value[index]) {
    console.error('没有找到地址数据:', index);
    uni.showToast({
      title: '地址数据不存在',
      icon: 'none'
    });
    return;
  }
  
  // 打印原始地址数据
  console.log('原始地址数据:', addressList.value[index]);
  
  // 将地址信息传递到编辑页面
  const addressData = {
    _id: addressList.value[index]._id,
    name: addressList.value[index].name,
    receiver: addressList.value[index].name,
    phone: addressList.value[index].phone,
    address: addressList.value[index].address,
    addall: addressList.value[index].address,
    region: addressList.value[index].region,
    add: addressList.value[index].region,
    isDefault: addressList.value[index].isDefault
  };
  
  // 使用本地存储传递数据
  uni.setStorageSync('edit_address_data', addressData);
  
  console.log('已将地址信息保存到本地存储:', addressData);
  
  // 简单地传递索引
  uni.navigateTo({
    url: `/pages/profile/address-edit?index=${index}`
  });
};

// 删除地址
const deleteAddress = async (index) => {
  uni.showModal({
    title: '提示',
    content: '确认删除该收货地址？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' });
          
          const addressId = addressList.value[index]._id;
          await deleteAddressService(addressId);
          
          // 从本地列表中移除
          addressList.value.splice(index, 1);
          
          uni.hideLoading();
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } catch (error) {
          uni.hideLoading();
          console.error('删除地址失败:', error);
          uni.showToast({
            title: '删除失败，请稍后重试',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 跳转到添加地址页面
const navigateToAddAddress = () => {
  uni.navigateTo({
    url: '/pages/profile/address-edit'
  });
};

// 监听地址更新事件
uni.$on('addressUpdated', () => {
  console.log('收到地址更新事件，重新加载地址列表');
  loadAddressList();
});

onMounted(() => {
  console.log('地址管理页面加载');
  loadAddressList();
  
  // 返回清理事件监听
  return () => {
    uni.$off('addressUpdated');
  };
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px;
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

.empty-address {
  margin-top: 120px;
}

.empty-image {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.address-list {
  padding: 16px;
}

.address-card {
  border-radius: 8px;
  overflow: hidden;
}

.address-detail {
  word-break: break-all;
  line-height: 1.6;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.default-tag {
  background-color: #fff5e5;
  color: #ff9800;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.check-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-action {
  color: #6b7280;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.bg-white { background-color: #ffffff; }
.text-white { color: #ffffff; }
.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }

.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }

.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mt-3 { margin-top: 12px; }
.ml-2 { margin-left: 8px; }
.ml-1 { margin-left: 4px; }
.mr-4 { margin-right: 16px; }

.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-medium { font-weight: 500; }

.rounded-full { border-radius: 9999px; }
.w-full { width: 100%; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #f0f0f0; }

.loading {
  margin-top: 120px;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top-color: #4CAF50;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  margin-top: 120px;
}

.retry-btn {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.address-location {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}
</style> 