<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack">
          <icon-image name="back" size="22" color="#FFFFFF"></icon-image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">{{isEdit ? '编辑地址' : '新增地址'}}</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 地址表单 -->
    <view class="address-form mt-3">
      <!-- 收货人 -->
      <view class="form-item">
        <text class="form-label">收货人</text>
        <input v-model="addressForm.receiver" placeholder="请输入收货人姓名" class="form-input" />
      </view>
      
      <!-- 手机号码 -->
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input v-model="addressForm.phone" type="number" maxlength="11" placeholder="请输入收货人手机号" class="form-input" />
      </view>
      
      <!-- 所在地区 -->
      <view class="form-item">
        <text class="form-label">所在地区</text>
        <picker mode="region" :value="regionArray" @change="regionChange">
          <view class="flex items-center justify-between flex-1">
            <text v-if="addressForm.add" class="text-gray-700">{{addressForm.add}}</text>
            <text v-else class="text-gray-400">请选择省/市/区(县)</text>
            <text class="text-gray-400">></text>
          </view>
        </picker>
      </view>
      
      <!-- 详细地址 -->
      <view class="form-item align-start">
        <text class="form-label">详细地址</text>
        <textarea v-model="addressForm.addall" placeholder="请输入详细地址信息" class="form-textarea" />
      </view>
      
      <!-- 设为默认 -->
      <view class="form-item no-border">
        <text class="form-label">设为默认地址</text>
        <view class="flex-1 flex items-center" @click="toggleDefault">
          <view class="check-icon-wrapper mr-2">
            <icon-image v-if="addressForm.isDefault" name="check-circle" size="20" color="#4CAF50"></icon-image>
            <icon-image v-else name="circle" size="20" color="#d1d5db"></icon-image>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="p-4 fixed-bottom">
      <button class="w-full py-3 rounded-full bg-green text-white" @tap="saveAddressData">保存并使用</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { saveAddress as saveAddressService } from '../../services/address.js';
import { getCurrentUserFromProfile } from '../../services/login.js';
import IconImage from '../../components/IconImage.vue';

// 页面参数
const isEdit = ref(false);
const editIndex = ref(-1);

// 表单数据
const addressForm = reactive({
  _id: '',
  receiver: '',
  phone: '',
  add: '',        // 所在地区
  addall: '',     // 详细地址
  isDefault: false
});

// 地区数组，用于地区选择器
const regionArray = ref(['', '', '']);

// 是否从商城页面跳转过来
const fromMall = ref(false);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 地区改变事件
const regionChange = (e) => {
  const regions = e.detail.value;
  regionArray.value = regions;
  addressForm.add = regions.join(' ');
};

// 切换默认地址状态
const toggleDefault = () => {
  addressForm.isDefault = !addressForm.isDefault;
};

// 保存地址
const saveAddressData = async () => {
  // 打印当前表单数据
  console.log('提交前的表单数据:', JSON.parse(JSON.stringify(addressForm)));
  
  // 简单表单验证
  if (!addressForm.receiver.trim()) {
    return uni.showToast({ title: '请输入收货人姓名', icon: 'none' });
  }
  if (!addressForm.phone.trim() || addressForm.phone.length !== 11) {
    return uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
  }
  if (!addressForm.add) {
    return uni.showToast({ title: '请选择所在地区', icon: 'none' });
  }
  if (!addressForm.addall.trim()) {
    return uni.showToast({ title: '请输入详细地址', icon: 'none' });
  }

  // 显示加载
  uni.showLoading({ title: '保存中...' });
  
  try {
    // 构建要保存的地址数据
    const addressData = {
      _id: isEdit.value ? addressForm._id : undefined,
      receiver: addressForm.receiver,
      phone: addressForm.phone,
      add: addressForm.add,
      addall: addressForm.addall,
      isDefault: addressForm.isDefault,
      name: addressForm.receiver,  // 兼容字段
      address: addressForm.addall, // 兼容字段
      region: addressForm.add,     // 兼容字段
      is_default: addressForm.isDefault // 兼容字段
    };
    
    console.log('要保存的地址数据:', addressData);
    
    // 使用服务保存地址
    await saveAddressService(addressData, isEdit.value);
    
    uni.hideLoading();
    uni.showToast({
      title: isEdit.value ? '修改成功' : '添加成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 通知地址已更新
        uni.$emit('addressUpdated');
        
        setTimeout(() => {
          uni.navigateBack({
            delta: 1,
            success: () => {
              // 如果是从商城页面跳转过来，额外通知
              if (fromMall.value) {
                // 这里不需要额外操作，因为我们已经使用了uni.$emit
              }
            }
          });
        }, 500);
      }
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    });
    console.error('保存地址失败：', error);
  }
};

// 直接解析URL参数获取地址信息
const getAddressFromUrl = () => {
  try {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    if (page && page.$page && page.$page.fullPath) {
      const fullPath = page.$page.fullPath;
      console.log('当前页面路径:', fullPath);
      
      // 解析URL参数
      const urlParams = new URLSearchParams(fullPath.split('?')[1]);
      const addressParam = urlParams.get('address');
      console.log('URL中的address参数:', addressParam ? '...(数据太长省略)' : undefined);
      
      if (addressParam) {
        const decodedAddress = decodeURIComponent(addressParam);
        console.log('解码后的地址数据长度:', decodedAddress.length);
        return JSON.parse(decodedAddress);
      }
    }
  } catch (e) {
    console.error('从URL解析地址数据失败:', e);
  }
  return null;
};

onMounted(() => {
  console.log('地址编辑页面加载');
  
  // 尝试从本地存储获取地址数据
  const storedAddress = uni.getStorageSync('edit_address_data');
  if (storedAddress) {
    console.log('从本地存储获取到地址数据:', storedAddress);
    
    isEdit.value = true;
    
    // 填充表单
    addressForm._id = storedAddress._id || '';
    addressForm.receiver = storedAddress.receiver || storedAddress.name || '';
    addressForm.phone = storedAddress.phone || '';
    addressForm.add = storedAddress.add || storedAddress.region || '';
    addressForm.addall = storedAddress.addall || storedAddress.address || '';
    addressForm.isDefault = storedAddress.isDefault || false;
    
    console.log('填充后的表单数据:', JSON.parse(JSON.stringify(addressForm)));
    
    // 设置地区数组
    if (addressForm.add) {
      regionArray.value = addressForm.add.split(' ');
      console.log('设置后的地区数组:', regionArray.value);
    }
    
    // 使用后清除本地存储
    uni.removeStorageSync('edit_address_data');
    
    return;
  }
  
  // 尝试从URL参数获取地址信息
  const addressData = getAddressFromUrl();
  if (addressData) {
    console.log('从URL成功解析地址数据:', addressData);
    
    isEdit.value = true;
    
    // 填充表单
    addressForm._id = addressData._id || '';
    addressForm.receiver = addressData.receiver || addressData.name || '';
    addressForm.phone = addressData.phone || '';
    addressForm.add = addressData.add || addressData.region || '';
    addressForm.addall = addressData.addall || addressData.address || '';
    addressForm.isDefault = addressData.isDefault || false;
    
    console.log('填充后的表单数据:', JSON.parse(JSON.stringify(addressForm)));
    
    // 设置地区数组
    if (addressForm.add) {
      regionArray.value = addressForm.add.split(' ');
      console.log('设置后的地区数组:', regionArray.value);
    }
    
    return;
  }
  
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 获取页面参数
  if (currentPage && currentPage.$page && currentPage.$page.options) {
    const { address, index, from } = currentPage.$page.options;
    
    console.log('获取到页面参数:', { address: address ? '...(数据太长省略)' : undefined, index, from });
    
    // 检查是否从商城页面跳转
    if (from === 'mall') {
      fromMall.value = true;
    }
    
    // 如果提供了索引但没有地址数据，可能是使用了本地存储但获取失败
    if (index !== undefined && !address) {
      isEdit.value = true;
      editIndex.value = parseInt(index);
    }
    
    if (address && index !== undefined) {
      isEdit.value = true;
      editIndex.value = parseInt(index);
      
      try {
        const addressData = JSON.parse(decodeURIComponent(address));
        console.log('解析后的地址数据:', addressData);
        
        // 填充表单
        addressForm._id = addressData._id || '';
        addressForm.receiver = addressData.name || addressData.receiver || '';
        addressForm.phone = addressData.phone || '';
        addressForm.add = addressData.region || addressData.add || '';
        addressForm.addall = addressData.address || addressData.addall || '';
        addressForm.isDefault = addressData.isDefault || false;
        
        console.log('填充后的表单数据:', JSON.parse(JSON.stringify(addressForm)));
        
        // 设置地区数组
        if (addressForm.add) {
          regionArray.value = addressForm.add.split(' ');
          console.log('设置后的地区数组:', regionArray.value);
        }
      } catch (e) {
        console.error('解析地址数据出错', e);
        uni.showToast({
          title: '加载地址信息失败',
          icon: 'none'
        });
      }
    }
  }
  
  // 如果是编辑模式但没有成功获取地址信息，尝试从数据库获取
  if (isEdit.value && addressForm._id) {
    uni.showLoading({ title: '加载中...' });
    
    uniCloud.callFunction({
      name: 'getAddresses'
    }).then(res => {
      uni.hideLoading();
      
      if (res.result && res.result.success) {
        const addresses = res.result.data || [];
        const address = addresses.find(addr => addr._id === addressForm._id);
        
        if (address) {
          // 根据返回的地址数据，进行字段映射
          addressForm.receiver = address.name || address.receiver || '';
          addressForm.phone = address.phone || '';
          addressForm.add = address.region || address.add || '';
          addressForm.addall = address.address || address.addall || '';
          addressForm.isDefault = address.isDefault || address.is_default || false;
          
          console.log('从数据库获取的地址数据:', address);
          console.log('更新后的表单数据:', JSON.parse(JSON.stringify(addressForm)));
          
          // 设置地区数组
          if (addressForm.add) {
            regionArray.value = addressForm.add.split(' ');
            console.log('更新后的地区数组:', regionArray.value);
          }
        }
      }
    }).catch(err => {
      uni.hideLoading();
      console.error('获取地址信息失败', err);
      uni.showToast({
        title: '加载地址信息失败',
        icon: 'none'
      });
    });
  }
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

.address-form {
  background-color: white;
  border-radius: 8px;
  margin: 16px;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.align-start {
  align-items: flex-start;
}

.no-border {
  border-bottom: none;
}

.form-label {
  width: 80px;
  font-size: 15px;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 15px;
  height: 24px;
}

.form-textarea {
  flex: 1;
  font-size: 15px;
  height: 80px;
  width: 100%;
}

.check-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-700 { color: #374151; }
.bg-white { background-color: #ffffff; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }

.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.mr-2 { margin-right: 8px; }

.mt-3 { margin-top: 12px; }

.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }

.rounded-full { border-radius: 9999px; }
.w-full { width: 100%; }
</style> 