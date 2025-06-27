"use strict";
const common_vendor = require("../../common/vendor.js");
const services_activity = require("../../services/activity.js");
if (!Math) {
  IconImage();
}
const IconImage = () => "../../components/IconImage.js";
const _sfc_main = {
  __name: "activity-add",
  setup(__props) {
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const activityTime = common_vendor.ref("");
    const location = common_vendor.ref("");
    const statusIndex = common_vendor.ref(0);
    const statusOptions = ["报名中", "未开始", "已结束"];
    const point = common_vendor.ref("0");
    const canPublish = common_vendor.computed(() => {
      return title.value.trim().length > 0 && description.value.trim().length > 0 && activityTime.value.trim().length > 0 && location.value.trim().length > 0;
    });
    const onStatusChange = (e) => {
      statusIndex.value = e.detail.value;
    };
    const goBack = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否放弃发布？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    };
    const publishActivity = async () => {
      if (!canPublish.value) {
        common_vendor.index.showToast({
          title: "请完善必填信息",
          icon: "none"
        });
        return;
      }
      try {
        const activityData = {
          title: title.value,
          description: description.value,
          activity_time: activityTime.value,
          location: location.value,
          status: statusOptions[statusIndex.value],
          point: parseInt(point.value) || 0
        };
        const result = await services_activity.addActivity(activityData);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "发布失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "back",
          size: 18
        }),
        b: common_vendor.o(goBack),
        c: !canPublish.value,
        d: !canPublish.value ? 1 : "",
        e: common_vendor.o(publishActivity),
        f: title.value,
        g: common_vendor.o(($event) => title.value = $event.detail.value),
        h: description.value,
        i: common_vendor.o(($event) => description.value = $event.detail.value),
        j: common_vendor.p({
          name: "calendar",
          size: 18
        }),
        k: activityTime.value,
        l: common_vendor.o(($event) => activityTime.value = $event.detail.value),
        m: common_vendor.p({
          name: "location",
          size: 18
        }),
        n: location.value,
        o: common_vendor.o(($event) => location.value = $event.detail.value),
        p: common_vendor.t(statusOptions[statusIndex.value]),
        q: common_vendor.p({
          name: "right",
          size: 16
        }),
        r: common_vendor.o(onStatusChange),
        s: statusIndex.value,
        t: statusOptions,
        v: point.value,
        w: common_vendor.o(($event) => point.value = $event.detail.value)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/activity-add.js.map
