"use strict";
const common_vendor = require("../../common/vendor.js");
const services_mall = require("../../services/mall.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "reward-list",
  setup(__props) {
    const rewards = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const formatImageUrl = (url) => {
      if (!url)
        return "/static/images/mall/default-product.png";
      if (!url.startsWith("/") && !url.startsWith("http")) {
        return "/" + url;
      }
      return url;
    };
    const handleImageError = (e, reward) => {
      common_vendor.index.__f__("error", "at pages/admin/reward-list.vue:109", `商品[${reward.name}]图片加载失败:`, e);
      e.target.src = "/static/images/mall/default-product.png";
    };
    const getCategoryText = (category) => {
      const categories = {
        "daily": "日常用品",
        "plant": "绿植花卉",
        "coupon": "优惠券"
      };
      return categories[category] || category;
    };
    const loadRewards = async () => {
      loading.value = true;
      try {
        const result = await services_mall.getAllRewards();
        rewards.value = result.sort((a, b) => {
          if ((a.is_limited === true || a.is_limited_time === true) && (b.is_limited !== true && b.is_limited_time !== true)) {
            return -1;
          }
          if (a.is_limited !== true && a.is_limited_time !== true && (b.is_limited === true || b.is_limited_time === true)) {
            return 1;
          }
          if (a.is_hot === true && b.is_hot !== true) {
            return -1;
          }
          if (a.is_hot !== true && b.is_hot === true) {
            return 1;
          }
          const aTime = a.created_at || 0;
          const bTime = b.created_at || 0;
          return bTime - aTime;
        });
        updateRewardCount(rewards.value.length);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/reward-list.vue:159", "获取商品列表失败:", error);
        common_vendor.index.showToast({
          title: error.message || "获取商品列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const updateRewardCount = (count) => {
      common_vendor.index.setStorageSync("reward_count", count);
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const navigateToAdd = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/reward-add"
      });
    };
    const navigateToEdit = (rewardId) => {
      common_vendor.index.navigateTo({
        url: `/pages/admin/reward-edit?id=${rewardId}`
      });
    };
    const showDeleteOption = (reward) => {
      common_vendor.index.showActionSheet({
        itemList: ["删除"],
        itemColor: "#ff0000",
        success: (res) => {
          if (res.tapIndex === 0) {
            confirmDeleteReward(reward);
          }
        }
      });
    };
    const confirmDeleteReward = (reward) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除"${reward.name}"商品吗？删除后无法恢复。`,
        confirmColor: "#ff0000",
        success: (res) => {
          if (res.confirm) {
            handleDeleteReward(reward._id);
          }
        }
      });
    };
    const handleDeleteReward = async (rewardId) => {
      try {
        await services_mall.deleteReward(rewardId);
        rewards.value = rewards.value.filter((reward) => reward._id !== rewardId);
        updateRewardCount(rewards.value.length);
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "删除失败",
          icon: "none"
        });
      }
    };
    const handleRewardsUpdate = (eventData) => {
      common_vendor.index.__f__("log", "at pages/admin/reward-list.vue:243", "收到商品更新事件:", eventData);
      loadRewards();
      let message = "";
      switch (eventData.type) {
        case "add":
          message = "商品添加成功";
          break;
        case "update":
          message = "商品更新成功";
          break;
        case "delete":
          message = "商品删除成功";
          break;
        default:
          message = "商品信息已更新";
      }
      common_vendor.index.showToast({
        title: message,
        icon: "success",
        duration: 2e3
      });
    };
    common_vendor.onMounted(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.__f__("log", "at pages/admin/reward-list.vue:274", "管理员未登录，跳转到登录页面");
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/admin/login"
          });
        }, 1500);
        return;
      }
      loadRewards();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/admin/reward-list.vue:292", "商品列表页面显示，检查登录状态");
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.__f__("log", "at pages/admin/reward-list.vue:297", "检测到管理员未登录，跳转到登录页面");
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/admin/login"
          });
        }, 1500);
        return;
      }
      loadRewards();
      const actionMessage = common_vendor.index.getStorageSync("reward_action_message");
      if (actionMessage) {
        common_vendor.index.showToast({
          title: actionMessage,
          icon: "success"
        });
        common_vendor.index.removeStorageSync("reward_action_message");
      }
    });
    common_vendor.onLoad(() => {
      common_vendor.index.$on("rewardsUpdated", handleRewardsUpdate);
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("rewardsUpdated");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: loading.value
      }, loading.value ? {} : common_vendor.e({
        d: common_vendor.t(rewards.value.length),
        e: rewards.value.length === 0
      }, rewards.value.length === 0 ? {} : {
        f: common_vendor.f(rewards.value, (reward, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(reward.name),
            b: "ef8d41f8-1-" + i0,
            c: common_vendor.o(($event) => showDeleteOption(reward), reward._id),
            d: formatImageUrl(reward.image_url),
            e: common_vendor.o(($event) => handleImageError($event, reward), reward._id),
            f: common_vendor.t(reward.stock_quantity || reward.stock || 0),
            g: common_vendor.t(getCategoryText(reward.category)),
            h: common_vendor.t(reward.required_points || reward.points || 0),
            i: reward.is_hot
          }, reward.is_hot ? {} : {}, {
            j: reward.is_limited || reward.is_limited_time
          }, reward.is_limited || reward.is_limited_time ? {} : {}, {
            k: reward._id,
            l: common_vendor.o(($event) => navigateToEdit(reward._id), reward._id)
          });
        }),
        g: common_vendor.p({
          name: "more",
          size: 16
        })
      }), {
        h: common_vendor.o(navigateToAdd)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/reward-list.js.map
