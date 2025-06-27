"use strict";
const common_vendor = require("../../common/vendor.js");
const services_activity = require("../../services/activity.js");
const services_mall = require("../../services/mall.js");
const _sfc_main = {
  __name: "dashboard",
  setup(__props) {
    const activityCount = common_vendor.ref(0);
    const rewardCount = common_vendor.ref(0);
    const loading = common_vendor.ref(true);
    const hasError = common_vendor.ref(false);
    const loadStats = async () => {
      loading.value = true;
      hasError.value = false;
      try {
        const cachedActivityCount = common_vendor.index.getStorageSync("activity_count") || 0;
        const cachedRewardCount = common_vendor.index.getStorageSync("reward_count") || 0;
        activityCount.value = cachedActivityCount;
        rewardCount.value = cachedRewardCount;
        Promise.all([
          services_activity.getActivityCount(),
          services_mall.getRewardCount()
        ]).then(([countActivity, countRewards]) => {
          activityCount.value = countActivity;
          rewardCount.value = countRewards;
          if (cachedActivityCount !== countActivity) {
            common_vendor.index.setStorageSync("activity_count", countActivity);
          }
          if (cachedRewardCount !== countRewards) {
            common_vendor.index.setStorageSync("reward_count", countRewards);
          }
          loading.value = false;
        }).catch((error) => {
          common_vendor.index.__f__("error", "at pages/admin/dashboard.vue:129", "获取统计数据失败:", error);
          hasError.value = true;
          loading.value = false;
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/dashboard.vue:135", "统计数据初始化失败:", error);
        hasError.value = true;
        if (!activityCount.value)
          activityCount.value = 3;
        if (!rewardCount.value)
          rewardCount.value = 10;
        loading.value = false;
      }
    };
    common_vendor.onMounted(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        common_vendor.index.navigateTo({
          url: "/pages/admin/login"
        });
      } else {
        loadStats();
      }
    });
    const navigateToActivityManagement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/activity-list"
      });
    };
    const navigateToKnowledgeManagement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/knowledge-list"
      });
    };
    const navigateToRewardsManagement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/reward-list"
      });
    };
    const navigateToResetPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/reset-points"
      });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "退出提示",
        content: "确认退出管理员账号？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("admin_login_status");
            common_vendor.index.navigateBack({
              delta: 2
              // 返回两级，跳过登录页面直接回到设置页面
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : {
        b: common_vendor.t(activityCount.value)
      }, {
        c: loading.value
      }, loading.value ? {} : {
        d: common_vendor.t(rewardCount.value)
      }, {
        e: common_vendor.o(navigateToActivityManagement),
        f: common_vendor.o(navigateToKnowledgeManagement),
        g: common_vendor.o(navigateToRewardsManagement),
        h: common_vendor.o(navigateToResetPoints),
        i: common_vendor.o(handleLogout)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/dashboard.js.map
