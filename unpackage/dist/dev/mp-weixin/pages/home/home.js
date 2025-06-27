"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const services_userActivity = require("../../services/userActivity.js");
const services_search = require("../../services/search.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const activities = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const hasError = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    common_vendor.ref([]);
    common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const searchResults = common_vendor.ref([]);
    const isSearchMode = common_vendor.ref(false);
    const searchTotal = common_vendor.ref(0);
    common_vendor.onErrorCaptured((err, instance, info) => {
      common_vendor.index.__f__("error", "at pages/home/home.vue:378", "首页捕获到错误:", err);
      common_vendor.index.__f__("log", "at pages/home/home.vue:379", "错误发生在:", info);
      hasError.value = true;
      errorMessage.value = err.message || "加载数据时出错";
      return false;
    });
    const getActivityList = async () => {
      loading.value = true;
      hasError.value = false;
      try {
        common_vendor.index.__f__("log", "at pages/home/home.vue:390", "开始获取首页活动列表...");
        const result = await services_userActivity.getTopActivities();
        common_vendor.index.__f__("log", "at pages/home/home.vue:392", "获取到的活动列表:", result);
        if (!result || result.length === 0) {
          common_vendor.index.__f__("warn", "at pages/home/home.vue:395", "没有活动数据，显示空状态");
          activities.value = [];
        } else {
          activities.value = result;
          common_vendor.index.__f__("log", "at pages/home/home.vue:399", "首页显示的活动数量:", activities.value.length);
          activities.value.forEach((activity, index) => {
            common_vendor.index.__f__("log", "at pages/home/home.vue:401", `活动${index + 1}: ${activity.title}, 状态: ${activity.status}, 已报名: ${activity.isEnrolled}, 已打卡: ${activity.isCheckedIn}`);
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:405", "获取活动列表失败", error);
        hasError.value = true;
        errorMessage.value = error.message || "获取活动数据失败";
        activities.value = [];
      } finally {
        loading.value = false;
      }
    };
    common_vendor.onPullDownRefresh(async () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:416", "触发下拉刷新...");
      try {
        await getActivityList();
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:425", "刷新失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none",
          duration: 1500
        });
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    const getStatusTextClass = (activity) => {
      if (activity.isCheckedIn) {
        return "status-tag status-completed";
      } else if (activity.isEnrolled) {
        return "status-tag status-ongoing";
      }
      switch (activity.status) {
        case "报名中":
          return "status-tag status-enrolling";
        case "未开始":
          return "status-tag status-upcoming";
        case "已结束":
          return "status-tag status-ended";
        default:
          return "status-tag status-default";
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
        common_vendor.index.navigateTo({
          url: `/pages/home/activity-detail?id=${activity._id}`
        });
      } else if (activity.status === "报名中") {
        handleEnrollActivity(activity._id);
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/home/activity-detail?id=${activity._id}`
        });
      }
    };
    const handleEnrollActivity = async (activityId) => {
      try {
        const result = await services_userActivity.enrollActivity(activityId);
        if (result && result.success) {
          common_vendor.index.showToast({
            title: "报名成功",
            icon: "success"
          });
          const index = activities.value.findIndex((item) => item._id === activityId);
          if (index > -1) {
            activities.value[index].isEnrolled = true;
          }
        } else {
          common_vendor.index.showToast({
            title: result.message || "报名失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:538", "报名活动失败", error);
        common_vendor.index.showToast({
          title: "报名失败，请稍后再试",
          icon: "none"
        });
      }
    };
    const getParticipantsCount = (activity) => {
      return activity.enrollCount || 0;
    };
    const navigateToDetail = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/home/activity-detail?id=${activityId}`
      });
    };
    const navigateToAllActivities = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home/activity-list"
      });
    };
    const navigateToKnowledgeDetail = (knowledgeId) => {
      if (knowledgeId === "static1") {
        common_vendor.index.navigateTo({
          url: "/pages/home/knowledge-static?id=1"
        });
      } else if (knowledgeId === "static2") {
        common_vendor.index.navigateTo({
          url: "/pages/home/knowledge-static?id=2"
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/home/knowledge-detail?id=${knowledgeId}`
        });
      }
    };
    const navigateToKnowledgeList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home/knowledge-list"
      });
    };
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      performSearch(searchKeyword.value);
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      if (isSearchMode.value) {
        exitSearch();
      }
    };
    const exitSearch = () => {
      isSearchMode.value = false;
      searchResults.value = [];
      searchKeyword.value = "";
    };
    const performSearch = async (keyword) => {
      try {
        isSearchMode.value = true;
        const results = await services_search.searchContent(keyword);
        searchResults.value = results;
        searchTotal.value = results.length;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:625", "搜索失败", error);
        common_vendor.index.showToast({
          title: "搜索失败，请稍后再试",
          icon: "none"
        });
        searchResults.value = [];
      }
    };
    common_vendor.onMounted(() => {
      getActivityList();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:641", "首页显示，刷新活动数据...");
      setTimeout(() => {
        getActivityList();
      }, 500);
    });
    const searchKnowledgeResults = common_vendor.computed(() => {
      return searchResults.value.filter((item) => item.type === "knowledge");
    });
    const searchActivityResults = common_vendor.computed(() => {
      return searchResults.value.filter((item) => item.type === "activity");
    });
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 60 * 60 * 1e3) {
        const minutes = Math.floor(diff / (60 * 1e3));
        return `${minutes}分钟前`;
      }
      if (diff < 24 * 60 * 60 * 1e3) {
        const hours = Math.floor(diff / (60 * 60 * 1e3));
        return `${hours}小时前`;
      }
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.getDate() === yesterday.getDate()) {
        return "昨天";
      }
      if (date.getFullYear() === now.getFullYear()) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "notification",
          size: "18"
        }),
        b: common_vendor.p({
          name: "calendar",
          size: "18"
        }),
        c: common_vendor.o(handleSearch),
        d: searchKeyword.value,
        e: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        f: searchKeyword.value
      }, searchKeyword.value ? {
        g: common_vendor.o(clearSearch),
        h: common_vendor.p({
          name: "close-circle",
          size: "16"
        })
      } : {}, {
        i: common_vendor.o(handleSearch),
        j: common_vendor.p({
          name: "search",
          size: "16"
        }),
        k: isSearchMode.value
      }, isSearchMode.value ? {
        l: common_vendor.t(searchKeyword.value),
        m: common_vendor.t(searchResults.value.length),
        n: common_vendor.o(exitSearch)
      } : {}, {
        o: isSearchMode.value
      }, isSearchMode.value ? common_vendor.e({
        p: searchResults.value.length === 0
      }, searchResults.value.length === 0 ? {
        q: common_vendor.p({
          name: "search",
          size: "48"
        })
      } : common_vendor.e({
        r: searchKnowledgeResults.value.length > 0
      }, searchKnowledgeResults.value.length > 0 ? {
        s: common_vendor.p({
          name: "right",
          size: "12"
        }),
        t: common_vendor.o(navigateToKnowledgeList),
        v: common_vendor.f(searchKnowledgeResults.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.image
          }, item.image ? common_vendor.e({
            b: item.image,
            c: item.tags
          }, item.tags ? {
            d: common_vendor.t(item.tags.split(",")[0])
          } : {}, {
            e: common_vendor.t(item.title),
            f: "822eb052-6-" + i0,
            g: common_vendor.p({
              name: "eye",
              size: "14"
            }),
            h: common_vendor.t(item.views || 0),
            i: "822eb052-7-" + i0,
            j: common_vendor.p({
              name: "like",
              size: "14"
            }),
            k: common_vendor.t(item.likes || 0),
            l: common_vendor.t(formatDate(item.created_at))
          }) : common_vendor.e({
            m: item.tags
          }, item.tags ? {
            n: common_vendor.t(item.tags.split(",")[0])
          } : {}, {
            o: common_vendor.t(item.title),
            p: "822eb052-8-" + i0,
            q: common_vendor.p({
              name: "eye",
              size: "14"
            }),
            r: common_vendor.t(item.views || 0),
            s: "822eb052-9-" + i0,
            t: common_vendor.p({
              name: "like",
              size: "14"
            }),
            v: common_vendor.t(item.likes || 0),
            w: common_vendor.t(formatDate(item.created_at))
          }), {
            x: item._id,
            y: common_vendor.o(($event) => navigateToKnowledgeDetail(item._id), item._id)
          });
        })
      } : {}, {
        w: searchActivityResults.value.length > 0
      }, searchActivityResults.value.length > 0 ? {
        x: common_vendor.p({
          name: "right",
          size: "12"
        }),
        y: common_vendor.o(navigateToAllActivities),
        z: common_vendor.f(searchActivityResults.value, (activity, index, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: common_vendor.t(activity.status),
            c: common_vendor.n(getStatusTextClass(activity)),
            d: common_vendor.t(activity.description),
            e: "822eb052-11-" + i0,
            f: common_vendor.t(activity.location),
            g: "822eb052-12-" + i0,
            h: common_vendor.t(activity.activity_time),
            i: common_vendor.t(getParticipantsCount(activity)),
            j: common_vendor.t(activity.status === "报名中" ? "立即报名" : "查看详情"),
            k: common_vendor.n(getActionButtonClass(activity)),
            l: common_vendor.o(($event) => handleActivityAction(activity), activity._id || index),
            m: activity._id || index,
            n: common_vendor.o(($event) => navigateToDetail(activity._id), activity._id || index)
          };
        }),
        A: common_vendor.p({
          name: "location",
          size: "14"
        }),
        B: common_vendor.p({
          name: "calendar",
          size: "14"
        })
      } : {})) : common_vendor.e({
        C: common_vendor.p({
          name: "right",
          size: "12"
        }),
        D: common_vendor.o(navigateToKnowledgeList),
        E: common_assets._imports_0$2,
        F: common_vendor.p({
          name: "eye",
          size: "14"
        }),
        G: common_vendor.p({
          name: "like",
          size: "14"
        }),
        H: common_vendor.o(($event) => navigateToKnowledgeDetail("static1")),
        I: common_vendor.p({
          name: "eye",
          size: "14"
        }),
        J: common_vendor.p({
          name: "like",
          size: "14"
        }),
        K: common_assets._imports_1$3,
        L: common_vendor.o(($event) => navigateToKnowledgeDetail("static2")),
        M: common_vendor.p({
          name: "right",
          size: "12"
        }),
        N: common_vendor.o(navigateToAllActivities),
        O: loading.value
      }, loading.value ? {} : hasError.value ? {
        Q: common_vendor.t(errorMessage.value),
        R: common_vendor.o(getActivityList)
      } : activities.value.length === 0 ? {} : {
        T: common_vendor.f(activities.value, (activity, index, i0) => {
          return {
            a: common_vendor.t(activity.title),
            b: common_vendor.t(getDisplayStatus(activity)),
            c: common_vendor.n(getStatusTextClass(activity)),
            d: common_vendor.t(activity.description),
            e: "822eb052-19-" + i0,
            f: common_vendor.t(activity.location),
            g: "822eb052-20-" + i0,
            h: common_vendor.t(activity.activity_time),
            i: common_vendor.t(getParticipantsCount(activity)),
            j: common_vendor.t(getActionButtonText(activity)),
            k: common_vendor.n(getActionButtonClass(activity)),
            l: common_vendor.o(($event) => handleActivityAction(activity), activity._id || index),
            m: activity._id || index,
            n: common_vendor.o(($event) => navigateToDetail(activity._id), activity._id || index)
          };
        }),
        U: common_vendor.p({
          name: "location",
          size: "14"
        }),
        V: common_vendor.p({
          name: "calendar",
          size: "14"
        })
      }, {
        P: hasError.value,
        S: activities.value.length === 0
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
