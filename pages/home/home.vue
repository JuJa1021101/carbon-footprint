<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="px-4 pt-10 pb-4 bg-white">
      <view class="flex items-center justify-between mb-4">
        <text class="text-xl font-bold">环保先锋</text>
        <view class="flex">
          <view class="mr-4">
            <icon-image :name="'notification'" class="text-gray-500" size="18"></icon-image>
          </view>
          <view>
            <icon-image :name="'calendar'" class="text-gray-500" size="18"></icon-image>
          </view>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="relative search-container">
        <view class="search-input-container">
          <input 
            type="text" 
            v-model="searchKeyword"
            class="search-bar w-full bg-gray-100 py-2 px-4 pr-10 text-sm" 
            placeholder="搜索环保知识、活动..."
            @confirm="handleSearch">
          <icon-image 
            v-if="searchKeyword" 
            :name="'close-circle'"
            class="absolute right-10 top-2-5 text-gray-400" 
            size="16"
            @tap="clearSearch">
          </icon-image>
          <icon-image :name="'search'" class="absolute right-3 top-2-5 text-gray-400" size="16" @tap="handleSearch"></icon-image>
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

    <!-- 分类导航 -->
    <view class="px-4 py-4 bg-white">
      <scroll-view scroll-x class="flex whitespace-nowrap pb-2" show-scrollbar="false">
        <text class="nav-pill active-pill flex-shrink-0">全部</text>
        <text class="nav-pill bg-gray-100 flex-shrink-0 space-left">垃圾分类</text>
        <text class="nav-pill bg-gray-100 flex-shrink-0 space-left">节能减排</text>
        <text class="nav-pill bg-gray-100 flex-shrink-0 space-left">资源回收</text>
        <text class="nav-pill bg-gray-100 flex-shrink-0 space-left">低碳生活</text>
      </scroll-view>
    </view>

    <!-- 内容区 -->
    <view class="p-4">
      <!-- 搜索结果 -->
      <view v-if="isSearchMode">
        <!-- 搜索结果为空 -->
        <view v-if="searchResults.length === 0" class="flex flex-col items-center py-10">
          <icon-image :name="'search'" class="text-gray-300 text-5xl mb-4" size="48"></icon-image>
          <text class="text-gray-500">没有找到相关内容</text>
          <text class="text-gray-400 text-sm mt-2">换个关键词试试吧</text>
        </view>
        
        <!-- 环保知识搜索结果 -->
        <view v-else>
          <!-- 知识搜索结果 -->
          <view v-if="searchKnowledgeResults.length > 0" class="mb-6">
            <view class="flex justify-between items-center mb-3">
              <text class="text-lg font-semibold">环保知识</text>
              <view class="flex items-center" @tap="navigateToKnowledgeList">
                <text class="text-sm text-gray-500">查看更多</text>
                <icon-image :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></icon-image>
              </view>
            </view>
            
            <!-- 知识卡片列表 -->
            <view 
              v-for="item in searchKnowledgeResults" 
              :key="item._id"
              class="card bg-white mb-4" 
              @tap="navigateToKnowledgeDetail(item._id)">
              
              <template v-if="item.image">
                <image :src="item.image" mode="aspectFill" class="knowledge-img"></image>
                <view class="p-3">
                  <view class="flex mb-2">
                    <text class="green-tag" v-if="item.tags"># {{ item.tags.split(',')[0] }}</text>
                  </view>
                  <text class="font-medium mb-2 block">{{ item.title }}</text>
                  <view class="flex items-center text-gray-500 text-xs">
                    <icon-image :name="'eye'" class="mr-1" size="14"></icon-image>
                    <text class="mr-3">{{ item.views || 0 }}</text>
                    <icon-image :name="'like'" class="mr-1" size="14"></icon-image>
                    <text>{{ item.likes || 0 }}</text>
                    <text class="ml-auto">{{ formatDate(item.created_at) }}</text>
                  </view>
                </view>
              </template>
              
              <template v-else>
                <view class="flex">
                  <view class="p-3 flex-grow">
                    <view class="flex mb-2">
                      <text class="green-tag" v-if="item.tags"># {{ item.tags.split(',')[0] }}</text>
                    </view>
                    <text class="font-medium mb-2 block">{{ item.title }}</text>
                    <view class="flex items-center text-gray-500 text-xs">
                      <icon-image :name="'eye'" class="mr-1" size="14"></icon-image>
                      <text class="mr-3">{{ item.views || 0 }}</text>
                      <icon-image :name="'like'" class="mr-1" size="14"></icon-image>
                      <text>{{ item.likes || 0 }}</text>
                      <text class="ml-auto">{{ formatDate(item.created_at) }}</text>
                    </view>
                  </view>
                </view>
              </template>
            </view>
          </view>
          
          <!-- 活动搜索结果 -->
          <view v-if="searchActivityResults.length > 0">
            <view class="flex justify-between items-center mb-3">
              <text class="text-lg font-semibold">公益活动</text>
              <view class="flex items-center" @tap="navigateToAllActivities">
                <text class="text-sm text-gray-500">查看更多</text>
                <icon-image :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></icon-image>
              </view>
            </view>
            
            <!-- 活动卡片列表 -->
            <view 
              v-for="(activity, index) in searchActivityResults" 
              :key="activity._id || index"
              class="activity-card bg-white mb-4 rounded-lg"
              @tap="navigateToDetail(activity._id)">
              <view class="p-4">
                <!-- 活动标题和状态 -->
                <view class="flex justify-between items-center mb-2">
                  <text class="font-medium text-base">{{ activity.title }}</text>
                  <text 
                    :class="getStatusTextClass(activity)"
                    class="text-xs">
                    {{ activity.status }}
                  </text>
                </view>
                
                <!-- 活动描述 -->
                <text class="text-gray-600 text-sm mb-3">{{ activity.description }}</text>
                
                <!-- 活动地点 -->
                <view class="flex items-center mb-2 text-gray-500 text-sm">
                  <icon-image :name="'location'" class="mr-1" size="14"></icon-image>
                  <text>{{ activity.location }}</text>
                </view>
                
                <!-- 活动时间 -->
                <view class="flex items-center mb-3 text-gray-500 text-sm">
                  <icon-image :name="'calendar'" class="mr-1" size="14"></icon-image>
                  <text>{{ activity.activity_time }}</text>
                </view>
                
                <!-- 参与人数和报名按钮 -->
                <view class="flex items-center justify-between">
                  <!-- 参与人数 -->
                  <view class="flex items-center">
                    <view class="flex mr-2">
                      <view class="activity-avatar-icon">🧑</view>
                      <view class="activity-avatar-icon ml-n2">👩</view>
                      <view class="activity-avatar-icon ml-n2">👨</view>
                    </view>
                    <text class="text-xs text-gray-500">{{ getParticipantsCount(activity) }}人已报名</text>
                  </view>
                  
                  <!-- 报名按钮 -->
                  <button 
                    :class="getActionButtonClass(activity)"
                    @tap.stop="handleActivityAction(activity)">
                    {{ activity.status === '报名中' ? '立即报名' : '查看详情' }}
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 正常首页内容 -->
      <view v-else>
        <!-- 推荐环保知识 -->
        <view class="mb-6">
          <view class="flex justify-between items-center mb-3">
            <text class="text-lg font-semibold">环保知识</text>
            <view class="flex items-center" @tap="navigateToKnowledgeList">
              <text class="text-sm text-gray-500">查看更多</text>
              <icon-image :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></icon-image>
            </view>
          </view>

          <!-- 静态知识卡片 -->
          <!-- 第一张卡片 -->
          <view class="card bg-white mb-4" @tap="navigateToKnowledgeDetail('static1')">
            <image src="/static/images/userspost/garbage-sorting.jpeg" mode="aspectFill" class="knowledge-img"></image>
            <view class="p-3">
              <view class="flex mb-2">
                <text class="green-tag"># 垃圾分类</text>
              </view>
              <text class="font-medium mb-2 block">一张图看懂家庭垃圾如何正确分类</text>
              <view class="flex items-center text-gray-500 text-xs">
                <icon-image :name="'eye'" class="mr-1" size="14"></icon-image>
                <text class="mr-3">1234</text>
                <icon-image :name="'like'" class="mr-1" size="14"></icon-image>
                <text>56</text>
                <text class="ml-auto">3小时前</text>
              </view>
            </view>
          </view>

          <!-- 第二张卡片 -->
          <view class="card bg-white" @tap="navigateToKnowledgeDetail('static2')">
            <view class="flex">
              <view class="p-3 flex-grow">
                <view class="flex mb-2">
                  <text class="green-tag"># 节能减排</text>
                </view>
                <text class="font-medium mb-2 block">日常用电小窍门，轻松节能30%</text>
                <view class="flex items-center text-gray-500 text-xs">
                  <icon-image :name="'eye'" class="mr-1" size="14"></icon-image>
                  <text class="mr-3">867</text>
                  <icon-image :name="'like'" class="mr-1" size="14"></icon-image>
                  <text>42</text>
                  <text class="ml-auto">昨天</text>
                </view>
              </view>
              <view class="p-3">
                <image src="/static/images/userspost/energy-saving.jpeg" mode="aspectFill" class="small-img"></image>
              </view>
            </view>
          </view>
        </view>

        <!-- 公益活动 -->
        <view>
          <view class="flex justify-between items-center mb-3">
            <text class="text-lg font-semibold">公益活动</text>
            <view class="flex items-center" @tap="navigateToAllActivities">
              <text class="text-sm text-gray-500">查看更多</text>
              <icon-image :name="'right'" class="text-xs text-gray-500 ml-1" size="12"></icon-image>
            </view>
          </view>

          <!-- 加载中 -->
          <view v-if="loading" class="flex justify-center py-4">
            <view class="loading-circle"></view>
          </view>
          
          <!-- 错误提示 -->
          <view v-else-if="hasError" class="card bg-white p-4">
            <view class="flex flex-col items-center justify-center py-4">
              <text class="text-red-500 mb-2">加载失败</text>
              <text class="text-gray-500 text-sm mb-3">{{ errorMessage }}</text>
              <button class="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-full" @tap="getActivityList">
                重新加载
              </button>
            </view>
          </view>
          
          <!-- 无活动提示 -->
          <view v-else-if="activities.length === 0" class="card bg-white p-4">
            <view class="flex flex-col items-center justify-center py-4">
              <text class="text-gray-500">暂无公益活动，敬请期待</text>
            </view>
          </view>

          <!-- 活动卡片 -->
          <block v-else>
            <view 
              v-for="(activity, index) in activities" 
              :key="activity._id || index"
              class="activity-card bg-white mb-4 rounded-lg"
              @tap="navigateToDetail(activity._id)">
              <view class="p-4">
                <!-- 活动标题和状态 -->
                <view class="flex justify-between items-center mb-2">
                  <text class="font-medium text-base">{{ activity.title }}</text>
                  <text 
                    :class="getStatusTextClass(activity)"
                    class="text-xs">
                    {{ getDisplayStatus(activity) }}
                  </text>
                </view>
                
                <!-- 活动描述 -->
                <text class="text-gray-600 text-sm mb-3">{{ activity.description }}</text>
                
                <!-- 活动地点 -->
                <view class="flex items-center mb-2 text-gray-500 text-sm">
                  <icon-image :name="'location'" class="mr-1" size="14"></icon-image>
                  <text>{{ activity.location }}</text>
                </view>
                
                <!-- 活动时间 -->
                <view class="flex items-center mb-3 text-gray-500 text-sm">
                  <icon-image :name="'calendar'" class="mr-1" size="14"></icon-image>
                  <text>{{ activity.activity_time }}</text>
                </view>
                
                <!-- 参与人数和报名按钮 -->
                <view class="flex items-center justify-between">
                  <!-- 参与人数 -->
                  <view class="flex items-center">
                    <view class="flex mr-2">
                      <view class="activity-avatar-icon">🧑</view>
                      <view class="activity-avatar-icon ml-n2">👩</view>
                      <view class="activity-avatar-icon ml-n2">👨</view>
                    </view>
                    <text class="text-xs text-gray-500">{{ getParticipantsCount(activity) }}人已报名</text>
                  </view>
                  
                  <!-- 报名按钮 -->
                  <button 
                    :class="getActionButtonClass(activity)"
                    @tap.stop="handleActivityAction(activity)">
                    {{ getActionButtonText(activity) }}
                  </button>
                </view>
              </view>
            </view>
          </block>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onErrorCaptured, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { getTopActivities, enrollActivity } from '../../services/userActivity.js';
import { searchContent } from '../../services/search.js';
import { getKnowledgeList } from '../../services/knowledge.js';
import IconImage from '../../components/IconImage.vue';

// 为了在模板中使用组件，需要创建别名
const IconEye = IconImage;
const IconLike = IconImage;
const IconHeart = IconImage;
const IconLocation = IconImage;
const IconCalendar = IconImage;
const IconRight = IconImage;
const IconSearch = IconImage;
const IconCloseCircle = IconImage;

// 活动列表
const activities = ref([]);
const loading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// 环保知识列表
const knowledgeList = ref([]);
const knowledgeLoading = ref(false);

// 搜索相关
const searchKeyword = ref('');
const searchResults = ref([]);
const isSearchMode = ref(false);
const searchTotal = ref(0);

// 捕获错误
onErrorCaptured((err, instance, info) => {
  console.error('首页捕获到错误:', err);
  console.log('错误发生在:', info);
  hasError.value = true;
  errorMessage.value = err.message || '加载数据时出错';
  return false; // 阻止错误继续传播
});

// 获取活动列表
const getActivityList = async () => {
  loading.value = true;
  hasError.value = false;
  try {
    console.log('开始获取首页活动列表...');
    const result = await getTopActivities();
    console.log('获取到的活动列表:', result);
    
    if (!result || result.length === 0) {
      console.warn('没有活动数据，显示空状态');
      activities.value = [];
    } else {
      activities.value = result;
      console.log('首页显示的活动数量:', activities.value.length);
      activities.value.forEach((activity, index) => {
        console.log(`活动${index+1}: ${activity.title}, 状态: ${activity.status}, 已报名: ${activity.isEnrolled}, 已打卡: ${activity.isCheckedIn}`);
      });
    }
  } catch (error) {
    console.error('获取活动列表失败', error);
    hasError.value = true;
    errorMessage.value = error.message || '获取活动数据失败';
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// 下拉刷新处理函数
onPullDownRefresh(async () => {
  console.log('触发下拉刷新...');
  try {
    await getActivityList();
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
  } catch (error) {
    console.error('刷新失败:', error);
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 1500
    });
  } finally {
    // 停止下拉刷新动画
    uni.stopPullDownRefresh();
  }
});

// 获取状态文本样式类
const getStatusTextClass = (activity) => {
  if (activity.isCheckedIn) {
    return 'status-tag status-completed'; // 已完成打卡，显示灰色
  } else if (activity.isEnrolled) {
    return 'status-tag status-ongoing'; // 已报名但未打卡，显示绿色
  }
  
  switch (activity.status) {
    case '报名中':
      return 'status-tag status-enrolling'; // 报名中，显示橙色
    case '未开始':
      return 'status-tag status-upcoming'; // 未开始，显示蓝色
    case '已结束':
      return 'status-tag status-ended'; // 已结束，显示灰色
    default:
      return 'status-tag status-default';
  }
};

// 获取用户端显示的状态文本
const getDisplayStatus = (activity) => {
  if (activity.isCheckedIn) {
    return '已完成'; // 已完成打卡
  } else if (activity.isEnrolled) {
    return '进行中'; // 已报名但未打卡
  }
  
  return activity.status; // 否则显示原始状态
};

// 获取操作按钮文本
const getActionButtonText = (activity) => {
  if (activity.isCheckedIn) {
    return '已完成';
  } else if (activity.isEnrolled) {
    return '查看详情';
  } else if (activity.status === '未开始') {
    return '等待开始';
  } else if (activity.status === '已结束') {
    return '已结束';
  } else {
    return '立即报名';
  }
};

// 获取按钮样式类
const getActionButtonClass = (activity) => {
  if (activity.status === '未开始' || activity.status === '已结束') {
    return 'ml-auto bg-gray-200 text-gray-500 text-sm px-4 py-1 rounded-full';
  } else {
    return 'ml-auto bg-green-50 text-green-600 text-sm px-4 py-1 rounded-full';
  }
};

// 处理活动操作
const handleActivityAction = (activity) => {
  if (activity.isCheckedIn) {
    // 已完成，不做任何操作
    uni.showToast({
      title: '您已完成该活动',
      icon: 'none'
    });
  } else if (activity.isEnrolled) {
    // 已报名但未完成，跳转到详情页
    uni.navigateTo({
      url: `/pages/home/activity-detail?id=${activity._id}`
    });
  } else if (activity.status === '报名中') {
    // 报名中，进行报名操作
    handleEnrollActivity(activity._id);
  } else {
    // 其他状态，跳转到详情页
    uni.navigateTo({
      url: `/pages/home/activity-detail?id=${activity._id}`
    });
  }
};

// 处理报名活动
const handleEnrollActivity = async (activityId) => {
  try {
    const result = await enrollActivity(activityId);
    if (result && result.success) {
      uni.showToast({
        title: '报名成功',
        icon: 'success'
      });
      
      // 更新本地活动列表
      const index = activities.value.findIndex(item => item._id === activityId);
      if (index > -1) {
        activities.value[index].isEnrolled = true;
      }
    } else {
      uni.showToast({
        title: result.message || '报名失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('报名活动失败', error);
    uni.showToast({
      title: '报名失败，请稍后再试',
      icon: 'none'
    });
  }
};

// 获取参与人数
const getParticipantsCount = (activity) => {
  return activity.enrollCount || 0;
};

// 跳转到活动详情
const navigateToDetail = (activityId) => {
  uni.navigateTo({
    url: `/pages/home/activity-detail?id=${activityId}`
  });
};

// 跳转到全部活动
const navigateToAllActivities = () => {
  uni.navigateTo({
    url: '/pages/home/activity-list'
  });
};

// 跳转到知识详情页
const navigateToKnowledgeDetail = (knowledgeId) => {
  if (knowledgeId === 'static1') {
    uni.navigateTo({
      url: '/pages/home/knowledge-static?id=1'
    });
  } else if (knowledgeId === 'static2') {
    uni.navigateTo({
      url: '/pages/home/knowledge-static?id=2'
    });
  } else {
    uni.navigateTo({
      url: `/pages/home/knowledge-detail?id=${knowledgeId}`
    });
  }
};

// 跳转到知识列表页
const navigateToKnowledgeList = () => {
  uni.navigateTo({
    url: '/pages/home/knowledge-list'
  });
};

// 执行搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    });
    return;
  }
  
  performSearch(searchKeyword.value);
};

// 清除搜索内容
const clearSearch = () => {
  searchKeyword.value = '';
  if (isSearchMode.value) {
    exitSearch();
  }
};

// 退出搜索模式
const exitSearch = () => {
  isSearchMode.value = false;
  searchResults.value = [];
  searchKeyword.value = '';
};

// 搜索处理
const performSearch = async (keyword) => {
  try {
    isSearchMode.value = true;
    const results = await searchContent(keyword);
    searchResults.value = results;
    searchTotal.value = results.length;
  } catch (error) {
    console.error('搜索失败', error);
    uni.showToast({
      title: '搜索失败，请稍后再试',
      icon: 'none'
    });
    searchResults.value = [];
  }
};

// 初始化加载活动列表
onMounted(() => {
  getActivityList();
});

// 每次显示页面时刷新活动
onShow(() => {
  console.log('首页显示，刷新活动数据...');
  setTimeout(() => {
    getActivityList();
  }, 500); // 延迟加载，避免初始化问题
});

// 计算属性：过滤知识搜索结果
const searchKnowledgeResults = computed(() => {
  return searchResults.value.filter(item => item.type === 'knowledge');
});

// 计算属性：过滤活动搜索结果
const searchActivityResults = computed(() => {
  return searchResults.value.filter(item => item.type === 'activity');
});

// 添加日期格式化函数
// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) {
    return '昨天';
  }
  
  // 今年内
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  
  // 其他
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
</script>

<style>
.container {
  background-color: #f8f9fa;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: #333;
  padding-bottom: 80px;
}

.search-bar {
  border-radius: 20px;
}

.nav-pill {
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 14px;
  display: inline-block;
}

.active-pill {
  background-color: #4CAF50;
  color: white;
}

.card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.green-tag {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  display: inline-block;
}

.avatar-group {
  display: flex;
  margin-right: -10px;
}

.avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid white;
  margin-right: -10px;
  object-fit: cover;
}

/* 修复间距类 */
.space-left {
  margin-left: 12px;
}

.tag-space {
  margin-left: 8px;
}

/* 图片样式优化 */
.knowledge-img {
  height: 140px;
  width: 100%;
  object-fit: cover;
  object-position: center;
}

.small-img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

/* 工具类 */
.px-4 { padding-left: 16px; padding-right: 16px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.p-4 { padding: 16px; }
.p-3 { padding: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.mr-4 { margin-right: 16px; }
.mr-3 { margin-right: 12px; }
.mr-2 { margin-right: 8px; }
.mr-1 { margin-right: 4px; }
.ml-auto { margin-left: auto; }
.ml-2 { margin-left: 8px; }
.ml-1 { margin-left: 4px; }
.mt-3 { margin-top: 12px; }
.mt-1 { margin-top: 4px; }
.mx-2 { margin-left: 8px; margin-right: 8px; }
.my-auto { margin-top: auto; margin-bottom: auto; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-50 { background-color: #f0fdf4; }

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
.text-green-600 { color: #4CAF50; }
.text-yellow-500 { color: #F59E0B; }

.flex { display: flex; }
.flex-grow { flex-grow: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

.w-full { width: 100%; }
.h-32 { height: 128px; }
.w-24 { width: 96px; }
.h-24 { height: 96px; }

.rounded-md { border-radius: 6px; }
.rounded-full { border-radius: 9999px; }

.object-cover { object-fit: cover; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.pb-2 { padding-bottom: 8px; }

.whitespace-nowrap { white-space: nowrap; }

.relative { position: relative; }
.absolute { position: absolute; }
.right-3 { right: 12px; }
.top-2-5 { top: 10px; }

.activity-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.activity-avatar-icon {
  width: 24px;
  height: 24px;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 1px solid white;
}

.ml-n2 {
  margin-left: -8px;
}

/* 搜索容器样式 */
.search-container {
  margin-bottom: 5px;
}

.search-status {
  background-color: #f8f9fa;
  padding: 5px 8px;
  border-radius: 8px;
}

.mt-2 {
  margin-top: 8px;
}

/* 状态标签样式 */
.status-tag {
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  padding: 2px 8px;
}

.status-enrolling {
  color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.status-ongoing {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.status-upcoming {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.status-ended, .status-completed {
  color: #6b7280;
  background-color: rgba(107, 114, 128, 0.1);
}

.status-default {
  color: #6b7280;
  background-color: rgba(107, 114, 128, 0.1);
}

/* 加载圈样式 */
.loading-circle {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 