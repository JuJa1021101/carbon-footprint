"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "reset-points",
  setup(__props) {
    const currentPoints = common_vendor.ref(0);
    const isResetting = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.showToast({
          title: "请先登录管理员账号",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/login"
          });
        }, 1500);
        return;
      }
      loadPoints();
    });
    const loadPoints = async (force = false) => {
      isRefreshing.value = true;
      try {
        const userId = "10086420";
        const { result } = await common_vendor.nr.callFunction({
          name: "getUserPoints",
          data: { userId }
        });
        if (result && result.success) {
          currentPoints.value = result.data.points;
          common_vendor.index.__f__("log", "at pages/admin/reset-points.vue:107", "当前积分:", currentPoints.value);
        } else {
          common_vendor.index.__f__("error", "at pages/admin/reset-points.vue:109", "获取积分失败:", result);
          common_vendor.index.showToast({
            title: "获取积分失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/reset-points.vue:116", "获取积分失败:", error);
        common_vendor.index.showToast({
          title: "获取积分失败",
          icon: "none"
        });
      } finally {
        isRefreshing.value = false;
      }
    };
    const refreshPoints = async () => {
      await loadPoints(true);
      common_vendor.index.showToast({
        title: "积分已刷新",
        icon: "success"
      });
    };
    const confirmReset = () => {
      common_vendor.index.showModal({
        title: "警告",
        content: "此操作将删除所有积分记录，并创建一个新的默认积分记录。此操作不可逆，是否继续？",
        success: (res) => {
          if (res.confirm) {
            resetPointsSystem();
          }
        }
      });
    };
    const resetPointsSystem = async () => {
      isResetting.value = true;
      try {
        common_vendor.index.showLoading({ title: "重置中..." });
        const { result } = await common_vendor.nr.callFunction({
          name: "resetPointsSystem"
        });
        common_vendor.index.hideLoading();
        if (result && result.success) {
          common_vendor.index.showToast({
            title: "重置成功",
            icon: "success"
          });
          await loadPoints(true);
          common_vendor.index.$emit("userPointsUpdated", { points: currentPoints.value });
        } else {
          common_vendor.index.showToast({
            title: "重置失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/reset-points.vue:180", "重置积分系统失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "重置失败",
          icon: "none"
        });
      } finally {
        isResetting.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_vendor.t(currentPoints.value),
        d: common_vendor.t(isResetting.value ? "重置中..." : "重置积分系统"),
        e: common_vendor.o(confirmReset),
        f: isResetting.value,
        g: common_vendor.t(isRefreshing.value ? "刷新中..." : "刷新积分"),
        h: common_vendor.o(refreshPoints),
        i: isRefreshing.value
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/reset-points.js.map
