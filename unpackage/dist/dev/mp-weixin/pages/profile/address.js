"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_address = require("../../services/address.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "address",
  setup(__props) {
    const addressList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasError = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const loadAddressList = async () => {
      loading.value = true;
      hasError.value = false;
      common_vendor.index.__f__("log", "at pages/profile/address.vue:105", "开始加载地址列表");
      try {
        const addresses = await services_address.getAddressList();
        common_vendor.index.__f__("log", "at pages/profile/address.vue:109", "获取到地址列表:", addresses);
        addressList.value = addresses;
        if (addresses.length === 0) {
          common_vendor.index.__f__("log", "at pages/profile/address.vue:113", "地址列表为空");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/address.vue:116", "加载地址列表失败:", error);
        hasError.value = true;
        errorMessage.value = error.message || "加载地址列表失败";
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const toggleDefault = async (index) => {
      if (addressList.value[index].isDefault) {
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "设置中..." });
        const address = { ...addressList.value[index] };
        address.isDefault = true;
        await services_address.saveAddress(address, true);
        addressList.value.forEach((item, i) => {
          item.isDefault = i === index;
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "设置默认地址成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/profile/address.vue:156", "设置默认地址失败:", error);
        common_vendor.index.showToast({
          title: "设置失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const editAddress = (index) => {
      if (!addressList.value[index]) {
        common_vendor.index.__f__("error", "at pages/profile/address.vue:168", "没有找到地址数据:", index);
        common_vendor.index.showToast({
          title: "地址数据不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/profile/address.vue:177", "原始地址数据:", addressList.value[index]);
      const addressData = {
        _id: addressList.value[index]._id,
        name: addressList.value[index].name,
        receiver: addressList.value[index].name,
        phone: addressList.value[index].phone,
        address: addressList.value[index].address,
        addall: addressList.value[index].address,
        region: addressList.value[index].region,
        add: addressList.value[index].region,
        isDefault: addressList.value[index].isDefault
      };
      common_vendor.index.setStorageSync("edit_address_data", addressData);
      common_vendor.index.__f__("log", "at pages/profile/address.vue:195", "已将地址信息保存到本地存储:", addressData);
      common_vendor.index.navigateTo({
        url: `/pages/profile/address-edit?index=${index}`
      });
    };
    const deleteAddress = async (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除该收货地址？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "删除中..." });
              const addressId = addressList.value[index]._id;
              await services_address.deleteAddress(addressId);
              addressList.value.splice(index, 1);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/profile/address.vue:226", "删除地址失败:", error);
              common_vendor.index.showToast({
                title: "删除失败，请稍后重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const navigateToAddAddress = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/address-edit"
      });
    };
    common_vendor.index.$on("addressUpdated", () => {
      common_vendor.index.__f__("log", "at pages/profile/address.vue:246", "收到地址更新事件，重新加载地址列表");
      loadAddressList();
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/profile/address.vue:251", "地址管理页面加载");
      loadAddressList();
      return () => {
        common_vendor.index.$off("addressUpdated");
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: addressList.value.length === 0
      }, addressList.value.length === 0 ? {
        d: common_assets._imports_0$6
      } : loading.value ? {} : hasError.value ? {
        g: common_vendor.t(errorMessage.value || "加载失败"),
        h: common_vendor.o(loadAddressList)
      } : {
        i: common_vendor.f(addressList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: common_vendor.t(item.phone),
            c: item.isDefault
          }, item.isDefault ? {} : {}, {
            d: common_vendor.t(item.region),
            e: common_vendor.t(item.address),
            f: item.isDefault
          }, item.isDefault ? {
            g: "47fa9c54-1-" + i0,
            h: common_vendor.p({
              name: "check-circle",
              size: "20",
              color: "#4CAF50"
            })
          } : {
            i: "47fa9c54-2-" + i0,
            j: common_vendor.p({
              name: "circle",
              size: "20",
              color: "#d1d5db"
            })
          }, {
            k: common_vendor.o(($event) => toggleDefault(index), index),
            l: "47fa9c54-3-" + i0,
            m: common_vendor.o(($event) => editAddress(index), index),
            n: "47fa9c54-4-" + i0,
            o: common_vendor.o(($event) => deleteAddress(index), index),
            p: index
          });
        }),
        j: common_vendor.p({
          name: "edit",
          size: "18",
          color: "#6b7280"
        }),
        k: common_vendor.p({
          name: "delete",
          size: "18",
          color: "#6b7280"
        })
      }, {
        e: loading.value,
        f: hasError.value,
        l: common_vendor.o(navigateToAddAddress)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/address.js.map
