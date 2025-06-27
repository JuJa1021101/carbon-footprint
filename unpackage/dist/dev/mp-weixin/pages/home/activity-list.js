"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_userActivity = require("../../services/userActivity.js");
const _sfc_main = {
  __name: "activity-list",
  setup(__props) {
    const activities = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const loadActivities = async () => {
      loading.value = true;
      try {
        const result = await services_userActivity.getActivities();
        activities.value = result;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "获取活动列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const getStatusTextClass = (activity) => {
      if (activity.isCheckedIn) {
        return "text-gray-500";
      } else if (activity.isEnrolled) {
        return "text-green-500";
      }
      switch (activity.status) {
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
    const getDisplayStatus = (activity) => {
      if (activity.isCheckedIn) {
        return "已完成";
      } else if (activity.isEnrolled) {
        return "进行中";
      }
      return activity.status;
    };
    const getParticipantsText = (activity) => {
      return activity.isEnrolled ? "2人已报名" : "2人已报名";
    };
    const getActionButtonText = (activity) => {
      if (activity.isCheckedIn) {
        return "已完成";
      } else if (activity.isEnrolled) {
        return "查看详情";
      } else if (activity.status === "未开始") {
        return "等待开始";
      } else if (activity.status === "已结束") {
        return "已结束";
      } else {
        return "立即报名";
      }
    };
    const getActionButtonClass = (activity) => {
      if (activity.status === "未开始" || activity.status === "已结束") {
        return "ml-auto bg-gray-200 text-gray-500 text-sm px-4 py-1 rounded-full";
      } else {
        return "ml-auto bg-green-50 text-green-600 text-sm px-4 py-1 rounded-full";
      }
    };
    const handleActivityAction = (activity) => {
      if (activity.isCheckedIn) {
        common_vendor.index.showToast({
          title: "您已完成该活动",
          icon: "none"
        });
      } else if (activity.isEnrolled) {
        navigateToDetail(activity._id);
      } else if (activity.status === "未开始") {
        common_vendor.index.showToast({
          title: "活动尚未开始，请等待",
          icon: "none"
        });
      } else if (activity.status === "已结束") {
        common_vendor.index.showToast({
          title: "该活动已结束",
          icon: "none"
        });
      } else {
        confirmEnroll(activity);
      }
    };
    const confirmEnroll = (activity) => {
      common_vendor.index.showModal({
        title: "报名确认",
        content: `确定要报名参加"${activity.title}"活动吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "报名中..." });
              await services_userActivity.enrollActivity(activity._id);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "报名成功",
                icon: "success"
              });
              await loadActivities();
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: error.message || "报名失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const navigateToDetail = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/home/activity-detail?id=${activityId}`
      });
    };
    common_vendor.onMounted(() => {
      loadActivities();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o(goBack),
        c: common_assets._imports_1$1,
        d: loading.value
      }, loading.value ? {} : common_vendor.e({
        e: activities.value.length === 0
      }, activities.value.length === 0 ? {} : {
        f: common_vendor.f(activities.value, (activity, index, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: common_vendor.t(getDisplayStatus(activity)),
            c: common_vendor.n(getStatusTextClass(activity)),
            d: common_vendor.t(activity.description),
            e: common_vendor.t(activity.location),
            f: common_vendor.t(activity.activity_time),
            g: common_vendor.t(getParticipantsText(activity)),
            h: common_vendor.t(getActionButtonText(activity)),
            i: common_vendor.n(getActionButtonClass(activity)),
            j: common_vendor.o(($event) => handleActivityAction(activity), activity._id),
            k: activity._id
          };
        }),
        g: common_assets._imports_2,
        h: common_assets._imports_3
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/activity-list.js.map
