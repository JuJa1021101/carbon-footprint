"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      phoneNumber: "18379364964"
      // 默认填入测试手机号
    };
  },
  methods: {
    // 直接导航到首页（手机号快捷登录）
    navigateToHome() {
      common_vendor.index.showToast({
        title: "登录成功",
        icon: "success",
        duration: 1500
      });
      common_vendor.index.setStorageSync("login_status", "loggedin");
      common_vendor.index.setStorageSync("user_token", "test_token");
      common_vendor.index.setStorageSync("user_info", JSON.stringify({
        account: "wx_user",
        avatar: "/static/images/avatars/default-avatar.png",
        id: 10086,
        mobile: "183****4964",
        nickname: "环保用户"
      }));
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      }, 1500);
    },
    // 处理模拟登录
    handleMockLogin() {
      common_vendor.index.showLoading({ title: "登录中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("login_status", "loggedin");
        common_vendor.index.setStorageSync("user_token", "test_token_" + Date.now());
        common_vendor.index.setStorageSync("user_info", JSON.stringify({
          account: "test_account",
          avatar: "/static/images/avatars/default-avatar.png",
          id: 10086420,
          mobile: "18379364964",
          nickname: "测试用户"
        }));
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_1,
    b: common_vendor.o((...args) => $options.navigateToHome && $options.navigateToHome(...args)),
    c: common_vendor.o((...args) => $options.handleMockLogin && $options.handleMockLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
