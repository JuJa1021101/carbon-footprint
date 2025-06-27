<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">帖子详情</text>
        </view>
        <view class="w-24px" v-if="post && post.isCurrentUser" @tap="showDeleteOption">
          <IconImage name="more" :size="16" />
        </view>
        <view class="w-24px" v-else>
          <!-- 占位元素保持布局一致 -->
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <image src="/static/images/loading.gif" class="w-12 h-12"></image>
    </view>

    <!-- 内容区 -->
    <view v-else-if="post" class="post-content bg-white">
      <!-- 用户信息 -->
      <view class="px-4 pt-4 flex items-center">
        <image :src="post.userInfo && post.userInfo.avatar ? post.userInfo.avatar : '/static/images/user-avatar.jpg'" alt="用户头像" class="avatar mr-3"></image>
        <view>
          <view class="flex items-center">
            <text class="font-medium text-gray-900">{{ post.userInfo && post.userInfo.nickname ? post.userInfo.nickname : '未知用户' }}</text>
            <text v-if="post.userInfo && post.userInfo.location" class="text-xs text-gray-500 ml-2">{{ post.userInfo.location }}</text>
          </view>
          <text class="text-xs text-gray-500">{{ post.createdAt || '未知时间' }}</text>
        </view>
        <button 
          v-if="!post.isCurrentUser"
          class="ml-auto text-sm px-3 py-1 rounded-full border" 
          :class="[post.isFollowed ? 'text-gray-400 border-gray-300' : 'text-green-500 border-green-500']"
          @tap="handleFollow">
          {{ post.isFollowed ? '已关注' : '+ 关注' }}
        </button>
      </view>

      <!-- 帖子内容 -->
      <view class="px-4 py-3">
        <text class="text-base text-gray-800 leading-relaxed">{{ post.content || '' }}</text>
      </view>

      <!-- 帖子图片 -->
      <view v-if="post.images && post.images.length > 0" class="px-4 mb-4">
        <view v-if="post.images.length === 1">
          <image :src="post.images[0]" alt="帖子图片" class="w-full rounded-lg" mode="widthFix" @tap="previewImage(post.images[0])"></image>
        </view>
        <view v-else class="image-grid" :class="'grid-' + Math.min(post.images.length, 3)">
          <view 
            v-for="(img, index) in post.images" 
            :key="index" 
            class="image-item" 
            @tap="previewImage(img, post.images)">
            <image :src="img" mode="aspectFill" class="w-full h-full"></image>
          </view>
        </view>
      </view>

      <!-- 标签 -->
      <view v-if="post.label" class="px-4 mb-4 flex flex-wrap">
        <text 
          v-for="(tag, index) in formatTags(post.label)" 
          :key="index" 
          class="tag" 
          :class="{'space-left': index > 0}">
          # {{ tag }}
        </text>
      </view>

      <!-- 互动统计 -->
      <view class="px-4 py-3 border-t border-b flex justify-between text-gray-500 text-sm">
        <view class="flex items-center">
          <image src="/static/images/icons/icon-eye.svg" class="mr-1 icon-size"></image>
          <text>{{ post.eyes }}</text>
        </view>
        <view 
          class="flex items-center" 
          :class="{'text-red-500': post.isLiked}"
          @tap="handleLike">
          <image :src="post.isLiked ? '/static/images/icons/icon-heart-active.svg' : '/static/images/icons/icon-heart.svg'" class="mr-1 icon-size"></image>
          <text>{{ post.likes }}</text>
        </view>
        <view class="flex items-center">
          <image src="/static/images/icons/icon-comment.svg" class="mr-1 icon-size"></image>
          <text>{{ post.comments }}</text>
        </view>
        <view 
          class="flex items-center" 
          :class="{'text-green-500': post.isCollected}"
          @tap="handleCollect">
          <image src="/static/images/icons/icon-bookmark.svg" class="mr-1 icon-size"></image>
          <text>{{ post.isCollected ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="flex items-center">
          <image src="/static/images/icons/icon-share.svg" class="mr-1 icon-size"></image>
          <text>分享</text>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comment-section">
        <view class="px-4 py-3 bg-gray-50 border-b">
          <text class="font-medium">{{ post.comments || 0 }}条评论</text>
        </view>

        <!-- 评论列表 -->
        <view v-if="commentList.length > 0">
          <view v-for="(comment, index) in commentList" :key="comment._id" class="comment-item px-4 py-3 border-b">
            <view class="flex">
              <image :src="comment.userInfo.avatar" alt="用户头像" class="comment-avatar mr-3"></image>
              <view class="flex-1">
                <view class="flex justify-between items-center">
                  <text class="font-medium text-sm">{{ comment.userInfo.nickname }}</text>
                  <view class="flex items-center">
                    <image 
                      :src="comment.isLiked ? '/static/images/icons/icon-heart-active.svg' : '/static/images/icons/icon-heart.svg'" 
                      class="mr-1 icon-size"
                      @tap="likeComment(comment)"></image>
                    <text class="text-xs text-gray-500">{{ comment.likes || 0 }}</text>
                  </view>
                </view>
                <text class="text-sm text-gray-800 py-1">{{ comment.content }}</text>
                <view class="flex justify-between items-center">
                  <text class="text-xs text-gray-500">{{ comment.createdAt }}</text>
                  <text class="text-xs text-gray-500" @tap="replyComment(comment)">回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 无评论状态 -->
        <view v-else class="flex flex-col items-center py-10">
          <text class="text-gray-500">暂无评论，快来抢沙发吧~</text>
        </view>
      </view>
    </view>

    <!-- 评论输入栏 -->
    <view class="comment-bar">
      <view class="flex items-center bg-white px-4 py-2 border-t">
        <input 
          type="text" 
          v-model="commentContent" 
          class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm" 
          placeholder="说点什么..."
          @confirm="submitComment" />
        <button 
          class="ml-3 px-4 py-1 rounded-full bg-green-500 text-white text-sm" 
          @tap="submitComment">
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPostDetail, createComment, deletePost } from '../../services/community.js';
import { getCurrentUser } from '@/services/login';
import IconImage from '../../components/IconImage.vue';

// 为了在模板中使用组件，需要创建别名
const IconBack = IconImage;
const IconEye = IconImage;
const IconHeart = IconImage;
const IconComment = IconImage;
const IconBookmark = IconImage;
const IconShare = IconImage;

// 帖子ID
const postId = ref('');

// 帖子数据
const post = ref(null);
const loading = ref(true);

// 评论相关
const commentList = ref([]);
const commentContent = ref('');
const replyToComment = ref(null);

// 获取参数
const getParams = () => {
  // 从路由参数获取ID
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.options) {
    postId.value = currentPage.options.id;
    
    if (postId.value) {
      loadPostDetail();
    }
  }
};

// 加载帖子详情
const loadPostDetail = async () => {
  try {
    loading.value = true;
    const postDetail = await getPostDetail(postId.value);
    
    if (postDetail) {
      post.value = postDetail;
      commentList.value = postDetail.commentList || [];
    } else {
      uni.showToast({
        title: '帖子不存在或已删除',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('加载帖子详情失败', error);
    uni.showToast({
      title: error.message || '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 处理点赞
const handleLike = async () => {
  if (!post.value) return;
  
  post.value.isLiked = !post.value.isLiked;
  post.value.likes += post.value.isLiked ? 1 : -1;
  
  // 调用API保存点赞状态
  try {
    await likePost(post.value._id, post.value.isLiked);
  } catch (apiError) {
    console.error('API调用失败，但继续使用本地状态', apiError);
  }
  
  // 保存交互状态
  savePostInteraction(post.value);
};

// 处理收藏
const handleCollect = () => {
  if (!post.value) return;
  
  post.value.isCollected = !post.value.isCollected;
  
  // 保存交互状态
  savePostInteraction(post.value);
};

// 处理关注
const handleFollow = () => {
  if (!post.value) return;
  
  post.value.isFollowed = !post.value.isFollowed;
  
  // 保存交互状态
  savePostInteraction(post.value);
};

// 保存帖子交互状态
const savePostInteraction = (post) => {
  if (!post || !post._id) return;
  
  try {
    // 保存到交互数据
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

// 预览图片
const previewImage = (current, urls = []) => {
  if (!current) return;
  
  // 如果只传入了一个参数，则将其作为urls
  if (!urls.length) {
    urls = [current];
  }
  
  uni.previewImage({
    current: current,
    urls: urls
  });
};

// 回复评论
const replyComment = (comment) => {
  replyToComment.value = comment;
  commentContent.value = `@${comment.userInfo.nickname} `;
  // 聚焦输入框
  uni.pageScrollTo({
    scrollTop: 99999,
    duration: 300
  });
};

// 点赞评论
const likeComment = (comment) => {
  comment.isLiked = !comment.isLiked;
  if (comment.isLiked) {
    comment.likes++;
  } else {
    comment.likes--;
  }
  
  // 这里可以调用接口更新点赞状态
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    uni.showToast({
      title: '评论内容不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 确保post存在且有_id
  if (!post.value || !post.value._id) {
    uni.showToast({
      title: '帖子加载失败，请返回重试',
      icon: 'none'
    });
    return;
  }
  
  try {
    const commentData = {
      postId: post.value._id,
      content: commentContent.value,
      parentId: replyToComment.value ? replyToComment.value._id : null
    };
    
    const result = await createComment(commentData);
    commentList.value.unshift(result);
    
    // 更新评论数
    post.value.comments += 1;
    
    // 清空输入框和回复对象
    commentContent.value = '';
    replyToComment.value = null;
    
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('提交评论失败', error);
    uni.showToast({
      title: error.message || '评论失败，请重试',
      icon: 'none'
    });
  }
};

// 格式化标签
const formatTags = (labelStr) => {
  if (!labelStr) return [];
  return labelStr.split(',').map(item => item.trim()).filter(Boolean);
};

// 显示删除选项
const showDeleteOption = () => {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#ff0000',
    success: (res) => {
      if (res.tapIndex === 0) {
        confirmDeletePost();
      }
    }
  });
};

// 确认删除帖子
const confirmDeletePost = () => {
  if (!post.value) return;
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条帖子吗？删除后无法恢复。',
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        handleDeletePost();
      }
    }
  });
};

// 处理删除帖子
const handleDeletePost = async () => {
  if (!post.value || !post.value._id) return;
  
  try {
    uni.showLoading({ title: '删除中...' });
    await deletePost(post.value._id);
    
    uni.hideLoading();
    uni.showToast({ 
      title: '删除成功',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '删除失败',
      icon: 'none'
    });
  }
};

// 页面加载
onMounted(() => {
  getParams();
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 60px; /* 留出底部输入框的空间 */
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.comment-avatar {
  width: 36px;
  height: 36px;
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

.image-grid {
  display: grid;
  grid-gap: 8px;
}

.grid-1 {
  grid-template-columns: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.image-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
}

.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-500 { background-color: #4CAF50; }

.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-green-500 { color: #4CAF50; }
.text-red-500 { color: #ef4444; }

.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.font-medium { font-weight: 500; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }

.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.pt-4 { padding-top: 16px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }
.pb-4 { padding-bottom: 16px; }

.m-2 { margin: 8px; }
.mx-2 { margin-left: 8px; margin-right: 8px; }
.my-2 { margin-top: 8px; margin-bottom: 8px; }
.mr-1 { margin-right: 4px; }
.mr-3 { margin-right: 12px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.ml-auto { margin-left: auto; }

.border { border-width: 1px; border-style: solid; }
.border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #e5e7eb; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
.border-gray-300 { border-color: #d1d5db; }
.border-green-500 { border-color: #4CAF50; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }
.w-24px { width: 24px; }

.icon-size {
  width: 16px;
  height: 16px;
}

.back-icon {
  width: 18px;
  height: 18px;
}

.leading-relaxed { line-height: 1.625; }
</style> 