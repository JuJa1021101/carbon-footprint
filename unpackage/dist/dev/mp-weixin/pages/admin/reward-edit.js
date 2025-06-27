"use strict";
const common_vendor = require("../../common/vendor.js");
const services_mall = require("../../services/mall.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "reward-edit",
  setup(__props) {
    const rewardId = common_vendor.ref("");
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
    const loading = common_vendor.ref(true);
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
        content: "是否放弃修改？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    };
    const loadRewardDetail = async (id) => {
      loading.value = true;
      try {
        const rewards = await services_mall.getAllRewards();
        const reward = rewards.find((item) => item._id === id);
        if (!reward) {
          common_vendor.index.showToast({
            title: "未找到商品信息",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
          return;
        }
        common_vendor.index.__f__("log", "at pages/admin/reward-edit.vue:251", "加载商品详情:", {
          name: reward.name,
          is_hot: reward.is_hot,
          is_limited: reward.is_limited,
          is_limited_time: reward.is_limited_time
        });
        name.value = reward.name;
        description.value = reward.description || "";
        imageUrl.value = reward.image_url;
        points.value = (reward.required_points || reward.points || 0).toString();
        stock.value = (reward.stock_quantity || reward.stock || 0).toString();
        const category = reward.category;
        const cIndex = categoryOptions.findIndex((item) => item === category);
        categoryIndex.value = cIndex > -1 ? cIndex : 0;
        hotIndex.value = reward.is_hot === true ? 1 : 0;
        limitedIndex.value = reward.is_limited === true || reward.is_limited_time === true ? 1 : 0;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "获取商品信息失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const submitRewardChanges = async () => {
      if (!canSave.value) {
        common_vendor.index.showToast({
          title: "请完善必填信息",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "保存中...",
          mask: true
        });
        const rewardData = {
          _id: rewardId.value,
          name: name.value,
          description: description.value,
          image_url: imageUrl.value,
          // 传递图片路径，可能是临时路径或已上传路径
          points: parseInt(points.value) || 0,
          stock: parseInt(stock.value) || 0,
          category: categoryOptions[categoryIndex.value],
          is_hot: hotIndex.value === 1,
          is_limited: limitedIndex.value === 1
        };
        await services_mall.updateReward(rewardData);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "保存失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/reward-edit.vue:343", "保存商品失败:", error);
      }
    };
    common_vendor.onMounted(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/login"
          });
        }, 1500);
        return;
      }
      const page = getCurrentPages().pop();
      const options = page.options || {};
      if (options.id) {
        rewardId.value = options.id;
        loadRewardDetail(options.id);
      } else {
        common_vendor.index.showToast({
          title: "缺少商品ID",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    const getCategoryText = (category) => {
      const categories = {
        "daily": "日常用品",
        "plant": "绿植花卉",
        "coupon": "优惠券"
      };
      return categories[category] || category;
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
        e: common_vendor.o(submitRewardChanges),
        f: loading.value
      }, loading.value ? {} : common_vendor.e({
        g: name.value,
        h: common_vendor.o(($event) => name.value = $event.detail.value),
        i: description.value,
        j: common_vendor.o(($event) => description.value = $event.detail.value),
        k: imageUrl.value
      }, imageUrl.value ? {
        l: imageUrl.value
      } : {
        m: common_vendor.p({
          name: "plus",
          size: 28
        })
      }, {
        n: common_vendor.o(chooseImage),
        o: common_vendor.p({
          name: "bookmark",
          size: 16
        }),
        p: points.value,
        q: common_vendor.o(($event) => points.value = $event.detail.value),
        r: common_vendor.p({
          name: "bookmark",
          size: 16
        }),
        s: stock.value,
        t: common_vendor.o(($event) => stock.value = $event.detail.value),
        v: common_vendor.t(getCategoryText(categoryOptions[categoryIndex.value])),
        w: common_vendor.p({
          name: "right",
          size: 16
        }),
        x: common_vendor.o(onCategoryChange),
        y: categoryIndex.value,
        z: categoryOptions,
        A: common_vendor.t(booleanOptions[hotIndex.value]),
        B: common_vendor.p({
          name: "right",
          size: 16
        }),
        C: common_vendor.o(onHotChange),
        D: hotIndex.value,
        E: booleanOptions,
        F: common_vendor.t(booleanOptions[limitedIndex.value]),
        G: common_vendor.p({
          name: "right",
          size: 16
        }),
        H: common_vendor.o(onLimitedChange),
        I: limitedIndex.value,
        J: booleanOptions,
        K: common_vendor.o(() => {
        })
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/reward-edit.js.map
