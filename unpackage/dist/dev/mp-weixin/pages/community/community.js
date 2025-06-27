"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_community = require("../../services/community.js");
if (!Math) {
  (IconImage + IconImage)();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "community",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const isSearchMode = common_vendor.ref(false);
    const posts = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    const activeTab = common_vendor.ref("recommend");
    const switchTab = (tab) => {
      if (activeTab.value === tab)
        return;
      activeTab.value = tab;
      currentPage.value = 1;
      posts.value = [];
      if (isSearchMode.value) {
        isSearchMode.value = false;
        searchKeyword.value = "";
      }
      loadPosts();
    };
    const loadPosts = async (isRefresh = false) => {
      if (isRefresh) {
        currentPage.value = 1;
        hasMore.value = true;
      }
      if (!hasMore.value && !isRefresh) {
        common_vendor.index.showToast({
          title: "没有更多内容了",
          icon: "none"
        });
        return;
      }
      try {
        loading.value = true;
        let result;
        if (isSearchMode.value && searchKeyword.value.trim()) {
          result = await services_community.searchPosts(searchKeyword.value, {
            page: currentPage.value,
            pageSize: pageSize.value
          });
        } else {
          const options = {
            filter: activeTab.value,
            page: currentPage.value,
            pageSize: pageSize.value
          };
          result = await services_community.getPosts(options);
        }
        if (result && result.posts) {
          if (isRefresh) {
            posts.value = result.posts;
          } else {
            posts.value = [...posts.value, ...result.posts];
          }
          total.value = result.total || 0;
          hasMore.value = posts.value.length < total.value;
          if (hasMore.value) {
            currentPage.value++;
          }
        } else {
          if (isRefresh) {
            posts.value = [];
          }
          hasMore.value = false;
          common_vendor.index.__f__("error", "at pages/community/community.vue:318", "返回数据格式不正确:", result);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:321", "加载帖子失败", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
        if (isRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
      }
    };
    const loadMore = () => {
      if (!hasMore.value || loading.value)
        return;
      currentPage.value++;
      loadPosts();
    };
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        if (isSearchMode.value) {
          isSearchMode.value = false;
          currentPage.value = 1;
          loadPosts();
        }
        return;
      }
      isSearchMode.value = true;
      currentPage.value = 1;
      posts.value = [];
      loadPosts();
    };
    const handleTagClick = (tag) => {
      searchKeyword.value = tag;
      handleSearch();
    };
    const formatTags = (labelStr) => {
      if (!labelStr)
        return [];
      return labelStr.split(",").map((item) => item.trim()).filter(Boolean);
    };
    const handleLike = async (post) => {
      try {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        try {
          await services_community.likePost(post._id, post.isLiked);
        } catch (apiError) {
          common_vendor.index.__f__("error", "at pages/community/community.vue:383", "API调用失败，但继续使用本地状态", apiError);
        }
        savePostInteraction(post);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:389", "点赞操作失败", error);
        common_vendor.index.showToast({
          title: error.message || "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const handleCollect = async (post) => {
      try {
        post.isCollected = !post.isCollected;
        savePostInteraction(post);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:406", "收藏操作失败", error);
        common_vendor.index.showToast({
          title: error.message || "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const handleFollow = async (post) => {
      try {
        post.isFollowed = !post.isFollowed;
        savePostInteraction(post);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:423", "关注操作失败", error);
        common_vendor.index.showToast({
          title: error.message || "操作失败，请重试",
          icon: "none"
        });
      }
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
        let localPosts = [];
        const cachedPosts = common_vendor.index.getStorageSync("local_posts");
        if (cachedPosts) {
          localPosts = JSON.parse(cachedPosts);
          const postIndex = localPosts.findIndex((p) => p._id === post._id);
          if (postIndex !== -1) {
            localPosts[postIndex].likes = post.likes;
            localPosts[postIndex].isLiked = post.isLiked;
            localPosts[postIndex].isCollected = post.isCollected;
            localPosts[postIndex].isFollowed = post.isFollowed;
            common_vendor.index.setStorageSync("local_posts", JSON.stringify(localPosts));
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:468", "保存交互状态失败", e);
      }
    };
    const navigateToDetail = (postId) => {
      common_vendor.index.navigateTo({
        url: `/pages/community/post-detail?id=${postId}`
      });
    };
    const navigateToPublish = () => {
      common_vendor.index.navigateTo({
        url: "/pages/community/post-publish",
        events: {
          publishSuccess: () => {
            if (activeTab.value === "recommend") {
              loadPosts();
            } else if (activeTab.value === "latest") {
              loadPosts();
            } else if (activeTab.value === "hot") {
              loadPosts();
            } else if (activeTab.value === "follow") {
              loadPosts();
            }
          }
        }
      });
    };
    const showDeleteOption = (post) => {
      common_vendor.index.showActionSheet({
        itemList: ["删除"],
        itemColor: "#ff0000",
        success: (res) => {
          if (res.tapIndex === 0) {
            confirmDeletePost(post);
          }
        }
      });
    };
    const confirmDeletePost = (post) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条帖子吗？删除后无法恢复。",
        confirmColor: "#ff0000",
        success: (res) => {
          if (res.confirm) {
            handleDeletePost(post._id);
          }
        }
      });
    };
    const handleDeletePost = async (postId) => {
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        await services_community.deletePost(postId);
        posts.value = posts.value.filter((post) => post._id !== postId);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "删除失败",
          icon: "none"
        });
      }
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      if (isSearchMode.value) {
        exitSearch();
      }
    };
    const exitSearch = () => {
      searchKeyword.value = "";
      isSearchMode.value = false;
      currentPage.value = 1;
      posts.value = [];
      loadPosts();
    };
    common_vendor.onMounted(() => {
      loadPosts();
    });
    common_vendor.onShow(() => {
      loadPosts();
    });
    common_vendor.onPullDownRefresh(() => {
      loadPosts(true);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "more",
          size: 16
        }),
        b: common_vendor.o(handleSearch),
        c: common_vendor.p({
          name: "search",
          size: 16
        }),
        d: common_vendor.o(handleSearch),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: searchKeyword.value
      }, searchKeyword.value ? {
        h: common_vendor.p({
          name: "close-circle",
          size: 16
        }),
        i: common_vendor.o(clearSearch)
      } : {}, {
        j: isSearchMode.value
      }, isSearchMode.value ? {
        k: common_vendor.t(searchKeyword.value),
        l: common_vendor.t(total.value),
        m: common_vendor.o(exitSearch)
      } : {}, {
        n: activeTab.value === "recommend"
      }, activeTab.value === "recommend" ? {} : {}, {
        o: activeTab.value === "recommend" ? 1 : "",
        p: activeTab.value !== "recommend" ? 1 : "",
        q: common_vendor.o(($event) => switchTab("recommend")),
        r: activeTab.value === "latest"
      }, activeTab.value === "latest" ? {} : {}, {
        s: activeTab.value === "latest" ? 1 : "",
        t: activeTab.value !== "latest" ? 1 : "",
        v: common_vendor.o(($event) => switchTab("latest")),
        w: activeTab.value === "hot"
      }, activeTab.value === "hot" ? {} : {}, {
        x: activeTab.value === "hot" ? 1 : "",
        y: activeTab.value !== "hot" ? 1 : "",
        z: common_vendor.o(($event) => switchTab("hot")),
        A: activeTab.value === "follow"
      }, activeTab.value === "follow" ? {} : {}, {
        B: activeTab.value === "follow" ? 1 : "",
        C: activeTab.value !== "follow" ? 1 : "",
        D: common_vendor.o(($event) => switchTab("follow")),
        E: loading.value
      }, loading.value ? {
        F: common_assets._imports_0
      } : posts.value.length === 0 ? {
        H: common_assets._imports_1$4
      } : {
        I: common_vendor.f(posts.value, (post, index, i0) => {
          return common_vendor.e({
            a: post.userInfo && post.userInfo.avatar ? post.userInfo.avatar : "/static/images/user-avatar.jpg",
            b: common_vendor.t(post.userInfo && post.userInfo.nickname ? post.userInfo.nickname : "未知用户"),
            c: common_vendor.t(post.createdAt || "未知时间"),
            d: !post.isCurrentUser
          }, !post.isCurrentUser ? {
            e: common_vendor.t(post.isFollowed ? "已关注" : "+ 关注"),
            f: common_vendor.n(post.isFollowed ? "text-gray-400 border-gray-300" : "text-green-500 border-green-500"),
            g: common_vendor.o(($event) => handleFollow(post), post._id)
          } : {
            h: "113b39ea-3-" + i0,
            i: common_vendor.p({
              name: "more",
              size: "16"
            }),
            j: common_vendor.o(($event) => showDeleteOption(post), post._id)
          }, {
            k: common_vendor.t(post.content || ""),
            l: common_vendor.o(($event) => navigateToDetail(post._id), post._id),
            m: post.images && post.images.length > 0
          }, post.images && post.images.length > 0 ? common_vendor.e({
            n: post.images.length === 1
          }, post.images.length === 1 ? {
            o: post.images[0]
          } : post.images.length === 2 ? {
            q: common_vendor.f(post.images, (img, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: img
              };
            })
          } : common_vendor.e({
            r: common_vendor.f(post.images.slice(0, 3), (img, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: img
              };
            }),
            s: post.images.length > 3
          }, post.images.length > 3 ? {
            t: common_vendor.t(post.images.length - 3)
          } : {}), {
            p: post.images.length === 2,
            v: common_vendor.o(($event) => navigateToDetail(post._id), post._id)
          }) : {}, {
            w: common_vendor.f(formatTags(post.label || ""), (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex,
                c: tagIndex > 0 ? 1 : "",
                d: common_vendor.o(($event) => handleTagClick(tag), tagIndex)
              };
            }),
            x: common_vendor.t(post.eyes || 0),
            y: post.isLiked ? "/static/images/icons/icon-heart-active.svg" : "/static/images/icons/icon-heart.svg",
            z: common_vendor.t(post.likes || 0),
            A: post.isLiked ? 1 : "",
            B: common_vendor.o(($event) => handleLike(post), post._id),
            C: common_vendor.t(post.comments || 0),
            D: common_vendor.o(($event) => navigateToDetail(post._id), post._id),
            E: common_vendor.t(post.isCollected ? "已收藏" : "收藏"),
            F: post.isCollected ? 1 : "",
            G: common_vendor.o(($event) => handleCollect(post), post._id),
            H: post._id
          });
        }),
        J: common_assets._imports_1$5,
        K: common_assets._imports_2$1,
        L: common_assets._imports_3$1
      }, {
        G: posts.value.length === 0,
        M: hasMore.value && posts.value.length > 0
      }, hasMore.value && posts.value.length > 0 ? {
        N: common_vendor.o(loadMore)
      } : {}, {
        O: common_vendor.o(navigateToPublish)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
