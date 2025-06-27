'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	// 获取用户ID
	const userId = event.userId || context.USERID || '';
	
	if (!userId) {
		return {
			success: false,
			message: '未提供有效的用户ID'
		};
	}
	
	try {
		// 查询用户积分历史记录
		const pointHistoryCollection = db.collection('point_history');
		const result = await pointHistoryCollection.where({
			user_id: userId
		}).orderBy('created_at', 'desc').get();
		
		return {
			success: true,
			data: result.data
		};
	} catch (error) {
		return {
			success: false,
			message: '获取积分历史失败',
			error: error.message
		};
	}
}; 