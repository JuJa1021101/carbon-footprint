"use strict";
const common_vendor = require("../common/vendor.js");
const getActivities = () => {
  return new Promise((resolve, reject) => {
    common_vendor.index.showLoading({ title: "加载中..." });
    common_vendor.nr.callFunction({
      name: "getActivities"
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || "获取活动列表失败"));
      }
    }).catch((err) => {
      common_vendor.index.hideLoading();
      reject(new Error(err.message || "获取活动列表失败"));
    });
  });
};
const getActivityCount = () => {
  return new Promise((resolve, reject) => {
    common_vendor.nr.callFunction({
      name: "getActivities",
      data: { count_only: true }
    }).then((res) => {
      if (res.result.code === 0) {
        resolve(res.result.data.total);
      } else {
        reject(new Error(res.result.message || "获取活动数量失败"));
      }
    }).catch((err) => {
      reject(new Error(err.message || "获取活动数量失败"));
    });
  });
};
const addActivity = (activityData) => {
  return new Promise((resolve, reject) => {
    const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
    if (adminLoginStatus !== "loggedin") {
      reject(new Error("管理员未登录"));
      return;
    }
    const adminId = common_vendor.index.getStorageSync("admin_id") || "admin";
    common_vendor.index.showLoading({ title: "添加中..." });
    common_vendor.nr.callFunction({
      name: "addActivity",
      data: {
        ...activityData,
        created_by: adminId
      }
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || "添加活动失败"));
      }
    }).catch((err) => {
      common_vendor.index.hideLoading();
      reject(new Error(err.message || "添加活动失败"));
    });
  });
};
const updateActivity = (activityData) => {
  return new Promise((resolve, reject) => {
    const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
    if (adminLoginStatus !== "loggedin") {
      reject(new Error("管理员未登录"));
      return;
    }
    common_vendor.index.showLoading({ title: "更新中..." });
    common_vendor.nr.callFunction({
      name: "updateActivity",
      data: activityData
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || "更新活动失败"));
      }
    }).catch((err) => {
      common_vendor.index.hideLoading();
      reject(new Error(err.message || "更新活动失败"));
    });
  });
};
const deleteActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
    if (adminLoginStatus !== "loggedin") {
      reject(new Error("管理员未登录"));
      return;
    }
    common_vendor.index.showLoading({ title: "删除中..." });
    common_vendor.nr.callFunction({
      name: "deleteActivity",
      data: { _id: activityId }
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || "删除活动失败"));
      }
    }).catch((err) => {
      common_vendor.index.hideLoading();
      reject(new Error(err.message || "删除活动失败"));
    });
  });
};
exports.addActivity = addActivity;
exports.deleteActivity = deleteActivity;
exports.getActivities = getActivities;
exports.getActivityCount = getActivityCount;
exports.updateActivity = updateActivity;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/activity.js.map
