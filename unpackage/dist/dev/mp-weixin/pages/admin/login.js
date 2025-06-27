"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const username = common_vendor.ref("");
    const password = common_vendor.ref("");
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleLogin = () => {
      if (!username.value || !password.value) {
        common_vendor.index.showToast({
          title: "请输入账号和密码",
          icon: "none"
        });
        return;
      }
      if (username.value === "admin" && password.value === "1021101") {
        common_vendor.index.setStorageSync("admin_login_status", "loggedin");
        common_vendor.index.setStorageSync("admin_id", "admin");
        common_vendor.index.setStorageSync("admin_username", username.value);
        common_vendor.index.setStorageSync("admin_login_time", Date.now());
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success",
          duration: 1500
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/admin/dashboard"
          });
        }, 1500);
      } else {
        common_vendor.index.showToast({
          title: "账号或密码错误",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_assets._imports_1,
        d: username.value,
        e: common_vendor.o(($event) => username.value = $event.detail.value),
        f: password.value,
        g: common_vendor.o(($event) => password.value = $event.detail.value),
        h: !username.value || !password.value,
        i: !username.value || !password.value ? 1 : "",
        j: common_vendor.o(handleLogin)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/login.js.map
