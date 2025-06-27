<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-white px-4 pt-10 pb-3">
      <view class="flex items-center">
        <view @tap="goBack" class="p-2">
          <IconImage name="back" :size="18" />
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-900 text-lg font-medium">发布动态</text>
        </view>
        <view>
          <button 
            class="publish-btn text-white text-sm bg-green-500 rounded-full px-4 py-1"
            :disabled="!canPublish"
            :class="{'bg-gray-300': !canPublish}"
            @tap="publishPost">
            发布
          </button>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="p-4">
      <!-- 文本内容 -->
      <textarea 
        v-model="content" 
        class="w-full p-3 bg-white rounded-lg mb-4" 
        placeholder="分享你的环保经验和心得..." 
        maxlength="1000"
        auto-height>
      </textarea>
      
      <!-- 图片上传 -->
      <view class="image-upload bg-white rounded-lg p-4 mb-4">
        <view class="flex flex-wrap">
          <!-- 已上传的图片 -->
          <view 
            v-for="(img, index) in images" 
            :key="index" 
            class="image-item relative m-1">
            <image 
              :src="img" 
              class="w-full h-full object-cover" 
              mode="aspectFill">
            </image>
            <view 
              class="delete-btn" 
              @tap.stop="removeImage(index)">
              <IconImage name="close-circle" :size="12" />
            </view>
          </view>
          
          <!-- 添加图片按钮 -->
          <view 
            class="image-add-btn m-1" 
            @tap="chooseImage" 
            v-if="images.length < 9">
            <IconImage name="plus" :size="24" class="text-gray-400" />
            <text class="text-xs text-gray-400 mt-1">{{ images.length }}/9</text>
          </view>
        </view>
      </view>
      
      <!-- 标签选择 -->
      <view class="bg-white rounded-lg p-4">
        <view class="flex items-center pb-3 border-b">
          <text class="text-gray-700">添加标签</text>
          <text class="text-xs text-gray-500 ml-2">(推荐选择相关标签，便于内容被发现)</text>
        </view>
        
        <!-- 已选标签 -->
        <view class="flex flex-wrap mt-3 mb-2" v-if="selectedTags.length > 0">
          <view 
            v-for="(tag, index) in selectedTags" 
            :key="index"
            class="tag-item flex items-center bg-green-50 text-green-500 rounded-full px-3 py-1 mr-2 mb-2">
            <text class="text-sm"># {{ tag }}</text>
            <view class="ml-1" @tap="removeTag(index)">
              <IconImage name="close-circle" :size="12" />
            </view>
          </view>
        </view>
        
        <!-- 添加自定义标签 -->
        <view class="flex mt-2">
          <input 
            type="text" 
            v-model="customTag" 
            class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm" 
            placeholder="输入自定义标签..."
            maxlength="20"
            @confirm="addCustomTag" />
          <button 
            class="ml-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm"
            @tap="addCustomTag">
            添加
          </button>
        </view>
        
        <!-- 热门标签 -->
        <view class="mt-4">
          <text class="text-sm text-gray-700 mb-2 block">热门标签</text>
          <view class="flex flex-wrap">
            <view 
              v-for="(tag, index) in popularTags" 
              :key="index"
              class="tag-item bg-gray-100 text-gray-600 rounded-full px-3 py-1 mr-2 mb-2"
              :class="{ 'bg-green-50 text-green-500': isTagSelected(tag) }"
              @tap="toggleTag(tag)">
              <text class="text-sm"># {{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { createPost } from '../../services/community.js';
import { getCurrentUser } from '../../services/login.js';
import IconImage from '../../components/IconImage.vue';

// 帖子内容
const content = ref('');
const images = ref([]);
const customTag = ref('');
const selectedTags = ref([]);

// 热门标签
const popularTags = ref([
  '垃圾分类', '环保行动', '节约用水', '低碳生活', 
  '废物利用', '创意改造', '环保科普', '绿色出行',
  '减塑行动', '二手交易', '能源节约', '植树造林'
]);

// 是否可以发布
const canPublish = computed(() => {
  return content.value.trim().length > 0;
});

// 检查标签是否已选中
const isTagSelected = (tag) => {
  return selectedTags.value.includes(tag);
};

// 切换标签选择状态
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    // 最多选择5个标签
    if (selectedTags.value.length >= 5) {
      uni.showToast({
        title: '最多可选5个标签',
        icon: 'none'
      });
      return;
    }
    selectedTags.value.push(tag);
  }
};

// 移除已选标签
const removeTag = (index) => {
  selectedTags.value.splice(index, 1);
};

// 添加自定义标签
const addCustomTag = () => {
  const tag = customTag.value.trim();
  
  if (!tag) {
    uni.showToast({
      title: '标签不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 最多选择5个标签
  if (selectedTags.value.length >= 5) {
    uni.showToast({
      title: '最多可选5个标签',
      icon: 'none'
    });
    return;
  }
  
  // 避免重复添加
  if (isTagSelected(tag)) {
    uni.showToast({
      title: '该标签已添加',
      icon: 'none'
    });
    return;
  }
  
  selectedTags.value.push(tag);
  customTag.value = '';
};

// 选择图片
const chooseImage = () => {
  if (images.value.length >= 9) {
    uni.showToast({
      title: '最多上传9张图片',
      icon: 'none'
    });
    return;
  }
  
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 模拟上传，实际开发中需要调用上传API
      images.value = [...images.value, ...res.tempFilePaths];
    }
  });
};

// 移除图片
const removeImage = (index) => {
  images.value.splice(index, 1);
};

// 返回上一页
const goBack = () => {
  uni.showModal({
    title: '提示',
    content: '是否放弃发布？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};

// 发布帖子
const publishPost = async () => {
  // 验证内容
  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    });
    return;
  }
  
  try {
    const postData = {
      content: content.value,
      images: images.value,
      label: selectedTags.value.join(',')
    };
    
    const result = await createPost(postData);
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    });
    
    // 通知社区页面刷新列表 - 使用更安全的方式
    try {
      // 获取当前页面栈
      const pages = getCurrentPages();
      // 获取上一页实例（社区页）
      const prePage = pages[pages.length - 2];
      // 直接调用上一页的方法刷新列表
      if (prePage && prePage.$vm && typeof prePage.$vm.loadPosts === 'function') {
        prePage.$vm.loadPosts();
      }
    } catch (e) {
      console.error('通知刷新失败', e);
    }
    
    // 延时返回，让用户看到发布成功提示
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.showToast({
      title: error.message || '发布失败',
      icon: 'none'
    });
  }
};

// 页面加载
onMounted(() => {
  console.log('发布页面加载');
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.publish-btn {
  border: none;
  min-width: 70px;
  line-height: 1.8;
}

.image-item {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 8px;
}

.image-add-btn {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.bg-green-50 { background-color: #ecfdf5; }
.bg-green-500 { background-color: #4CAF50; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-300 { background-color: #d1d5db; }

.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.text-green-500 { color: #4CAF50; }

.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-lg { font-size: 18px; }
.text-2xl { font-size: 24px; }
.font-medium { font-weight: 500; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }

.m-1 { margin: 4px; }
.m-2 { margin: 8px; }
.mx-2 { margin-left: 8px; margin-right: 8px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }

.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.relative { position: relative; }
.object-cover { object-fit: cover; }

.block { display: block; }

.back-icon {
  width: 18px;
  height: 18px;
}
</style> 