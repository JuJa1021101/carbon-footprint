<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header bg-green px-4 py-3">
      <view class="flex items-center">
        <view @tap="goBack">
          <icon-image name="back" size="22" color="#FFFFFF"></icon-image>
        </view>
        <view class="flex-1 text-center">
          <text class="text-white text-lg font-medium">个人信息</text>
        </view>
        <view class="w-24px"></view> <!-- 为了居中标题的占位 -->
      </view>
    </view>
    
    <!-- 头像选择 -->
    <view class="bg-white p-4 mb-2">
      <view class="flex items-center justify-between">
        <text class="text-gray-700">头像</text>
        <view class="flex items-center" @tap="chooseAvatar">
          <image :src="userInfo.avatar" class="avatar-medium"></image>
          <text class="text-xs text-gray-400 ml-2">点击修改头像</text>
        </view>
      </view>
    </view>
    
    <!-- 基本信息 -->
    <view class="bg-white mb-2">
      <!-- 昵称 -->
      <view class="p-4 border-b border-gray-100">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">昵称</text>
          <view class="flex items-center">
            <input type="text" v-model="userInfo.nickname" placeholder="请输入昵称" class="text-right text-gray-700 pr-2" />
          </view>
        </view>
      </view>
      
      <!-- 账号 -->
      <view class="p-4 border-b border-gray-100">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">账号</text>
          <view class="flex items-center">
            <text class="text-gray-500">{{userInfo.account}}</text>
          </view>
        </view>
      </view>
      
      <!-- 性别 -->
      <view class="p-4 border-b border-gray-100">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">性别</text>
          <view class="flex items-center">
            <radio-group @change="genderChange">
              <label class="radio-label mr-4">
                <radio value="男" :checked="userInfo.gender === '男'" color="#4CAF50" />
                <text class="ml-1">男</text>
              </label>
              <label class="radio-label">
                <radio value="女" :checked="userInfo.gender === '女'" color="#4CAF50" />
                <text class="ml-1">女</text>
              </label>
            </radio-group>
          </view>
        </view>
      </view>
      
      <!-- 出生日期 -->
      <view class="p-4 border-b border-gray-100">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">出生日期</text>
          <picker mode="date" :value="userInfo.birthdate" @change="birthdateChange" fields="day" start="1900-01-01" end="2023-12-31">
            <view class="flex items-center">
              <text class="text-gray-500 mr-2">{{userInfo.birthdate || '请选择'}}</text>
              <icon-image name="right" size="18"></icon-image>
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 城市 -->
      <view class="p-4 border-b border-gray-100">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">所在城市</text>
          <picker mode="region" :value="cityArray" @change="cityChange">
            <view class="flex items-center">
              <text class="text-gray-500 mr-2">{{userInfo.city || '请选择'}}</text>
              <icon-image name="right" size="18"></icon-image>
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 职业 -->
      <view class="p-4">
        <view class="flex items-center justify-between">
          <text class="text-gray-700">职业</text>
          <view class="flex items-center">
            <input type="text" v-model="userInfo.occupation" placeholder="请输入职业" class="text-right text-gray-700 pr-2" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="p-4">
      <button class="bg-green text-white py-3 rounded-full w-full" @tap="saveUserInfo">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import IconImage from '../../components/IconImage.vue';

// 用户信息数据
const userInfo = reactive({
  avatar: '/static/images/user-avatar.jpg',
  nickname: '绿色先锋',
  account: 'Dawn99',
  gender: '男',
  birthdate: '1992-07-11',
  city: '广东省 广州市 天河区',
  occupation: '能源顾问'
});

// 城市数组，用于城市选择器
const cityArray = ref(['广东省', '广州市', '天河区']);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 从相册选择或拍照
    success: (res) => {
      // 返回选定照片的临时文件路径
      const tempFilePath = res.tempFilePaths[0];
      
      // 上传图片到云存储
      uploadFile(tempFilePath);
    }
  });
};

// 上传图片到云存储
const uploadFile = (filePath) => {
  uni.showLoading({ title: '上传中...' });
  
  const extName = filePath.substring(filePath.lastIndexOf('.') + 1);
  const cloudPath = `avatar/${Date.now()}-${Math.random().toString(36).slice(-8)}.${extName}`;
  
  uniCloud.uploadFile({
    filePath: filePath,
    cloudPath: cloudPath,
    success: (res) => {
      userInfo.avatar = res.fileID;
      uni.hideLoading();
      uni.showToast({ title: '上传成功', icon: 'success' });
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '上传失败', icon: 'error' });
      console.error(err);
    }
  });
};

// 性别改变事件
const genderChange = (e) => {
  userInfo.gender = e.detail.value;
};

// 出生日期改变事件
const birthdateChange = (e) => {
  userInfo.birthdate = e.detail.value;
};

// 城市改变事件
const cityChange = (e) => {
  const cityArr = e.detail.value;
  cityArray.value = cityArr;
  userInfo.city = cityArr.join(' ');
};

// 保存用户信息
const saveUserInfo = () => {
  // 表单验证
  if (!userInfo.nickname) {
    return uni.showToast({ title: '请输入昵称', icon: 'none' });
  }
  
  uni.showLoading({ title: '保存中...' });
  
  // 处理日期格式，转换为Date对象
  const birthdate = userInfo.birthdate ? new Date(userInfo.birthdate) : null;
  
  // 通过云函数调用保存用户信息
  uniCloud.callFunction({
    name: 'saveUserInfo',
    data: {
      account: userInfo.account,
      nickname: userInfo.nickname,
      gender: userInfo.gender,
      birthdate: birthdate,
      city: userInfo.city,
      occupation: userInfo.occupation,
      avatar: userInfo.avatar
    }
  }).then(res => {
    if (res.result && res.result.code === 0) {
      uni.hideLoading();
      uni.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          // 信息保存到本地
          uni.setStorageSync('userInfo', JSON.stringify(userInfo));
          
          // 触发全局事件，通知其他页面用户信息更新
          uni.$emit('userInfoUpdated', userInfo);
          
          // 返回个人中心
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        }
      });
    } else {
      throw new Error(res.result.msg || '保存失败');
    }
  }).catch(err => {
    uni.hideLoading();
    uni.showToast({
      title: err.message || '保存失败',
      icon: 'error'
    });
    console.error('保存用户信息失败：', err);
  });
};

// 页面加载时获取用户信息
onMounted(() => {
  // 尝试从本地获取用户信息
  const localUserInfo = uni.getStorageSync('userInfo');
  if (localUserInfo) {
    try {
      const parsedInfo = JSON.parse(localUserInfo);
      Object.assign(userInfo, parsedInfo);
      
      // 设置城市数组
      if (userInfo.city) {
        cityArray.value = userInfo.city.split(' ');
      }
    } catch (e) {
      console.error('解析本地用户信息失败', e);
    }
  } else {
    // 从数据库获取
    // 使用云函数获取用户信息
    uniCloud.callFunction({
      name: 'getProfile',
      data: { account: userInfo.account }
    }).then(res => {
      if (res.result && res.result.code === 0 && res.result.data.userInfo) {
        const dbUserInfo = res.result.data.userInfo;
        
        // 更新本地用户信息
        userInfo.nickname = dbUserInfo.nickname || userInfo.nickname;
        userInfo.gender = dbUserInfo.gender || userInfo.gender;
        
        // 处理日期类型
        if (dbUserInfo.birthdate) {
          const date = new Date(dbUserInfo.birthdate);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            userInfo.birthdate = `${year}-${month}-${day}`;
          }
        }
        
        userInfo.city = dbUserInfo.city || userInfo.city;
        userInfo.occupation = dbUserInfo.occupation || userInfo.occupation;
        userInfo.avatar = dbUserInfo.avatar || userInfo.avatar;
        
        // 设置城市数组
        if (userInfo.city) {
          cityArray.value = userInfo.city.split(' ');
        }
      }
    }).catch(err => {
      console.error('获取用户信息失败', err);
    });
  }
});
</script>

<style>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  padding-top: 44px;
  padding-bottom: 12px;
  box-sizing: content-box;
}

.bg-green {
  background-color: #4CAF50;
}

.text-green-500 {
  color: #4CAF50;
}

.w-24px {
  width: 24px;
}

.avatar-medium {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-100 {
  border-color: #f0f0f0;
}

.rounded-full {
  border-radius: 9999px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
}

.bg-white { background-color: #ffffff; }
.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.p-4 { padding: 16px; }
.p-3 { padding: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pr-2 { padding-right: 8px; }

.mb-2 { margin-bottom: 8px; }
.mr-4 { margin-right: 16px; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }
.ml-1 { margin-left: 4px; }

.text-lg { font-size: 18px; }
.text-xs { font-size: 12px; }
.font-medium { font-weight: 500; }

input {
  outline: none;
  border: none;
  width: 150px;
}
</style> 