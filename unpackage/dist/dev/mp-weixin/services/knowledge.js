"use strict";
const common_vendor = require("../common/vendor.js");
async function getKnowledgeList() {
  try {
    const result = await common_vendor.nr.callFunction({
      name: "getKnowledge"
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || "获取环保知识列表失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/knowledge.js:18", "获取环保知识列表失败:", error);
    throw error;
  }
}
async function getKnowledgeDetail(id) {
  try {
    const result = await common_vendor.nr.callFunction({
      name: "getKnowledgeDetail",
      data: { id }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || "获取环保知识详情失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/knowledge.js:37", "获取环保知识详情失败:", error);
    throw error;
  }
}
async function toggleLikeKnowledge(id, isLike) {
  try {
    const result = await common_vendor.nr.callFunction({
      name: "updateKnowledgeLikes",
      data: {
        id,
        action: isLike ? "like" : "unlike"
      }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || "更新点赞状态失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/knowledge.js:59", "更新点赞状态失败:", error);
    throw error;
  }
}
exports.getKnowledgeDetail = getKnowledgeDetail;
exports.getKnowledgeList = getKnowledgeList;
exports.toggleLikeKnowledge = toggleLikeKnowledge;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/knowledge.js.map
