<script>
import { checkLoginStatus } from './services/login.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
		
		// 检查登录状态
		const isLoggedIn = checkLoginStatus();
		if (!isLoggedIn) {
			// 未登录，跳转到登录页
			uni.redirectTo({
				url: '/pages/login/login'
			});
		}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url('./static/style/iconfont.css');
	@import url('./static/style/common.css');

	page {
		font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
		background-color: #f8f9fa;
	}
</style>
