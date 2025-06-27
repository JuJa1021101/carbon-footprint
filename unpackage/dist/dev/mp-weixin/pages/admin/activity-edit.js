"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_activity = require("../../services/activity.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "activity-edit",
  setup(__props) {
    const activityId = common_vendor.ref("");
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const activityTime = common_vendor.ref("");
    const location = common_vendor.ref("");
    const statusIndex = common_vendor.ref(0);
    const statusOptions = ["报名中", "未开始", "已结束"];
    const point = common_vendor.ref("0");
    const loading = common_vendor.ref(true);
    const canSave = common_vendor.computed(() => {
      return title.value.trim().length > 0 && description.value.trim().length > 0 && activityTime.value.trim().length > 0 && location.value.trim().length > 0;
    });
    const onStatusChange = (e) => {
      statusIndex.value = e.detail.value;
    };
    const goBack = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否放弃修改？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    };
    const loadActivityDetail = async (id) => {
      loading.value = true;
      try {
        const activities = await services_activity.getActivities();
        const activity = activities.find((item) => item._id === id);
        if (!activity) {
          common_vendor.index.showToast({
            title: "未找到活动信息",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
          return;
        }
        title.value = activity.title;
        description.value = activity.description;
        activityTime.value = activity.activity_time;
        location.value = activity.location;
        point.value = activity.point.toString();
        const statusValue = activity.status;
        const index = statusOptions.findIndex((item) => item === statusValue);
        statusIndex.value = index > -1 ? index : 0;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "获取活动信息失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const saveActivity = async () => {
      if (!canSave.value) {
        common_vendor.index.showToast({
          title: "请完善必填信息",
          icon: "none"
        });
        return;
      }
      try {
        const activityData = {
          _id: activityId.value,
          title: title.value,
          description: description.value,
          activity_time: activityTime.value,
          location: location.value,
          status: statusOptions[statusIndex.value],
          point: parseInt(point.value) || 0
        };
        const result = await services_activity.updateActivity(activityData);
        common_vendor.index.showToast({
          title: "修改成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "修改失败",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus !== "loggedin") {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/login"
          });
        }, 1500);
        return;
      }
      const page = getCurrentPages().pop();
      const options = page.options || {};
      if (options.id) {
        activityId.value = options.id;
        loadActivityDetail(options.id);
      } else {
        common_vendor.index.showToast({
          title: "缺少活动ID",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: !canSave.value,
        d: !canSave.value ? 1 : "",
        e: common_vendor.o(saveActivity),
        f: loading.value
      }, loading.value ? {
        g: common_assets._imports_0
      } : {
        h: title.value,
        i: common_vendor.o(($event) => title.value = $event.detail.value),
        j: description.value,
        k: common_vendor.o(($event) => description.value = $event.detail.value),
        l: common_vendor.p({
          name: "calendar",
          size: 18
        }),
        m: activityTime.value,
        n: common_vendor.o(($event) => activityTime.value = $event.detail.value),
        o: common_vendor.p({
          name: "location",
          size: 18
        }),
        p: location.value,
        q: common_vendor.o(($event) => location.value = $event.detail.value),
        r: common_vendor.t(statusOptions[statusIndex.value]),
        s: common_vendor.p({
          name: "right",
          size: 16
        }),
        t: common_vendor.o(onStatusChange),
        v: statusIndex.value,
        w: statusOptions,
        x: point.value,
        y: common_vendor.o(($event) => point.value = $event.detail.value)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/activity-edit.js.map
