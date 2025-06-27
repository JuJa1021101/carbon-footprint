"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_userActivity = require("../../services/userActivity.js");
const _sfc_main = {
  __name: "activity-detail",
  setup(__props) {
    const activityId = common_vendor.ref("");
    const activity = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const loadActivityDetail = async (id) => {
      loading.value = true;
      try {
        const activities = await services_userActivity.getActivities(false);
        const found = activities.find((item) => item._id === id);
        if (found) {
          activity.value = found;
        } else {
          common_vendor.index.showToast({
            title: "未找到活动信息",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "获取活动信息失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const getStatusTextClass = (activity2) => {
      if (activity2.isCheckedIn) {
        return "text-gray-500";
      } else if (activity2.isEnrolled) {
        return "text-green-500";
      }
      switch (activity2.status) {
        case "报名中":
          return "text-yellow-500";
        case "未开始":
          return "text-blue-500";
        case "已结束":
          return "text-gray-500";
        default:
          return "text-gray-500";
      }
    };
    const getDisplayStatus = (activity2) => {
      if (activity2.isCheckedIn) {
        return "已完成";
      } else if (activity2.isEnrolled) {
        return "进行中";
      }
      return activity2.status;
    };
    const handleCheckIn = () => {
      if (!activity.value)
        return;
      common_vendor.index.showModal({
        title: "打卡确认",
        content: `确定要为"${activity.value.title}"活动打卡吗？完成后将获得${activity.value.point}积分`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "打卡中..." });
              const result = await services_userActivity.checkInActivity(activity.value._id, activity.value.point);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: `打卡成功，获得${result.points}积分`,
                icon: "success"
              });
              await loadActivityDetail(activityId.value);
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: error.message || "打卡失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    common_vendor.onMounted(() => {
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
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_assets._imports_1$1,
        d: loading.value
      }, loading.value ? {} : common_vendor.e({
        e: activity.value
      }, activity.value ? {
        f: common_vendor.t(activity.value.title),
        g: common_vendor.t(getDisplayStatus(activity.value)),
        h: common_vendor.n(getStatusTextClass(activity.value)),
        i: common_vendor.t(activity.value.description),
        j: common_assets._imports_2,
        k: common_vendor.t(activity.value.location),
        l: common_assets._imports_3,
        m: common_vendor.t(activity.value.activity_time),
        n: common_assets._imports_4,
        o: common_vendor.t(activity.value.point)
      } : {}), {
        p: activity.value && activity.value.isEnrolled && !activity.value.isCheckedIn
      }, activity.value && activity.value.isEnrolled && !activity.value.isCheckedIn ? {
        q: common_vendor.o(handleCheckIn)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/activity-detail.js.map
