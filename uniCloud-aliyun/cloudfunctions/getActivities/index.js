'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	
	// 获取参数
	const { count_only } = event || {};
	
	// 如果只需要统计数量
	if (count_only) {
		const totalCount = await db.collection('activity').count();
		return {
			code: 0,
			message: '获取活动数量成功',
			data: {
				total: totalCount.total
			}
		}
	}
	
	// 按创建时间倒序排列
	const activitiesCollection = await db.collection('activity')
		.orderBy('createdAt', 'desc')
		.get();
	
	return {
		code: 0,
		message: '获取活动列表成功',
		data: activitiesCollection.data
	}
}; 