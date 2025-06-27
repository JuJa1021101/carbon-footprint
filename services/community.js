// 社区服务
import { getCurrentUser } from './login.js';

/**
 * 获取帖子列表
 * @param {Object} options 查询参数
 * @returns {Promise} 帖子列表Promise
 */
export const getPosts = (options = {}) => {
  return new Promise((resolve) => {
    const { filter = 'recommend', page = 1, pageSize = 10 } = options;
    
    // 获取当前登录用户信息
    const currentUser = getCurrentUser();
    
    // 从本地存储获取用户发布的帖子
    let localPosts = [];
    try {
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
      }
    } catch (e) {
      console.error('获取本地帖子失败', e);
    }
    
    // 获取交互数据
    let postInteractions = {};
    try {
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      console.error('获取交互状态失败', e);
    }
    
    // 为本地帖子添加当前用户信息和交互状态
    localPosts = localPosts.map(post => {
      // 确保所有由当前用户发表的帖子都使用最新的用户信息
      if (post.userId === currentUser.id || post.isCurrentUser) {
        post.userInfo = {
          nickname: currentUser.nickname || '绿色先锋',
          avatar: currentUser.avatar || '/static/images/avatars/avatar-user2.jpg',
          location: post.userInfo?.location || '当前位置'
        };
        post.isCurrentUser = true;
      }
      
      // 应用交互状态
      if (postInteractions[post._id]) {
        post.eyes = postInteractions[post._id].eyes || post.eyes;
        post.likes = postInteractions[post._id].likes || post.likes;
        post.comments = postInteractions[post._id].comments || post.comments;
        post.isLiked = postInteractions[post._id].isLiked || false;
        post.isCollected = postInteractions[post._id].isCollected || false;
        post.isFollowed = postInteractions[post._id].isFollowed || false;
      }
      
      return post;
    });
    
    // 模拟数据，在实际应用中，这部分将被替换为API调用
    const mockPosts = [{
      _id: 'post1',
      userId: 'user1',
      userInfo: {
        nickname: '绿色生活家',
        avatar: '/static/images/avatars/avatar-user1.jpg',
        location: '北京市'
      },
      content: '分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用',
      images: [
        '/static/images/userspost/recycle-before.jpeg',
        '/static/images/userspost/recycle-after.jpeg'
      ],
      label: '创意改造,废物利用',
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '2小时前',
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    }, {
      _id: 'post2',
      userId: 'user2',
      userInfo: {
        nickname: '环保达人',
        avatar: '/static/images/avatars/avatar-user2.jpg',
        location: '上海市'
      },
      content: '今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动',
      images: [
        '/static/images/userspost/river-cleanup.jpeg'
      ],
      label: '志愿活动,环保行动',
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '昨天',
      timestamp: Date.now() - 24 * 60 * 60 * 1000
    }, {
      _id: 'post3',
      userId: 'user3',
      userInfo: {
        nickname: '低碳生活馆',
        avatar: '/static/images/avatars/avatar-user3.jpg',
        location: '广州市'
      },
      content: '【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧',
      images: [
        '/static/images/userspost/water-saving.jpeg'
      ],
      label: '节约用水,生活技巧',
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '3天前',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
    }];
    
    // 根据筛选参数返回不同的帖子
    let resultPosts;
    
    if (filter === 'mine') {
      // 仅返回当前用户的帖子
      resultPosts = localPosts.filter(post => post.userId === currentUser.id);
    } else {
      // 将模拟数据和本地数据合并
      resultPosts = [...localPosts, ...mockPosts];
      
      // 根据筛选条件过滤
      switch (filter) {
        case 'follow':
          resultPosts = resultPosts.filter(post => post.isFollowed);
          break;
        case 'hot':
          resultPosts.sort((a, b) => b.likes - a.likes);
          break;
        case 'latest':
          resultPosts.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp - a.timestamp;
            }
            return 0;
          });
          break;
        default:
          // recommend，默认排序
          break;
      }
    }
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedPosts = resultPosts.slice(start, end);
    
    // 返回结果
    setTimeout(() => {
      resolve({
        posts: pagedPosts,
        total: resultPosts.length,
        page,
        pageSize
      });
    }, 300);
  });
};

/**
 * 获取帖子详情
 * @param {string} postId 帖子ID
 * @returns {Promise} 帖子详情Promise
 */
export const getPostDetail = (postId) => {
  return new Promise((resolve) => {
    // 获取当前登录用户
    const currentUser = getCurrentUser();
    
    // 从本地存储获取用户发布的帖子
    let localPosts = [];
    try {
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        const localPost = localPosts.find(p => p._id === postId);
        if (localPost) {
          // 找到本地帖子
          // 更新用户信息 - 确保所有帖子都显示当前用户的信息
          if (localPost.userId === currentUser.id || localPost.isCurrentUser) {
            localPost.userInfo = {
              nickname: currentUser.nickname || '绿色先锋',
              avatar: currentUser.avatar || '/static/images/avatars/avatar-user2.jpg',
              location: localPost.userInfo?.location || '当前位置'
            };
            localPost.isCurrentUser = true;
          }
          
          // 增加浏览次数
          localPost.eyes += 1;
          
          // 保存回本地存储
          uni.setStorageSync('local_posts', JSON.stringify(localPosts));
          
          // 保存交互数据
          savePostInteraction(localPost);
          
          // 如果没有评论列表，添加空数组
          if (!localPost.commentList) {
            localPost.commentList = [];
          }
          
          // 为每个评论设置当前用户信息
          if (localPost.commentList && localPost.commentList.length > 0) {
            localPost.commentList = localPost.commentList.map(comment => {
              if (comment.userId === currentUser.id) {
                comment.userInfo = {
                  nickname: currentUser.nickname || '绿色先锋',
                  avatar: currentUser.avatar || '/static/images/avatars/avatar-user2.jpg'
                };
              }
              return comment;
            });
          }
          
          setTimeout(() => {
            resolve(localPost);
          }, 300);
          return;
        }
      }
    } catch (e) {
      console.error('解析本地帖子失败', e);
    }
    
    // 获取交互状态
    let postInteractions = {};
    try {
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      console.error('获取交互状态失败', e);
    }
    
    // 使用模拟数据
    const mockPosts = [{
      _id: 'post1',
      userId: 'user1',
      userInfo: {
        nickname: '绿色生活家',
        avatar: '/static/images/avatars/avatar-user1.jpg',
        location: '北京市'
      },
      content: '分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用',
      images: [
        '/static/images/userspost/recycle-before.jpeg',
        '/static/images/userspost/recycle-after.jpeg'
      ],
      label: '创意改造,废物利用',
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '2小时前',
      commentList: []
    }, {
      _id: 'post2',
      userId: 'user2',
      userInfo: {
        nickname: '环保达人',
        avatar: '/static/images/avatars/avatar-user2.jpg',
        location: '上海市'
      },
      content: '今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动',
      images: [
        '/static/images/userspost/river-cleanup.jpeg'
      ],
      label: '志愿活动,环保行动',
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '昨天',
      commentList: []
    }, {
      _id: 'post3',
      userId: 'user3',
      userInfo: {
        nickname: '低碳生活馆',
        avatar: '/static/images/avatars/avatar-user3.jpg',
        location: '广州市'
      },
      content: '【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧',
      images: [
        '/static/images/userspost/water-saving.jpeg'
      ],
      label: '节约用水,生活技巧',
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '3天前',
      commentList: []
    }];
    
    // 找到对应ID的帖子
    const post = mockPosts.find(p => p._id === postId);
    
    if (post) {
      // 应用交互状态
      if (postInteractions[post._id]) {
        post.eyes = postInteractions[post._id].eyes || post.eyes;
        post.likes = postInteractions[post._id].likes || post.likes;
        post.comments = postInteractions[post._id].comments || post.comments;
        post.isLiked = postInteractions[post._id].isLiked || false;
        post.isCollected = postInteractions[post._id].isCollected || false;
        post.isFollowed = postInteractions[post._id].isFollowed || false;
      }
      
      // 增加浏览次数
      post.eyes += 1;
      
      // 保存交互数据
      savePostInteraction(post);
    }
    
    // 模拟延时
    setTimeout(() => {
      resolve(post || null);
    }, 300);
  });
};

/**
 * 保存帖子交互状态
 * @param {Object} post 帖子对象
 */
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
  } catch (e) {
    console.error('保存交互状态失败', e);
  }
};

/**
 * 发布帖子
 * @param {Object} postData 帖子数据
 * @param {string} postData.content 帖子内容
 * @param {Array} postData.images 图片数组
 * @param {string} postData.label 标签，多个标签用逗号分隔
 * @returns {Promise} 发布结果Promise
 */
export const createPost = (postData) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }
    
    const { content, images, label } = postData;
    
    // 校验内容
    if (!content || content.trim() === '') {
      reject(new Error('内容不能为空'));
      return;
    }
    
    // 显示加载状态
    uni.showLoading({ title: '发布中...' });
    
    setTimeout(() => {
      uni.hideLoading();
      
      const timestamp = Date.now();
      const newPost = {
        _id: 'post_' + timestamp,
        userId: user.id,
        userInfo: {
          nickname: user.nickname || '绿色先锋',
          avatar: user.avatar || '/static/images/avatars/avatar-user2.jpg',
          location: '当前位置' // 实际应用中可从定位获取
        },
        content,
        images: images || [],
        label: label || '',
        eyes: 0,
        likes: 0,
        comments: 0,
        isFollowed: false,
        isLiked: false,
        isCollected: false,
        isCurrentUser: true, // 标记为当前用户的帖子
        createdAt: '刚刚',
        timestamp: timestamp,
        commentList: []
      };
      
      // 保存到本地缓存，模拟数据持久化
      try {
        let localPosts = [];
        const cachedPosts = uni.getStorageSync('local_posts');
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
        }
        localPosts.unshift(newPost); // 添加到数组开头
        uni.setStorageSync('local_posts', JSON.stringify(localPosts));
      } catch (e) {
        console.error('保存帖子失败', e);
      }
      
      resolve(newPost);
    }, 1000);
  });
};

/**
 * 点赞/取消点赞帖子
 * @param {string} postId 帖子ID
 * @param {boolean} isLike 是否点赞，false为取消点赞
 * @returns {Promise} 操作结果Promise
 */
export const likePost = (postId, isLike) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }
    
    // 更新本地存储中的帖子数据
    try {
      // 更新交互状态
      let postInteractions = {};
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
      
      if (!postInteractions[postId]) {
        postInteractions[postId] = { likes: 0, isLiked: false };
      }
      
      // 更新点赞状态和数量
      if (isLike && !postInteractions[postId].isLiked) {
        postInteractions[postId].likes = (postInteractions[postId].likes || 0) + 1;
        postInteractions[postId].isLiked = true;
      } else if (!isLike && postInteractions[postId].isLiked) {
        postInteractions[postId].likes = Math.max(0, (postInteractions[postId].likes || 0) - 1);
        postInteractions[postId].isLiked = false;
      }
      
      // 保存交互状态
      uni.setStorageSync('post_interactions', JSON.stringify(postInteractions));
      
      // 更新本地帖子数据
      let localPosts = [];
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        const postIndex = localPosts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          localPosts[postIndex].likes = postInteractions[postId].likes;
          localPosts[postIndex].isLiked = postInteractions[postId].isLiked;
          uni.setStorageSync('local_posts', JSON.stringify(localPosts));
        }
      }
    } catch (e) {
      console.error('更新点赞状态失败', e);
    }
    
    // 在真实环境中，这里应该调用云函数更新点赞状态
    setTimeout(() => {
      resolve({
        success: true,
        isLike
      });
    }, 300);
  });
};

/**
 * 收藏/取消收藏帖子
 * @param {string} postId 帖子ID
 * @param {boolean} isCollect 是否收藏，false为取消收藏
 * @returns {Promise} 操作结果Promise
 */
export const collectPost = (postId, isCollect) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }
    
    // 更新本地存储中的帖子数据
    try {
      // 更新交互状态
      let postInteractions = {};
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
      
      if (!postInteractions[postId]) {
        postInteractions[postId] = { isCollected: false };
      }
      
      // 更新收藏状态
      postInteractions[postId].isCollected = isCollect;
      
      // 保存交互状态
      uni.setStorageSync('post_interactions', JSON.stringify(postInteractions));
      
      // 更新本地帖子数据
      let localPosts = [];
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        const postIndex = localPosts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          localPosts[postIndex].isCollected = isCollect;
          uni.setStorageSync('local_posts', JSON.stringify(localPosts));
        }
      }
    } catch (e) {
      console.error('更新收藏状态失败', e);
    }
    
    // 在真实环境中，这里应该调用云函数更新收藏状态
    setTimeout(() => {
      resolve({
        success: true,
        isCollect
      });
    }, 300);
  });
};

/**
 * 关注/取消关注用户
 * @param {string} userId 要关注的用户ID
 * @param {boolean} isFollow 是否关注，false为取消关注
 * @returns {Promise} 操作结果Promise
 */
export const followUser = (userId, isFollow) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }
    
    // 更新与该用户相关的所有帖子的关注状态
    try {
      // 获取本地帖子
      let localPosts = [];
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        
        // 更新所有该用户的帖子
        let updated = false;
        localPosts.forEach(post => {
          if (post.userId === userId) {
            post.isFollowed = isFollow;
            updated = true;
          }
        });
        
        if (updated) {
          uni.setStorageSync('local_posts', JSON.stringify(localPosts));
        }
      }
      
      // 更新交互状态
      let postInteractions = {};
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
        
        // 遍历所有交互，更新关注状态
        let interactionsUpdated = false;
        for (const postId in postInteractions) {
          // 我们需要知道每个帖子的作者是谁
          // 这里假设我们有一个映射关系，实际中可能需要另外存储
          let postIndex = localPosts.findIndex(post => post._id === postId);
          if (postIndex !== -1 && localPosts[postIndex].userId === userId) {
            if (!postInteractions[postId]) {
              postInteractions[postId] = {};
            }
            postInteractions[postId].isFollowed = isFollow;
            interactionsUpdated = true;
          }
        }
        
        if (interactionsUpdated) {
          uni.setStorageSync('post_interactions', JSON.stringify(postInteractions));
        }
      }
    } catch (e) {
      console.error('更新关注状态失败', e);
    }
    
    // 在真实环境中，这里应该调用云函数更新关注状态
    setTimeout(() => {
      resolve({
        success: true,
        isFollow
      });
    }, 300);
  });
};

/**
 * 发表评论
 * @param {Object} commentData 评论数据
 * @param {string} commentData.postId 帖子ID
 * @param {string} commentData.content 评论内容
 * @param {Object} [commentData.replyTo] 回复的评论
 * @returns {Promise} 评论结果Promise
 */
export const createComment = (commentData) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }
    
    const { postId, content, replyTo } = commentData;
    
    // 校验内容
    if (!content || content.trim() === '') {
      reject(new Error('评论内容不能为空'));
      return;
    }
    
    // 校验帖子ID
    if (!postId) {
      reject(new Error('缺少帖子ID'));
      return;
    }
    
    uni.showLoading({ title: '提交中...' });
    
    setTimeout(() => {
      uni.hideLoading();
      
      // 创建评论对象
      const timestamp = Date.now();
      const newComment = {
        _id: 'comment_' + timestamp,
        postId: postId,
        userId: user.id,
        userInfo: {
          nickname: user.nickname || '绿色先锋',
          avatar: user.avatar || '/static/images/avatars/avatar-user2.jpg'
        },
        content: content,
        createdAt: '刚刚',
        timestamp: timestamp,
        likes: 0,
        isLiked: false
      };
      
      // 如果是回复其他评论
      if (replyTo) {
        newComment.replyTo = {
          commentId: replyTo.commentId,
          userId: replyTo.userId,
          nickname: replyTo.nickname
        };
      }
      
      // 获取本地帖子
      try {
        let localPosts = [];
        const cachedPosts = uni.getStorageSync('local_posts');
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          
          // 找到对应的帖子
          const postIndex = localPosts.findIndex(post => post._id === postId);
          if (postIndex !== -1) {
            // 确保commentList数组存在
            if (!localPosts[postIndex].commentList) {
              localPosts[postIndex].commentList = [];
            }
            
            // 添加评论
            localPosts[postIndex].commentList.push(newComment);
            
            // 更新评论数
            localPosts[postIndex].comments += 1;
            
            // 保存回本地存储
            uni.setStorageSync('local_posts', JSON.stringify(localPosts));
            
            // 保存交互数据
            savePostInteraction(localPosts[postIndex]);
            
            resolve(newComment);
            return;
          }
        }
      } catch (e) {
        console.error('保存评论失败', e);
      }
      
      // 如果找不到本地帖子，创建临时评论
      resolve(newComment);
    }, 500);
  });
};

/**
 * 删除帖子
 * @param {string} postId 要删除的帖子ID
 * @returns {Promise} 删除结果Promise
 */
export const deletePost = (postId) => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    const user = getCurrentUser();
    if (!user) {
      reject(new Error('用户未登录'));
      return;
    }

    uni.showLoading({ title: '删除中...' });
    
    // 模拟网络延迟
    setTimeout(() => {
      try {
        // 从本地存储获取帖子列表
        let localPosts = [];
        const cachedPosts = uni.getStorageSync('local_posts');
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          
          // 找到对应帖子的索引
          const postIndex = localPosts.findIndex(post => post._id === postId);
          
          // 检查帖子是否存在
          if (postIndex === -1) {
            uni.hideLoading();
            reject(new Error('帖子不存在'));
            return;
          }
          
          const post = localPosts[postIndex];
          // 检查是否是用户自己的帖子或当前用户的帖子
          // 1. 比较用户ID
          // 2. 或检查isCurrentUser标记
          if (post.userId !== user.id && !post.isCurrentUser) {
            uni.hideLoading();
            reject(new Error('无权限删除此帖子'));
            return;
          }
          
          // 删除帖子
          localPosts.splice(postIndex, 1);
          
          // 保存回本地存储
          uni.setStorageSync('local_posts', JSON.stringify(localPosts));
          
          // 删除交互数据
          try {
            const cachedInteractions = uni.getStorageSync('post_interactions');
            if (cachedInteractions) {
              const postInteractions = JSON.parse(cachedInteractions);
              if (postInteractions[postId]) {
                delete postInteractions[postId];
                uni.setStorageSync('post_interactions', JSON.stringify(postInteractions));
              }
            }
          } catch (e) {
            console.error('删除交互数据失败', e);
          }
          
          uni.hideLoading();
          resolve({ success: true, message: '帖子删除成功' });
        } else {
          uni.hideLoading();
          reject(new Error('没有找到帖子数据'));
        }
      } catch (e) {
        uni.hideLoading();
        console.error('删除帖子失败', e);
        reject(new Error('删除帖子失败'));
      }
    }, 800);
  });
};

/**
 * 搜索帖子
 * @param {string} query 搜索关键词
 * @param {Object} options 搜索选项
 * @param {number} options.page 页码，默认1
 * @param {number} options.pageSize 每页数量，默认10
 * @returns {Promise} 搜索结果Promise
 */
export const searchPosts = (query, options = {}) => {
  return new Promise((resolve) => {
    const { page = 1, pageSize = 10 } = options;
    
    // 如果搜索关键词为空，返回空结果
    if (!query || query.trim() === '') {
      resolve({
        posts: [],
        total: 0,
        page,
        pageSize
      });
      return;
    }
    
    // 获取当前用户信息
    const currentUser = getCurrentUser();
    
    // 获取所有帖子（本地存储 + 模拟数据）
    let allPosts = [];
    
    // 从本地存储获取帖子
    try {
      const cachedPosts = uni.getStorageSync('local_posts');
      if (cachedPosts) {
        allPosts = JSON.parse(cachedPosts);
      }
    } catch (e) {
      console.error('获取本地帖子失败', e);
    }
    
    // 添加模拟数据
    const mockPosts = [{
      _id: 'post1',
      userId: 'user1',
      userInfo: {
        nickname: '绿色生活家',
        avatar: '/static/images/avatars/avatar-user1.jpg',
        location: '北京市'
      },
      content: '分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用',
      images: [
        '/static/images/userspost/recycle-before.jpeg',
        '/static/images/userspost/recycle-after.jpeg'
      ],
      label: '创意改造,废物利用',
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '2小时前',
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    }, {
      _id: 'post2',
      userId: 'user2',
      userInfo: {
        nickname: '环保达人',
        avatar: '/static/images/avatars/avatar-user2.jpg',
        location: '上海市'
      },
      content: '今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动',
      images: [
        '/static/images/userspost/river-cleanup.jpeg'
      ],
      label: '志愿活动,环保行动',
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '昨天',
      timestamp: Date.now() - 24 * 60 * 60 * 1000
    }, {
      _id: 'post3',
      userId: 'user3',
      userInfo: {
        nickname: '低碳生活馆',
        avatar: '/static/images/avatars/avatar-user3.jpg',
        location: '广州市'
      },
      content: '【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧',
      images: [
        '/static/images/userspost/water-saving.jpeg'
      ],
      label: '节约用水,生活技巧',
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: '3天前',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
    }];
    
    // 合并数据
    allPosts = [...allPosts, ...mockPosts];
    
    // 获取交互数据
    let postInteractions = {};
    try {
      const cachedInteractions = uni.getStorageSync('post_interactions');
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      console.error('获取交互状态失败', e);
    }
    
    // 模糊搜索逻辑
    const searchQuery = query.toLowerCase().trim();
    const matchedPosts = allPosts.filter(post => {
      // 搜索内容
      const contentMatch = post.content && post.content.toLowerCase().includes(searchQuery);
      
      // 搜索标签
      const labelMatch = post.label && post.label.toLowerCase().includes(searchQuery);
      
      // 内容或标签匹配即返回true
      return contentMatch || labelMatch;
    });
    
    // 应用交互状态和当前用户信息
    const resultPosts = matchedPosts.map(post => {
      // 确保所有由当前用户发表的帖子都使用最新的用户信息
      if (post.userId === currentUser.id || post.isCurrentUser) {
        post.userInfo = {
          nickname: currentUser.nickname || '绿色先锋',
          avatar: currentUser.avatar || '/static/images/avatars/avatar-user2.jpg',
          location: post.userInfo?.location || '当前位置'
        };
        post.isCurrentUser = true;
      }
      
      // 应用交互状态
      if (postInteractions[post._id]) {
        post.eyes = postInteractions[post._id].eyes || post.eyes;
        post.likes = postInteractions[post._id].likes || post.likes;
        post.comments = postInteractions[post._id].comments || post.comments;
        post.isLiked = postInteractions[post._id].isLiked || false;
        post.isCollected = postInteractions[post._id].isCollected || false;
        post.isFollowed = postInteractions[post._id].isFollowed || false;
      }
      
      return post;
    });
    
    // 按相关性排序（包含在内容中的优先于标签中的）
    resultPosts.sort((a, b) => {
      const aContentMatch = a.content && a.content.toLowerCase().includes(searchQuery);
      const bContentMatch = b.content && b.content.toLowerCase().includes(searchQuery);
      
      if (aContentMatch && !bContentMatch) return -1;
      if (!aContentMatch && bContentMatch) return 1;
      
      // 如果内容匹配情况一样，按时间降序
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedPosts = resultPosts.slice(start, end);
    
    // 返回结果
    setTimeout(() => {
      resolve({
        posts: pagedPosts,
        total: resultPosts.length,
        page,
        pageSize,
        query
      });
    }, 300);
  });
}; 