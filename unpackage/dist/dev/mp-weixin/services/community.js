"use strict";
const common_vendor = require("../common/vendor.js");
const services_login = require("./login.js");
const getPosts = (options = {}) => {
  return new Promise((resolve) => {
    const { filter = "recommend", page = 1, pageSize = 10 } = options;
    const currentUser = services_login.getCurrentUser();
    let localPosts = [];
    try {
      const cachedPosts = common_vendor.index.getStorageSync("local_posts");
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:24", "获取本地帖子失败", e);
    }
    let postInteractions = {};
    try {
      const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:35", "获取交互状态失败", e);
    }
    localPosts = localPosts.map((post) => {
      var _a;
      if (post.userId === currentUser.id || post.isCurrentUser) {
        post.userInfo = {
          nickname: currentUser.nickname || "绿色先锋",
          avatar: currentUser.avatar || "/static/images/avatars/avatar-user2.jpg",
          location: ((_a = post.userInfo) == null ? void 0 : _a.location) || "当前位置"
        };
        post.isCurrentUser = true;
      }
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
    const mockPosts = [{
      _id: "post1",
      userId: "user1",
      userInfo: {
        nickname: "绿色生活家",
        avatar: "/static/images/avatars/avatar-user1.jpg",
        location: "北京市"
      },
      content: "分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用",
      images: [
        "/static/images/userspost/recycle-before.jpeg",
        "/static/images/userspost/recycle-after.jpeg"
      ],
      label: "创意改造,废物利用",
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "2小时前",
      timestamp: Date.now() - 2 * 60 * 60 * 1e3
    }, {
      _id: "post2",
      userId: "user2",
      userInfo: {
        nickname: "环保达人",
        avatar: "/static/images/avatars/avatar-user2.jpg",
        location: "上海市"
      },
      content: "今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动",
      images: [
        "/static/images/userspost/river-cleanup.jpeg"
      ],
      label: "志愿活动,环保行动",
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "昨天",
      timestamp: Date.now() - 24 * 60 * 60 * 1e3
    }, {
      _id: "post3",
      userId: "user3",
      userInfo: {
        nickname: "低碳生活馆",
        avatar: "/static/images/avatars/avatar-user3.jpg",
        location: "广州市"
      },
      content: "【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧",
      images: [
        "/static/images/userspost/water-saving.jpeg"
      ],
      label: "节约用水,生活技巧",
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "3天前",
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1e3
    }];
    let resultPosts;
    if (filter === "mine") {
      resultPosts = localPosts.filter((post) => post.userId === currentUser.id);
    } else {
      resultPosts = [...localPosts, ...mockPosts];
      switch (filter) {
        case "follow":
          resultPosts = resultPosts.filter((post) => post.isFollowed);
          break;
        case "hot":
          resultPosts.sort((a, b) => b.likes - a.likes);
          break;
        case "latest":
          resultPosts.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp - a.timestamp;
            }
            return 0;
          });
          break;
      }
    }
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedPosts = resultPosts.slice(start, end);
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
const getPostDetail = (postId) => {
  return new Promise((resolve) => {
    var _a;
    const currentUser = services_login.getCurrentUser();
    let localPosts = [];
    try {
      const cachedPosts = common_vendor.index.getStorageSync("local_posts");
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        const localPost = localPosts.find((p) => p._id === postId);
        if (localPost) {
          if (localPost.userId === currentUser.id || localPost.isCurrentUser) {
            localPost.userInfo = {
              nickname: currentUser.nickname || "绿色先锋",
              avatar: currentUser.avatar || "/static/images/avatars/avatar-user2.jpg",
              location: ((_a = localPost.userInfo) == null ? void 0 : _a.location) || "当前位置"
            };
            localPost.isCurrentUser = true;
          }
          localPost.eyes += 1;
          common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
          savePostInteraction(localPost);
          if (!localPost.commentList) {
            localPost.commentList = [];
          }
          if (localPost.commentList && localPost.commentList.length > 0) {
            localPost.commentList = localPost.commentList.map((comment) => {
              if (comment.userId === currentUser.id) {
                comment.userInfo = {
                  nickname: currentUser.nickname || "绿色先锋",
                  avatar: currentUser.avatar || "/static/images/avatars/avatar-user2.jpg"
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
      common_vendor.index.__f__("error", "at services/community.js:242", "解析本地帖子失败", e);
    }
    let postInteractions = {};
    try {
      const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:253", "获取交互状态失败", e);
    }
    const mockPosts = [{
      _id: "post1",
      userId: "user1",
      userInfo: {
        nickname: "绿色生活家",
        avatar: "/static/images/avatars/avatar-user1.jpg",
        location: "北京市"
      },
      content: "分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用",
      images: [
        "/static/images/userspost/recycle-before.jpeg",
        "/static/images/userspost/recycle-after.jpeg"
      ],
      label: "创意改造,废物利用",
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "2小时前",
      commentList: []
    }, {
      _id: "post2",
      userId: "user2",
      userInfo: {
        nickname: "环保达人",
        avatar: "/static/images/avatars/avatar-user2.jpg",
        location: "上海市"
      },
      content: "今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动",
      images: [
        "/static/images/userspost/river-cleanup.jpeg"
      ],
      label: "志愿活动,环保行动",
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "昨天",
      commentList: []
    }, {
      _id: "post3",
      userId: "user3",
      userInfo: {
        nickname: "低碳生活馆",
        avatar: "/static/images/avatars/avatar-user3.jpg",
        location: "广州市"
      },
      content: "【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧",
      images: [
        "/static/images/userspost/water-saving.jpeg"
      ],
      label: "节约用水,生活技巧",
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "3天前",
      commentList: []
    }];
    const post = mockPosts.find((p) => p._id === postId);
    if (post) {
      if (postInteractions[post._id]) {
        post.eyes = postInteractions[post._id].eyes || post.eyes;
        post.likes = postInteractions[post._id].likes || post.likes;
        post.comments = postInteractions[post._id].comments || post.comments;
        post.isLiked = postInteractions[post._id].isLiked || false;
        post.isCollected = postInteractions[post._id].isCollected || false;
        post.isFollowed = postInteractions[post._id].isFollowed || false;
      }
      post.eyes += 1;
      savePostInteraction(post);
    }
    setTimeout(() => {
      resolve(post || null);
    }, 300);
  });
};
const savePostInteraction = (post) => {
  if (!post || !post._id)
    return;
  try {
    let postInteractions = {};
    const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
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
    common_vendor.index.setStorageSync("post_interactions", JSON.stringify(postInteractions));
  } catch (e) {
    common_vendor.index.__f__("error", "at services/community.js:376", "保存交互状态失败", e);
  }
};
const createPost = (postData) => {
  return new Promise((resolve, reject) => {
    const user = services_login.getCurrentUser();
    if (!user) {
      reject(new Error("用户未登录"));
      return;
    }
    const { content, images, label } = postData;
    if (!content || content.trim() === "") {
      reject(new Error("内容不能为空"));
      return;
    }
    common_vendor.index.showLoading({ title: "发布中..." });
    setTimeout(() => {
      common_vendor.index.hideLoading();
      const timestamp = Date.now();
      const newPost = {
        _id: "post_" + timestamp,
        userId: user.id,
        userInfo: {
          nickname: user.nickname || "绿色先锋",
          avatar: user.avatar || "/static/images/avatars/avatar-user2.jpg",
          location: "当前位置"
          // 实际应用中可从定位获取
        },
        content,
        images: images || [],
        label: label || "",
        eyes: 0,
        likes: 0,
        comments: 0,
        isFollowed: false,
        isLiked: false,
        isCollected: false,
        isCurrentUser: true,
        // 标记为当前用户的帖子
        createdAt: "刚刚",
        timestamp,
        commentList: []
      };
      try {
        let localPosts = [];
        const cachedPosts = common_vendor.index.getStorageSync("local_posts");
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
        }
        localPosts.unshift(newPost);
        common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
      } catch (e) {
        common_vendor.index.__f__("error", "at services/community.js:445", "保存帖子失败", e);
      }
      resolve(newPost);
    }, 1e3);
  });
};
const likePost = (postId, isLike) => {
  return new Promise((resolve, reject) => {
    const user = services_login.getCurrentUser();
    if (!user) {
      reject(new Error("用户未登录"));
      return;
    }
    try {
      let postInteractions = {};
      const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
      if (!postInteractions[postId]) {
        postInteractions[postId] = { likes: 0, isLiked: false };
      }
      if (isLike && !postInteractions[postId].isLiked) {
        postInteractions[postId].likes = (postInteractions[postId].likes || 0) + 1;
        postInteractions[postId].isLiked = true;
      } else if (!isLike && postInteractions[postId].isLiked) {
        postInteractions[postId].likes = Math.max(0, (postInteractions[postId].likes || 0) - 1);
        postInteractions[postId].isLiked = false;
      }
      common_vendor.index.setStorageSync("post_interactions", JSON.stringify(postInteractions));
      let localPosts = [];
      const cachedPosts = common_vendor.index.getStorageSync("local_posts");
      if (cachedPosts) {
        localPosts = JSON.parse(cachedPosts);
        const postIndex = localPosts.findIndex((post) => post._id === postId);
        if (postIndex !== -1) {
          localPosts[postIndex].likes = postInteractions[postId].likes;
          localPosts[postIndex].isLiked = postInteractions[postId].isLiked;
          common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
        }
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:506", "更新点赞状态失败", e);
    }
    setTimeout(() => {
      resolve({
        success: true,
        isLike
      });
    }, 300);
  });
};
const createComment = (commentData) => {
  return new Promise((resolve, reject) => {
    const user = services_login.getCurrentUser();
    if (!user) {
      reject(new Error("用户未登录"));
      return;
    }
    const { postId, content, replyTo } = commentData;
    if (!content || content.trim() === "") {
      reject(new Error("评论内容不能为空"));
      return;
    }
    if (!postId) {
      reject(new Error("缺少帖子ID"));
      return;
    }
    common_vendor.index.showLoading({ title: "提交中..." });
    setTimeout(() => {
      common_vendor.index.hideLoading();
      const timestamp = Date.now();
      const newComment = {
        _id: "comment_" + timestamp,
        postId,
        userId: user.id,
        userInfo: {
          nickname: user.nickname || "绿色先锋",
          avatar: user.avatar || "/static/images/avatars/avatar-user2.jpg"
        },
        content,
        createdAt: "刚刚",
        timestamp,
        likes: 0,
        isLiked: false
      };
      if (replyTo) {
        newComment.replyTo = {
          commentId: replyTo.commentId,
          userId: replyTo.userId,
          nickname: replyTo.nickname
        };
      }
      try {
        let localPosts = [];
        const cachedPosts = common_vendor.index.getStorageSync("local_posts");
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          const postIndex = localPosts.findIndex((post) => post._id === postId);
          if (postIndex !== -1) {
            if (!localPosts[postIndex].commentList) {
              localPosts[postIndex].commentList = [];
            }
            localPosts[postIndex].commentList.push(newComment);
            localPosts[postIndex].comments += 1;
            common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
            savePostInteraction(localPosts[postIndex]);
            resolve(newComment);
            return;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at services/community.js:748", "保存评论失败", e);
      }
      resolve(newComment);
    }, 500);
  });
};
const deletePost = (postId) => {
  return new Promise((resolve, reject) => {
    const user = services_login.getCurrentUser();
    if (!user) {
      reject(new Error("用户未登录"));
      return;
    }
    common_vendor.index.showLoading({ title: "删除中..." });
    setTimeout(() => {
      try {
        let localPosts = [];
        const cachedPosts = common_vendor.index.getStorageSync("local_posts");
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          const postIndex = localPosts.findIndex((post2) => post2._id === postId);
          if (postIndex === -1) {
            common_vendor.index.hideLoading();
            reject(new Error("帖子不存在"));
            return;
          }
          const post = localPosts[postIndex];
          if (post.userId !== user.id && !post.isCurrentUser) {
            common_vendor.index.hideLoading();
            reject(new Error("无权限删除此帖子"));
            return;
          }
          localPosts.splice(postIndex, 1);
          common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
          try {
            const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
            if (cachedInteractions) {
              const postInteractions = JSON.parse(cachedInteractions);
              if (postInteractions[postId]) {
                delete postInteractions[postId];
                common_vendor.index.setStorageSync("post_interactions", JSON.stringify(postInteractions));
              }
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at services/community.js:819", "删除交互数据失败", e);
          }
          common_vendor.index.hideLoading();
          resolve({ success: true, message: "帖子删除成功" });
        } else {
          common_vendor.index.hideLoading();
          reject(new Error("没有找到帖子数据"));
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at services/community.js:830", "删除帖子失败", e);
        reject(new Error("删除帖子失败"));
      }
    }, 800);
  });
};
const searchPosts = (query, options = {}) => {
  return new Promise((resolve) => {
    const { page = 1, pageSize = 10 } = options;
    if (!query || query.trim() === "") {
      resolve({
        posts: [],
        total: 0,
        page,
        pageSize
      });
      return;
    }
    const currentUser = services_login.getCurrentUser();
    let allPosts = [];
    try {
      const cachedPosts = common_vendor.index.getStorageSync("local_posts");
      if (cachedPosts) {
        allPosts = JSON.parse(cachedPosts);
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:873", "获取本地帖子失败", e);
    }
    const mockPosts = [{
      _id: "post1",
      userId: "user1",
      userInfo: {
        nickname: "绿色生活家",
        avatar: "/static/images/avatars/avatar-user1.jpg",
        location: "北京市"
      },
      content: "分享一个超实用的废旧纸盒改造方法，做成收纳盒不仅美观还环保！#创意改造 #废物利用",
      images: [
        "/static/images/userspost/recycle-before.jpeg",
        "/static/images/userspost/recycle-after.jpeg"
      ],
      label: "创意改造,废物利用",
      eyes: 356,
      likes: 42,
      comments: 18,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "2小时前",
      timestamp: Date.now() - 2 * 60 * 60 * 1e3
    }, {
      _id: "post2",
      userId: "user2",
      userInfo: {
        nickname: "环保达人",
        avatar: "/static/images/avatars/avatar-user2.jpg",
        location: "上海市"
      },
      content: "今天参加了河道清洁活动，大家的环保意识越来越强了！三小时清理出这么多垃圾，希望下次不再有！#志愿活动 #环保行动",
      images: [
        "/static/images/userspost/river-cleanup.jpeg"
      ],
      label: "志愿活动,环保行动",
      eyes: 209,
      likes: 67,
      comments: 24,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "昨天",
      timestamp: Date.now() - 24 * 60 * 60 * 1e3
    }, {
      _id: "post3",
      userId: "user3",
      userInfo: {
        nickname: "低碳生活馆",
        avatar: "/static/images/avatars/avatar-user3.jpg",
        location: "广州市"
      },
      content: "【省水小窍门】洗菜水可以用来浇花，洗衣服最后一遍的清水可以用来拖地，这些循环用水的方法每月能省下不少水费！#节约用水 #生活技巧",
      images: [
        "/static/images/userspost/water-saving.jpeg"
      ],
      label: "节约用水,生活技巧",
      eyes: 489,
      likes: 93,
      comments: 36,
      isFollowed: false,
      isLiked: false,
      isCollected: false,
      createdAt: "3天前",
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1e3
    }];
    allPosts = [...allPosts, ...mockPosts];
    let postInteractions = {};
    try {
      const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
      if (cachedInteractions) {
        postInteractions = JSON.parse(cachedInteractions);
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at services/community.js:954", "获取交互状态失败", e);
    }
    const searchQuery = query.toLowerCase().trim();
    const matchedPosts = allPosts.filter((post) => {
      const contentMatch = post.content && post.content.toLowerCase().includes(searchQuery);
      const labelMatch = post.label && post.label.toLowerCase().includes(searchQuery);
      return contentMatch || labelMatch;
    });
    const resultPosts = matchedPosts.map((post) => {
      var _a;
      if (post.userId === currentUser.id || post.isCurrentUser) {
        post.userInfo = {
          nickname: currentUser.nickname || "绿色先锋",
          avatar: currentUser.avatar || "/static/images/avatars/avatar-user2.jpg",
          location: ((_a = post.userInfo) == null ? void 0 : _a.location) || "当前位置"
        };
        post.isCurrentUser = true;
      }
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
    resultPosts.sort((a, b) => {
      const aContentMatch = a.content && a.content.toLowerCase().includes(searchQuery);
      const bContentMatch = b.content && b.content.toLowerCase().includes(searchQuery);
      if (aContentMatch && !bContentMatch)
        return -1;
      if (!aContentMatch && bContentMatch)
        return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedPosts = resultPosts.slice(start, end);
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
exports.createComment = createComment;
exports.createPost = createPost;
exports.deletePost = deletePost;
exports.getPostDetail = getPostDetail;
exports.getPosts = getPosts;
exports.likePost = likePost;
exports.searchPosts = searchPosts;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/community.js.map
