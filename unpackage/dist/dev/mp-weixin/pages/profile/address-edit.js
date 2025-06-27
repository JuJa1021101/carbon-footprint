"use strict";
const common_vendor = require("../../common/vendor.js");
const services_address = require("../../services/address.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "address-edit",
  setup(__props) {
    const isEdit = common_vendor.ref(false);
    const editIndex = common_vendor.ref(-1);
    const addressForm = common_vendor.reactive({
      _id: "",
      receiver: "",
      phone: "",
      add: "",
      // 所在地区
      addall: "",
      // 详细地址
      isDefault: false
    });
    const regionArray = common_vendor.ref(["", "", ""]);
    const fromMall = common_vendor.ref(false);
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const regionChange = (e) => {
      const regions = e.detail.value;
      regionArray.value = regions;
      addressForm.add = regions.join(" ");
    };
    const toggleDefault = () => {
      addressForm.isDefault = !addressForm.isDefault;
    };
    const saveAddressData = async () => {
      common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:113", "提交前的表单数据:", JSON.parse(JSON.stringify(addressForm)));
      if (!addressForm.receiver.trim()) {
        return common_vendor.index.showToast({ title: "请输入收货人姓名", icon: "none" });
      }
      if (!addressForm.phone.trim() || addressForm.phone.length !== 11) {
        return common_vendor.index.showToast({ title: "请输入正确的手机号码", icon: "none" });
      }
      if (!addressForm.add) {
        return common_vendor.index.showToast({ title: "请选择所在地区", icon: "none" });
      }
      if (!addressForm.addall.trim()) {
        return common_vendor.index.showToast({ title: "请输入详细地址", icon: "none" });
      }
      common_vendor.index.showLoading({ title: "保存中..." });
      try {
        const addressData = {
          _id: isEdit.value ? addressForm._id : void 0,
          receiver: addressForm.receiver,
          phone: addressForm.phone,
          add: addressForm.add,
          addall: addressForm.addall,
          isDefault: addressForm.isDefault,
          name: addressForm.receiver,
          // 兼容字段
          address: addressForm.addall,
          // 兼容字段
          region: addressForm.add,
          // 兼容字段
          is_default: addressForm.isDefault
          // 兼容字段
        };
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:147", "要保存的地址数据:", addressData);
        await services_address.saveAddress(addressData, isEdit.value);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: isEdit.value ? "修改成功" : "添加成功",
          icon: "success",
          duration: 1500,
          success: () => {
            common_vendor.index.$emit("addressUpdated");
            setTimeout(() => {
              common_vendor.index.navigateBack({
                delta: 1,
                success: () => {
                  if (fromMall.value) {
                  }
                }
              });
            }, 500);
          }
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "保存失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/profile/address-edit.vue:180", "保存地址失败：", error);
      }
    };
    const getAddressFromUrl = () => {
      try {
        const pages = getCurrentPages();
        const page = pages[pages.length - 1];
        if (page && page.$page && page.$page.fullPath) {
          const fullPath = page.$page.fullPath;
          common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:191", "当前页面路径:", fullPath);
          const urlParams = new URLSearchParams(fullPath.split("?")[1]);
          const addressParam = urlParams.get("address");
          common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:196", "URL中的address参数:", addressParam ? "...(数据太长省略)" : void 0);
          if (addressParam) {
            const decodedAddress = decodeURIComponent(addressParam);
            common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:200", "解码后的地址数据长度:", decodedAddress.length);
            return JSON.parse(decodedAddress);
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile/address-edit.vue:205", "从URL解析地址数据失败:", e);
      }
      return null;
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:211", "地址编辑页面加载");
      const storedAddress = common_vendor.index.getStorageSync("edit_address_data");
      if (storedAddress) {
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:216", "从本地存储获取到地址数据:", storedAddress);
        isEdit.value = true;
        addressForm._id = storedAddress._id || "";
        addressForm.receiver = storedAddress.receiver || storedAddress.name || "";
        addressForm.phone = storedAddress.phone || "";
        addressForm.add = storedAddress.add || storedAddress.region || "";
        addressForm.addall = storedAddress.addall || storedAddress.address || "";
        addressForm.isDefault = storedAddress.isDefault || false;
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:228", "填充后的表单数据:", JSON.parse(JSON.stringify(addressForm)));
        if (addressForm.add) {
          regionArray.value = addressForm.add.split(" ");
          common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:233", "设置后的地区数组:", regionArray.value);
        }
        common_vendor.index.removeStorageSync("edit_address_data");
        return;
      }
      const addressData = getAddressFromUrl();
      if (addressData) {
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:245", "从URL成功解析地址数据:", addressData);
        isEdit.value = true;
        addressForm._id = addressData._id || "";
        addressForm.receiver = addressData.receiver || addressData.name || "";
        addressForm.phone = addressData.phone || "";
        addressForm.add = addressData.add || addressData.region || "";
        addressForm.addall = addressData.addall || addressData.address || "";
        addressForm.isDefault = addressData.isDefault || false;
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:257", "填充后的表单数据:", JSON.parse(JSON.stringify(addressForm)));
        if (addressForm.add) {
          regionArray.value = addressForm.add.split(" ");
          common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:262", "设置后的地区数组:", regionArray.value);
        }
        return;
      }
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.$page && currentPage.$page.options) {
        const { address, index, from } = currentPage.$page.options;
        common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:275", "获取到页面参数:", { address: address ? "...(数据太长省略)" : void 0, index, from });
        if (from === "mall") {
          fromMall.value = true;
        }
        if (index !== void 0 && !address) {
          isEdit.value = true;
          editIndex.value = parseInt(index);
        }
        if (address && index !== void 0) {
          isEdit.value = true;
          editIndex.value = parseInt(index);
          try {
            const addressData2 = JSON.parse(decodeURIComponent(address));
            common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:294", "解析后的地址数据:", addressData2);
            addressForm._id = addressData2._id || "";
            addressForm.receiver = addressData2.name || addressData2.receiver || "";
            addressForm.phone = addressData2.phone || "";
            addressForm.add = addressData2.region || addressData2.add || "";
            addressForm.addall = addressData2.address || addressData2.addall || "";
            addressForm.isDefault = addressData2.isDefault || false;
            common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:304", "填充后的表单数据:", JSON.parse(JSON.stringify(addressForm)));
            if (addressForm.add) {
              regionArray.value = addressForm.add.split(" ");
              common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:309", "设置后的地区数组:", regionArray.value);
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/profile/address-edit.vue:312", "解析地址数据出错", e);
            common_vendor.index.showToast({
              title: "加载地址信息失败",
              icon: "none"
            });
          }
        }
      }
      if (isEdit.value && addressForm._id) {
        common_vendor.index.showLoading({ title: "加载中..." });
        common_vendor.nr.callFunction({
          name: "getAddresses"
        }).then((res) => {
          common_vendor.index.hideLoading();
          if (res.result && res.result.success) {
            const addresses = res.result.data || [];
            const address = addresses.find((addr) => addr._id === addressForm._id);
            if (address) {
              addressForm.receiver = address.name || address.receiver || "";
              addressForm.phone = address.phone || "";
              addressForm.add = address.region || address.add || "";
              addressForm.addall = address.address || address.addall || "";
              addressForm.isDefault = address.isDefault || address.is_default || false;
              common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:342", "从数据库获取的地址数据:", address);
              common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:343", "更新后的表单数据:", JSON.parse(JSON.stringify(addressForm)));
              if (addressForm.add) {
                regionArray.value = addressForm.add.split(" ");
                common_vendor.index.__f__("log", "at pages/profile/address-edit.vue:348", "更新后的地区数组:", regionArray.value);
              }
            }
          }
        }).catch((err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/profile/address-edit.vue:354", "获取地址信息失败", err);
          common_vendor.index.showToast({
            title: "加载地址信息失败",
            icon: "none"
          });
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.t(isEdit.value ? "编辑地址" : "新增地址"),
        d: addressForm.receiver,
        e: common_vendor.o(($event) => addressForm.receiver = $event.detail.value),
        f: addressForm.phone,
        g: common_vendor.o(($event) => addressForm.phone = $event.detail.value),
        h: addressForm.add
      }, addressForm.add ? {
        i: common_vendor.t(addressForm.add)
      } : {}, {
        j: regionArray.value,
        k: common_vendor.o(regionChange),
        l: addressForm.addall,
        m: common_vendor.o(($event) => addressForm.addall = $event.detail.value),
        n: addressForm.isDefault
      }, addressForm.isDefault ? {
        o: common_vendor.p({
          name: "check-circle",
          size: "20",
          color: "#4CAF50"
        })
      } : {
        p: common_vendor.p({
          name: "circle",
          size: "20",
          color: "#d1d5db"
        })
      }, {
        q: common_vendor.o(toggleDefault),
        r: common_vendor.o(saveAddressData)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/address-edit.js.map
