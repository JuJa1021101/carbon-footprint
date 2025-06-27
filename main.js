import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'

// 在应用启动时初始化所有集合
async function initializeCollections() {
  console.log('应用启动 - 开始初始化所有集合');
  
  try {
    // 首先使用专用函数初始化reward_redemptions集合
    console.log('尝试初始化reward_redemptions集合...');
    const redemptionsResult = await uniCloud.callFunction({
      name: 'emptyFunction'
    });
    console.log('reward_redemptions集合初始化结果:', redemptionsResult);
    
    // 使用新创建的专用函数再次尝试初始化reward_redemptions集合
    console.log('使用专用函数再次尝试初始化reward_redemptions集合...');
    const specialInitResult = await uniCloud.callFunction({
      name: 'initRedemptionsCollection'
    });
    console.log('专用函数初始化结果:', specialInitResult);
    
    // 然后初始化所有其他集合
    console.log('初始化所有其他集合...');
    const allCollectionsResult = await uniCloud.callFunction({
      name: 'updateAllCollections'
    });
    console.log('所有集合初始化结果:', allCollectionsResult);
    
    return true;
  } catch (error) {
    console.error('集合初始化失败，但继续启动应用:', error);
    return false;
  }
}

// 初始化后再挂载应用
initializeCollections().then(() => {
  console.log('集合初始化完成，挂载应用');
  const app = new Vue({
    ...App
  });
  app.$mount();
}).catch(error => {
  console.error('集合初始化过程出错，但仍然挂载应用:', error);
  const app = new Vue({
    ...App
  });
  app.$mount();
});

// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 在Vue3环境下初始化集合
  setTimeout(async () => {
    try {
      // 初始化reward_redemptions集合
      const redemptionsResult = await uniCloud.callFunction({
        name: 'emptyFunction'
      });
      console.log('Vue3 - reward_redemptions集合初始化结果:', redemptionsResult);
      
      // 使用专用函数再次尝试初始化
      const specialInitResult = await uniCloud.callFunction({
        name: 'initRedemptionsCollection'
      });
      console.log('Vue3 - 专用函数初始化结果:', specialInitResult);
      
      // 初始化所有其他集合
      const allCollectionsResult = await uniCloud.callFunction({
        name: 'updateAllCollections'
      });
      console.log('Vue3 - 所有集合初始化结果:', allCollectionsResult);
    } catch (error) {
      console.error('Vue3 - 集合初始化失败，但应用已启动:', error);
    }
  }, 1000);
  
  return {
    app
  }
}
// #endif