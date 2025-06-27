"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      knowledgeList: []
    };
  },
  onShow() {
    this.getKnowledgeList();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    async getKnowledgeList() {
      try {
        const res = await common_vendor.nr.callFunction({
          name: "getKnowledge"
        });
        if (res.result.code === 0) {
          this.knowledgeList = res.result.data;
        } else {
          common_vendor.index.showToast({
            title: "获取知识列表失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/admin/knowledge-list.vue:78", e);
        common_vendor.index.showToast({
          title: "获取知识列表失败",
          icon: "none"
        });
      }
    },
    formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    goToAdd() {
      common_vendor.index.navigateTo({
        url: "/pages/admin/knowledge-add"
      });
    },
    goToEdit(item) {
      common_vendor.index.navigateTo({
        url: `/pages/admin/knowledge-edit?id=${item._id}`
      });
    },
    showActionSheet(item) {
      common_vendor.index.showActionSheet({
        itemList: ["删除"],
        itemColor: "#FF0000",
        success: (res) => {
          if (res.tapIndex === 0) {
            this.deleteKnowledge(item._id);
          }
        }
      });
    },
    async deleteKnowledge(id) {
      try {
        const res = await common_vendor.nr.callFunction({
          name: "deleteKnowledge",
          data: {
            _id: id
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          this.getKnowledgeList();
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "删除失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/admin/knowledge-list.vue:133", e);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.knowledgeList.length === 0
  }, $data.knowledgeList.length === 0 ? {} : {}, {
    d: common_vendor.f($data.knowledgeList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: item.image
      }, item.image ? {
        c: item.image
      } : {}, {
        d: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        e: common_vendor.t($options.formatDate(item.created_at)),
        f: common_vendor.o(($event) => $options.goToEdit(item), item._id),
        g: common_vendor.o(($event) => $options.showActionSheet(item), item._id),
        h: item._id
      });
    }),
    e: common_assets._imports_1$1,
    f: common_vendor.o((...args) => $options.goToAdd && $options.goToAdd(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/knowledge-list.js.map
