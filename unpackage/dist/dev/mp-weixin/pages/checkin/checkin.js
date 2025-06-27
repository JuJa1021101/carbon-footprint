"use strict";
const common_vendor = require("../../common/vendor.js");
const services_points = require("../../services/points.js");
const _sfc_main = {
  __name: "checkin",
  setup(__props) {
    const userPoints = common_vendor.ref(300);
    const todayPoints = common_vendor.ref(15);
    const userLevelInfo = {
      1: { name: "环保新手 Lv.1", nextLevel: "环保学徒Lv.2", threshold: 100 },
      2: { name: "环保学徒 Lv.2", nextLevel: "环保达人Lv.3", threshold: 300 },
      3: { name: "环保达人 Lv.3", nextLevel: "环保先锋Lv.4", threshold: 500 },
      4: { name: "环保先锋 Lv.4", nextLevel: "环保大使Lv.5", threshold: 800 },
      5: { name: "环保大使 Lv.5", nextLevel: "环保使者Lv.6", threshold: 1200 }
    };
    const currentLevel = common_vendor.computed(() => {
      if (userPoints.value < 100)
        return 1;
      if (userPoints.value < 300)
        return 2;
      if (userPoints.value < 500)
        return 3;
      if (userPoints.value < 800)
        return 4;
      return 5;
    });
    const userLevel = common_vendor.computed(() => {
      return userLevelInfo[currentLevel.value].name;
    });
    const nextLevel = common_vendor.computed(() => {
      return userLevelInfo[currentLevel.value].nextLevel;
    });
    const nextLevelPoints = common_vendor.computed(() => {
      return userLevelInfo[currentLevel.value].threshold;
    });
    const pointsNeeded = common_vendor.computed(() => {
      return Math.max(0, nextLevelPoints.value - userPoints.value);
    });
    const progressWidth = common_vendor.computed(() => {
      let startPoints = 0;
      if (currentLevel.value > 1) {
        startPoints = userLevelInfo[currentLevel.value - 1].threshold;
      }
      const levelRange = nextLevelPoints.value - startPoints;
      const currentProgress = userPoints.value - startPoints;
      return Math.min(100, Math.max(0, currentProgress / levelRange * 100));
    });
    common_vendor.onMounted(async () => {
      await loadUserPoints();
      common_vendor.index.$on("userPointsUpdated", handlePointsUpdate);
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.$off("userPointsUpdated", handlePointsUpdate);
    });
    const loadUserPoints = async () => {
      try {
        const result = await services_points.getUserPoints(true);
        if (result && result.success && result.data) {
          userPoints.value = result.data.points;
          common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:223", "打卡页面更新积分:", userPoints.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:226", "获取积分失败:", error);
      }
    };
    const handlePointsUpdate = (pointsData) => {
      if (pointsData && typeof pointsData.points !== "undefined") {
        common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:233", "打卡页面收到积分更新事件:", pointsData);
        userPoints.value = pointsData.points;
      }
    };
    const handleCheckin = async (points, type) => {
      try {
        common_vendor.index.showLoading({ title: "正在打卡..." });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        todayPoints.value += points;
        const { result } = await common_vendor.nr.callFunction({
          name: "updateUserPoints",
          data: {
            userId: "10086420",
            // 使用固定的默认用户ID
            pointsChange: points,
            reason: `${type}打卡`
          }
        });
        common_vendor.index.hideLoading();
        if (result && result.success) {
          common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:262", "打卡成功，积分更新结果:", result);
          if (result.data && result.data.current_points !== void 0) {
            const newPoints = result.data.current_points;
            userPoints.value = newPoints;
            services_points.updatePointsCache({ points: newPoints });
            try {
              common_vendor.index.setStorageSync("user_points", newPoints.toString());
              common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:275", "打卡后更新本地积分存储:", newPoints);
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:277", "保存积分到本地存储失败:", e);
            }
          }
          common_vendor.index.showToast({
            title: "打卡成功",
            icon: "success"
          });
        } else {
          common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:286", "打卡失败，积分更新失败:", result);
          common_vendor.index.showToast({
            title: "打卡失败，请重试",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:294", "打卡失败:", error);
        common_vendor.index.showToast({
          title: "打卡失败，请重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(userPoints.value),
        b: common_vendor.t(todayPoints.value),
        c: common_vendor.t(userLevel.value),
        d: common_vendor.t(userPoints.value),
        e: common_vendor.t(nextLevelPoints.value),
        f: progressWidth.value + "%",
        g: common_vendor.t(pointsNeeded.value),
        h: common_vendor.t(nextLevel.value),
        i: common_vendor.o(($event) => handleCheckin(5, "垃圾分类")),
        j: common_vendor.o(($event) => handleCheckin(10, "资源回收"))
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkin/checkin.js.map
