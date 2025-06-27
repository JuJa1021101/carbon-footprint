"use strict";
const common_vendor = require("../common/vendor.js");
const services_login = require("./login.js");
let cachedUserPoints = null;
let lastFetchTime = 0;
const getUserPoints = (forceRefresh = false) => {
  return new Promise(async (resolve) => {
    try {
      const userId = "10086420";
      if (!forceRefresh) {
        try {
          const pointsStr = common_vendor.index.getStorageSync("user_points");
          if (pointsStr) {
            const points = parseInt(pointsStr);
            common_vendor.index.__f__("log", "at services/points.js:25", "从本地存储获取积分:", points);
            cachedUserPoints = { points };
            lastFetchTime = Date.now();
            resolve({
              success: true,
              data: { points },
              source: "local"
            });
            return;
          }
        } catch (localError) {
          common_vendor.index.__f__("error", "at services/points.js:40", "从本地存储获取积分失败:", localError);
        }
        const now = Date.now();
        if (!forceRefresh && cachedUserPoints && now - lastFetchTime < 3e4) {
          common_vendor.index.__f__("log", "at services/points.js:46", "使用缓存的积分数据:", cachedUserPoints);
          resolve({
            success: true,
            data: cachedUserPoints,
            cached: true
          });
          return;
        }
      }
      try {
        common_vendor.index.__f__("log", "at services/points.js:58", "从云端获取积分，用户ID:", userId);
        const { result } = await common_vendor.nr.callFunction({
          name: "getUserPoints",
          data: { userId }
        });
        if (result && result.success) {
          const cloudPoints = result.data.points || 1e3;
          common_vendor.index.__f__("log", "at services/points.js:67", "从云端获取的积分:", cloudPoints);
          cachedUserPoints = { points: cloudPoints };
          lastFetchTime = Date.now();
          try {
            common_vendor.index.setStorageSync("user_points", cloudPoints.toString());
            common_vendor.index.__f__("log", "at services/points.js:76", "云端积分已保存到本地:", cloudPoints);
          } catch (e) {
            common_vendor.index.__f__("error", "at services/points.js:78", "保存积分到本地存储失败:", e);
          }
          common_vendor.index.$emit("userPointsUpdated", { points: cloudPoints });
          resolve({
            success: true,
            data: { points: cloudPoints },
            source: "cloud"
          });
          return;
        } else {
          common_vendor.index.__f__("error", "at services/points.js:91", "云函数获取积分失败:", result);
        }
      } catch (cloudError) {
        common_vendor.index.__f__("error", "at services/points.js:94", "调用云函数获取积分失败:", cloudError);
      }
      const defaultPoints = { points: 1e3 };
      cachedUserPoints = defaultPoints;
      lastFetchTime = Date.now();
      try {
        common_vendor.index.setStorageSync("user_points", "1000");
        common_vendor.index.__f__("log", "at services/points.js:105", "默认积分已保存到本地");
      } catch (e) {
        common_vendor.index.__f__("error", "at services/points.js:107", "保存默认积分到本地失败:", e);
      }
      resolve({
        success: true,
        message: "使用默认积分",
        data: defaultPoints
      });
    } catch (error) {
      common_vendor.index.__f__("error", "at services/points.js:116", "获取用户积分失败:", error);
      const fallbackData = cachedUserPoints || { points: 1e3 };
      resolve({
        success: false,
        message: "获取积分失败，使用默认值",
        data: fallbackData
      });
    }
  });
};
const updatePointsCache = (pointsData) => {
  if (pointsData && typeof pointsData.points !== "undefined") {
    cachedUserPoints = { ...pointsData };
    lastFetchTime = Date.now();
    common_vendor.index.__f__("log", "at services/points.js:135", "积分缓存已更新:", cachedUserPoints);
    try {
      common_vendor.index.setStorageSync("user_points", pointsData.points.toString());
      common_vendor.index.__f__("log", "at services/points.js:140", "积分已保存到本地存储:", pointsData.points);
    } catch (e) {
      common_vendor.index.__f__("error", "at services/points.js:142", "保存积分到本地存储失败:", e);
    }
    broadcastPointsUpdate(pointsData);
    return true;
  }
  return false;
};
const broadcastPointsUpdate = (pointsData) => {
  if (pointsData && typeof pointsData.points !== "undefined") {
    common_vendor.index.$emit("userPointsUpdated", pointsData);
    common_vendor.index.__f__("log", "at services/points.js:161", "已广播积分更新事件:", pointsData);
    try {
      const currentUser = services_login.getCurrentUserFromProfile();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          points: pointsData.points
        };
        common_vendor.index.setStorageSync("profileUser", JSON.stringify(updatedUser));
        common_vendor.index.__f__("log", "at services/points.js:176", "用户信息中的积分已更新:", updatedUser);
        common_vendor.index.$emit("userInfoUpdated", updatedUser);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at services/points.js:182", "更新用户信息中的积分失败:", error);
    }
  }
};
const getCurrentPoints = () => {
  try {
    const pointsStr = common_vendor.index.getStorageSync("user_points");
    if (pointsStr) {
      return parseInt(pointsStr);
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at services/points.js:199", "从本地存储获取积分失败:", e);
  }
  if (cachedUserPoints && typeof cachedUserPoints.points !== "undefined") {
    return cachedUserPoints.points;
  }
  try {
    const currentUser = services_login.getCurrentUserFromProfile();
    if (currentUser && typeof currentUser.points !== "undefined") {
      return currentUser.points;
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/points.js:214", "从用户信息获取积分失败:", error);
  }
  return 1e3;
};
exports.getCurrentPoints = getCurrentPoints;
exports.getUserPoints = getUserPoints;
exports.updatePointsCache = updatePointsCache;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/points.js.map
