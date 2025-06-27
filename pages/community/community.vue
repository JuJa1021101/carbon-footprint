<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="px-4 pt-10 pb-4 bg-white">
      <view class="flex items-center justify-between mb-4">
        <text class="text-xl font-bold">环保社区</text>
        <IconImage name="more" :size="16" />
      </view>

      <!-- 搜索框 -->
      <view class="search-container">
        <view class="search-input-wrapper">
          <view class="search-icon-wrapper">
            <IconImage name="search" :size="16" class="search-icon" @tap="handleSearch" />
          </view>
          <input 
            type="text" 
            v-model="searchKeyword"
            class="search-input" 
            placeholder="搜索社区内容..."
            @confirm="handleSearch">
          <view v-if="searchKeyword" class="clear-icon-wrapper" @tap="clearSearch">
            <IconImage name="close-circle" :size="16" class="clear-icon" />
          </view>
        </view>
        
        <!-- 搜索状态 -->
        <view v-if="isSearchMode" class="search-status mt-2">
          <view class="flex items-center">
            <text class="text-sm">关键词: "{{ searchKeyword }}"</text>
            <text class="text-xs text-gray-500 ml-2">(找到 {{ total }} 条结果)</text>
            <view class="ml-auto">
              <text class="text-green-500 text-sm" @tap="exitSearch">退出搜索</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 标签筛选 -->
    <view class="px-4 py-3 bg-white border-b">
      <view class="flex justify-around">
        <view 
          class="tab-btn" 
          :class="{ 'active font-medium': activeTab === 'recommend', 'text-gray-500': activeTab !== 'recommend' }"
          @tap="switchTab('recommend')">
          <text>推荐</text>
          <view class="tab-indicator" v-if="activeTab === 'recommend'"></view>
        </view>
        <view 
          class="tab-btn" 
          :class="{ 'active font-medium': activeTab === 'latest', 'text-gray-500': activeTab !== 'latest' }"
          @tap="switchTab('latest')">
          <text>最新</text>
          <view class="tab-indicator" v-if="activeTab === 'latest'"></view>
        </view>
        <view 
          class="tab-btn" 
          :class="{ 'active font-medium': activeTab === 'hot', 'text-gray-500': activeTab !== 'hot' }"
          @tap="switchTab('hot')">
          <text>热门</text>
          <view class="tab-indicator" v-if="activeTab === 'hot'"></view>
        </view>
        <view 
          class="tab-btn" 
          :class="{ 'active font-medium': activeTab === 'follow', 'text-gray-500': activeTab !== 'follow' }"
          @tap="switchTab('follow')">
          <text>关注</text>
          <view class="tab-indicator" v-if="activeTab === 'follow'"></view>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="p-4">
      <!-- 加载中 -->
      <view v-if="loading" class="flex justify-center py-10">
        <image src="/static/images/loading.gif" class="w-12 h-12"></image>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="posts.length === 0" class="flex flex-col items-center py-10">
        <image src="/static/images/empty-state.png" class="w-32 h-32 mb-4"></image>
        <text class="text-gray-500">暂无内容</text>
      </view>
      
      <!-- 帖子卡片 -->
      <block v-else>
        <view v-for="(post, index) in posts" :key="post._id" class="card bg-white shadow-sm mb-4">
          <view class="p-3">
            <!-- 用户信息 -->
            <view class="flex items-center mb-3">
              <image :src="post.userInfo && post.userInfo.avatar ? post.userInfo.avatar : '/static/images/user-avatar.jpg'" alt="用户头像" class="avatar mr-3"></image>
              <view>
                <text class="font-medium text-sm">{{ post.userInfo && post.userInfo.nickname ? post.userInfo.nickname : '未知用户' }}</text>
                <view class="text-xs text-gray-500">{{ post.createdAt || '未知时间' }}</view>
              </view>
              <button 
                v-if="!post.isCurrentUser"
                class="ml-auto text-sm px-3 py-1 rounded-full border" 
                :class="[post.isFollowed ? 'text-gray-400 border-gray-300' : 'text-green-500 border-green-500']"
                @tap="handleFollow(post)">
                {{ post.isFollowed ? '已关注' : '+ 关注' }}
              </button>
              
              <!-- 删除按钮 -->
              <view v-else class="ml-auto" @tap.stop="showDeleteOption(post)">
                <icon-image :name="'more'" size="16" class="text-gray-600"></icon-image>
              </view>
            </view>

            <!-- 帖子内容 -->
            <text class="text-sm mb-3" @tap="navigateToDetail(post._id)">{{ post.content || '' }}</text>

            <!-- 图片 -->
            <view v-if="post.images && post.images.length > 0" class="mb-3" @tap="navigateToDetail(post._id)">
              <!-- 单图样式 -->
              <image 
                v-if="post.images.length === 1" 
                :src="post.images[0]" 
                alt="帖子图片" 
                class="w-full h-48 object-cover rounded-lg" 
                mode="aspectFill"></image>
              
              <!-- 双图样式 -->
              <view v-else-if="post.images.length === 2" class="grid-2 gap-2">
                <image 
                  v-for="(img, imgIndex) in post.images" 
                  :key="imgIndex" 
                  :src="img" 
                  alt="帖子图片" 
                  class="grid-item" 
                  mode="aspectFill"></image>
              </view>
              
              <!-- 多图样式 -->
              <view v-else class="grid-3 gap-2">
                <image 
                  v-for="(img, imgIndex) in post.images.slice(0, 3)" 
                  :key="imgIndex" 
                  :src="img" 
                  alt="帖子图片" 
                  class="grid-item" 
                  mode="aspectFill"></image>
                <view v-if="post.images.length > 3" class="more-images">
                  <text>+{{ post.images.length - 3 }}</text>
                </view>
              </view>
            </view>

            <!-- 标签 -->
            <view class="flex flex-wrap mb-3">
              <text 
                v-for="(tag, tagIndex) in formatTags(post.label || '')" 
                :key="tagIndex" 
                class="tag" 
                :class="{'space-left': tagIndex > 0}"
                @tap="handleTagClick(tag)">
                # {{ tag }}
              </text>
            </view>

            <!-- 互动数据 -->
            <view class="flex justify-between text-gray-500 text-sm border-t pt-3">
              <view class="flex items-center">
                <image src="/static/images/icons/icon-eye.svg" class="mr-1 icon-size" mode="aspectFit"></image>
                <text>{{ post.eyes || 0 }}</text>
              </view>
              <view 
                class="flex items-center" 
                :class="{'text-red-500': post.isLiked}"
                @tap="handleLike(post)">
                <image :src="post.isLiked ? '/static/images/icons/icon-heart-active.svg' : '/static/images/icons/icon-heart.svg'" class="mr-1 icon-size" mode="aspectFit"></image>
                <text>{{ post.likes || 0 }}</text>
              </view>
              <view class="flex items-center" @tap="navigateToDetail(post._id)">
                <image src="/static/images/icons/icon-comment.svg" class="mr-1 icon-size" mode="aspectFit"></image>
                <text>{{ post.comments || 0 }}</text>
              </view>
              <view 
                class="flex items-center" 
                :class="{'text-green-500': post.isCollected}"
                @tap="handleCollect(post)">
                <image src="/static/images/icons/icon-bookmark.svg" class="mr-1 icon-size" mode="aspectFit"></image>
                <text>{{ post.isCollected ? '已收藏' : '收藏' }}</text>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 加载更多 -->
      <view v-if="hasMore && posts.length > 0" class="flex justify-center py-4">
        <text class="text-sm text-gray-500" @tap="loadMore">加载更多</text>
      </view>
    </view>

    <!-- 悬浮发布按钮 -->
    <view class="float-btn" @tap="navigateToPublish">
      <view class="float-btn-inner">
        <text class="plus-text">+</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { getPosts, likePost, collectPost, getPostDetail, deletePost, searchPosts } from '@/services/community';
import { getCurrentUser } from '@/services/login';
import IconImage from '../../components/IconImage.vue';

// 为了在模板中使用组件，需要创建别名
const IconEye = IconImage;
const IconHeart = IconImage;
const IconComment = IconImage;
const IconPlus = IconImage;
const IconBookmark = IconImage;
const IconSearch = IconImage;
const IconCloseCircle = IconImage;
const IconMore = IconImage;

// 搜索关键词
const searchKeyword = ref('');
// 是否处于搜索模式
const isSearchMode = ref(false);

// 帖子数据
const posts = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasMore = ref(true);
const loading = ref(false);

// 当前选中的标签
const activeTab = ref('recommend');

// 切换标签
const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  currentPage.value = 1;
  posts.value = [];
  // 切换标签时退出搜索模式
  if (isSearchMode.value) {
    isSearchMode.value = false;
    searchKeyword.value = '';
  }
  loadPosts();
};

// 加载帖子
const loadPosts = async (isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1;
    hasMore.value = true;
  }
  
  if (!hasMore.value && !isRefresh) {
    uni.showToast({
      title: '没有更多内容了',
      icon: 'none'
    });
    return;
  }
  
  try {
    loading.value = true;
    
    let result;
    
    // 根据是否有搜索关键词决定调用哪个API
    if (isSearchMode.value && searchKeyword.value.trim()) {
      // 调用搜索API
      result = await searchPosts(searchKeyword.value, {
        page: currentPage.value,
        pageSize: pageSize.value
      });
    } else {
      // 构建查询参数
      const options = {
        filter: activeTab.value,
        page: currentPage.value,
        pageSize: pageSize.value
      };
      
      // 调用常规获取帖子API
      result = await getPosts(options);
    }
    
    // 确保result和result.posts存在
    if (result && result.posts) {
      // 更新帖子列表
      if (isRefresh) {
        posts.value = result.posts;
      } else {
        posts.value = [...posts.value, ...result.posts];
      }
      
      // 更新总数
      total.value = result.total || 0;
      
      // 判断是否有更多数据
      hasMore.value = posts.value.length < total.value;
      
      // 增加页码
      if (hasMore.value) {
        currentPage.value++;
      }
    } else {
      // 如果返回数据格式不对，设置空数组
      if (isRefresh) {
        posts.value = [];
      }
      hasMore.value = false;
      console.error('返回数据格式不正确:', result);
    }
  } catch (error) {
    console.error('加载帖子失败', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return;
  currentPage.value++;
  loadPosts();
};

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索框为空，并且之前处于搜索模式，则重置为普通模式
    if (isSearchMode.value) {
      isSearchMode.value = false;
      currentPage.value = 1;
      loadPosts();
    }
    return;
  }
  
  // 设置为搜索模式
  isSearchMode.value = true;
  currentPage.value = 1;
  posts.value = [];
  loadPosts();
};

// 点击标签
const handleTagClick = (tag) => {
  searchKeyword.value = tag;
  handleSearch();
};

// 格式化标签
const formatTags = (labelStr) => {
  if (!labelStr) return [];
  return labelStr.split(',').map(item => item.trim()).filter(Boolean);
};

// 处理点赞
const handleLike = async (post) => {
  try {
    // 切换点赞状态
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    
    // 调用API保存点赞状态
    try {
      await likePost(post._id, post.isLiked);
    } catch (apiError) {
      console.error('API调用失败，但继续使用本地状态', apiError);
    }
    
    // 保存交互状态
    savePostInteraction(post);
  } catch (error) {
    console.error('点赞操作失败', error);
    uni.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 处理收藏
const handleCollect = async (post) => {
  try {
    // 切换收藏状态
    post.isCollected = !post.isCollected;
    
    // 保存交互状态
    savePostInteraction(post);
  } catch (error) {
    console.error('收藏操作失败', error);
    uni.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 处理关注
const handleFollow = async (post) => {
  try {
    // 切换关注状态
    post.isFollowed = !post.isFollowed;
    
    // 保存交互状态
    savePostInteraction(post);
  } catch (error) {
    console.error('关注操作失败', error);
    uni.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 保存帖子交互状态
const savePostInteraction = (post) => {
  if (!post || !post._id) return;
  
  try {
    let postInteractions = {};
    const cachedInteractions = uni.getStorageSync('post_interactions');
    if (cachedInteractions) {
      postInteractions = JSON.parse(cachedInteractions);
    }
    
    postInteractions[post._id] = {
      eyes: post.eyes,
      likes: post.likes,
      comments: post.comments,
      isLiked: post.isLiked,
      isCollected: post.isCollected,
      isFollowed: post.isFollowed
    };
    
    uni.setStorageSync('post_interactions', JSON.stringify(postInteractions));
    
    // 如果是本地发布的帖子，也更新local_posts中的状态
    let localPosts = [];
    const cachedPosts = uni.getStorageSync('local_posts');
    if (cachedPosts) {
      localPosts = JSON.parse(cachedPosts);
      const postIndex = localPosts.findIndex(p => p._id === post._id);
      if (postIndex !== -1) {
        localPosts[postIndex].likes = post.likes;
        localPosts[postIndex].isLiked = post.isLiked;
        localPosts[postIndex].isCollected = post.isCollected;
        localPosts[postIndex].isFollowed = post.isFollowed;
        uni.setStorageSync('local_posts', JSON.stringify(localPosts));
      }
    }
  } catch (e) {
    console.error('保存交互状态失败', e);
  }
};

// 跳转到帖子详情页
const navigateToDetail = (postId) => {
  uni.navigateTo({
    url: `/pages/community/post-detail?id=${postId}`
  });
};

// 跳转到发布页面
const navigateToPublish = () => {
  uni.navigateTo({
    url: '/pages/community/post-publish',
    events: {
      publishSuccess: () => {
        if (activeTab.value === 'recommend') {
          loadPosts();
        } else if (activeTab.value === 'latest') {
          loadPosts();
        } else if (activeTab.value === 'hot') {
          loadPosts();
        } else if (activeTab.value === 'follow') {
          loadPosts();
        }
      }
    }
  });
};

// 显示删除选项
const showDeleteOption = (post) => {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#ff0000',
    success: (res) => {
      if (res.tapIndex === 0) {
        // 用户点击了"删除"选项
        confirmDeletePost(post);
      }
    }
  });
};

// 确认删除帖子
const confirmDeletePost = (post) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条帖子吗？删除后无法恢复。',
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        handleDeletePost(post._id);
      }
    }
  });
};

// 处理删除帖子
const handleDeletePost = async (postId) => {
  try {
    uni.showLoading({ title: '删除中...' });
    await deletePost(postId);
    
    // 从当前列表中移除该帖子
    posts.value = posts.value.filter(post => post._id !== postId);
    
    uni.hideLoading();
    uni.showToast({ 
      title: '删除成功',
      icon: 'success'
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '删除失败',
      icon: 'none'
    });
  }
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  // 如果处于搜索模式，退出搜索
  if (isSearchMode.value) {
    exitSearch();
  }
};

// 退出搜索模式
const exitSearch = () => {
  searchKeyword.value = '';
  isSearchMode.value = false;
  currentPage.value = 1;
  posts.value = [];
  loadPosts();
};

// 页面加载完成
onMounted(() => {
  loadPosts();
});

// 监听页面显示
onShow(() => {
  // 每次页面显示时刷新数据，确保显示最新发布的帖子
  loadPosts();
});

// 下拉刷新
onPullDownRefresh(() => {
  loadPosts(true);
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: #333;
  padding-bottom: 80px;
}

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

.search-icon-wrapper, .clear-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.search-status {
  background-color: rgba(76, 175, 80, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
}

.top-2-5 {
  top: 50%;
  transform: translateY(-50%);
}

.right-10 {
  right: 40px;
}

.card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.tag {
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  display: inline-block;
  margin-bottom: 6px;
}

.space-left {
  margin-left: 8px;
}

.tab-btn {
  position: relative;
  padding-bottom: 10px;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 20px;
  height: 3px;
  background-color: #4CAF50;
  border-radius: 3px;
  transform: translateX(-50%);
}

.float-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  z-index: 100;
}

.float-btn-inner {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.plus-text {
  color: white;
  font-size: 30px;
  font-weight: bold;
  line-height: 30px;
  text-align: center;
  margin-top: -2px; /* 轻微上移调整垂直位置 */
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.gap-2 {
  gap: 8px;
}

.grid-item {
  width: 100%;
  height: 128px;
  border-radius: 8px;
  object-fit: cover;
}

.more-images {
  position: relative;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.w-full {
  width: 100%;
}

.h-48 {
  height: 192px;
}

.object-cover {
  object-fit: cover;
}

.rounded-lg {
  border-radius: 8px;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-black-60 {
  background-color: rgba(0, 0, 0, 0.6);
}

.w-12 {
  width: 48px;
}

.h-12 {
  height: 48px;
}

.w-32 {
  width: 128px;
}

.h-32 {
  height: 128px;
}

.w-14 {
  width: 56px;
}

.h-14 {
  height: 56px;
}

.rounded-full {
  border-radius: 9999px;
}

.text-white {
  color: white;
}

.text-xl {
  font-size: 20px;
}

.text-xs {
  font-size: 12px;
}

.px-2 {
  padding-left: 8px;
  padding-right: 8px;
}

.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}

.bottom-2 {
  bottom: 8px;
}

.right-2 {
  right: 8px;
}

.icon-size {
  width: 16px;
  height: 16px;
}

.plus-icon {
  width: 24px;
  height: 24px;
}

/* 工具类 */
.px-4 { padding-left: 16px; padding-right: 16px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.p-3 { padding: 12px; }
.pt-3 { padding-top: 12px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }

.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mr-3 { margin-right: 12px; }
.mr-1 { margin-right: 4px; }
.ml-auto { margin-left: auto; }
.ml-2 { margin-left: 8px; }
.mt-3 { margin-top: 12px; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }

.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-green-500 { color: #4CAF50; }
.text-red-500 { color: #ef4444; }

.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-center { justify-content: center; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
.border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #e5e7eb; }
.border { border-width: 1px; border-style: solid; }
.border-green-500 { border-color: #4CAF50; }
.border-gray-300 { border-color: #d1d5db; }

.w-full { width: 100%; }
.h-48 { height: 192px; }
.w-14 { width: 56px; }
.h-14 { height: 56px; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.object-cover { object-fit: cover; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.gap-2 { gap: 8px; }

.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.right-3 { right: 12px; }
.top-2-5 { top: 10px; }
.bottom-2 { bottom: 8px; }
.right-2 { right: 8px; }

.search-input::placeholder {
  color: #999;
  font-size: 14px;
}
</style> 