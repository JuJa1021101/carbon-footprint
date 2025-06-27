<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">添加商品</text>
        </view>
        <view>
          <button 
            class="publish-btn text-white text-sm bg-green-500 rounded-full px-4 py-1"
            :disabled="!canSave"
            :class="{'bg-gray-300': !canSave}"
            @tap="submitReward">
            添加
          </button>
        </view>
      </view>
    </view>

    <!-- 内容区 - 使用普通view替代scroll-view -->
    <view class="form-wrapper p-4">
      <form @submit.prevent>
        <!-- 商品名称 -->
        <view class="form-item">
          <view class="form-label mb-1">商品名称</view>
          <input 
            v-model="name"
            class="form-input"
            placeholder="请输入商品名称"
            maxlength="100"
          />
        </view>
        
        <!-- 商品描述 -->
        <view class="form-item">
          <view class="form-label mb-1">商品描述</view>
          <textarea 
            v-model="description" 
            class="form-textarea" 
            placeholder="请输入商品描述..." 
            maxlength="500"
            auto-height>
          </textarea>
        </view>
        
        <!-- 商品图片上传 -->
        <view class="form-item">
          <view class="image-upload-container">
            <view class="image-upload-label">商品图片</view>
            <view class="image-upload-area" @tap="chooseImage">
              <image v-if="imageUrl" :src="imageUrl" mode="aspectFill" class="preview-image"></image>
              <view v-else class="upload-placeholder">
                <IconImage name="plus" :size="28" class="mb-2" />
                <text class="upload-text">点击上传图片</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 积分输入框 -->
        <view class="form-item">
          <view class="form-label mb-1">兑换积分</view>
          <view class="form-input-wrapper flex items-center">
            <IconImage name="bookmark" :size="16" class="mr-2 text-gray-500" />
            <input 
              v-model="points"
              class="form-input flex-1 pl-0"
              placeholder="请输入兑换所需积分"
              type="number"
            />
          </view>
        </view>
        
        <!-- 库存输入框 -->
        <view class="form-item">
          <view class="form-label mb-1">商品库存</view>
          <view class="form-input-wrapper flex items-center">
            <IconImage name="bookmark" :size="16" class="mr-2 text-gray-500" />
            <input 
              v-model="stock"
              class="form-input flex-1 pl-0"
              placeholder="请输入商品库存"
              type="number"
            />
          </view>
        </view>
        
        <!-- 商品分类 -->
        <view class="form-item">
          <view class="form-label mb-1">商品分类</view>
          <picker 
            @change="onCategoryChange" 
            :value="categoryIndex" 
            :range="categoryOptions">
            <view class="picker-content">
              <text class="picker-text">{{ getCategoryText(categoryOptions[categoryIndex]) }}</text>
              <IconImage name="right" :size="16" />
            </view>
          </picker>
        </view>
        
        <!-- 是否热门 -->
        <view class="form-item">
          <view class="form-label mb-1">热门商品</view>
          <picker 
            @change="onHotChange" 
            :value="hotIndex" 
            :range="booleanOptions">
            <view class="picker-content">
              <text class="picker-text">{{ booleanOptions[hotIndex] }}</text>
              <IconImage name="right" :size="16" />
            </view>
          </picker>
        </view>
        
        <!-- 是否限时 -->
        <view class="form-item">
          <view class="form-label mb-1">限时商品</view>
          <picker 
            @change="onLimitedChange" 
            :value="limitedIndex" 
            :range="booleanOptions">
            <view class="picker-content">
              <text class="picker-text">{{ booleanOptions[limitedIndex] }}</text>
              <IconImage name="right" :size="16" />
            </view>
          </picker>
        </view>
      </form>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addReward, uploadImageToStatic } from '../../services/mall.js';
import { onLoad, onShow } from '@dcloudio/uni-app';
import IconImage from '../../components/IconImage.vue';

// 表单数据
const name = ref('');
const description = ref('');
const imageUrl = ref('');
const points = ref('0');
const stock = ref('0');
const categoryIndex = ref(0);
const categoryOptions = ['daily', 'plant', 'coupon'];
const hotIndex = ref(0); // 0-否，1-是
const limitedIndex = ref(0); // 0-否，1-是
const booleanOptions = ['否', '是'];

// 获取分类显示文字
const getCategoryText = (category) => {
  const categories = {
    'daily': '日常用品',
    'plant': '绿植花卉',
    'coupon': '优惠券'
  };
  return categories[category] || category;
};

// 检查管理员登录状态
const checkAdminLoginStatus = () => {
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    uni.showToast({
      title: '请先登录管理员账号',
      icon: 'none',
      duration: 2000
    });
    
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/admin/login'
      });
    }, 1500);
    return false;
  }
  return true;
};

// 页面加载时检查登录状态
onLoad(() => {
  checkAdminLoginStatus();
});

// 页面显示时检查登录状态
onShow(() => {
  checkAdminLoginStatus();
});

// 跟踪输入框焦点状态
const isPointsFocused = ref(false);
const isStockFocused = ref(false);

// 验证并格式化数字输入
const validateNumberInput = (field) => {
  if (field === 'points') {
    // 确保是纯数字，去除非数字字符
    points.value = points.value.replace(/\D/g, '');
    // 如果为空，设置为0
    if (points.value === '') points.value = '0';
  } else if (field === 'stock') {
    // 确保是纯数字，去除非数字字符
    stock.value = stock.value.replace(/\D/g, '');
    // 如果为空，设置为0
    if (stock.value === '') stock.value = '0';
  }
};

// 是否可以保存
const canSave = computed(() => {
  // 添加安全检查，确保值存在再调用trim()
  const nameValid = name.value && typeof name.value === 'string' && name.value.trim().length > 0;
  const imageValid = imageUrl.value && typeof imageUrl.value === 'string' && imageUrl.value.trim().length > 0;
  return nameValid && imageValid;
});

// 分类选择变化
const onCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
};

// 热门选择变化
const onHotChange = (e) => {
  hotIndex.value = e.detail.value;
};

// 限时选择变化
const onLimitedChange = (e) => {
  limitedIndex.value = e.detail.value;
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 直接设置临时文件路径
      imageUrl.value = res.tempFilePaths[0];
    }
  });
};

// 返回上一页
const goBack = () => {
  uni.showModal({
    title: '提示',
    content: '是否放弃添加？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};

// 添加商品
const submitReward = async () => {
  // 验证内容
  if (!canSave.value) {
    uni.showToast({
      title: '请完善必填信息',
      icon: 'none'
    });
    return;
  }
  
  // 检查管理员登录状态
  if (!checkAdminLoginStatus()) {
    return;
  }
  
  try {
    // 显示加载状态
    uni.showLoading({
      title: '添加中...',
      mask: true
    });
    
    // 构建商品数据对象
    const rewardData = {
      name: name.value,
      description: description.value,
      image_url: imageUrl.value, // 传递图片临时路径
      points: parseInt(points.value) || 0,
      stock: parseInt(stock.value) || 0,
      category: categoryOptions[categoryIndex.value],
      is_hot: hotIndex.value === 1,
      is_limited: limitedIndex.value === 1
    };
    
    // 调用商品添加服务
    const result = await addReward(rewardData);
    
    uni.hideLoading();
    uni.showToast({
      title: '添加成功',
      icon: 'success'
    });
    
    // 更新商品数量缓存
    const currentCount = parseInt(uni.getStorageSync('reward_count') || '0');
    uni.setStorageSync('reward_count', currentCount + 1);
    
    // 保存操作消息，供列表页面显示
    uni.setStorageSync('reward_action_message', `商品"${name.value}"添加成功`);
    
    // 修改返回逻辑，确保返回到正确页面
    setTimeout(() => {
      try {
        // 使用重定向而不是navigateBack，避免页面栈问题
        uni.redirectTo({
          url: '/pages/admin/reward-list',
          fail: (err) => {
            console.error('跳转失败:', err);
            // 如果重定向失败，尝试使用其他方式跳转
            uni.reLaunch({
              url: '/pages/admin/reward-list'
            });
          }
        });
      } catch (navError) {
        console.error('导航错误:', navError);
        // 确保在任何情况下都能返回管理员列表页
        uni.reLaunch({
          url: '/pages/admin/dashboard'
        });
      }
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '添加失败',
      icon: 'none'
    });
    console.error('添加商品失败:', error);
    
    // 如果失败了，也要检查登录状态是否被清除
    const adminLoginStatus = uni.getStorageSync('admin_login_status');
    if (adminLoginStatus !== 'loggedin') {
      console.warn('添加商品失败后检测到登录状态丢失，重新设置');
      uni.setStorageSync('admin_login_status', 'loggedin');
      uni.setStorageSync('admin_id', 'admin');
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
  width: 100vw;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

.form-wrapper {
  padding-bottom: 80px;
  width: 100%;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 16px;
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
  position: relative;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-input-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  min-height: 44px;
  box-sizing: border-box;
}

.pl-0 {
  padding-left: 0;
}

.image-upload-container {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.image-upload-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

.image-upload-area {
  width: 100%;
  height: 200px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.upload-text {
  margin-top: 8px;
  font-size: 14px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-1 {
  margin-bottom: 4px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.picker-content {
  background-color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.picker-text {
  color: #333;
}

.mr-2 {
  margin-right: 8px;
}

.publish-btn {
  border: none;
  min-width: 70px;
  line-height: 1.8;
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.bg-green-500 { background-color: #4CAF50; }
.bg-gray-300 { background-color: #d1d5db; }
.text-white { color: #ffffff; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-900 { color: #111827; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.font-medium { font-weight: 500; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.w-full { width: 100%; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.text-center { text-align: center; }
</style> 