"use strict";
const common_vendor = require("../../common/vendor.js");
const services_mall = require("../../services/mall.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "reward-add",
  setup(__props) {
    const name = common_vendor.ref("");
    const description = common_vendor.ref("");
    const imageUrl = common_vendor.ref("");
    const points = common_vendor.ref("0");
    const stock = common_vendor.ref("0");
    const categoryIndex = common_vendor.ref(0);
    const categoryOptions = ["daily", "plant", "coupon"];
    const hotIndex = common_vendor.ref(0);
    const limitedIndex = common_vendor.ref(0);
    const booleanOptions = ["否", "是"];
    const getCategoryText = (category) => {
      const categories = {
        "daily": "日常用品",
        "plant": "绿植花卉",
        "coupon": "优惠券"
      };
      return categories[category] || category;
    };
    const checkAdminLoginStatus = () => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.showToast({
          title: "请先登录管理员账号",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/login"
          });
        }, 1500);
        return false;
      }
      return true;
    };
    common_vendor.onLoad(() => {
      checkAdminLoginStatus();
    });
    common_vendor.onShow(() => {
      checkAdminLoginStatus();
    });
    common_vendor.ref(false);
    common_vendor.ref(false);
    const canSave = common_vendor.computed(() => {
      const nameValid = name.value && typeof name.value === "string" && name.value.trim().length > 0;
      const imageValid = imageUrl.value && typeof imageUrl.value === "string" && imageUrl.value.trim().length > 0;
      return nameValid && imageValid;
    });
    const onCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
    };
    const onHotChange = (e) => {
      hotIndex.value = e.detail.value;
    };
    const onLimitedChange = (e) => {
      limitedIndex.value = e.detail.value;
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          imageUrl.value = res.tempFilePaths[0];
        }
      });
    };
    const goBack = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否放弃添加？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    };
    const submitReward = async () => {
      if (!canSave.value) {
        common_vendor.index.showToast({
          title: "请完善必填信息",
          icon: "none"
        });
        return;
      }
      if (!checkAdminLoginStatus()) {
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "添加中...",
          mask: true
        });
        const rewardData = {
          name: name.value,
          description: description.value,
          image_url: imageUrl.value,
          // 传递图片临时路径
          points: parseInt(points.value) || 0,
          stock: parseInt(stock.value) || 0,
          category: categoryOptions[categoryIndex.value],
          is_hot: hotIndex.value === 1,
          is_limited: limitedIndex.value === 1
        };
        const result = await services_mall.addReward(rewardData);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "添加成功",
          icon: "success"
        });
        const currentCount = parseInt(common_vendor.index.getStorageSync("reward_count") || "0");
        common_vendor.index.setStorageSync("reward_count", currentCount + 1);
        common_vendor.index.setStorageSync("reward_action_message", `商品"${name.value}"添加成功`);
        setTimeout(() => {
          try {
            common_vendor.index.redirectTo({
              url: "/pages/admin/reward-list",
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/admin/reward-add.vue:322", "跳转失败:", err);
                common_vendor.index.reLaunch({
                  url: "/pages/admin/reward-list"
                });
              }
            });
          } catch (navError) {
            common_vendor.index.__f__("error", "at pages/admin/reward-add.vue:330", "导航错误:", navError);
            common_vendor.index.reLaunch({
              url: "/pages/admin/dashboard"
            });
          }
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "添加失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/reward-add.vue:343", "添加商品失败:", error);
        const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
        if (adminLoginStatus !== "loggedin") {
          common_vendor.index.__f__("warn", "at pages/admin/reward-add.vue:348", "添加商品失败后检测到登录状态丢失，重新设置");
          common_vendor.index.setStorageSync("admin_login_status", "loggedin");
          common_vendor.index.setStorageSync("admin_id", "admin");
        }
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: !canSave.value,
        d: !canSave.value ? 1 : "",
        e: common_vendor.o(submitReward),
        f: name.value,
        g: common_vendor.o(($event) => name.value = $event.detail.value),
        h: description.value,
        i: common_vendor.o(($event) => description.value = $event.detail.value),
        j: imageUrl.value
      }, imageUrl.value ? {
        k: imageUrl.value
      } : {
        l: common_vendor.p({
          name: "plus",
          size: 28
        })
      }, {
        m: common_vendor.o(chooseImage),
        n: common_vendor.p({
          name: "bookmark",
          size: 16
        }),
        o: points.value,
        p: common_vendor.o(($event) => points.value = $event.detail.value),
        q: common_vendor.p({
          name: "bookmark",
          size: 16
        }),
        r: stock.value,
        s: common_vendor.o(($event) => stock.value = $event.detail.value),
        t: common_vendor.t(getCategoryText(categoryOptions[categoryIndex.value])),
        v: common_vendor.p({
          name: "right",
          size: 16
        }),
        w: common_vendor.o(onCategoryChange),
        x: categoryIndex.value,
        y: categoryOptions,
        z: common_vendor.t(booleanOptions[hotIndex.value]),
        A: common_vendor.p({
          name: "right",
          size: 16
        }),
        B: common_vendor.o(onHotChange),
        C: hotIndex.value,
        D: booleanOptions,
        E: common_vendor.t(booleanOptions[limitedIndex.value]),
        F: common_vendor.p({
          name: "right",
          size: 16
        }),
        G: common_vendor.o(onLimitedChange),
        H: limitedIndex.value,
        I: booleanOptions,
        J: common_vendor.o(() => {
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/reward-add.js.map
