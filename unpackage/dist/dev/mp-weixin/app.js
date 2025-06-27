"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const services_login = require("./services/login.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/admin/activity-list.js";
  "./pages/admin/activity-add.js";
  "./pages/admin/activity-edit.js";
  "./pages/admin/reward-list.js";
  "./pages/admin/reward-add.js";
  "./pages/admin/reward-edit.js";
  "./pages/admin/knowledge-list.js";
  "./pages/admin/knowledge-add.js";
  "./pages/admin/knowledge-edit.js";
  "./pages/home/knowledge-list.js";
  "./pages/home/knowledge-detail.js";
  "./pages/home/activity-list.js";
  "./pages/home/activity-detail.js";
  "./pages/index/index.js";
  "./pages/home/home.js";
  "./pages/community/community.js";
  "./pages/community/post-detail.js";
  "./pages/community/post-publish.js";
  "./pages/checkin/checkin.js";
  "./pages/mall/mall.js";
  "./pages/profile/profile.js";
  "./pages/profile/edit.js";
  "./pages/profile/settings.js";
  "./pages/profile/address.js";
  "./pages/profile/address-edit.js";
  "./pages/admin/login.js";
  "./pages/admin/dashboard.js";
  "./pages/admin/reset-points.js";
  "./pages/home/knowledge-static.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    const isLoggedIn = services_login.checkLoginStatus();
    if (!isLoggedIn) {
      common_vendor.index.redirectTo({
        url: "/pages/login/login"
      });
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:18", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:21", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  setTimeout(async () => {
    try {
      const redemptionsResult = await common_vendor.nr.callFunction({
        name: "emptyFunction"
      });
      common_vendor.index.__f__("log", "at main.js:71", "Vue3 - reward_redemptions集合初始化结果:", redemptionsResult);
      const specialInitResult = await common_vendor.nr.callFunction({
        name: "initRedemptionsCollection"
      });
      common_vendor.index.__f__("log", "at main.js:77", "Vue3 - 专用函数初始化结果:", specialInitResult);
      const allCollectionsResult = await common_vendor.nr.callFunction({
        name: "updateAllCollections"
      });
      common_vendor.index.__f__("log", "at main.js:83", "Vue3 - 所有集合初始化结果:", allCollectionsResult);
    } catch (error) {
      common_vendor.index.__f__("error", "at main.js:85", "Vue3 - 集合初始化失败，但应用已启动:", error);
    }
  }, 1e3);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
