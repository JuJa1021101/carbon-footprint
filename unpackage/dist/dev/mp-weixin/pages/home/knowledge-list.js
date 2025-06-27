"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_knowledge = require("../../services/knowledge.js");
const _sfc_main = {
  __name: "knowledge-list",
  setup(__props) {
    const knowledgeList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const hasError = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const userLikedIds = common_vendor.ref([]);
    const getKnowledgeList = async () => {
      loading.value = true;
      hasError.value = false;
      try {
        const result = await services_knowledge.getKnowledgeList();
        const userLikedIdsFromStorage = common_vendor.index.getStorageSync("userLikedKnowledge") || [];
        userLikedIds.value = userLikedIdsFromStorage;
        result.forEach((item) => {
          item.isLiked = userLikedIds.value.includes(item._id);
        });
        knowledgeList.value = result;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/knowledge-list.vue:131", "加载环保知识列表失败:", error);
        hasError.value = true;
        errorMessage.value = error.message || "加载环保知识列表失败";
      } finally {
        loading.value = false;
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const toggleLike = async (item) => {
      try {
        const currentLiked = item.isLiked;
        item.isLiked = !currentLiked;
        item.likes = (item.likes || 0) + (currentLiked ? -1 : 1);
        let likedIds = [...userLikedIds.value];
        if (currentLiked) {
          likedIds = likedIds.filter((id) => id !== item._id);
        } else {
          likedIds.push(item._id);
        }
        userLikedIds.value = likedIds;
        common_vendor.index.setStorageSync("userLikedKnowledge", likedIds);
        await services_knowledge.toggleLikeKnowledge(item._id, !currentLiked);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/knowledge-list.vue:169", "更新点赞状态失败:", error);
        item.isLiked = !item.isLiked;
        item.likes = (item.likes || 0) + (item.isLiked ? -1 : 1);
        common_vendor.index.showToast({
          title: "点赞失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const navigateToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/home/knowledge-detail?id=${id}`
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      getKnowledgeList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_assets._imports_1$1,
        d: loading.value
      }, loading.value ? {
        e: common_assets._imports_0
      } : hasError.value ? {
        g: common_vendor.t(errorMessage.value),
        h: common_vendor.o(getKnowledgeList)
      } : common_vendor.e({
        i: knowledgeList.value.length === 0
      }, knowledgeList.value.length === 0 ? {} : {
        j: common_vendor.f(knowledgeList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.image
          }, item.image ? {
            b: item.image
          } : {}, {
            c: common_vendor.t(item.title),
            d: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            e: common_vendor.t(item.views || 0),
            f: common_vendor.n(item.isLiked ? "icon-like-fill text-red-500" : "icon-like text-gray-400"),
            g: common_vendor.t(item.likes || 0),
            h: common_vendor.n(item.isLiked ? "text-red-500" : "text-gray-500"),
            i: common_vendor.o(($event) => toggleLike(item), item._id),
            j: common_vendor.t(formatDate(item.created_at)),
            k: item._id,
            l: common_vendor.o(($event) => navigateToDetail(item._id), item._id)
          });
        })
      }), {
        f: hasError.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/knowledge-list.js.map
