"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      title: "",
      content: "",
      image: "",
      customTag: "",
      selectedTags: [],
      popularTags: [
        "垃圾分类",
        "环保行动",
        "节约用水",
        "低碳生活",
        "废物利用",
        "创意改造",
        "环保科普",
        "绿色出行",
        "减塑行动",
        "二手交易",
        "能源节约",
        "植树造林"
      ]
    };
  },
  computed: {
    canPublish() {
      return this.title.trim().length > 0 && this.content.trim().length > 0;
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否放弃发布？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    },
    // 选择图片
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.image = res.tempFilePaths[0];
        }
      });
    },
    // 移除图片
    removeImage() {
      this.image = "";
    },
    // 检查标签是否已选中
    isTagSelected(tag) {
      return this.selectedTags.includes(tag);
    },
    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        if (this.selectedTags.length >= 5) {
          common_vendor.index.showToast({
            title: "最多可选5个标签",
            icon: "none"
          });
          return;
        }
        this.selectedTags.push(tag);
      }
    },
    // 移除已选标签
    removeTag(index) {
      this.selectedTags.splice(index, 1);
    },
    // 添加自定义标签
    addCustomTag() {
      const tag = this.customTag.trim();
      if (!tag) {
        common_vendor.index.showToast({
          title: "标签不能为空",
          icon: "none"
        });
        return;
      }
      if (this.selectedTags.length >= 5) {
        common_vendor.index.showToast({
          title: "最多可选5个标签",
          icon: "none"
        });
        return;
      }
      if (this.isTagSelected(tag)) {
        common_vendor.index.showToast({
          title: "该标签已添加",
          icon: "none"
        });
        return;
      }
      this.selectedTags.push(tag);
      this.customTag = "";
    },
    // 发布知识
    async publishKnowledge() {
      if (!this.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入标题",
          icon: "none"
        });
        return;
      }
      if (!this.content.trim()) {
        common_vendor.index.showToast({
          title: "请输入内容",
          icon: "none"
        });
        return;
      }
      try {
        const knowledgeData = {
          title: this.title,
          content: this.content,
          image: this.image,
          tags: this.selectedTags
        };
        const result = await common_vendor.nr.callFunction({
          name: "addKnowledge",
          data: knowledgeData
        });
        if (result.result.code === 0) {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "发布失败",
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
    c: !$options.canPublish,
    d: !$options.canPublish ? 1 : "",
    e: common_vendor.o((...args) => $options.publishKnowledge && $options.publishKnowledge(...args)),
    f: $data.title,
    g: common_vendor.o(($event) => $data.title = $event.detail.value),
    h: $data.content,
    i: common_vendor.o(($event) => $data.content = $event.detail.value),
    j: $data.image
  }, $data.image ? {
    k: $data.image,
    l: common_vendor.o((...args) => $options.removeImage && $options.removeImage(...args))
  } : {}, {
    m: !$data.image
  }, !$data.image ? {
    n: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    o: $data.selectedTags.length > 0
  }, $data.selectedTags.length > 0 ? {
    p: common_vendor.f($data.selectedTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: common_vendor.o(($event) => $options.removeTag(index), index),
        c: index
      };
    }),
    q: common_assets._imports_1$2
  } : {}, {
    r: common_vendor.o((...args) => $options.addCustomTag && $options.addCustomTag(...args)),
    s: $data.customTag,
    t: common_vendor.o(($event) => $data.customTag = $event.detail.value),
    v: common_vendor.o((...args) => $options.addCustomTag && $options.addCustomTag(...args)),
    w: common_vendor.f($data.popularTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: $options.isTagSelected(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/knowledge-add.js.map
