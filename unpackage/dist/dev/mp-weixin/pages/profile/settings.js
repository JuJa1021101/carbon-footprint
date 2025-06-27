"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_login = require("../../services/login.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "settings",
  setup(__props) {
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const navigateToAddressManage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/address"
      });
    };
    const navigateToAdminLogin = () => {
      common_vendor.index.getStorageSync("admin_login_status");
      common_vendor.index.navigateTo({
        url: "/pages/admin/login",
        success: () => {
          common_vendor.index.__f__("log", "at pages/profile/settings.vue:97", "成功导航到管理员登录页面");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/settings.vue:100", "导航到管理员登录页面失败:", err);
          common_vendor.index.redirectTo({
            url: "/pages/admin/login",
            fail: (redirectErr) => {
              common_vendor.index.__f__("error", "at pages/profile/settings.vue:105", "重定向到管理员登录页面也失败:", redirectErr);
              common_vendor.index.showToast({
                title: "页面跳转失败，请重试",
                icon: "none"
              });
            }
          });
        }
      });
    };
    const showLogoutConfirm = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认退出登录？",
        success: (res) => {
          if (res.confirm) {
            handleLogout();
          }
        }
      });
    };
    const handleLogout = () => {
      common_vendor.index.showLoading({
        title: "退出中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        services_login.logout();
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      }, 1e3);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/profile/settings.vue:150", "设置页面加载");
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "back",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: common_assets._imports_0$5,
        d: common_vendor.o(navigateToAddressManage),
        e: common_assets._imports_1$7,
        f: common_assets._imports_2$3,
        g: common_assets._imports_3$3,
        h: common_vendor.o(navigateToAdminLogin),
        i: common_vendor.o(showLogoutConfirm)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/settings.js.map
