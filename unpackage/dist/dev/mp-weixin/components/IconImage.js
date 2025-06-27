"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "IconImage",
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: "currentColor"
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconUrl() {
      if (this.active && (this.name === "like" || this.name === "heart")) {
        return `/static/images/icons/icon-${this.name}-active.svg`;
      }
      return `/static/images/icons/icon-${this.name}.svg`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $options.iconUrl,
    b: $props.size + "px",
    c: $props.size + "px",
    d: $props.size + "px",
    e: $props.size + "px",
    f: $props.active && ($props.name === "heart" || $props.name === "like") ? 1 : ""
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/IconImage.js.map
