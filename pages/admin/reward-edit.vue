<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">编辑商品</text>
        </view>
        <view>
          <button 
            class="publish-btn text-white text-sm bg-green-500 rounded-full px-4 py-1"
            :disabled="!canSave"
            :class="{'bg-gray-300': !canSave}"
            @tap="submitRewardChanges">
            保存
          </button>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container py-10">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 内容区 - 使用普通view替代scroll-view -->
    <view v-else class="form-wrapper p-4">
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
import { ref, computed, onMounted } from 'vue';
import { updateReward, getAllRewards, uploadImageToStatic } from '../../services/mall.js';
import IconImage from '../../components/IconImage.vue';

// 商品ID
const rewardId = ref('');

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
const loading = ref(true);

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
    content: '是否放弃修改？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};

// 加载商品详情
const loadRewardDetail = async (id) => {
  loading.value = true;
  try {
    const rewards = await getAllRewards();
    const reward = rewards.find(item => item._id === id);
    
    if (!reward) {
      uni.showToast({
        title: '未找到商品信息',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
      return;
    }
    
    console.log('加载商品详情:', {
      name: reward.name,
      is_hot: reward.is_hot,
      is_limited: reward.is_limited,
      is_limited_time: reward.is_limited_time
    });
    
    // 填充表单
    name.value = reward.name;
    description.value = reward.description || '';
    imageUrl.value = reward.image_url;
    points.value = (reward.required_points || reward.points || 0).toString();
    stock.value = (reward.stock_quantity || reward.stock || 0).toString();
    
    // 设置分类
    const category = reward.category;
    const cIndex = categoryOptions.findIndex(item => item === category);
    categoryIndex.value = cIndex > -1 ? cIndex : 0;
    
    // 设置热门状态 - 兼容不同字段名
    hotIndex.value = reward.is_hot === true ? 1 : 0;
    
    // 设置限时状态 - 兼容不同字段名
    limitedIndex.value = (reward.is_limited === true || reward.is_limited_time === true) ? 1 : 0;
    
  } catch (error) {
    uni.showToast({
      title: error.message || '获取商品信息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 获取事件通道
function getOpenerEventChannel() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const eventChannel = currentPage.getOpenerEventChannel();
  return eventChannel;
}

// 提交修改
const submitRewardChanges = async () => {
  if (!canSave.value) {
    uni.showToast({
      title: '请完善必填信息',
      icon: 'none'
    });
    return;
  }
  
  // 直接提交表单，不检查登录状态
  try {
    uni.showLoading({
      title: '保存中...',
      mask: true
    });
    
    // 构建更新数据
    const rewardData = {
      _id: rewardId.value,
      name: name.value,
      description: description.value,
      image_url: imageUrl.value, // 传递图片路径，可能是临时路径或已上传路径
      points: parseInt(points.value) || 0,
      stock: parseInt(stock.value) || 0,
      category: categoryOptions[categoryIndex.value],
      is_hot: hotIndex.value === 1,
      is_limited: limitedIndex.value === 1
    };
    
    // 调用更新服务，它会处理图片上传
    await updateReward(rewardData);
    
    uni.hideLoading();
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    });
    console.error('保存商品失败:', error);
  }
};

// 页面加载
onMounted(() => {
  // 检查管理员登录状态
  const adminLoginStatus = uni.getStorageSync('admin_login_status');
  if (adminLoginStatus !== 'loggedin') {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/admin/login'
      });
    }, 1500);
    return;
  }
  
  // 获取页面参数
  const page = getCurrentPages().pop();
  const options = page.options || {};
  
  if (options.id) {
    rewardId.value = options.id;
    loadRewardDetail(options.id);
  } else {
    uni.showToast({
      title: '缺少商品ID',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

// 获取分类显示文字
const getCategoryText = (category) => {
  const categories = {
    'daily': '日常用品',
    'plant': '绿植花卉',
    'coupon': '优惠券'
  };
  return categories[category] || category;
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

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.text-center { text-align: center; }
</style> 