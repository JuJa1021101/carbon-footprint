"use strict";
const common_vendor = require("../common/vendor.js");
const services_login = require("./login.js");
const USER_ACTIVITY_STATUS_KEY = "user_activity_status";
const FALLBACK_ACTIVITIES = [
  {
    _id: "activity1",
    title: "城市河道清洁志愿行动",
    description: "一起行动，清洁我们的城市河道，保护水资源",
    location: "城东河滨公园",
    activity_time: "6月15日 09:00",
    status: "报名中",
    point: 100
  },
  {
    _id: "activity2",
    title: "废旧电池回收换礼品",
    description: "回收旧电池，保护环境，还能换取环保小礼品",
    location: "市民服务中心",
    activity_time: "6月1日-30日",
    status: "进行中",
    point: 50
  },
  {
    _id: "activity3",
    title: "图书馆整理书籍",
    description: "将书按类别归纳，放在书架上。",
    location: "东华理工大学",
    activity_time: "2025年6月19日",
    status: "未开始",
    point: 80
  }
];
const getActivities = (sort = true) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.showLoading({ title: "加载中..." });
    try {
      common_vendor.nr.callFunction({
        name: "getActivities"
      }).then((res) => {
        common_vendor.index.hideLoading();
        if (res.result && res.result.code === 0) {
          let activities = res.result.data;
          if (!activities || activities.length === 0) {
            common_vendor.index.__f__("log", "at services/userActivity.js:60", "云函数返回的活动列表为空，使用备用数据");
            activities = FALLBACK_ACTIVITIES;
          }
          processActivities(activities, sort, resolve);
        } else {
          common_vendor.index.__f__("error", "at services/userActivity.js:66", "云函数返回异常:", res);
          common_vendor.index.__f__("log", "at services/userActivity.js:67", "使用备用数据");
          processActivities(FALLBACK_ACTIVITIES, sort, resolve);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at services/userActivity.js:72", "调用云函数失败:", err);
        common_vendor.index.__f__("log", "at services/userActivity.js:73", "使用备用数据");
        processActivities(FALLBACK_ACTIVITIES, sort, resolve);
      });
    } catch (error) {
      common_vendor.index.hideLoading();
      common_vendor.index.__f__("error", "at services/userActivity.js:78", "调用云函数出现异常:", error);
      common_vendor.index.__f__("log", "at services/userActivity.js:79", "使用备用数据");
      processActivities(FALLBACK_ACTIVITIES, sort, resolve);
    }
  });
};
const processActivities = (activities, sort, resolve) => {
  if (sort && activities.length > 0) {
    const userActivityStatus2 = getUserActivityStatus();
    activities.sort((a, b) => {
      var _a, _b, _c, _d;
      const aCheckedIn = ((_a = userActivityStatus2[a._id]) == null ? void 0 : _a.isCheckedIn) || false;
      const bCheckedIn = ((_b = userActivityStatus2[b._id]) == null ? void 0 : _b.isCheckedIn) || false;
      if (aCheckedIn && !bCheckedIn)
        return 1;
      if (!aCheckedIn && bCheckedIn)
        return -1;
      const aEnrolled = ((_c = userActivityStatus2[a._id]) == null ? void 0 : _c.isEnrolled) || false;
      const bEnrolled = ((_d = userActivityStatus2[b._id]) == null ? void 0 : _d.isEnrolled) || false;
      if (aEnrolled && !bEnrolled)
        return -1;
      if (!aEnrolled && bEnrolled)
        return 1;
      const statusOrder = {
        "进行中": 0,
        "报名中": 1,
        "未开始": 2,
        "已结束": 3
      };
      const aStatusValue = statusOrder[a.status] !== void 0 ? statusOrder[a.status] : 999;
      const bStatusValue = statusOrder[b.status] !== void 0 ? statusOrder[b.status] : 999;
      return aStatusValue - bStatusValue;
    });
  }
  const userActivityStatus = getUserActivityStatus();
  const activitiesWithStatus = activities.map((activity) => {
    const status = userActivityStatus[activity._id] || {};
    return {
      ...activity,
      isEnrolled: status.isEnrolled || false,
      isCheckedIn: status.isCheckedIn || false
    };
  });
  resolve(activitiesWithStatus);
};
const getTopActivities = () => {
  return new Promise((resolve, reject) => {
    common_vendor.index.__f__("log", "at services/userActivity.js:147", "开始获取首页置顶活动...");
    getActivities(true).then((activities) => {
      common_vendor.index.__f__("log", "at services/userActivity.js:151", "获取到活动列表，总数:", activities.length);
      if (!activities || activities.length === 0) {
        common_vendor.index.__f__("log", "at services/userActivity.js:154", "没有获取到活动，将使用备用数据");
        resolve(FALLBACK_ACTIVITIES.slice(0, 2));
        return;
      }
      activities.sort((a, b) => {
        const getStatusPriority = (activity) => {
          if (activity.isEnrolled && !activity.isCheckedIn)
            return 0;
          if (activity.status === "报名中")
            return 1;
          if (activity.status === "未开始")
            return 2;
          if (activity.status === "已结束")
            return 3;
          if (activity.isCheckedIn)
            return 4;
          return 5;
        };
        const aPriority = getStatusPriority(a);
        const bPriority = getStatusPriority(b);
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        if (a.activity_time && b.activity_time) {
          return new Date(a.activity_time) - new Date(b.activity_time);
        }
        return 0;
      });
      common_vendor.index.__f__("log", "at services/userActivity.js:189", "排序后的活动顺序:", activities.map((a) => `${a.title} (${a.status}${a.isEnrolled ? "/已报名" : ""}${a.isCheckedIn ? "/已打卡" : ""})`));
      const topActivities = activities.slice(0, 2);
      common_vendor.index.__f__("log", "at services/userActivity.js:191", "首页将显示的活动:", topActivities.map((a) => a.title));
      resolve(topActivities);
    }).catch((err) => {
      common_vendor.index.__f__("error", "at services/userActivity.js:195", "获取活动列表失败，将使用备用数据:", err);
      resolve(FALLBACK_ACTIVITIES.slice(0, 2));
    });
  });
};
const enrollActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    const user = services_login.getCurrentUser();
    if (!user) {
      reject(new Error("请先登录"));
      return;
    }
    const userActivityStatus = getUserActivityStatus();
    userActivityStatus[activityId] = {
      ...userActivityStatus[activityId] || {},
      isEnrolled: true,
      enrolledAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveUserActivityStatus(userActivityStatus);
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};
const checkInActivity = (activityId, points) => {
  return new Promise(async (resolve, reject) => {
    var _a, _b;
    try {
      const user = services_login.getCurrentUser();
      if (!user) {
        reject(new Error("请先登录"));
        return;
      }
      const userId = "10086420";
      const userActivityStatus = getUserActivityStatus();
      if (!((_a = userActivityStatus[activityId]) == null ? void 0 : _a.isEnrolled)) {
        reject(new Error("请先报名该活动"));
        return;
      }
      if ((_b = userActivityStatus[activityId]) == null ? void 0 : _b.isCheckedIn) {
        reject(new Error("您已经完成打卡"));
        return;
      }
      userActivityStatus[activityId] = {
        ...userActivityStatus[activityId],
        isCheckedIn: true,
        checkedInAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      saveUserActivityStatus(userActivityStatus);
      common_vendor.index.__f__("log", "at services/userActivity.js:280", "开始更新积分，活动ID:", activityId, "积分:", points);
      common_vendor.index.showLoading({ title: "更新积分中..." });
      let originalPoints;
      try {
        const pointsStr = common_vendor.index.getStorageSync("user_points");
        originalPoints = pointsStr ? parseInt(pointsStr) : 0;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/userActivity.js:289", "获取原始积分失败:", e);
      }
      try {
        const { result } = await common_vendor.nr.callFunction({
          name: "updateUserPoints",
          data: {
            userId,
            // 使用固定的默认用户ID
            pointsChange: points,
            reason: `完成活动"${activityId}"打卡`
          }
        });
        common_vendor.index.hideLoading();
        if (result && result.success) {
          common_vendor.index.__f__("log", "at services/userActivity.js:305", "积分更新成功:", result);
          const newPoints = result.data.current_points;
          try {
            common_vendor.index.setStorageSync("user_points", newPoints.toString());
            common_vendor.index.__f__("log", "at services/userActivity.js:313", "本地积分已更新为:", newPoints);
            common_vendor.index.$emit("userPointsUpdated", { points: newPoints });
          } catch (e) {
            common_vendor.index.__f__("error", "at services/userActivity.js:318", "保存积分到本地存储失败:", e);
          }
          resolve({
            success: true,
            points,
            totalPoints: newPoints
          });
        } else {
          common_vendor.index.__f__("error", "at services/userActivity.js:327", "积分更新失败:", result);
          common_vendor.index.showToast({
            title: "积分更新失败",
            icon: "none"
          });
          reject(new Error("积分更新失败"));
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at services/userActivity.js:336", "调用云函数更新积分失败:", error);
        if (originalPoints !== void 0) {
          try {
            common_vendor.index.setStorageSync("user_points", originalPoints.toString());
          } catch (e) {
            common_vendor.index.__f__("error", "at services/userActivity.js:343", "恢复原始积分失败:", e);
          }
        }
        common_vendor.index.showToast({
          title: "积分更新失败",
          icon: "none"
        });
        reject(new Error("积分更新失败，请稍后重试"));
      }
    } catch (error) {
      common_vendor.index.hideLoading();
      common_vendor.index.__f__("error", "at services/userActivity.js:355", "打卡过程中发生错误:", error);
      reject(new Error("打卡失败，请稍后重试"));
    }
  });
};
const getUserActivityStatus = () => {
  try {
    const statusStr = common_vendor.index.getStorageSync(USER_ACTIVITY_STATUS_KEY);
    return statusStr ? JSON.parse(statusStr) : {};
  } catch (e) {
    common_vendor.index.__f__("error", "at services/userActivity.js:370", "获取用户活动状态失败", e);
    return {};
  }
};
const saveUserActivityStatus = (status) => {
  try {
    common_vendor.index.setStorageSync(USER_ACTIVITY_STATUS_KEY, JSON.stringify(status));
  } catch (e) {
    common_vendor.index.__f__("error", "at services/userActivity.js:383", "保存用户活动状态失败", e);
  }
};
exports.checkInActivity = checkInActivity;
exports.enrollActivity = enrollActivity;
exports.getActivities = getActivities;
exports.getTopActivities = getTopActivities;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/userActivity.js.map
