"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_community = require("../../services/community.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "post-detail",
  setup(__props) {
    const postId = common_vendor.ref("");
    const post = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const commentList = common_vendor.ref([]);
    const commentContent = common_vendor.ref("");
    const replyToComment = common_vendor.ref(null);
    const getParams = () => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.options) {
        postId.value = currentPage.options.id;
        if (postId.value) {
          loadPostDetail();
        }
      }
    };
    const loadPostDetail = async () => {
      try {
        loading.value = true;
        const postDetail = await services_community.getPostDetail(postId.value);
        if (postDetail) {
          post.value = postDetail;
          commentList.value = postDetail.commentList || [];
        } else {
          common_vendor.index.showToast({
            title: "帖子不存在或已删除",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/post-detail.vue:227", "加载帖子详情失败", error);
        common_vendor.index.showToast({
          title: error.message || "加载失败，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleLike = async () => {
      if (!post.value)
        return;
      post.value.isLiked = !post.value.isLiked;
      post.value.likes += post.value.isLiked ? 1 : -1;
      try {
        await likePost(post.value._id, post.value.isLiked);
      } catch (apiError) {
        common_vendor.index.__f__("error", "at pages/community/post-detail.vue:253", "API调用失败，但继续使用本地状态", apiError);
      }
      savePostInteraction(post.value);
    };
    const handleCollect = () => {
      if (!post.value)
        return;
      post.value.isCollected = !post.value.isCollected;
      savePostInteraction(post.value);
    };
    const handleFollow = () => {
      if (!post.value)
        return;
      post.value.isFollowed = !post.value.isFollowed;
      savePostInteraction(post.value);
    };
    const savePostInteraction = (post2) => {
      if (!post2 || !post2._id)
        return;
      try {
        let postInteractions = {};
        const cachedInteractions = common_vendor.index.getStorageSync("post_interactions");
        if (cachedInteractions) {
          postInteractions = JSON.parse(cachedInteractions);
        }
        postInteractions[post2._id] = {
          eyes: post2.eyes,
          likes: post2.likes,
          comments: post2.comments,
          isLiked: post2.isLiked,
          isCollected: post2.isCollected,
          isFollowed: post2.isFollowed
        };
        common_vendor.index.setStorageSync("post_interactions", JSON.stringify(postInteractions));
        let localPosts = [];
        const cachedPosts = common_vendor.index.getStorageSync("local_posts");
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          const postIndex = localPosts.findIndex((p) => p._id === post2._id);
          if (postIndex !== -1) {
            localPosts[postIndex].likes = post2.likes;
            localPosts[postIndex].isLiked = post2.isLiked;
            localPosts[postIndex].isCollected = post2.isCollected;
            localPosts[postIndex].isFollowed = post2.isFollowed;
            common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/post-detail.vue:318", "保存交互状态失败", e);
      }
    };
    const previewImage = (current, urls = []) => {
      if (!current)
        return;
      if (!urls.length) {
        urls = [current];
      }
      common_vendor.index.previewImage({
        current,
        urls
      });
    };
    const replyComment = (comment) => {
      replyToComment.value = comment;
      commentContent.value = `@${comment.userInfo.nickname} `;
      common_vendor.index.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      });
    };
    const likeComment = (comment) => {
      comment.isLiked = !comment.isLiked;
      if (comment.isLiked) {
        comment.likes++;
      } else {
        comment.likes--;
      }
    };
    const submitComment = async () => {
      if (!commentContent.value.trim()) {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      if (!post.value || !post.value._id) {
        common_vendor.index.showToast({
          title: "帖子加载失败，请返回重试",
          icon: "none"
        });
        return;
      }
      try {
        const commentData = {
          postId: post.value._id,
          content: commentContent.value,
          parentId: replyToComment.value ? replyToComment.value._id : null
        };
        const result = await services_community.createComment(commentData);
        commentList.value.unshift(result);
        post.value.comments += 1;
        commentContent.value = "";
        replyToComment.value = null;
        common_vendor.index.showToast({
          title: "评论成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/post-detail.vue:401", "提交评论失败", error);
        common_vendor.index.showToast({
          title: error.message || "评论失败，请重试",
          icon: "none"
        });
      }
    };
    const formatTags = (labelStr) => {
      if (!labelStr)
        return [];
      return labelStr.split(",").map((item) => item.trim()).filter(Boolean);
    };
    const showDeleteOption = () => {
      common_vendor.index.showActionSheet({
        itemList: ["删除"],
        itemColor: "#ff0000",
        success: (res) => {
          if (res.tapIndex === 0) {
            confirmDeletePost();
          }
        }
      });
    };
    const confirmDeletePost = () => {
      if (!post.value)
        return;
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条帖子吗？删除后无法恢复。",
        confirmColor: "#ff0000",
        success: (res) => {
          if (res.confirm) {
            handleDeletePost();
          }
        }
      });
    };
    const handleDeletePost = async () => {
      if (!post.value || !post.value._id)
        return;
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        await services_community.deletePost(post.value._id);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1e3);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "删除失败",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      getParams();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: post.value && post.value.isCurrentUser
      }, post.value && post.value.isCurrentUser ? {
        d: common_vendor.p({
          name: "more",
          size: 16
        }),
        e: common_vendor.o(showDeleteOption)
      } : {}, {
        f: loading.value
      }, loading.value ? {
        g: common_assets._imports_0
      } : post.value ? common_vendor.e({
        i: post.value.userInfo && post.value.userInfo.avatar ? post.value.userInfo.avatar : "/static/images/user-avatar.jpg",
        j: common_vendor.t(post.value.userInfo && post.value.userInfo.nickname ? post.value.userInfo.nickname : "未知用户"),
        k: post.value.userInfo && post.value.userInfo.location
      }, post.value.userInfo && post.value.userInfo.location ? {
        l: common_vendor.t(post.value.userInfo.location)
      } : {}, {
        m: common_vendor.t(post.value.createdAt || "未知时间"),
        n: !post.value.isCurrentUser
      }, !post.value.isCurrentUser ? {
        o: common_vendor.t(post.value.isFollowed ? "已关注" : "+ 关注"),
        p: common_vendor.n(post.value.isFollowed ? "text-gray-400 border-gray-300" : "text-green-500 border-green-500"),
        q: common_vendor.o(handleFollow)
      } : {}, {
        r: common_vendor.t(post.value.content || ""),
        s: post.value.images && post.value.images.length > 0
      }, post.value.images && post.value.images.length > 0 ? common_vendor.e({
        t: post.value.images.length === 1
      }, post.value.images.length === 1 ? {
        v: post.value.images[0],
        w: common_vendor.o(($event) => previewImage(post.value.images[0]))
      } : {
        x: common_vendor.f(post.value.images, (img, index, i0) => {
          return {
            a: img,
            b: index,
            c: common_vendor.o(($event) => previewImage(img, post.value.images), index)
          };
        }),
        y: common_vendor.n("grid-" + Math.min(post.value.images.length, 3))
      }) : {}, {
        z: post.value.label
      }, post.value.label ? {
        A: common_vendor.f(formatTags(post.value.label), (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index,
            c: index > 0 ? 1 : ""
          };
        })
      } : {}, {
        B: common_assets._imports_1$5,
        C: common_vendor.t(post.value.eyes),
        D: post.value.isLiked ? "/static/images/icons/icon-heart-active.svg" : "/static/images/icons/icon-heart.svg",
        E: common_vendor.t(post.value.likes),
        F: post.value.isLiked ? 1 : "",
        G: common_vendor.o(handleLike),
        H: common_assets._imports_2$1,
        I: common_vendor.t(post.value.comments),
        J: common_assets._imports_3$1,
        K: common_vendor.t(post.value.isCollected ? "已收藏" : "收藏"),
        L: post.value.isCollected ? 1 : "",
        M: common_vendor.o(handleCollect),
        N: common_assets._imports_4$1,
        O: common_vendor.t(post.value.comments || 0),
        P: commentList.value.length > 0
      }, commentList.value.length > 0 ? {
        Q: common_vendor.f(commentList.value, (comment, index, i0) => {
          return {
            a: comment.userInfo.avatar,
            b: common_vendor.t(comment.userInfo.nickname),
            c: comment.isLiked ? "/static/images/icons/icon-heart-active.svg" : "/static/images/icons/icon-heart.svg",
            d: common_vendor.o(($event) => likeComment(comment), comment._id),
            e: common_vendor.t(comment.likes || 0),
            f: common_vendor.t(comment.content),
            g: common_vendor.t(comment.createdAt),
            h: common_vendor.o(($event) => replyComment(comment), comment._id),
            i: comment._id
          };
        })
      } : {}) : {}, {
        h: post.value,
        R: common_vendor.o(submitComment),
        S: commentContent.value,
        T: common_vendor.o(($event) => commentContent.value = $event.detail.value),
        U: common_vendor.o(submitComment)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/post-detail.js.map
