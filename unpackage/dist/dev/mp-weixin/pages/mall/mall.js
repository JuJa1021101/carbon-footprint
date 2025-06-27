"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_login = require("../../services/login.js");
const services_mall = require("../../services/mall.js");
const services_points = require("../../services/points.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  (IconImage + _easycom_uni_popup)();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "mall",
  setup(__props) {
    const userPoints = common_vendor.ref(1e3);
    const monthPoints = common_vendor.ref(0);
    const redemptionCount = common_vendor.ref(0);
    const currentCategory = common_vendor.ref("全部");
    const allRewards = common_vendor.ref([]);
    const limitedTimeRewards = common_vendor.ref([]);
    const hotRewards = common_vendor.ref([]);
    const regularRewards = common_vendor.ref([]);
    const formatImageUrl = (url) => {
      if (!url)
        return "/static/images/mall/default-product.png";
      if (!url.startsWith("/") && !url.startsWith("http")) {
        return "/" + url;
      }
      return url;
    };
    const searchKeyword = common_vendor.ref("");
    const isSearchMode = common_vendor.ref(false);
    const searchResults = common_vendor.ref([]);
    const searchPage = common_vendor.ref(1);
    const searchPageSize = common_vendor.ref(20);
    const redemptionPopup = common_vendor.ref(null);
    const resultPopup = common_vendor.ref(null);
    const selectedReward = common_vendor.ref(null);
    const resultMessage = common_vendor.ref("");
    const isRedeeming = common_vendor.ref(false);
    const addresses = common_vendor.ref([]);
    const selectedAddressIndex = common_vendor.ref(0);
    const selectedAddress = common_vendor.ref(null);
    const addressChanged = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const loading = common_vendor.ref(true);
    const showUpdateTip = common_vendor.ref(false);
    const hasUpdates = common_vendor.ref(false);
    const displayedLimitedTimeRewards = common_vendor.computed(() => {
      return limitedTimeRewards.value.slice(0, 1);
    });
    const displayedHotRewards = common_vendor.computed(() => {
      return hotRewards.value.slice(0, 4);
    });
    const categoryRewards = common_vendor.computed(() => {
      if (currentCategory.value === "全部") {
        return regularRewards.value.slice(0, 4);
      } else if (currentCategory.value === "限时兑换") {
        return limitedTimeRewards.value;
      } else if (currentCategory.value === "热门") {
        return hotRewards.value;
      } else {
        return regularRewards.value.filter((item) => item.category === currentCategory.value).slice(0, 8);
      }
    });
    const addressOptions = common_vendor.computed(() => {
      return addresses.value.map((addr) => `${addr.name} ${addr.phone} - ${addr.address}`);
    });
    const getStockQuantity = (reward) => {
      if (!reward)
        return 0;
      const safeReward = services_mall.ensureStockQuantity(reward);
      return typeof safeReward.stock_quantity !== "undefined" ? safeReward.stock_quantity : typeof safeReward.stock !== "undefined" ? safeReward.stock : 0;
    };
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        if (isSearchMode.value) {
          exitSearch();
        }
        return;
      }
      isSearchMode.value = true;
      searchPage.value = 1;
      try {
        common_vendor.index.showLoading({ title: "搜索中..." });
        const result = await services_mall.searchRewards(searchKeyword.value, {
          page: searchPage.value,
          pageSize: searchPageSize.value
        });
        if (result.success) {
          searchResults.value = result.data.map((reward) => {
            const safeReward = services_mall.ensureStockQuantity(reward);
            if (safeReward.image_url) {
              safeReward.image_url = formatImageUrl(safeReward.image_url);
            }
            if (safeReward.image) {
              safeReward.image = formatImageUrl(safeReward.image);
            }
            return safeReward;
          });
          common_vendor.index.__f__("log", "at pages/mall/mall.vue:419", `搜索结果: 找到 ${result.data.length} 个商品`);
          searchResults.value.forEach((reward) => {
            common_vendor.index.__f__("log", "at pages/mall/mall.vue:423", `搜索商品[${reward.name}]图片路径: ${reward.image_url}`);
          });
        } else {
          searchResults.value = [];
          common_vendor.index.showToast({
            title: result.message || "搜索失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:433", "搜索失败", error);
        common_vendor.index.showToast({
          title: "搜索失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      if (isSearchMode.value) {
        exitSearch();
      }
    };
    const exitSearch = () => {
      isSearchMode.value = false;
      searchKeyword.value = "";
      searchResults.value = [];
    };
    const changeCategory = (category) => {
      currentCategory.value = category;
    };
    const viewMore = (category) => {
      if (category === "热门") {
        currentCategory.value = "热门";
        common_vendor.index.showToast({
          title: "已切换到热门兑换专区",
          icon: "none"
        });
      } else if (category === "限时兑换") {
        currentCategory.value = "限时兑换";
        common_vendor.index.showToast({
          title: "已切换到限时兑换专区",
          icon: "none"
        });
      } else {
        currentCategory.value = "全部";
        common_vendor.index.showToast({
          title: "已切换到积分兑换专区",
          icon: "none"
        });
      }
      common_vendor.index.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    };
    common_vendor.index.$on("addressUpdated", () => {
      loadAddresses();
      addressChanged.value = true;
    });
    common_vendor.onMounted(async () => {
      await loadUserPoints(true);
      try {
        await loadLimitedTimeRewards();
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:507", "已加载限时商品:", limitedTimeRewards.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:509", "加载限时商品失败:", error);
      }
      try {
        await Promise.all([
          loadAddresses(),
          loadAllRewards(),
          loadHotRewards(),
          loadRedemptionCount()
        ]);
        categorizeRewards();
        loading.value = false;
      } catch (loadError) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:525", "加载商品数据失败:", loadError);
        loading.value = false;
      }
      common_vendor.index.$on("userPointsUpdated", handlePointsUpdate);
      common_vendor.index.$on("rewardsUpdated", handleRewardsUpdate);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("userPointsUpdated", handlePointsUpdate);
      common_vendor.index.$off("rewardsUpdated", handleRewardsUpdate);
    });
    const handleRewardsUpdate = (updateData) => {
      common_vendor.index.__f__("log", "at pages/mall/mall.vue:544", "商城页面收到商品更新事件:", updateData);
      hasUpdates.value = true;
      showUpdateTip.value = true;
    };
    const handlePointsUpdate = (pointsData) => {
      if (pointsData && typeof pointsData.points !== "undefined") {
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:552", "商城页面收到积分更新事件:", pointsData);
        userPoints.value = pointsData.points;
      }
    };
    const loadUserPoints = async (force = false) => {
      try {
        try {
          const pointsStr = common_vendor.index.getStorageSync("user_points");
          if (!force && pointsStr) {
            const points = parseInt(pointsStr);
            common_vendor.index.__f__("log", "at pages/mall/mall.vue:565", "从本地存储获取积分:", points);
            userPoints.value = points;
            common_vendor.index.__f__("log", "at pages/mall/mall.vue:568", "从本地存储设置用户积分:", userPoints.value);
            services_points.updatePointsCache({ points });
            return;
          }
        } catch (localError) {
          common_vendor.index.__f__("error", "at pages/mall/mall.vue:576", "从本地存储获取积分失败:", localError);
        }
        const result = await services_mall.getUserPoints(force);
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:582", "获取积分结果:", result);
        if (result && result.success && result.data) {
          userPoints.value = result.data.points || 0;
          common_vendor.index.__f__("log", "at pages/mall/mall.vue:586", "用户积分:", userPoints.value);
          try {
            common_vendor.index.setStorageSync("user_points", userPoints.value.toString());
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/mall/mall.vue:592", "保存积分到本地存储失败:", e);
          }
        } else {
          common_vendor.index.__f__("warn", "at pages/mall/mall.vue:595", "获取积分失败，使用默认值或上次的值:", result == null ? void 0 : result.message);
          if (userPoints.value === void 0) {
            userPoints.value = 1e3;
            try {
              common_vendor.index.setStorageSync("user_points", "1000");
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/mall/mall.vue:605", "保存默认积分到本地存储失败:", e);
            }
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:610", "获取积分失败，使用默认值:", error);
        if (userPoints.value === void 0) {
          userPoints.value = 1e3;
          try {
            common_vendor.index.setStorageSync("user_points", "1000");
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/mall/mall.vue:619", "保存默认积分到本地存储失败:", e);
          }
        }
      }
    };
    const loadAddresses = async () => {
      try {
        const { result } = await common_vendor.nr.callFunction({
          name: "getAddresses"
        });
        if (result && result.success) {
          addresses.value = result.data || [];
          if (result.default_address) {
            selectedAddress.value = result.default_address;
            selectedAddressIndex.value = addresses.value.findIndex((addr) => addr._id === result.default_address._id);
            if (selectedAddressIndex.value < 0)
              selectedAddressIndex.value = 0;
          } else if (addresses.value.length > 0) {
            selectedAddress.value = addresses.value[0];
          }
          if (addressChanged.value && redemptionPopup.value) {
            addressChanged.value = false;
            if (addresses.value.length > 0) {
              setTimeout(() => {
                selectedAddress.value = addresses.value[0];
                redemptionPopup.value.open();
              }, 500);
            }
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:656", "获取地址失败", error);
      }
    };
    const loadAllRewards = async () => {
      try {
        const currentUser = services_login.getCurrentUserFromProfile();
        let userId = currentUser && currentUser._id ? currentUser._id : null;
        const { result } = await common_vendor.nr.callFunction({
          name: "getRewards",
          data: {
            userId,
            userPoints: userPoints.value
          }
        });
        if (result && result.success) {
          allRewards.value = (result.data || []).map((reward) => {
            const safeReward = services_mall.ensureStockQuantity(reward);
            if (safeReward.image_url) {
              safeReward.image_url = formatImageUrl(safeReward.image_url);
            }
            if (safeReward.image) {
              safeReward.image = formatImageUrl(safeReward.image);
            }
            return safeReward;
          });
          allRewards.value.forEach((reward) => {
            common_vendor.index.__f__("log", "at pages/mall/mall.vue:693", `商品[${reward.name}]图片路径: ${reward.image_url}`);
          });
          categorizeRewards();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:700", "获取所有商品失败", error);
      }
    };
    const loadHotRewards = async () => {
      try {
        const currentUser = services_login.getCurrentUserFromProfile();
        let userId = currentUser && currentUser._id ? currentUser._id : null;
        const hotResult = await common_vendor.nr.callFunction({
          name: "getHotRewards",
          data: {
            userId,
            userPoints: userPoints.value
          }
        });
        if (hotResult.result && hotResult.result.success) {
          hotRewards.value = (hotResult.result.data || []).map((reward) => {
            const safeReward = services_mall.ensureStockQuantity(reward);
            if (safeReward.image_url) {
              safeReward.image_url = formatImageUrl(safeReward.image_url);
            }
            if (safeReward.image) {
              safeReward.image = formatImageUrl(safeReward.image);
            }
            safeReward.is_hot = true;
            return safeReward;
          });
          categorizeRewards();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:740", "获取热门商品失败", error);
      }
    };
    const loadLimitedTimeRewards = async () => {
      try {
        const currentUser = services_login.getCurrentUserFromProfile();
        let userId = currentUser && currentUser._id ? currentUser._id : null;
        const limitedResult = await common_vendor.nr.callFunction({
          name: "getLimitedTimeRewards",
          data: {
            userId,
            userPoints: userPoints.value
          }
        });
        if (limitedResult.result && limitedResult.result.success) {
          limitedTimeRewards.value = (limitedResult.result.data || []).map((reward) => {
            const safeReward = services_mall.ensureStockQuantity(reward);
            if (safeReward.image_url) {
              safeReward.image_url = formatImageUrl(safeReward.image_url);
            }
            if (safeReward.image) {
              safeReward.image = formatImageUrl(safeReward.image);
            }
            safeReward.is_limited = true;
            return safeReward;
          });
          categorizeRewards();
          limitedTimeRewards.value.forEach((reward) => {
            common_vendor.index.__f__("log", "at pages/mall/mall.vue:781", `限时商品[${reward.name}]图片路径: ${reward.image_url}`);
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:785", "获取限时商品失败", error);
      }
    };
    const categorizeRewards = () => {
      const allRewardsMap = /* @__PURE__ */ new Map();
      allRewards.value.forEach((reward) => {
        allRewardsMap.set(reward._id, { ...reward });
      });
      hotRewards.value.forEach((reward) => {
        allRewardsMap.set(reward._id, { ...reward, is_hot: true });
      });
      limitedTimeRewards.value.forEach((reward) => {
        allRewardsMap.set(reward._id, { ...reward, is_limited: true, is_limited_time: true });
      });
      regularRewards.value = [];
      hotRewards.value = [];
      limitedTimeRewards.value = [];
      allRewardsMap.forEach((reward) => {
        if (reward.is_limited === true || reward.is_limited_time === true) {
          limitedTimeRewards.value.push(reward);
        } else if (reward.is_hot === true) {
          hotRewards.value.push(reward);
        } else {
          regularRewards.value.push(reward);
        }
      });
      const sortByPointsAndStock = (a, b) => {
        const aPoints = a.required_points || a.points || 0;
        const bPoints = b.required_points || b.points || 0;
        if (aPoints !== bPoints) {
          return aPoints - bPoints;
        }
        const aStock = a.stock_quantity || a.stock || 0;
        const bStock = b.stock_quantity || b.stock || 0;
        return bStock - aStock;
      };
      limitedTimeRewards.value.sort(sortByPointsAndStock);
      hotRewards.value.sort(sortByPointsAndStock);
      regularRewards.value.sort(sortByPointsAndStock);
      common_vendor.index.__f__("log", "at pages/mall/mall.vue:849", `商品分类完成: 限时(${limitedTimeRewards.value.length}), 热门(${hotRewards.value.length}), 普通(${regularRewards.value.length})`);
    };
    const loadRewards = async () => {
      try {
        await Promise.all([
          loadAllRewards(),
          loadHotRewards(),
          loadLimitedTimeRewards()
        ]);
        categorizeRewards();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:864", "加载商品数据失败:", error);
      }
    };
    const loadRedemptionCount = async () => {
      try {
        const currentUser = services_login.getCurrentUserFromProfile();
        let userId = currentUser && currentUser._id ? currentUser._id : null;
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:874", "从profile获取的用户ID (兑换记录):", userId);
        const { result } = await common_vendor.nr.callFunction({
          name: "getUserRedemptions",
          data: { userId }
        });
        if (result && result.success) {
          redemptionCount.value = (result.data || []).length;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:885", "获取兑换记录数量失败", error);
      }
    };
    const confirmRedemption = (reward) => {
      const safeReward = services_mall.ensureStockQuantity(reward);
      selectedReward.value = safeReward;
      if (addresses.value.length === 0) {
        goToAddAddress();
        return;
      }
      redemptionPopup.value.open();
    };
    const addressChange = (e) => {
      selectedAddressIndex.value = e.detail.value;
      selectedAddress.value = addresses.value[selectedAddressIndex.value];
    };
    const closePopup = () => {
      redemptionPopup.value.close();
    };
    const closeResultPopup = () => {
      resultPopup.value.close();
      loadUserPoints(true);
      loadRewards();
      loadRedemptionCount();
    };
    const goToAddAddress = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/address-edit"
      });
    };
    const redeemReward = async () => {
      if (!selectedAddress.value) {
        resultMessage.value = "请选择收货地址";
        redemptionPopup.value.close();
        resultPopup.value.open();
        return;
      }
      isRedeeming.value = true;
      try {
        const userId = "10086420";
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:945", "兑换商品使用用户ID:", userId);
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        const rewardId = selectedReward.value._id;
        const addressId = selectedAddress.value._id;
        const pointsRequired = selectedReward.value.required_points || selectedReward.value.points || 0;
        if (selectedReward.value.status !== "available") {
          common_vendor.index.__f__("error", "at pages/mall/mall.vue:957", "商品状态不可兑换:", selectedReward.value.status);
          redemptionPopup.value.close();
          resultMessage.value = selectedReward.value.status === "unavailable" ? "积分不足" : "商品已售罄";
          resultPopup.value.open();
          isRedeeming.value = false;
          return;
        }
        const currentStock = getStockQuantity(selectedReward.value);
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:967", "兑换前再次检查库存:", currentStock);
        if (currentStock <= 0) {
          common_vendor.index.__f__("error", "at pages/mall/mall.vue:969", "商品库存不足");
          redemptionPopup.value.close();
          resultMessage.value = "商品已售罄";
          resultPopup.value.open();
          isRedeeming.value = false;
          return;
        }
        const originalPoints = userPoints.value;
        const originalStock = getStockQuantity(selectedReward.value);
        userPoints.value = Math.max(0, userPoints.value - pointsRequired);
        if (selectedReward.value.stock_quantity !== void 0) {
          selectedReward.value.stock_quantity = Math.max(0, selectedReward.value.stock_quantity - 1);
        } else if (selectedReward.value.stock !== void 0) {
          selectedReward.value.stock = Math.max(0, selectedReward.value.stock - 1);
        }
        redemptionPopup.value.close();
        common_vendor.index.showLoading({ title: "处理中..." });
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:994", "发送兑换请求:", {
          userId,
          rewardId,
          addressId,
          reward: {
            name: selectedReward.value.name,
            stock: selectedReward.value.stock,
            stock_quantity: selectedReward.value.stock_quantity,
            status: selectedReward.value.status
          }
        });
        const { result } = await common_vendor.nr.callFunction({
          name: "redeemRewardDirect",
          data: {
            userId,
            rewardId,
            addressId
          }
        });
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/mall/mall.vue:1017", "直接兑换结果:", result);
        if (result && result.success) {
          if (result.data && result.data.remaining_points !== void 0) {
            userPoints.value = result.data.remaining_points;
            services_points.updatePointsCache({ points: result.data.remaining_points });
            try {
              common_vendor.index.setStorageSync("user_points", result.data.remaining_points.toString());
              common_vendor.index.__f__("log", "at pages/mall/mall.vue:1030", "兑换后更新本地积分存储:", result.data.remaining_points);
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/mall/mall.vue:1032", "保存积分到本地存储失败:", e);
            }
          }
          resultMessage.value = "兑换成功";
          resultPopup.value.open();
          setTimeout(() => {
            loadUserPoints(true);
            loadRewards();
            loadRedemptionCount();
          }, 1e3);
        } else {
          userPoints.value = originalPoints;
          if (selectedReward.value.stock_quantity !== void 0) {
            selectedReward.value.stock_quantity = originalStock;
          } else if (selectedReward.value.stock !== void 0) {
            selectedReward.value.stock = originalStock;
          }
          resultMessage.value = (result == null ? void 0 : result.message) || "兑换失败，请稍后重试";
          resultPopup.value.open();
          setTimeout(() => {
            loadRewards();
          }, 500);
        }
        isRedeeming.value = false;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:1065", "兑换过程中发生错误:", error);
        common_vendor.index.hideLoading();
        isRedeeming.value = false;
        resultMessage.value = "兑换失败，请稍后重试";
        resultPopup.value.open();
        setTimeout(() => {
          loadUserPoints(true);
          loadRewards();
          loadRedemptionCount();
        }, 1e3);
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      try {
        await refreshData();
      } finally {
        setTimeout(() => {
          refreshing.value = false;
        }, 500);
      }
    };
    const forceRefresh = async () => {
      loading.value = true;
      await refreshData();
      loading.value = false;
    };
    const refreshData = async () => {
      showUpdateTip.value = false;
      hasUpdates.value = false;
      try {
        await loadUserPoints(true);
        await loadRewards();
        await loadAddresses();
        await loadRedemptionCount();
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:1120", "刷新数据失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败，请稍后再试",
          icon: "none",
          duration: 2e3
        });
      }
    };
    const onLoadMore = () => {
      common_vendor.index.__f__("log", "at pages/mall/mall.vue:1132", "滚动到底部，可以加载更多");
    };
    const handleImageError = (e) => {
      const originalSrc = e.target.src;
      common_vendor.index.__f__("log", "at pages/mall/mall.vue:1139", "图片加载失败:", originalSrc);
      try {
        let newSrc = originalSrc;
        if (originalSrc && !originalSrc.startsWith("/") && !originalSrc.startsWith("http")) {
          newSrc = "/" + originalSrc;
          common_vendor.index.__f__("log", "at pages/mall/mall.vue:1148", "尝试添加前导斜杠修复路径:", newSrc);
        } else if (originalSrc && originalSrc.startsWith("//")) {
          newSrc = originalSrc.substring(1);
          common_vendor.index.__f__("log", "at pages/mall/mall.vue:1153", "尝试移除多余斜杠修复路径:", newSrc);
        }
        if (newSrc !== originalSrc) {
          e.target.src = newSrc;
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mall/mall.vue:1162", "修复图片路径失败:", error);
      }
      e.target.src = "/static/images/mall/default-product.png";
      common_vendor.index.__f__("log", "at pages/mall/mall.vue:1167", "使用默认图片替换");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(forceRefresh),
        b: redemptionCount.value > 0
      }, redemptionCount.value > 0 ? {
        c: common_vendor.t(redemptionCount.value)
      } : {}, {
        d: common_assets._imports_0$3,
        e: common_vendor.o(handleSearch),
        f: common_vendor.o(handleSearch),
        g: searchKeyword.value,
        h: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        i: searchKeyword.value
      }, searchKeyword.value ? {
        j: common_assets._imports_1$2,
        k: common_vendor.o(clearSearch)
      } : {}, {
        l: isSearchMode.value
      }, isSearchMode.value ? {
        m: common_vendor.t(searchKeyword.value),
        n: common_vendor.t(searchResults.value.length),
        o: common_vendor.o(exitSearch)
      } : {}, {
        p: common_vendor.t(userPoints.value),
        q: common_vendor.t(monthPoints.value),
        r: showUpdateTip.value
      }, showUpdateTip.value ? {
        s: common_vendor.o(refreshData)
      } : {}, {
        t: !isSearchMode.value
      }, !isSearchMode.value ? {
        v: currentCategory.value === "全部" ? 1 : "",
        w: common_vendor.o(($event) => changeCategory("全部")),
        x: currentCategory.value === "热门" ? 1 : "",
        y: common_vendor.o(($event) => changeCategory("热门")),
        z: currentCategory.value === "限时兑换" ? 1 : "",
        A: common_vendor.o(($event) => changeCategory("限时兑换")),
        B: currentCategory.value === "环保用品" ? 1 : "",
        C: common_vendor.o(($event) => changeCategory("环保用品")),
        D: currentCategory.value === "绿植花卉" ? 1 : "",
        E: common_vendor.o(($event) => changeCategory("绿植花卉")),
        F: currentCategory.value === "优惠券" ? 1 : "",
        G: common_vendor.o(($event) => changeCategory("优惠券"))
      } : {}, {
        H: isSearchMode.value
      }, isSearchMode.value ? common_vendor.e({
        I: searchResults.value.length === 0
      }, searchResults.value.length === 0 ? {} : {
        J: common_vendor.f(searchResults.value, (reward, index, i0) => {
          return common_vendor.e({
            a: formatImageUrl(reward.image_url) || formatImageUrl(reward.image),
            b: reward.name,
            c: common_vendor.o(handleImageError, reward._id),
            d: common_vendor.t(reward.required_points || reward.points),
            e: common_vendor.t(reward.name),
            f: common_vendor.t(getStockQuantity(reward)),
            g: reward.status === "available"
          }, reward.status === "available" ? {
            h: common_vendor.o(($event) => confirmRedemption(reward), reward._id)
          } : reward.status === "unavailable" ? {} : {}, {
            i: reward.status === "unavailable",
            j: reward._id
          });
        })
      }) : common_vendor.e({
        K: limitedTimeRewards.value.length > 0
      }, limitedTimeRewards.value.length > 0 ? {
        L: common_vendor.o(($event) => viewMore("限时兑换")),
        M: common_vendor.p({
          name: "right",
          size: "12"
        }),
        N: common_vendor.f(displayedLimitedTimeRewards.value, (reward, index, i0) => {
          return common_vendor.e({
            a: formatImageUrl(reward.image_url) || formatImageUrl(reward.image),
            b: reward.name,
            c: common_vendor.o(handleImageError, reward._id),
            d: common_vendor.t(reward.required_points || reward.points),
            e: common_vendor.t(reward.name),
            f: reward.description
          }, reward.description ? {
            g: common_vendor.t(reward.description)
          } : {}, {
            h: common_vendor.t(getStockQuantity(reward)),
            i: reward.remaining_time
          }, reward.remaining_time ? {
            j: common_vendor.t(reward.remaining_time.text || "0天0小时")
          } : {}, {
            k: reward.status === "available"
          }, reward.status === "available" ? {
            l: common_vendor.o(($event) => confirmRedemption(reward), reward._id)
          } : reward.status === "unavailable" ? {} : {}, {
            m: reward.status === "unavailable",
            n: reward._id
          });
        })
      } : {}, {
        O: hotRewards.value.length > 0
      }, hotRewards.value.length > 0 ? {
        P: common_vendor.o(($event) => viewMore("热门")),
        Q: common_vendor.p({
          name: "right",
          size: "12"
        }),
        R: common_vendor.f(displayedHotRewards.value, (reward, index, i0) => {
          return common_vendor.e({
            a: formatImageUrl(reward.image_url) || formatImageUrl(reward.image),
            b: reward.name,
            c: common_vendor.o(handleImageError, reward._id),
            d: common_vendor.t(reward.required_points || reward.points),
            e: common_vendor.t(reward.name),
            f: common_vendor.t(getStockQuantity(reward)),
            g: reward.status === "available"
          }, reward.status === "available" ? {
            h: common_vendor.o(($event) => confirmRedemption(reward), reward._id)
          } : reward.status === "unavailable" ? {} : {}, {
            i: reward.status === "unavailable",
            j: reward._id
          });
        })
      } : {}, {
        S: categoryRewards.value.length > 0
      }, categoryRewards.value.length > 0 ? {
        T: common_vendor.o(($event) => viewMore("全部")),
        U: common_vendor.p({
          name: "right",
          size: "12"
        }),
        V: common_vendor.f(categoryRewards.value, (reward, index, i0) => {
          return common_vendor.e({
            a: formatImageUrl(reward.image_url) || formatImageUrl(reward.image),
            b: reward.name,
            c: common_vendor.o(handleImageError, reward._id),
            d: common_vendor.t(reward.required_points || reward.points),
            e: common_vendor.t(reward.name),
            f: common_vendor.t(getStockQuantity(reward)),
            g: reward.status === "available"
          }, reward.status === "available" ? {
            h: common_vendor.o(($event) => confirmRedemption(reward), reward._id)
          } : reward.status === "unavailable" ? {} : {}, {
            i: reward.status === "unavailable",
            j: reward._id
          });
        })
      } : {}), {
        W: loading.value
      }, loading.value ? {} : {}, {
        X: refreshing.value,
        Y: common_vendor.o(onRefresh),
        Z: common_vendor.o(onLoadMore),
        aa: selectedReward.value
      }, selectedReward.value ? common_vendor.e({
        ab: formatImageUrl(selectedReward.value.image_url) || formatImageUrl(selectedReward.value.image),
        ac: common_vendor.t(selectedReward.value.name),
        ad: common_vendor.t(selectedReward.value.required_points || selectedReward.value.points),
        ae: common_vendor.t(userPoints.value),
        af: common_vendor.t(userPoints.value - (selectedReward.value.required_points || selectedReward.value.points || 0)),
        ag: addresses.value.length > 0
      }, addresses.value.length > 0 ? common_vendor.e({
        ah: selectedAddress.value
      }, selectedAddress.value ? {
        ai: common_vendor.t(selectedAddress.value.name),
        aj: common_vendor.t(selectedAddress.value.phone),
        ak: common_vendor.t(selectedAddress.value.address)
      } : {}, {
        al: common_vendor.o(addressChange),
        am: selectedAddressIndex.value,
        an: addressOptions.value
      }) : {
        ao: common_vendor.o(goToAddAddress)
      }) : {}, {
        ap: common_vendor.o(closePopup),
        aq: common_vendor.o(redeemReward),
        ar: !selectedAddress.value || isRedeeming.value,
        as: common_vendor.sr(redemptionPopup, "365a90f7-3", {
          "k": "redemptionPopup"
        }),
        at: common_vendor.p({
          type: "center"
        }),
        av: common_vendor.t(resultMessage.value),
        aw: common_vendor.o(closeResultPopup),
        ax: common_vendor.sr(resultPopup, "365a90f7-4", {
          "k": "resultPopup"
        }),
        ay: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mall/mall.js.map
