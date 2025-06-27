"use strict";
const common_vendor = require("../common/vendor.js");
const checkLoginStatus = () => {
  const status = common_vendor.index.getStorageSync("login_status");
  const token = common_vendor.index.getStorageSync("user_token");
  return status === "loggedin" && !!token;
};
const getCurrentUser = () => {
  try {
    const profileUser = common_vendor.index.getStorageSync("profileUser");
    if (profileUser) {
      try {
        const user = typeof profileUser === "string" ? JSON.parse(profileUser) : profileUser;
        common_vendor.index.__f__("log", "at services/login.js:99", "getCurrentUser: 从profileUser获取用户:", user);
        return user;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:102", "解析profileUser失败:", e);
      }
    }
    const userInfoStr = common_vendor.index.getStorageSync("userInfo");
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        common_vendor.index.__f__("log", "at services/login.js:111", "getCurrentUser: 从userInfo获取用户:", user);
        return user;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:114", "解析userInfo失败:", e);
      }
    }
    const user_info = common_vendor.index.getStorageSync("user_info");
    if (user_info) {
      try {
        const user = typeof user_info === "string" ? JSON.parse(user_info) : user_info;
        common_vendor.index.__f__("log", "at services/login.js:123", "getCurrentUser: 从user_info获取用户:", user);
        return user;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:126", "解析user_info失败:", e);
      }
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at services/login.js:130", "获取用户信息失败", e);
  }
  const defaultUser = {
    _id: "10086420",
    id: "10086420",
    nickname: "绿色先锋",
    avatar: "/static/images/avatars/default-avatar.png",
    level: 4
  };
  common_vendor.index.__f__("log", "at services/login.js:141", "getCurrentUser: 返回默认用户:", defaultUser);
  return defaultUser;
};
const getCurrentUserFromProfile = () => {
  try {
    let userInfo = null;
    const profileUser = common_vendor.index.getStorageSync("profileUser");
    if (profileUser) {
      try {
        userInfo = typeof profileUser === "string" ? JSON.parse(profileUser) : profileUser;
        common_vendor.index.__f__("log", "at services/login.js:159", "getCurrentUserFromProfile: 从profileUser获取用户:", userInfo);
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:166", "解析profileUser失败:", e);
      }
    }
    const localUserInfo = common_vendor.index.getStorageSync("userInfo");
    if (localUserInfo) {
      try {
        userInfo = typeof localUserInfo === "string" ? JSON.parse(localUserInfo) : localUserInfo;
        common_vendor.index.__f__("log", "at services/login.js:175", "getCurrentUserFromProfile: 从userInfo获取用户:", userInfo);
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:182", "解析userInfo失败:", e);
      }
    }
    const userInfoStr = common_vendor.index.getStorageSync("user_info");
    if (userInfoStr) {
      try {
        userInfo = typeof userInfoStr === "string" ? JSON.parse(userInfoStr) : userInfoStr;
        common_vendor.index.__f__("log", "at services/login.js:191", "getCurrentUserFromProfile: 从user_info获取用户:", userInfo);
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:198", "解析user_info失败:", e);
      }
    }
    const memberInfo = common_vendor.index.getStorageSync("member_info");
    if (memberInfo) {
      try {
        userInfo = typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
        common_vendor.index.__f__("log", "at services/login.js:207", "getCurrentUserFromProfile: 从member_info获取用户:", userInfo);
        if (!userInfo._id && userInfo.id) {
          userInfo._id = userInfo.id;
        }
        return userInfo;
      } catch (e) {
        common_vendor.index.__f__("error", "at services/login.js:214", "解析member_info失败:", e);
      }
    }
    const defaultUser = {
      _id: "10086420",
      id: "10086420",
      nickname: "绿色先锋",
      avatar: "/static/images/avatars/default-avatar.png",
      level: 4,
      points: 1e3
    };
    common_vendor.index.__f__("log", "at services/login.js:227", "getCurrentUserFromProfile: 返回默认用户:", defaultUser);
    return defaultUser;
  } catch (error) {
    common_vendor.index.__f__("error", "at services/login.js:230", "获取用户信息失败", error);
    return {
      _id: "10086420",
      id: "10086420",
      nickname: "绿色先锋",
      avatar: "/static/images/avatars/default-avatar.png",
      level: 4,
      points: 1e3
    };
  }
};
const logout = () => {
  common_vendor.index.removeStorageSync("login_status");
  common_vendor.index.removeStorageSync("user_token");
  common_vendor.index.removeStorageSync("user_info");
};
exports.checkLoginStatus = checkLoginStatus;
exports.getCurrentUser = getCurrentUser;
exports.getCurrentUserFromProfile = getCurrentUserFromProfile;
exports.logout = logout;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/login.js.map
