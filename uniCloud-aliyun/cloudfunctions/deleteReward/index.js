'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		if (!event.id) {
			return {
				success: false,
				message: '缺少商品ID'
			};
		}
		
		const rewardCollection = db.collection('rewards');
		
		// 从数据库删除
		const res = await rewardCollection.doc(event.id).remove();
		
		return {
			success: true,
			message: '删除商品成功',
			data: res
		};
	} catch (error) {
		console.error('删除商品出错:', error);
		return {
			success: false,
			message: error.message || '删除商品失败',
			error
		};
	}
}; 