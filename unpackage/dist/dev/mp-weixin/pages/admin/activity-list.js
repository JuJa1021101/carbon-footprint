"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_activity = require("../../services/activity.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "activity-list",
  setup(__props) {
    const activities = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const loadActivities = async () => {
      loading.value = true;
      try {
        const result = await services_activity.getActivities();
        common_vendor.index.__f__("log", "at pages/admin/activity-list.vue:89", "原始活动列表:", result.map((a) => `${a.title} (${a.status})`));
        const sortedActivities = result.sort((a, b) => {
          const statusOrder = {
            "未开始": 1,
            "报名中": 2,
            "已结束": 3
          };
          const statusA = statusOrder[a.status] || 999;
          const statusB = statusOrder[b.status] || 999;
          return statusA - statusB;
        });
        common_vendor.index.__f__("log", "at pages/admin/activity-list.vue:105", "排序后活动列表:", sortedActivities.map((a) => `${a.title} (${a.status})`));
        activities.value = sortedActivities;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/activity-list.vue:108", "获取活动列表失败:", error);
        common_vendor.index.showToast({
          title: error.message || "获取活动列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const formatDescription = (description) => {
      if (!description)
        return "";
      if (description.length <= 50)
        return description;
      return description.substring(0, 50) + "...";
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const navigateToAdd = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/activity-add"
      });
    };
    const navigateToEdit = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/admin/activity-edit?id=${activityId}`
      });
    };
    const showDeleteOption = (activity) => {
      common_vendor.index.showActionSheet({
        itemList: ["删除"],
        itemColor: "#ff0000",
        success: (res) => {
          if (res.tapIndex === 0) {
            confirmDeleteActivity(activity);
          }
        }
      });
    };
    const confirmDeleteActivity = (activity) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除"${activity.title}"活动吗？删除后无法恢复。`,
        confirmColor: "#ff0000",
        success: (res) => {
          if (res.confirm) {
            handleDeleteActivity(activity._id);
          }
        }
      });
    };
    const handleDeleteActivity = async (activityId) => {
      try {
        await services_activity.deleteActivity(activityId);
        activities.value = activities.value.filter((activity) => activity._id !== activityId);
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "删除失败",
          icon: "none"
        });
      }
    };
    const getStatusClass = (status) => {
      switch (status) {
        case "报名中":
          return "status-enrolling";
        case "未开始":
          return "status-not-started";
        case "已结束":
          return "status-ended";
        default:
          return "";
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
      loadActivities();
    });
    common_vendor.onShow(() => {
      const adminLoginStatus = common_vendor.index.getStorageSync("admin_login_status");
      if (adminLoginStatus === "loggedin") {
        loadActivities();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: loading.value
      }, loading.value ? {
        d: common_assets._imports_0
      } : common_vendor.e({
        e: activities.value.length === 0
      }, activities.value.length === 0 ? {} : {
        f: common_vendor.f(activities.value, (activity, index, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: "6e665b24-1-" + i0,
            c: common_vendor.o(($event) => showDeleteOption(activity), activity._id),
            d: common_vendor.t(formatDescription(activity.description)),
            e: "6e665b24-2-" + i0,
            f: common_vendor.t(activity.location),
            g: "6e665b24-3-" + i0,
            h: common_vendor.t(activity.activity_time),
            i: common_vendor.t(activity.status),
            j: common_vendor.n(getStatusClass(activity.status)),
            k: activity._id,
            l: common_vendor.o(($event) => navigateToEdit(activity._id), activity._id)
          };
        }),
        g: common_vendor.p({
          name: "more",
          size: 16
        }),
        h: common_vendor.p({
          name: "location",
          size: 14
        }),
        i: common_vendor.p({
          name: "calendar",
          size: 14
        })
      }), {
        j: common_vendor.o(navigateToAdd)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/activity-list.js.map
