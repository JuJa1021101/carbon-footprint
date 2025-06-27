"use strict";
const common_vendor = require("../common/vendor.js");
const searchContent = (keyword, options = {}) => {
  return new Promise((resolve, reject) => {
    const { page = 1, pageSize = 10 } = options;
    if (!keyword || keyword.trim() === "") {
      resolve({
        results: [],
        total: 0,
        page,
        pageSize
      });
      return;
    }
    common_vendor.index.showLoading({ title: "搜索中..." });
    common_vendor.nr.callFunction({
      name: "searchContent",
      data: {
        keyword,
        page,
        pageSize
      }
    }).then((res) => {
      common_vendor.index.hideLoading();
      if (res.result.code === 0) {
        resolve(res.result.data);
      } else {
        reject(new Error(res.result.message || "搜索失败"));
      }
    }).catch((err) => {
      common_vendor.index.hideLoading();
      common_vendor.index.__f__("error", "at services/search.js:46", "搜索失败", err);
      reject(new Error(err.message || "搜索失败"));
      const mockResults = getMockSearchResults(keyword);
      resolve(mockResults);
    });
  });
};
const getMockSearchResults = (keyword) => {
  const mockKnowledge = [
    {
      _id: "k1",
      title: "垃圾分类指南：一文看懂四分法",
      content: "垃圾分类是指按一定规定或标准将垃圾分类储存、分类投放和分类搬运，从而转变成公共资源的一系列活动的总称。",
      tags: "垃圾分类,环保知识,生活指南",
      cover: "/static/images/userspost/garbage-sorting.jpeg",
      views: 1234,
      likes: 56,
      createdAt: Date.now() - 3 * 60 * 60 * 1e3,
      type: "knowledge",
      typeText: "环保知识"
    },
    {
      _id: "k2",
      title: "节能减排小窍门：家庭省电技巧",
      content: "日常节电小技巧：1. 及时关闭不用的电器 2. 使用节能灯泡 3. 电器不用时拔掉插头",
      tags: "节能减排,省电技巧,低碳生活",
      cover: "/static/images/userspost/energy-saving.jpeg",
      views: 867,
      likes: 42,
      createdAt: Date.now() - 24 * 60 * 60 * 1e3,
      type: "knowledge",
      typeText: "环保知识"
    }
  ];
  const mockActivities = [
    {
      _id: "a1",
      title: "城市河道清洁志愿行动",
      description: "一起行动，清洁我们的城市河道，保护水资源",
      location: "城东河滨公园",
      activity_time: "6月15日 09:00",
      status: "报名中",
      point: 100,
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1e3,
      type: "activity",
      typeText: "环保活动"
    },
    {
      _id: "a2",
      title: "废旧电池回收换礼品",
      description: "回收旧电池，保护环境，还能换取环保小礼品",
      location: "市民服务中心",
      activity_time: "6月1日-30日",
      status: "进行中",
      point: 50,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1e3,
      type: "activity",
      typeText: "环保活动"
    }
  ];
  const keywordLower = keyword.toLowerCase();
  const filteredKnowledge = mockKnowledge.filter(
    (item) => item.title.toLowerCase().includes(keywordLower) || item.content.toLowerCase().includes(keywordLower) || item.tags.toLowerCase().includes(keywordLower)
  );
  const filteredActivities = mockActivities.filter(
    (item) => item.title.toLowerCase().includes(keywordLower) || item.description.toLowerCase().includes(keywordLower) || item.location.toLowerCase().includes(keywordLower)
  );
  const results = [...filteredKnowledge, ...filteredActivities];
  results.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(keywordLower);
    const bTitleMatch = b.title.toLowerCase().includes(keywordLower);
    if (aTitleMatch && !bTitleMatch)
      return -1;
    if (!aTitleMatch && bTitleMatch)
      return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return {
    results,
    total: results.length,
    page: 1,
    pageSize: 10
  };
};
exports.searchContent = searchContent;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/search.js.map
