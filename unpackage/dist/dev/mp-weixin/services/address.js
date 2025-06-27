"use strict";
const common_vendor = require("../common/vendor.js");
const services_login = require("./login.js");
const getAddressList = () => {
  return new Promise((resolve, reject) => {
    const currentUser = services_login.getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    common_vendor.index.__f__("log", "at services/address.js:16", "获取地址列表，用户ID:", userId);
    common_vendor.nr.callFunction({
      name: "getAddresses",
      data: {
        userId
      }
    }).then((res) => {
      var _a, _b;
      common_vendor.index.__f__("log", "at services/address.js:25", "getAddresses云函数返回结果:", res.result);
      if (res.result && res.result.success) {
        const addresses = res.result.data.map((addr) => ({
          _id: addr._id,
          name: addr.name || addr.receiver || "",
          phone: addr.phone || "",
          address: addr.address || addr.addall || "",
          region: addr.region || addr.add || "",
          isDefault: addr.is_default || addr.isDefault || false
        }));
        common_vendor.index.__f__("log", "at services/address.js:38", "处理后的地址列表:", addresses);
        resolve(addresses);
      } else {
        common_vendor.index.__f__("error", "at services/address.js:41", "获取地址列表失败:", ((_a = res.result) == null ? void 0 : _a.message) || "未知错误");
        reject(new Error(((_b = res.result) == null ? void 0 : _b.message) || "获取地址列表失败"));
      }
    }).catch((err) => {
      common_vendor.index.__f__("error", "at services/address.js:45", "获取地址列表失败:", err);
      reject(err);
    });
  });
};
const saveAddress = (address, isEdit = false) => {
  return new Promise((resolve, reject) => {
    const currentUser = services_login.getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    common_vendor.index.__f__("log", "at services/address.js:63", "保存地址，用户ID:", userId);
    common_vendor.index.__f__("log", "at services/address.js:64", "保存地址内容:", address);
    const addressData = {
      _id: isEdit ? address._id : void 0,
      receiver: address.receiver || address.name || "",
      phone: address.phone || "",
      add: address.add || address.region || "",
      addall: address.addall || address.address || "",
      isDefault: address.isDefault || false
    };
    common_vendor.index.__f__("log", "at services/address.js:76", "处理后的地址数据:", addressData);
    common_vendor.nr.callFunction({
      name: "saveAddress",
      data: {
        userId,
        address: addressData,
        isEdit
      }
    }).then((res) => {
      var _a, _b;
      common_vendor.index.__f__("log", "at services/address.js:87", "saveAddress云函数返回结果:", res.result);
      if (res.result && res.result.success) {
        resolve(res.result);
      } else {
        common_vendor.index.__f__("error", "at services/address.js:92", "保存地址失败:", ((_a = res.result) == null ? void 0 : _a.message) || "未知错误");
        reject(new Error(((_b = res.result) == null ? void 0 : _b.message) || "保存地址失败"));
      }
    }).catch((err) => {
      common_vendor.index.__f__("error", "at services/address.js:96", "保存地址失败:", err);
      reject(err);
    });
  });
};
const deleteAddress = (addressId) => {
  return new Promise((resolve, reject) => {
    const currentUser = services_login.getCurrentUserFromProfile();
    const userId = currentUser && currentUser._id ? currentUser._id : null;
    common_vendor.index.__f__("log", "at services/address.js:113", "删除地址，地址ID:", addressId);
    common_vendor.nr.callFunction({
      name: "deleteAddress",
      data: {
        userId,
        addressId
      }
    }).then((res) => {
      var _a, _b;
      common_vendor.index.__f__("log", "at services/address.js:123", "deleteAddress云函数返回结果:", res.result);
      if (res.result && res.result.success) {
        resolve(res.result);
      } else {
        common_vendor.index.__f__("error", "at services/address.js:128", "删除地址失败:", ((_a = res.result) == null ? void 0 : _a.message) || "未知错误");
        reject(new Error(((_b = res.result) == null ? void 0 : _b.message) || "删除地址失败"));
      }
    }).catch((err) => {
      common_vendor.index.__f__("error", "at services/address.js:132", "删除地址失败:", err);
      reject(err);
    });
  });
};
exports.deleteAddress = deleteAddress;
exports.getAddressList = getAddressList;
exports.saveAddress = saveAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/address.js.map
