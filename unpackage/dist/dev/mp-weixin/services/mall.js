"use strict";
const common_vendor = require("../common/vendor.js");
const services_login = require("./login.js");
const services_points = require("./points.js");
const searchRewards = (query, options = {}) => {
  return new Promise(async (resolve) => {
    try {
      const currentUser = services_login.getCurrentUserFromProfile();
      let userId = currentUser && currentUser._id ? currentUser._id : null;
      common_vendor.index.__f__("log", "at services/mall.js:18", "Search rewards with query:", query, "userId:", userId);
      const { result } = await common_vendor.nr.callFunction({
        name: "searchRewards",
        data: {
          query,
          userId,
          ...options
        }
      });
      if (result && result.success) {
        const safeData = (result.data || []).map((reward) => ensureStockQuantity(reward));
        resolve({
          success: true,
          data: safeData,
          total: result.total || 0
        });
      } else {
        resolve({
          success: false,
          message: (result == null ? void 0 : result.message) || "搜索失败",
          data: []
        });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at services/mall.js:48", "搜索奖品失败:", error);
      resolve({
        success: false,
        message: "搜索失败，请稍后重试",
        data: []
      });
    }
  });
};
const getUserPoints = (forceRefresh = false) => {
  return new Promise((resolve) => {
    try {
      const pointsStr = common_vendor.index.getStorageSync("user_points");
      if (pointsStr) {
        const points = parseInt(pointsStr);
        common_vendor.index.__f__("log", "at services/mall.js:70", "mall.js - 从本地存储获取积分:", points);
        services_points.updatePointsCache({ points });
        resolve({
          success: true,
          data: { points },
          source: "local"
        });
        return;
      }
      services_points.getUserPoints(forceRefresh).then((result) => {
        if (result && result.success && result.data && result.data.points) {
          try {
            common_vendor.index.setStorageSync("user_points", result.data.points.toString());
            common_vendor.index.__f__("log", "at services/mall.js:89", "mall.js - 保存服务获取的积分到本地:", result.data.points);
          } catch (e) {
            common_vendor.index.__f__("error", "at services/mall.js:91", "保存积分到本地存储失败:", e);
          }
        }
        resolve(result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at services/mall.js:96", "获取积分服务失败:", err);
        resolve({
          success: false,
          message: "获取积分失败",
          data: { points: 1e3 }
        });
      });
    } catch (error) {
      common_vendor.index.__f__("error", "at services/mall.js:104", "获取用户积分失败:", error);
      resolve({
        success: false,
        message: "获取积分失败，使用默认值",
        data: { points: 1e3 }
      });
    }
  });
};
const ensureStockQuantity = (reward) => {
  if (!reward)
    return {};
  const safeReward = { ...reward };
  common_vendor.index.__f__("log", "at services/mall.js:126", "原始商品数据库存信息:", {
    name: safeReward.name,
    stock: safeReward.stock,
    stock_quantity: safeReward.stock_quantity,
    status: safeReward.status
  });
  if (safeReward.stock !== void 0 && safeReward.stock_quantity === void 0) {
    safeReward.stock_quantity = safeReward.stock;
  }
  if (safeReward.points !== void 0 && safeReward.required_points === void 0) {
    safeReward.required_points = safeReward.points;
  }
  if (safeReward.image !== void 0 && safeReward.image_url === void 0) {
    safeReward.image_url = safeReward.image;
  }
  let stockQuantity = 0;
  if (safeReward.stock_quantity !== void 0 && safeReward.stock_quantity !== null) {
    const parsedStock = Number(safeReward.stock_quantity);
    stockQuantity = !isNaN(parsedStock) ? parsedStock : 0;
    safeReward.stock_quantity = stockQuantity;
  }
  if (safeReward.stock !== void 0 && safeReward.stock !== null) {
    const parsedStock = Number(safeReward.stock);
    const stockValue = !isNaN(parsedStock) ? parsedStock : 0;
    safeReward.stock = stockValue;
    if (safeReward.stock_quantity === void 0) {
      safeReward.stock_quantity = stockValue;
      stockQuantity = stockValue;
    }
  }
  if (safeReward.status === "sold_out") {
    safeReward.status = "soldout";
  }
  if (stockQuantity <= 0 && safeReward.status !== "unavailable") {
    safeReward.status = "soldout";
    common_vendor.index.__f__("log", "at services/mall.js:178", `商品[${safeReward.name}]库存为0，设置状态为已售罄`);
  }
  if ((safeReward.status === "soldout" || safeReward.status === "sold_out") && stockQuantity > 0) {
    common_vendor.index.__f__("log", "at services/mall.js:183", `警告: 商品[${safeReward.name}]状态为已售罄，但库存为${stockQuantity}`);
  }
  common_vendor.index.__f__("log", "at services/mall.js:187", "处理后商品数据库存信息:", {
    name: safeReward.name,
    stock: safeReward.stock,
    stock_quantity: safeReward.stock_quantity,
    status: safeReward.status
  });
  return safeReward;
};
const getAllRewards = async () => {
  try {
    const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
    if (adminLoginStatus !== "loggedin") {
      common_vendor.index.__f__("warn", "at services/mall.js:206", "管理员未登录，但仍尝试获取商品列表");
    }
    const { result } = await common_vendor.nr.callFunction({
      name: "getRewards",
      data: { showAll: true }
    });
    if (result && result.success) {
      const rewards = result.data.map((reward) => {
        let imageUrl = reward.image_url || "";
        if (!imageUrl || imageUrl === "undefined") {
          common_vendor.index.__f__("warn", "at services/mall.js:223", `商品[${reward.name}]无图片路径，使用默认图片`);
          imageUrl = "/static/images/mall/default-product.png";
        } else if (!imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
          common_vendor.index.__f__("log", "at services/mall.js:228", `修正商品[${reward.name}]图片路径: ${imageUrl} -> /${imageUrl}`);
          imageUrl = "/" + imageUrl;
        }
        reward.image_url = imageUrl;
        if (reward.stock !== void 0 && reward.stock_quantity === void 0) {
          reward.stock_quantity = reward.stock;
        }
        if (reward.points !== void 0 && reward.required_points === void 0) {
          reward.required_points = reward.points;
        }
        common_vendor.index.__f__("log", "at services/mall.js:245", `处理后的商品[${reward.name}]图片路径: ${reward.image_url}`);
        return reward;
      });
      return rewards;
    } else {
      common_vendor.index.__f__("error", "at services/mall.js:251", "获取商品列表失败:", result == null ? void 0 : result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/mall.js:255", "获取商品列表出错:", error);
    return [];
  }
};
const uploadImageToStatic = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      common_vendor.index.__f__("log", "at services/mall.js:280", "开始上传图片，临时路径:", filePath);
      common_vendor.index.showLoading({ title: "上传中..." });
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);
      const fileName = `product_${timestamp}_${randomStr}.${fileExtension}`;
      try {
        const timeout = setTimeout(() => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("warn", "at services/mall.js:294", "图片上传处理超时，使用默认图片");
          resolve("static/images/mall/default-product.png");
        }, 3e4);
        const fileContent = common_vendor.index.getFileSystemManager().readFileSync(filePath, "base64");
        common_vendor.nr.callFunction({
          name: "saveFileToStatic",
          data: {
            fileContent,
            fileName
          },
          timeout: 3e4,
          // 30秒超时
          success: (res) => {
            clearTimeout(timeout);
            common_vendor.index.hideLoading();
            if (res.result && res.result.success) {
              const staticPath = res.result.data.url;
              common_vendor.index.__f__("log", "at services/mall.js:315", "图片上传成功，数据库路径:", staticPath);
              resolve(staticPath);
            } else {
              common_vendor.index.__f__("error", "at services/mall.js:318", "保存到云端失败:", res.result);
              resolve("static/images/mall/default-product.png");
            }
          },
          fail: (err) => {
            clearTimeout(timeout);
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at services/mall.js:326", "调用云函数失败:", err);
            resolve("static/images/mall/default-product.png");
          }
        });
      } catch (readError) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at services/mall.js:333", "读取文件失败:", readError);
        resolve("static/images/mall/default-product.png");
      }
    } catch (error) {
      common_vendor.index.hideLoading();
      common_vendor.index.__f__("error", "at services/mall.js:339", "处理图片失败:", error);
      resolve("static/images/mall/default-product.png");
    }
  });
};
const addReward = async (rewardData) => {
  try {
    common_vendor.index.__f__("log", "at services/mall.js:353", "添加商品，数据为:", {
      name: rewardData.name,
      image_url: rewardData.image_url,
      points: rewardData.points || rewardData.required_points,
      stock: rewardData.stock || rewardData.stock_quantity
    });
    const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
    if (adminLoginStatus !== "loggedin") {
      common_vendor.index.__f__("error", "at services/mall.js:363", "管理员未登录，无法添加商品");
      throw new Error("请先登录管理员账号");
    }
    const adminId = common_vendor.index.getStorageSync("admin_id") || "admin";
    let imageUrl = rewardData.image_url;
    if (imageUrl && (imageUrl.startsWith("wxfile:") || imageUrl.startsWith("http://tmp") || imageUrl.startsWith("file://") || !imageUrl.includes("static/images/mall/"))) {
      try {
        common_vendor.index.__f__("log", "at services/mall.js:377", "检测到临时图片路径，开始上传...");
        imageUrl = await uploadImageToStatic(imageUrl).catch((err) => {
          common_vendor.index.__f__("error", "at services/mall.js:380", "图片上传出错，使用默认图片", err);
          return "/static/images/mall/default-product.png";
        });
        common_vendor.index.__f__("log", "at services/mall.js:383", "图片已上传到static目录:", imageUrl);
      } catch (uploadError) {
        common_vendor.index.__f__("error", "at services/mall.js:385", "图片上传失败:", uploadError);
        imageUrl = "/static/images/mall/default-product.png";
      }
    }
    const fullRewardData = {
      ...rewardData,
      image_url: imageUrl,
      created_by: adminId
    };
    let result;
    try {
      const response = await common_vendor.nr.callFunction({
        name: "addReward",
        data: fullRewardData
      });
      result = response.result;
    } catch (cloudError) {
      common_vendor.index.__f__("error", "at services/mall.js:406", "云函数调用失败:", cloudError);
      if (!common_vendor.index.getStorageSync("admin_login_status")) {
        common_vendor.index.setStorageSync("admin_login_status", "loggedin");
        common_vendor.index.setStorageSync("admin_id", adminId);
      }
      throw new Error("网络错误，请稍后再试");
    }
    if (result && result.success) {
      if (!common_vendor.index.getStorageSync("admin_login_status")) {
        common_vendor.index.setStorageSync("admin_login_status", "loggedin");
        common_vendor.index.setStorageSync("admin_id", adminId);
      }
      common_vendor.index.$emit("rewardsUpdated", {
        type: "add",
        data: result.data
      });
      return result.data;
    } else {
      throw new Error((result == null ? void 0 : result.message) || "添加商品失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/mall.js:432", "添加商品失败:", error);
    throw error;
  }
};
const updateReward = async (rewardData) => {
  try {
    common_vendor.index.__f__("log", "at services/mall.js:444", "正在更新商品，数据为:", {
      id: rewardData._id,
      name: rewardData.name,
      image_url: rewardData.image_url,
      is_hot: rewardData.is_hot,
      is_limited: rewardData.is_limited
    });
    let imageUrl = rewardData.image_url;
    if (imageUrl && (imageUrl.startsWith("wxfile:") || imageUrl.startsWith("http://tmp") || imageUrl.startsWith("file://") || !imageUrl.includes("static/images/mall/"))) {
      try {
        common_vendor.index.__f__("log", "at services/mall.js:459", "检测到临时图片路径，开始上传...");
        imageUrl = await uploadImageToStatic(imageUrl).catch((err) => {
          common_vendor.index.__f__("error", "at services/mall.js:462", "图片上传出错，使用默认图片", err);
          return "static/images/mall/default-product.png";
        });
        common_vendor.index.__f__("log", "at services/mall.js:465", "图片已上传到static目录:", imageUrl);
      } catch (uploadError) {
        common_vendor.index.__f__("error", "at services/mall.js:467", "图片上传失败:", uploadError);
        imageUrl = "static/images/mall/default-product.png";
      }
    }
    const normalizedData = {
      ...rewardData,
      image_url: imageUrl,
      is_hot: rewardData.is_hot === true,
      is_limited: rewardData.is_limited === true,
      is_limited_time: rewardData.is_limited === true
      // 保持字段一致
    };
    common_vendor.index.__f__("log", "at services/mall.js:482", "发送到云函数的数据:", {
      id: normalizedData._id,
      name: normalizedData.name,
      is_hot: normalizedData.is_hot,
      is_limited: normalizedData.is_limited,
      is_limited_time: normalizedData.is_limited_time,
      image_url: normalizedData.image_url
    });
    const { result } = await common_vendor.nr.callFunction({
      name: "updateReward",
      data: normalizedData
    });
    if (result && result.success) {
      common_vendor.index.$emit("rewardsUpdated", {
        type: "update",
        data: result.data
      });
      return result.data;
    } else {
      throw new Error((result == null ? void 0 : result.message) || "更新商品失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/mall.js:507", "更新商品失败:", error);
    throw error;
  }
};
const deleteReward = async (rewardId) => {
  try {
    const { result } = await common_vendor.nr.callFunction({
      name: "deleteReward",
      data: { id: rewardId }
    });
    if (result && result.success) {
      common_vendor.index.$emit("rewardsUpdated", {
        type: "delete",
        data: { id: rewardId }
      });
      return result.data;
    } else {
      throw new Error((result == null ? void 0 : result.message) || "删除商品失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/mall.js:535", "删除商品失败:", error);
    throw error;
  }
};
const getRewardCount = async () => {
  try {
    const { result } = await common_vendor.nr.callFunction({
      name: "getRewards",
      data: { countOnly: true }
    });
    if (result && result.success) {
      return result.count || 0;
    } else {
      throw new Error((result == null ? void 0 : result.message) || "获取商品数量失败");
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at services/mall.js:557", "获取商品数量失败:", error);
    return 0;
  }
};
exports.addReward = addReward;
exports.deleteReward = deleteReward;
exports.ensureStockQuantity = ensureStockQuantity;
exports.getAllRewards = getAllRewards;
exports.getRewardCount = getRewardCount;
exports.getUserPoints = getUserPoints;
exports.searchRewards = searchRewards;
exports.updateReward = updateReward;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/mall.js.map
