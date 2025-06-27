<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="px-4 pt-10 pb-4 bg-white">
      <view class="flex items-center justify-between mb-4">
        <text class="text-xl font-bold">积分商城</text>
        <view class="flex">
          <view class="mr-5" @tap="forceRefresh">
            <text class="iconfont icon-refresh text-gray-500"></text>
          </view>
          <view class="mr-5">
            <text class="iconfont icon-heart text-gray-500"></text>
          </view>
          <view class="relative">
            <text class="iconfont icon-shopping-bag text-gray-500"></text>
            <text class="badge-dot" v-if="redemptionCount > 0">{{redemptionCount}}</text>
          </view>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="search-container">
        <view class="search-input-wrapper">
          <image src="/static/images/icons/icon-search.svg" class="search-icon" @tap="handleSearch"></image>
          <input 
            type="text" 
            v-model="searchKeyword"
            class="search-input" 
            placeholder="搜索环保产品..."
            @confirm="handleSearch">
          <image 
            v-if="searchKeyword" 
            src="/static/images/icons/icon-close-circle.svg"
            class="clear-icon" 
            @tap="clearSearch"></image>
        </view>
        
        <!-- 搜索状态 -->
        <view v-if="isSearchMode" class="search-status mt-2">
          <view class="flex items-center">
            <text class="text-sm">关键词: "{{ searchKeyword }}"</text>
            <text class="text-xs text-gray-500 ml-2">(找到 {{ searchResults.length }} 条结果)</text>
            <view class="ml-auto">
              <text class="text-green-500 text-sm" @tap="exitSearch">退出搜索</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 下拉刷新区域 -->
    <scroll-view 
      scroll-y 
      class="mall-content" 
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore">
      
      <!-- 我的积分状态 -->
      <view class="px-4 py-4 bg-white border-b">
        <view class="flex items-center justify-between">
          <view>
            <text class="text-sm text-gray-500">我的环保积分</text>
            <view class="flex items-baseline">
              <text class="text-2xl font-bold mr-2">{{userPoints}}</text>
              <text class="text-sm text-gray-500">可兑换</text>
            </view>
          </view>
          <view class="bg-green-50 px-4 py-2 rounded-lg">
            <text class="text-xs text-gray-500 mb-1">本月已获得积分</text>
            <text class="text-green-500 font-semibold">+{{monthPoints}}</text>
          </view>
        </view>
      </view>

      <!-- 商品更新提示 -->
      <view v-if="showUpdateTip" class="update-tip" @tap="refreshData">
        <text class="update-tip-text">商品信息已更新，点击刷新</text>
      </view>

      <!-- 分类导航 -->
      <view class="px-4 py-3 bg-white" v-if="!isSearchMode">
        <scroll-view scroll-x class="flex whitespace-nowrap pb-2">
          <text class="category-btn" :class="{'active': currentCategory === '全部'}" @click="changeCategory('全部')">全部</text>
          <text class="category-btn flex-shrink-0 space-left" :class="{'active': currentCategory === '热门'}" @click="changeCategory('热门')">热门</text>
          <text class="category-btn flex-shrink-0 space-left" :class="{'active': currentCategory === '限时兑换'}" @click="changeCategory('限时兑换')">限时兑换</text>
          <text class="category-btn flex-shrink-0 space-left" :class="{'active': currentCategory === '环保用品'}" @click="changeCategory('环保用品')">环保用品</text>
          <text class="category-btn flex-shrink-0 space-left" :class="{'active': currentCategory === '绿植花卉'}" @click="changeCategory('绿植花卉')">绿植花卉</text>
          <text class="category-btn flex-shrink-0 space-left" :class="{'active': currentCategory === '优惠券'}" @click="changeCategory('优惠券')">优惠券</text>
        </scroll-view>
      </view>

      <!-- 商品列表 -->
      <view class="p-4">
        <!-- 如果是搜索模式，显示搜索结果 -->
        <view v-if="isSearchMode">
          <!-- 搜索结果为空 -->
          <view v-if="searchResults.length === 0" class="flex flex-col items-center py-10">
            <text class="iconfont icon-search text-gray-300 text-5xl mb-4"></text>
            <text class="text-gray-500">没有找到相关商品</text>
          </view>
          
          <!-- 搜索结果列表 -->
          <view v-else>
            <view class="grid-2 gap-4">
              <view class="product-card" v-for="(reward, index) in searchResults" :key="reward._id">
                <view class="product-img-container">
                  <image :src="formatImageUrl(reward.image_url) || formatImageUrl(reward.image)" :alt="reward.name" class="product-img" @error="handleImageError"></image>
                  <view class="point-tag">{{reward.required_points || reward.points}}积分</view>
                </view>
                <view class="p-2">
                  <text class="font-medium text-sm mb-1">{{reward.name}}</text>
                  <view class="flex items-center justify-between">
                    <text class="text-xs text-gray-500">库存:{{getStockQuantity(reward)}}</text>
                    <button class="btn-exchange-small" v-if="reward.status === 'available'" @click="confirmRedemption(reward)">兑换</button>
                    <button class="btn-exchange-disabled-small" v-else-if="reward.status === 'unavailable'">积分不足</button>
                    <button class="btn-exchange-disabled-small" v-else>已售罄</button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 正常模式显示标准商品列表 -->
        <view v-else>
          <!-- 限时兑换区 -->
          <view class="mb-6" v-if="limitedTimeRewards.length > 0">
            <view class="flex justify-between items-center mb-3">
              <text class="text-lg font-semibold">限时兑换</text>
              <view class="flex items-center">
                <text class="text-sm text-gray-500" @click="viewMore('限时兑换')">查看更多</text>
                <IconImage :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></IconImage>
              </view>
            </view>

            <view class="card bg-white p-3 mb-4" v-for="(reward, index) in displayedLimitedTimeRewards" :key="reward._id">
              <view class="flex items-center">
                <view class="product-img-container-lg">
                  <image :src="formatImageUrl(reward.image_url) || formatImageUrl(reward.image)" :alt="reward.name" class="product-image" @error="handleImageError"></image>
                  <view class="point-tag">{{reward.required_points || reward.points}}积分</view>
                </view>
                <view class="ml-4 flex-grow">
                  <text class="font-medium text-sm mb-1">{{reward.name}}</text>
                  <text v-if="reward.description" class="text-xs text-gray-500 mb-1 line-clamp-2">{{reward.description}}</text>
                  <view class="flex items-center mb-1">
                    <text class="stock-tag mr-2">库存{{getStockQuantity(reward)}}</text>
                    <text class="text-xs text-red-500" v-if="reward.remaining_time">剩余：{{reward.remaining_time.text || '0天0小时'}}</text>
                  </view>
                  <view class="mb-2">
                    <view class="flex justify-between text-xs mb-1">
                      <text>已兑换进度</text>
                      <text>70%</text>
                    </view>
                    <view class="progress-bar">
                      <view class="progress" style="width: 70%"></view>
                    </view>
                  </view>
                  <button class="btn-exchange" v-if="reward.status === 'available'" @click="confirmRedemption(reward)">立即兑换</button>
                  <button class="btn-exchange-disabled" v-else-if="reward.status === 'unavailable'">积分不足</button>
                  <button class="btn-exchange-disabled" v-else>已售罄</button>
                </view>
              </view>
            </view>
          </view>

          <!-- 热门兑换 -->
          <view class="mb-6" v-if="hotRewards.length > 0">
            <view class="flex justify-between items-center mb-3">
              <text class="text-lg font-semibold">热门兑换</text>
              <view class="flex items-center">
                <text class="text-sm text-gray-500" @click="viewMore('热门')">查看更多</text>
                <IconImage :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></IconImage>
              </view>
            </view>

            <view class="grid-2 gap-4">
              <view class="product-card" v-for="(reward, index) in displayedHotRewards" :key="reward._id">
                <view class="product-img-container">
                  <image :src="formatImageUrl(reward.image_url) || formatImageUrl(reward.image)" :alt="reward.name" class="product-img" @error="handleImageError"></image>
                  <view class="point-tag">{{reward.required_points || reward.points}}积分</view>
                </view>
                <view class="p-2">
                  <text class="font-medium text-sm mb-1">{{reward.name}}</text>
                  <view class="flex items-center justify-between">
                    <text class="text-xs text-gray-500">库存:{{getStockQuantity(reward)}}</text>
                    <button class="btn-exchange-small" v-if="reward.status === 'available'" @click="confirmRedemption(reward)">兑换</button>
                    <button class="btn-exchange-disabled-small" v-else-if="reward.status === 'unavailable'">积分不足</button>
                    <button class="btn-exchange-disabled-small" v-else>已售罄</button>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 积分兑换专区 -->
          <view v-if="categoryRewards.length > 0">
            <view class="flex justify-between items-center mb-3">
              <text class="text-lg font-semibold">积分兑换专区</text>
              <view class="flex items-center">
                <text class="text-sm text-gray-500" @click="viewMore('全部')">查看更多</text>
                <IconImage :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></IconImage>
              </view>
            </view>

            <view class="grid-2 gap-4">
              <view class="product-card" v-for="(reward, index) in categoryRewards" :key="reward._id">
                <view class="product-img-container">
                  <image :src="formatImageUrl(reward.image_url) || formatImageUrl(reward.image)" :alt="reward.name" class="product-img" @error="handleImageError"></image>
                  <view class="point-tag">{{reward.required_points || reward.points}}积分</view>
                </view>
                <view class="p-2">
                  <text class="font-medium text-sm mb-1">{{reward.name}}</text>
                  <view class="flex items-center justify-between">
                    <text class="text-xs text-gray-500">库存:{{getStockQuantity(reward)}}</text>
                    <button class="btn-exchange-small" v-if="reward.status === 'available'" @click="confirmRedemption(reward)">兑换</button>
                    <button class="btn-exchange-disabled-small" v-else-if="reward.status === 'unavailable'">积分不足</button>
                    <button class="btn-exchange-disabled-small" v-else>已售罄</button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container py-5">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载商品信息...</text>
      </view>
    </scroll-view>
    
    <!-- 兑换确认弹窗 -->
    <uni-popup ref="redemptionPopup" type="center">
      <view class="bg-white rounded-lg p-4" style="width: 300px;">
        <view class="text-center mb-4">
          <text class="text-lg font-bold">确认兑换</text>
        </view>
        <view class="mb-4" v-if="selectedReward">
          <view class="flex items-center mb-3">
            <image :src="formatImageUrl(selectedReward.image_url) || formatImageUrl(selectedReward.image)" class="w-16 h-16 rounded object-cover"></image>
            <view class="ml-3">
              <text class="font-medium">{{selectedReward.name}}</text>
              <text class="text-red-500 block">{{selectedReward.required_points || selectedReward.points}}积分</text>
            </view>
          </view>
          <view class="bg-gray-100 p-3 rounded mb-3">
            <text class="text-sm">您当前积分: {{userPoints}}</text>
            <text class="text-sm block">兑换后剩余: {{userPoints - (selectedReward.required_points || selectedReward.points || 0)}}</text>
          </view>
          
          <view v-if="addresses.length > 0">
            <text class="font-medium mb-2 block">选择收货地址:</text>
            <picker @change="addressChange" :value="selectedAddressIndex" :range="addressOptions">
              <view class="bg-gray-100 p-2 rounded">
                <text class="text-sm" v-if="selectedAddress">{{selectedAddress.name}} {{selectedAddress.phone}} - {{selectedAddress.address}}</text>
                <text class="text-sm" v-else>请选择收货地址</text>
              </view>
            </picker>
          </view>
          <view v-else class="text-center text-red-500 my-3">
            <text>您还没有添加收货地址</text>
            <text class="text-blue-500 ml-2" @click="goToAddAddress">去添加</text>
          </view>
        </view>
        <view class="flex justify-between">
          <button class="btn-cancel" @click="closePopup">取消</button>
          <button class="btn-confirm" @click="redeemReward" :disabled="!selectedAddress || isRedeeming">确认兑换</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 结果提示弹窗 -->
    <uni-popup ref="resultPopup" type="center">
      <view class="bg-white rounded-lg p-4 text-center" style="width: 250px;">
        <text class="text-lg font-bold mb-3 block">{{resultMessage}}</text>
        <button class="btn-confirm w-full" @click="closeResultPopup">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue';
import { getCurrentUserFromProfile } from '@/services/login.js';
import { searchRewards, getUserPoints, ensureStockQuantity } from '@/services/mall.js';
import { updatePointsCache } from '@/services/points.js';
import IconImage from '@/components/IconImage.vue';

// 用户积分
const userPoints = ref(1000); // 默认值设为1000
const monthPoints = ref(0);
const redemptionCount = ref(0);

// 分类和商品
const currentCategory = ref('全部');
const allRewards = ref([]);
const limitedTimeRewards = ref([]);
const hotRewards = ref([]);
const regularRewards = ref([]);  // 新增：普通商品列表

// 格式化图片URL，确保路径正确
const formatImageUrl = (url) => {
  if (!url) return '/static/images/mall/default-product.png';
  
  // 如果不是以斜杠或http开头，添加前导斜杠
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return '/' + url;
  }
  
  return url;
};

// 搜索相关
const searchKeyword = ref('');
const isSearchMode = ref(false);
const searchResults = ref([]);
const searchPage = ref(1);
const searchPageSize = ref(20);

// 弹窗相关
const redemptionPopup = ref(null);
const resultPopup = ref(null);
const selectedReward = ref(null);
const resultMessage = ref('');
const isRedeeming = ref(false);

// 地址相关
const addresses = ref([]);
const selectedAddressIndex = ref(0);
const selectedAddress = ref(null);
const addressChanged = ref(false);

// 刷新和加载状态
const refreshing = ref(false);
const loading = ref(true);
const showUpdateTip = ref(false);
const hasUpdates = ref(false);

// 计算属性：根据分类和限制显示商品
const displayedLimitedTimeRewards = computed(() => {
  return limitedTimeRewards.value.slice(0, 1); // 限时商品只显示1个
});

const displayedHotRewards = computed(() => {
  return hotRewards.value.slice(0, 4); // 热门商品最多显示4个
});

const categoryRewards = computed(() => {
  if (currentCategory.value === '全部') {
    return regularRewards.value.slice(0, 4); // 普通商品最多显示4个
  } else if (currentCategory.value === '限时兑换') {
    return limitedTimeRewards.value;
  } else if (currentCategory.value === '热门') {
    return hotRewards.value;
  } else {
    return regularRewards.value.filter(item => item.category === currentCategory.value).slice(0, 8);
  }
});

// 地址选项
const addressOptions = computed(() => {
  return addresses.value.map(addr => `${addr.name} ${addr.phone} - ${addr.address}`);
});

// 安全获取库存数量
const getStockQuantity = (reward) => {
  if (!reward) return 0;
  
  // 使用辅助函数确保库存数量是安全的数字
  const safeReward = ensureStockQuantity(reward);
  
  // 优先使用stock_quantity，如果没有则使用stock
  return typeof safeReward.stock_quantity !== 'undefined' ? safeReward.stock_quantity : 
         (typeof safeReward.stock !== 'undefined' ? safeReward.stock : 0);
};

// 搜索商品
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    if (isSearchMode.value) {
      exitSearch();
    }
    return;
  }
  
  // 设置为搜索模式
  isSearchMode.value = true;
  searchPage.value = 1;
  
  try {
    uni.showLoading({ title: '搜索中...' });
    
    // 调用搜索服务
    const result = await searchRewards(searchKeyword.value, {
      page: searchPage.value,
      pageSize: searchPageSize.value
    });
    
    if (result.success) {
      // 确保搜索结果的图片路径正确
      searchResults.value = result.data.map(reward => {
        // 使用ensureStockQuantity确保数据格式正确
        const safeReward = ensureStockQuantity(reward);
        
        // 确保图片路径格式正确
        if (safeReward.image_url) {
          safeReward.image_url = formatImageUrl(safeReward.image_url);
        }
        if (safeReward.image) {
          safeReward.image = formatImageUrl(safeReward.image);
        }
        
        return safeReward;
      });
      
      console.log(`搜索结果: 找到 ${result.data.length} 个商品`);
      
      // 打印图片路径调试信息
      searchResults.value.forEach(reward => {
        console.log(`搜索商品[${reward.name}]图片路径: ${reward.image_url}`);
      });
    } else {
      searchResults.value = [];
      uni.showToast({
        title: result.message || '搜索失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('搜索失败', error);
    uni.showToast({
      title: '搜索失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  if (isSearchMode.value) {
    exitSearch();
  }
};

// 退出搜索模式
const exitSearch = () => {
  isSearchMode.value = false;
  searchKeyword.value = '';
  searchResults.value = [];
};

// 修改分类
const changeCategory = (category) => {
  currentCategory.value = category;
};

// 查看更多
const viewMore = (category) => {
  // 根据类型切换到相应的分类
  if (category === '热门') {
    currentCategory.value = '热门';
    uni.showToast({
      title: '已切换到热门兑换专区',
      icon: 'none'
    });
  } else if (category === '限时兑换') {
    currentCategory.value = '限时兑换';
    uni.showToast({
      title: '已切换到限时兑换专区',
      icon: 'none'
    });
  } else {
    currentCategory.value = '全部';
    uni.showToast({
      title: '已切换到积分兑换专区',
      icon: 'none'
    });
  }
  
  // 滚动到分类导航区域
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  });
};

// 在页面显示时刷新数据
uni.$on('addressUpdated', () => {
  loadAddresses();
  addressChanged.value = true;
});

// 初始化数据
onMounted(async () => {
  // 首先加载用户积分，强制从云端刷新
  await loadUserPoints(true);
  
  // 加载限时商品，优先展示
  try {
    await loadLimitedTimeRewards();
    console.log('已加载限时商品:', limitedTimeRewards.value);
  } catch (error) {
    console.error('加载限时商品失败:', error);
  }
  
  // 然后加载其他数据
  try {
    await Promise.all([
      loadAddresses(),
      loadAllRewards(),
      loadHotRewards(),
      loadRedemptionCount()
    ]);
    
    // 对所有商品进行分类
    categorizeRewards();
    loading.value = false;
  } catch (loadError) {
    console.error('加载商品数据失败:', loadError);
    loading.value = false;
  }
  
  // 监听积分更新事件
  uni.$on('userPointsUpdated', handlePointsUpdate);
  
  // 监听商品更新事件
  uni.$on('rewardsUpdated', handleRewardsUpdate);
});

// 在组件销毁时清除事件监听
onUnmounted(() => {
  uni.$off('userPointsUpdated', handlePointsUpdate);
  uni.$off('rewardsUpdated', handleRewardsUpdate);
});

// 监听商品更新事件
const handleRewardsUpdate = (updateData) => {
  console.log('商城页面收到商品更新事件:', updateData);
  hasUpdates.value = true;
  showUpdateTip.value = true;
};

// 监听积分更新事件
const handlePointsUpdate = (pointsData) => {
  if (pointsData && typeof pointsData.points !== 'undefined') {
    console.log('商城页面收到积分更新事件:', pointsData);
    userPoints.value = pointsData.points;
  }
};

// 加载用户积分
const loadUserPoints = async (force = false) => {
  try {
    // 首先尝试从本地存储获取积分
    try {
      const pointsStr = uni.getStorageSync('user_points');
      if (!force && pointsStr) {
        const points = parseInt(pointsStr);
        console.log('从本地存储获取积分:', points);
        
        userPoints.value = points;
        console.log('从本地存储设置用户积分:', userPoints.value);
        
        // 保存到本地缓存，同步到其他组件
        updatePointsCache({ points });
        
        return;
      }
    } catch (localError) {
      console.error('从本地存储获取积分失败:', localError);
    }
    
    // 使用优化后的服务函数获取用户积分
    const result = await getUserPoints(force);
    
    console.log('获取积分结果:', result);
    
    if (result && result.success && result.data) {
      userPoints.value = result.data.points || 0;
      console.log('用户积分:', userPoints.value);
      
      // 保存到本地存储，确保一致性
      try {
        uni.setStorageSync('user_points', userPoints.value.toString());
      } catch (e) {
        console.error('保存积分到本地存储失败:', e);
      }
    } else {
      console.warn('获取积分失败，使用默认值或上次的值:', result?.message);
      
      // 如果未设置过积分，则使用默认值
      if (userPoints.value === undefined) {
        userPoints.value = 1000;
        
        // 保存默认积分到本地存储
        try {
          uni.setStorageSync('user_points', '1000');
        } catch (e) {
          console.error('保存默认积分到本地存储失败:', e);
        }
      }
    }
  } catch (error) {
    console.error('获取积分失败，使用默认值:', error);
    // 如果未设置过积分，则使用默认值
    if (userPoints.value === undefined) {
      userPoints.value = 1000;
      
      // 保存默认积分到本地存储
      try {
        uni.setStorageSync('user_points', '1000');
      } catch (e) {
        console.error('保存默认积分到本地存储失败:', e);
      }
    }
  }
};

// 加载收货地址
const loadAddresses = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getAddresses'
    });
    
    if (result && result.success) {
      addresses.value = result.data || [];
      
      if (result.default_address) {
        selectedAddress.value = result.default_address;
        // 找出默认地址的索引
        selectedAddressIndex.value = addresses.value.findIndex(addr => addr._id === result.default_address._id);
        if (selectedAddressIndex.value < 0) selectedAddressIndex.value = 0;
      } else if (addresses.value.length > 0) {
        selectedAddress.value = addresses.value[0];
      }
      
      // 如果地址被更新了，且兑换弹窗是打开的，重新显示弹窗
      if (addressChanged.value && redemptionPopup.value) {
        addressChanged.value = false;
        if (addresses.value.length > 0) {
          setTimeout(() => {
            selectedAddress.value = addresses.value[0];
            redemptionPopup.value.open();
          }, 500);
        }
      }
    }
  } catch (error) {
    console.error('获取地址失败', error);
  }
};

// 加载所有商品
const loadAllRewards = async () => {
  try {
    // 从profile页面获取用户信息
    const currentUser = getCurrentUserFromProfile();
    let userId = currentUser && currentUser._id ? currentUser._id : null;
    
    const { result } = await uniCloud.callFunction({
      name: 'getRewards',
      data: { 
        userId,
        userPoints: userPoints.value
      }
    });
    
    if (result && result.success) {
      // 确保每个商品的库存数量和图片路径是正确的
      allRewards.value = (result.data || []).map(reward => {
        const safeReward = ensureStockQuantity(reward);
        
        // 确保图片路径格式正确
        if (safeReward.image_url) {
          safeReward.image_url = formatImageUrl(safeReward.image_url);
        }
        if (safeReward.image) {
          safeReward.image = formatImageUrl(safeReward.image);
        }
        
        return safeReward;
      });
      
      // 打印图片路径调试信息
      allRewards.value.forEach(reward => {
        console.log(`商品[${reward.name}]图片路径: ${reward.image_url}`);
      });
      
      // 对商品进行分类
      categorizeRewards();
    }
  } catch (error) {
    console.error('获取所有商品失败', error);
  }
};

// 加载热门商品
const loadHotRewards = async () => {
  try {
    // 从profile页面获取用户信息
    const currentUser = getCurrentUserFromProfile();
    let userId = currentUser && currentUser._id ? currentUser._id : null;
    
    const hotResult = await uniCloud.callFunction({
      name: 'getHotRewards',
      data: { 
        userId,
        userPoints: userPoints.value
      }
    });
    
    if (hotResult.result && hotResult.result.success) {
      // 确保每个热门商品的库存数量和图片路径是正确的
      hotRewards.value = (hotResult.result.data || []).map(reward => {
        const safeReward = ensureStockQuantity(reward);
        
        // 确保图片路径格式正确
        if (safeReward.image_url) {
          safeReward.image_url = formatImageUrl(safeReward.image_url);
        }
        if (safeReward.image) {
          safeReward.image = formatImageUrl(safeReward.image);
        }
        
        safeReward.is_hot = true; // 确保标记为热门
        return safeReward;
      });
      
      // 对商品进行分类
      categorizeRewards();
    }
  } catch (error) {
    console.error('获取热门商品失败', error);
  }
};

// 分离限时商品加载，以便单独调用
const loadLimitedTimeRewards = async () => {
  try {
    // 从profile页面获取用户信息
    const currentUser = getCurrentUserFromProfile();
    let userId = currentUser && currentUser._id ? currentUser._id : null;
    
    const limitedResult = await uniCloud.callFunction({
      name: 'getLimitedTimeRewards',
      data: { 
        userId,
        userPoints: userPoints.value
      }
    });
    
    if (limitedResult.result && limitedResult.result.success) {
      // 确保每个限时商品的库存数量和图片路径是正确的
      limitedTimeRewards.value = (limitedResult.result.data || []).map(reward => {
        const safeReward = ensureStockQuantity(reward);
        
        // 确保图片路径格式正确
        if (safeReward.image_url) {
          safeReward.image_url = formatImageUrl(safeReward.image_url);
        }
        if (safeReward.image) {
          safeReward.image = formatImageUrl(safeReward.image);
        }
        
        safeReward.is_limited = true; // 确保标记为限时
        return safeReward;
      });
      
      // 对商品进行分类
      categorizeRewards();
      
      // 打印调试信息
      limitedTimeRewards.value.forEach(reward => {
        console.log(`限时商品[${reward.name}]图片路径: ${reward.image_url}`);
      });
    }
  } catch (error) {
    console.error('获取限时商品失败', error);
  }
};

// 分类商品函数
const categorizeRewards = () => {
  // 先将所有商品整合到一起以便分类
  const allRewardsMap = new Map();
  
  // 添加所有普通商品
  allRewards.value.forEach(reward => {
    allRewardsMap.set(reward._id, { ...reward });
  });
  
  // 添加热门商品，标记为热门
  hotRewards.value.forEach(reward => {
    allRewardsMap.set(reward._id, { ...reward, is_hot: true });
  });
  
  // 添加限时商品，标记为限时
  limitedTimeRewards.value.forEach(reward => {
    allRewardsMap.set(reward._id, { ...reward, is_limited: true, is_limited_time: true });
  });
  
  // 根据属性进行分类
  regularRewards.value = [];
  hotRewards.value = [];
  limitedTimeRewards.value = [];
  
  allRewardsMap.forEach(reward => {
    // 先判断限时，优先级最高
    if (reward.is_limited === true || reward.is_limited_time === true) {
      limitedTimeRewards.value.push(reward);
    }
    // 再判断热门
    else if (reward.is_hot === true) {
      hotRewards.value.push(reward);
    }
    // 最后是普通商品
    else {
      regularRewards.value.push(reward);
    }
  });
  
  // 对商品列表内部按照积分和库存再次排序
  const sortByPointsAndStock = (a, b) => {
    const aPoints = a.required_points || a.points || 0;
    const bPoints = b.required_points || b.points || 0;
    
    // 先按积分从低到高排序
    if (aPoints !== bPoints) {
      return aPoints - bPoints;
    }
    
    // 积分相同，按库存从高到低排序
    const aStock = a.stock_quantity || a.stock || 0;
    const bStock = b.stock_quantity || b.stock || 0;
    return bStock - aStock;
  };
  
  limitedTimeRewards.value.sort(sortByPointsAndStock);
  hotRewards.value.sort(sortByPointsAndStock);
  regularRewards.value.sort(sortByPointsAndStock);
  
  console.log(`商品分类完成: 限时(${limitedTimeRewards.value.length}), 热门(${hotRewards.value.length}), 普通(${regularRewards.value.length})`);
};

// 统一加载所有商品，然后进行分类
const loadRewards = async () => {
  try {
    await Promise.all([
      loadAllRewards(),
      loadHotRewards(),
      loadLimitedTimeRewards()
    ]);
    
    // 对所有商品进行分类
    categorizeRewards();
  } catch (error) {
    console.error('加载商品数据失败:', error);
  }
};

// 加载兑换记录数量
const loadRedemptionCount = async () => {
  try {
    // 从profile页面获取用户信息
    const currentUser = getCurrentUserFromProfile();
    let userId = currentUser && currentUser._id ? currentUser._id : null;
    console.log('从profile获取的用户ID (兑换记录):', userId);
    
    const { result } = await uniCloud.callFunction({
      name: 'getUserRedemptions',
      data: { userId }
    });
    
    if (result && result.success) {
      redemptionCount.value = (result.data || []).length;
    }
  } catch (error) {
    console.error('获取兑换记录数量失败', error);
  }
};

// 确认兑换
const confirmRedemption = (reward) => {
  // 确保reward和stock_quantity是安全的
  const safeReward = ensureStockQuantity(reward);
  selectedReward.value = safeReward;
  
  // 如果没有地址，先去添加地址
  if (addresses.value.length === 0) {
    goToAddAddress();
    return;
  }
  
  redemptionPopup.value.open();
};

// 地址选择变化
const addressChange = (e) => {
  selectedAddressIndex.value = e.detail.value;
  selectedAddress.value = addresses.value[selectedAddressIndex.value];
};

// 关闭弹窗
const closePopup = () => {
  redemptionPopup.value.close();
};

// 关闭结果弹窗
const closeResultPopup = () => {
  resultPopup.value.close();
  // 刷新数据
  loadUserPoints(true); // 强制从服务器刷新积分
  loadRewards(); // 使用新的统一加载函数
  loadRedemptionCount();
};

// 前往添加地址页面
const goToAddAddress = () => {
  uni.navigateTo({
    url: '/pages/profile/address-edit'
  });
};

// 兑换奖品
const redeemReward = async () => {
  if (!selectedAddress.value) {
    resultMessage.value = '请选择收货地址';
    redemptionPopup.value.close();
    resultPopup.value.open();
    return;
  }
  
  isRedeeming.value = true;
  
  try {
    // 使用固定的默认用户ID
    const userId = '10086420';
    console.log('兑换商品使用用户ID:', userId);
    
    // 添加随机延迟，避免过快操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 获取参数信息
    const rewardId = selectedReward.value._id;
    const addressId = selectedAddress.value._id;
    const pointsRequired = selectedReward.value.required_points || selectedReward.value.points || 0;
    
    // 确认商品可兑换状态
    if (selectedReward.value.status !== 'available') {
      console.error('商品状态不可兑换:', selectedReward.value.status);
      redemptionPopup.value.close();
      resultMessage.value = selectedReward.value.status === 'unavailable' ? '积分不足' : '商品已售罄';
      resultPopup.value.open();
      isRedeeming.value = false;
      return;
    }
    
    // 再次确认库存
    const currentStock = getStockQuantity(selectedReward.value);
    console.log('兑换前再次检查库存:', currentStock);
    if (currentStock <= 0) {
      console.error('商品库存不足');
      redemptionPopup.value.close();
      resultMessage.value = '商品已售罄';
      resultPopup.value.open();
      isRedeeming.value = false;
      return;
    }
    
    // 保存当前状态，以便回滚
    const originalPoints = userPoints.value;
    const originalStock = getStockQuantity(selectedReward.value);
    
    // 先在本地更新UI显示
    userPoints.value = Math.max(0, userPoints.value - pointsRequired);
    if (selectedReward.value.stock_quantity !== undefined) {
      selectedReward.value.stock_quantity = Math.max(0, selectedReward.value.stock_quantity - 1);
    } else if (selectedReward.value.stock !== undefined) {
      selectedReward.value.stock = Math.max(0, selectedReward.value.stock - 1);
    }
    
    // 关闭兑换弹窗，显示处理中
    redemptionPopup.value.close();
    uni.showLoading({ title: '处理中...' });
    
    // 添加详细的请求数据日志
    console.log('发送兑换请求:', {
      userId,
      rewardId,
      addressId,
      reward: {
        name: selectedReward.value.name,
        stock: selectedReward.value.stock,
        stock_quantity: selectedReward.value.stock_quantity,
        status: selectedReward.value.status
      }
    });
    
    // 调用直接兑换函数
    const { result } = await uniCloud.callFunction({
      name: 'redeemRewardDirect',
      data: {
        userId: userId,
        rewardId: rewardId,
        addressId: addressId
      }
    });
    
    uni.hideLoading();
    console.log('直接兑换结果:', result);
    
    if (result && result.success) {
      // 使用服务器返回的数据更新本地状态
      if (result.data && result.data.remaining_points !== undefined) {
        userPoints.value = result.data.remaining_points;
        
        // 更新积分缓存，这会自动广播到其他页面
        updatePointsCache({ points: result.data.remaining_points });
        
        // 更新本地存储中的积分
        try {
          uni.setStorageSync('user_points', result.data.remaining_points.toString());
          console.log('兑换后更新本地积分存储:', result.data.remaining_points);
        } catch (e) {
          console.error('保存积分到本地存储失败:', e);
        }
      }
      
      resultMessage.value = '兑换成功';
      resultPopup.value.open();
      
      // 刷新数据
      setTimeout(() => {
        loadUserPoints(true); // 强制从服务器刷新积分
        loadRewards();
        loadRedemptionCount();
      }, 1000);
    } else {
      // 如果服务器端兑换失败，回滚本地状态
      userPoints.value = originalPoints;
      if (selectedReward.value.stock_quantity !== undefined) {
        selectedReward.value.stock_quantity = originalStock;
      } else if (selectedReward.value.stock !== undefined) {
        selectedReward.value.stock = originalStock;
      }
      
      resultMessage.value = result?.message || '兑换失败，请稍后重试';
      resultPopup.value.open();
      
      // 立即刷新数据，确保显示正确的状态
      setTimeout(() => {
        loadRewards();
      }, 500);
    }
    
    isRedeeming.value = false;
  } catch (error) {
    console.error('兑换过程中发生错误:', error);
    uni.hideLoading();
    
    isRedeeming.value = false;
    resultMessage.value = '兑换失败，请稍后重试';
    resultPopup.value.open();
    
    // 刷新数据
    setTimeout(() => {
      loadUserPoints(true); // 强制从服务器刷新积分
      loadRewards();
      loadRedemptionCount();
    }, 1000);
  }
};

// 下拉刷新处理
const onRefresh = async () => {
  refreshing.value = true;
  try {
    await refreshData();
  } finally {
    setTimeout(() => {
      refreshing.value = false;
    }, 500); // 确保刷新动画至少显示500ms
  }
};

// 强制刷新
const forceRefresh = async () => {
  loading.value = true;
  await refreshData();
  loading.value = false;
};

// 刷新数据
const refreshData = async () => {
  // 重置更新提示
  showUpdateTip.value = false;
  hasUpdates.value = false;
  
  try {
    // 刷新所有数据
    await loadUserPoints(true);
    await loadRewards();
    await loadAddresses();
    await loadRedemptionCount();
    
    // 显示刷新成功消息
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
  } catch (error) {
    console.error('刷新数据失败:', error);
    uni.showToast({
      title: '刷新失败，请稍后再试',
      icon: 'none',
      duration: 2000
    });
  }
};

// 滚动到底部加载更多
const onLoadMore = () => {
  // 目前只是预留的方法，如果需要分页加载可以在这里实现
  console.log('滚动到底部，可以加载更多');
};

// 图片加载错误处理
const handleImageError = (e) => {
  // 获取当前src
  const originalSrc = e.target.src;
  console.log('图片加载失败:', originalSrc);
  
  // 尝试修复路径
  try {
    let newSrc = originalSrc;
    
    // 如果是相对路径但没有前导斜杠，添加斜杠
    if (originalSrc && !originalSrc.startsWith('/') && !originalSrc.startsWith('http')) {
      newSrc = '/' + originalSrc;
      console.log('尝试添加前导斜杠修复路径:', newSrc);
    }
    // 如果路径有两个斜杠，删除一个
    else if (originalSrc && originalSrc.startsWith('//')) {
      newSrc = originalSrc.substring(1);
      console.log('尝试移除多余斜杠修复路径:', newSrc);
    }
    
    // 如果修复的路径与原路径不同，尝试使用新路径
    if (newSrc !== originalSrc) {
      e.target.src = newSrc;
      return; // 尝试用新路径加载
    }
  } catch (error) {
    console.error('修复图片路径失败:', error);
  }
  
  // 如果修复失败或者路径已经是最佳格式，使用默认图片
  e.target.src = '/static/images/mall/default-product.png';
  console.log('使用默认图片替换');
};
</script>

<style>
.container {
  background-color: #f8f9fa;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: #333;
  padding-bottom: 80px;
}

.card {
  border-radius: 16px;
  overflow: hidden;
}

.product-card {
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.product-img-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.product-img-container-lg {
  position: relative;
  width: 96px;
  height: 96px;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-btn {
  border-radius: 24px;
  padding: 6px 14px;
  font-size: 14px;
  background-color: #f1f9f2;
  color: #4CAF50;
  display: inline-block;
}

.category-btn.active {
  background-color: #4CAF50;
  color: white;
}

.point-tag {
  border-radius: 12px 0 12px 0;
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 3px 10px;
  font-size: 12px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.stock-tag {
  background-color: #FDF6E3;
  color: #F5A623;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  display: inline-block;
}

.progress-bar {
  height: 4px;
  border-radius: 2px;
  background-color: #e9ecef;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 2px;
  background-color: #4CAF50;
}

.btn-exchange {
  background-color: #4CAF50;
  color: white;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.btn-exchange-small {
  background-color: #4CAF50;
  color: white;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.btn-exchange-disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.btn-exchange-disabled-small {
  background-color: #e9ecef;
  color: #adb5bd;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.btn-confirm {
  background-color: #4CAF50;
  color: white;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.btn-cancel {
  background-color: #f1f3f5;
  color: #495057;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.product-image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  object-fit: cover;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
}

.badge-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background-color: #ef4444;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.space-left {
  margin-left: 12px;
}

/* 工具类 */
.px-4 { padding-left: 16px; padding-right: 16px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.p-4 { padding: 16px; }
.p-3 { padding: 12px; }
.p-2 { padding: 8px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.pb-2 { padding-bottom: 8px; }
.pr-10 { padding-right: 40px; }

.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.mr-5 { margin-right: 20px; }
.mr-4 { margin-right: 16px; }
.mr-2 { margin-right: 8px; }
.mr-1 { margin-right: 4px; }
.ml-4 { margin-left: 16px; }
.ml-3 { margin-left: 12px; }
.ml-2 { margin-left: 8px; }
.ml-1 { margin-left: 4px; }
.ml-auto { margin-left: auto; }
.my-3 { margin-top: 12px; margin-bottom: 12px; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-50 { background-color: #f0fdf4; }

.text-2xl { font-size: 24px; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-green-500 { color: #4CAF50; }
.text-red-500 { color: #ef4444; }
.text-blue-500 { color: #3b82f6; }
.text-center { text-align: center; }

.flex { display: flex; }
.flex-grow { flex-grow: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.self-center { align-self: center; }
.block { display: block; }

.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }

.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 8px; }
.rounded { border-radius: 4px; }

.gap-4 { gap: 16px; }

.relative { position: relative; }
.absolute { position: absolute; }
.top-0 { top: 0; }
.right-0 { right: 0; }

.whitespace-nowrap { white-space: nowrap; }

.object-cover { object-fit: cover; }

.w-full { width: 100%; }
.w-16 { width: 64px; }
.h-16 { height: 64px; }

/* 搜索相关样式 */
.search-container {
  margin-bottom: 10px;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 0;
  height: 36px;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 36px;
  background-color: transparent;
  border-radius: 20px;
  padding-left: 40px;
  padding-right: 15px;
  font-size: 14px;
  color: #666;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #999;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
}

.search-status {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
}

/* 添加新的样式 */
.mall-content {
  height: calc(100vh - 120px);
  position: relative;
}

.update-tip {
  background-color: rgba(76, 175, 80, 0.1);
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.update-tip-text {
  color: #4CAF50;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-top: 2px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 