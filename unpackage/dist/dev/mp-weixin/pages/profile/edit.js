"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/images/user-avatar.jpg",
      nickname: "绿色先锋",
      account: "Dawn99",
      gender: "男",
      birthdate: "1992-07-11",
      city: "广东省 广州市 天河区",
      occupation: "能源顾问"
    });
    const cityArray = common_vendor.ref(["广东省", "广州市", "天河区"]);
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const chooseAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        // 默认9
        sizeType: ["original", "compressed"],
        // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"],
        // 从相册选择或拍照
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uploadFile(tempFilePath);
        }
      });
    };
    const uploadFile = (filePath) => {
      common_vendor.index.showLoading({ title: "上传中..." });
      const extName = filePath.substring(filePath.lastIndexOf(".") + 1);
      const cloudPath = `avatar/${Date.now()}-${Math.random().toString(36).slice(-8)}.${extName}`;
      common_vendor.nr.uploadFile({
        filePath,
        cloudPath,
        success: (res) => {
          userInfo.avatar = res.fileID;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "上传成功", icon: "success" });
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "上传失败", icon: "error" });
          common_vendor.index.__f__("error", "at pages/profile/edit.vue:169", err);
        }
      });
    };
    const genderChange = (e) => {
      userInfo.gender = e.detail.value;
    };
    const birthdateChange = (e) => {
      userInfo.birthdate = e.detail.value;
    };
    const cityChange = (e) => {
      const cityArr = e.detail.value;
      cityArray.value = cityArr;
      userInfo.city = cityArr.join(" ");
    };
    const saveUserInfo = () => {
      if (!userInfo.nickname) {
        return common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
      }
      common_vendor.index.showLoading({ title: "保存中..." });
      const birthdate = userInfo.birthdate ? new Date(userInfo.birthdate) : null;
      common_vendor.nr.callFunction({
        name: "saveUserInfo",
        data: {
          account: userInfo.account,
          nickname: userInfo.nickname,
          gender: userInfo.gender,
          birthdate,
          city: userInfo.city,
          occupation: userInfo.occupation,
          avatar: userInfo.avatar
        }
      }).then((res) => {
        if (res.result && res.result.code === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success",
            success: () => {
              common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
              common_vendor.index.$emit("userInfoUpdated", userInfo);
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1e3);
            }
          });
        } else {
          throw new Error(res.result.msg || "保存失败");
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: err.message || "保存失败",
          icon: "error"
        });
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:243", "保存用户信息失败：", err);
      });
    };
    common_vendor.onMounted(() => {
      const localUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (localUserInfo) {
        try {
          const parsedInfo = JSON.parse(localUserInfo);
          Object.assign(userInfo, parsedInfo);
          if (userInfo.city) {
            cityArray.value = userInfo.city.split(" ");
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/profile/edit.vue:261", "解析本地用户信息失败", e);
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
            if (dbUserInfo.birthdate) {
              const date = new Date(dbUserInfo.birthdate);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                userInfo.birthdate = `${year}-${month}-${day}`;
              }
            }
            userInfo.city = dbUserInfo.city || userInfo.city;
            userInfo.occupation = dbUserInfo.occupation || userInfo.occupation;
            userInfo.avatar = dbUserInfo.avatar || userInfo.avatar;
            if (userInfo.city) {
              cityArray.value = userInfo.city.split(" ");
            }
          }
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/profile/edit.vue:298", "获取用户信息失败", err);
        });
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "back",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: userInfo.avatar,
        d: common_vendor.o(chooseAvatar),
        e: userInfo.nickname,
        f: common_vendor.o(($event) => userInfo.nickname = $event.detail.value),
        g: common_vendor.t(userInfo.account),
        h: userInfo.gender === "男",
        i: userInfo.gender === "女",
        j: common_vendor.o(genderChange),
        k: common_vendor.t(userInfo.birthdate || "请选择"),
        l: common_vendor.p({
          name: "right",
          size: "18"
        }),
        m: userInfo.birthdate,
        n: common_vendor.o(birthdateChange),
        o: common_vendor.t(userInfo.city || "请选择"),
        p: common_vendor.p({
          name: "right",
          size: "18"
        }),
        q: cityArray.value,
        r: common_vendor.o(cityChange),
        s: userInfo.occupation,
        t: common_vendor.o(($event) => userInfo.occupation = $event.detail.value),
        v: common_vendor.o(saveUserInfo)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/edit.js.map
