"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_points = require("../../services/points.js");
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/images/user-avatar.jpg",
      nickname: "绿色先锋",
      level: 4,
      id: "10086420",
      ecoDays: 138,
      points: services_points.getCurrentPoints(),
      // 使用积分服务的同步方法获取初始值
      activities: 42,
      followers: 89
    });
    const chooseAvatar = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/edit"
      });
    };
    const navigateToEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/edit"
      });
    };
    const initUserInfo = async () => {
      const localUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (localUserInfo) {
        try {
          const parsedInfo = JSON.parse(localUserInfo);
          Object.assign(userInfo, parsedInfo);
          saveProfileUserInfo(userInfo);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/profile/profile.vue:240", "解析本地用户信息失败", e);
        }
      } else {
        common_vendor.nr.callFunction({
          name: "getProfile",
          data: { account: userInfo.account }
        }).then((res) => {
          if (res.result && res.result.code === 0 && res.result.data.userInfo) {
            const dbUserInfo = res.result.data.userInfo;
            userInfo.nickname = dbUserInfo.nickname || userInfo.nickname;
            userInfo.gender = dbUserInfo.gender || userInfo.gender;
            userInfo.avatar = dbUserInfo.avatar || userInfo.avatar;
            if (dbUserInfo.level)
              userInfo.level = dbUserInfo.level;
            if (dbUserInfo.id)
              userInfo.id = dbUserInfo.id;
            common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
            saveProfileUserInfo(userInfo);
          }
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/profile/profile.vue:266", "获取用户信息失败", err);
        });
      }
      await loadUserPoints();
    };
    const loadUserPoints = async () => {
      try {
        const result = await services_points.getUserPoints(true);
        if (result && result.success && result.data) {
          userInfo.points = result.data.points;
          common_vendor.index.__f__("log", "at pages/profile/profile.vue:281", "个人页面更新积分:", userInfo.points);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:284", "获取积分失败:", error);
      }
    };
    const saveProfileUserInfo = (userInfo2) => {
      try {
        const profileUser = {
          ...userInfo2,
          _id: userInfo2.id || "10086420",
          // 使用id作为_id
          id: userInfo2.id || "10086420"
        };
        common_vendor.index.setStorageSync("profileUser", JSON.stringify(profileUser));
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:300", "Saved user info to profileUser storage:", profileUser);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:302", "保存用户信息到profileUser失败:", error);
      }
    };
    const handleUserInfoUpdate = (updatedInfo) => {
      if (updatedInfo) {
        Object.assign(userInfo, updatedInfo);
        saveProfileUserInfo(userInfo);
      }
    };
    const handlePointsUpdate = (pointsData) => {
      if (pointsData && typeof pointsData.points !== "undefined") {
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:318", "收到积分更新事件:", pointsData);
        userInfo.points = pointsData.points;
      }
    };
    common_vendor.onMounted(() => {
      initUserInfo();
      saveProfileUserInfo(userInfo);
      common_vendor.index.$on("userInfoUpdated", handleUserInfoUpdate);
      common_vendor.index.$on("userPointsUpdated", handlePointsUpdate);
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.$off("userInfoUpdated", handleUserInfoUpdate);
      common_vendor.index.$off("userPointsUpdated", handlePointsUpdate);
    });
    const navigateToSettings = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings"
      });
    };
    const navigateToCheckinRecord = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/checkin-record"
      });
    };
    const navigateToAchievements = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/achievements"
      });
    };
    const navigateToOrders = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/orders"
      });
    };
    const navigateToFAQ = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/faq"
      });
    };
    const contactService = () => {
      common_vendor.index.showToast({
        title: "正在接入客服",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: userInfo.avatar || "/static/images/user-avatar.jpg",
        b: common_vendor.o(chooseAvatar),
        c: common_vendor.t(userInfo.nickname || "绿色先锋"),
        d: common_vendor.t(userInfo.level || 4),
        e: common_vendor.t(userInfo.id || "10086420"),
        f: common_vendor.o(navigateToEdit),
        g: common_vendor.t(userInfo.ecoDays || 138),
        h: common_vendor.t(userInfo.points || 485),
        i: common_vendor.t(userInfo.activities || 42),
        j: common_vendor.t(userInfo.followers || 89),
        k: common_assets._imports_0$4,
        l: common_vendor.o(navigateToCheckinRecord),
        m: common_assets._imports_1$6,
        n: common_vendor.o(navigateToAchievements),
        o: common_assets._imports_2$2,
        p: common_vendor.o(navigateToOrders),
        q: common_assets._imports_3$2,
        r: common_vendor.o(navigateToFAQ),
        s: common_assets._imports_4$2,
        t: common_vendor.o(contactService),
        v: common_assets._imports_5,
        w: common_vendor.o(navigateToSettings)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
