"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_knowledge = require("../../services/knowledge.js");
const _sfc_main = {
  __name: "knowledge-detail",
  setup(__props) {
    const knowledgeId = common_vendor.ref("");
    const knowledge = common_vendor.ref({});
    const loading = common_vendor.ref(true);
    const hasError = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const isLiked = common_vendor.ref(false);
    const getKnowledgeDetail = async () => {
      if (!knowledgeId.value)
        return;
      loading.value = true;
      hasError.value = false;
      try {
        common_vendor.index.__f__("log", "at pages/home/knowledge-detail.vue:112", "正在获取知识详情，ID:", knowledgeId.value);
        const result = await services_knowledge.getKnowledgeDetail(knowledgeId.value);
        common_vendor.index.__f__("log", "at pages/home/knowledge-detail.vue:114", "获取知识详情结果:", result);
        knowledge.value = result;
        const userLikedIds = common_vendor.index.getStorageSync("userLikedKnowledge") || [];
        isLiked.value = userLikedIds.includes(knowledgeId.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/knowledge-detail.vue:122", "加载环保知识详情失败:", error);
        hasError.value = true;
        errorMessage.value = error.message || "加载环保知识详情失败";
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
    const toggleLike = async () => {
      try {
        const currentLiked = isLiked.value;
        isLiked.value = !currentLiked;
        knowledge.value.likes = (knowledge.value.likes || 0) + (currentLiked ? -1 : 1);
        const userLikedIds = common_vendor.index.getStorageSync("userLikedKnowledge") || [];
        let newLikedIds = [...userLikedIds];
        if (currentLiked) {
          newLikedIds = newLikedIds.filter((id) => id !== knowledgeId.value);
        } else {
          newLikedIds.push(knowledgeId.value);
        }
        common_vendor.index.setStorageSync("userLikedKnowledge", newLikedIds);
        await services_knowledge.toggleLikeKnowledge(knowledgeId.value, !currentLiked);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/knowledge-detail.vue:162", "更新点赞状态失败:", error);
        isLiked.value = !isLiked.value;
        knowledge.value.likes = (knowledge.value.likes || 0) + (isLiked.value ? 1 : -1);
        common_vendor.index.showToast({
          title: "点赞失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1,
        fail: function() {
          common_vendor.index.navigateTo({
            url: "/pages/home/knowledge-list"
          });
        }
      });
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/home/knowledge-detail.vue:190", "知识详情页面参数:", options);
      if (options.id) {
        knowledgeId.value = options.id;
        getKnowledgeDetail();
      } else {
        hasError.value = true;
        errorMessage.value = "缺少知识ID参数";
        loading.value = false;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_assets._imports_1$1,
        d: loading.value
      }, loading.value ? {} : hasError.value ? {
        f: common_vendor.t(errorMessage.value),
        g: common_vendor.o(getKnowledgeDetail)
      } : common_vendor.e({
        h: common_vendor.t(knowledge.value.title),
        i: knowledge.value.content,
        j: knowledge.value.image
      }, knowledge.value.image ? {
        k: knowledge.value.image
      } : {}, {
        l: knowledge.value.tags && knowledge.value.tags.length > 0
      }, knowledge.value.tags && knowledge.value.tags.length > 0 ? {
        m: common_vendor.f(knowledge.value.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        n: common_vendor.t(formatDate(knowledge.value.created_at)),
        o: common_vendor.t(knowledge.value.views || 0),
        p: common_vendor.n(isLiked.value ? "icon-like-fill" : "icon-like"),
        q: common_vendor.t(knowledge.value.likes || 0),
        r: isLiked.value ? 1 : "",
        s: common_vendor.o(toggleLike)
      }), {
        e: hasError.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/knowledge-detail.js.map
