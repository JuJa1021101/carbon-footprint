"use strict";
const common_vendor = require("../../common/vendor.js");
const services_community = require("../../services/community.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "post-publish",
  setup(__props) {
    const content = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const customTag = common_vendor.ref("");
    const selectedTags = common_vendor.ref([]);
    const popularTags = common_vendor.ref([
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
    ]);
    const canPublish = common_vendor.computed(() => {
      return content.value.trim().length > 0;
    });
    const isTagSelected = (tag) => {
      return selectedTags.value.includes(tag);
    };
    const toggleTag = (tag) => {
      const index = selectedTags.value.indexOf(tag);
      if (index > -1) {
        selectedTags.value.splice(index, 1);
      } else {
        if (selectedTags.value.length >= 5) {
          common_vendor.index.showToast({
            title: "最多可选5个标签",
            icon: "none"
          });
          return;
        }
        selectedTags.value.push(tag);
      }
    };
    const removeTag = (index) => {
      selectedTags.value.splice(index, 1);
    };
    const addCustomTag = () => {
      const tag = customTag.value.trim();
      if (!tag) {
        common_vendor.index.showToast({
          title: "标签不能为空",
          icon: "none"
        });
        return;
      }
      if (selectedTags.value.length >= 5) {
        common_vendor.index.showToast({
          title: "最多可选5个标签",
          icon: "none"
        });
        return;
      }
      if (isTagSelected(tag)) {
        common_vendor.index.showToast({
          title: "该标签已添加",
          icon: "none"
        });
        return;
      }
      selectedTags.value.push(tag);
      customTag.value = "";
    };
    const chooseImage = () => {
      if (images.value.length >= 9) {
        common_vendor.index.showToast({
          title: "最多上传9张图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 9 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          images.value = [...images.value, ...res.tempFilePaths];
        }
      });
    };
    const removeImage = (index) => {
      images.value.splice(index, 1);
    };
    const goBack = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否放弃发布？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    };
    const publishPost = async () => {
      if (!content.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入内容",
          icon: "none"
        });
        return;
      }
      try {
        const postData = {
          content: content.value,
          images: images.value,
          label: selectedTags.value.join(",")
        };
        const result = await services_community.createPost(postData);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success"
        });
        try {
          const pages = getCurrentPages();
          const prePage = pages[pages.length - 2];
          if (prePage && prePage.$vm && typeof prePage.$vm.loadPosts === "function") {
            prePage.$vm.loadPosts();
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/community/post-publish.vue:281", "通知刷新失败", e);
        }
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "发布失败",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/community/post-publish.vue:298", "发布页面加载");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: !canPublish.value,
        d: !canPublish.value ? 1 : "",
        e: common_vendor.o(publishPost),
        f: content.value,
        g: common_vendor.o(($event) => content.value = $event.detail.value),
        h: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: img,
            b: "da888da0-1-" + i0,
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index
          };
        }),
        i: common_vendor.p({
          name: "close-circle",
          size: 12
        }),
        j: images.value.length < 9
      }, images.value.length < 9 ? {
        k: common_vendor.p({
          name: "plus",
          size: 24
        }),
        l: common_vendor.t(images.value.length),
        m: common_vendor.o(chooseImage)
      } : {}, {
        n: selectedTags.value.length > 0
      }, selectedTags.value.length > 0 ? {
        o: common_vendor.f(selectedTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: "da888da0-3-" + i0,
            c: common_vendor.o(($event) => removeTag(index), index),
            d: index
          };
        }),
        p: common_vendor.p({
          name: "close-circle",
          size: 12
        })
      } : {}, {
        q: common_vendor.o(addCustomTag),
        r: customTag.value,
        s: common_vendor.o(($event) => customTag.value = $event.detail.value),
        t: common_vendor.o(addCustomTag),
        v: common_vendor.f(popularTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index,
            c: isTagSelected(tag) ? 1 : "",
            d: common_vendor.o(($event) => toggleTag(tag), index)
          };
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/post-publish.js.map
