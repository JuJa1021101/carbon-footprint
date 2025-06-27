'use strict';

const db = uniCloud.database();

// 一个极简的云函数，仅更新用户积分，没有任何事务或复杂逻辑
exports.main = async (event, context) => {
	console.log('updateUserPoints function called with event:', event);
	
	try {
		// 获取请求参数
		const { pointsChange, reason } = event;
		
		// 使用固定的默认用户ID
		const userId = '10086420';
		console.log('更新积分使用固定用户ID:', userId);
		
		// 获取当前用户积分
		const userPointsResult = await db.collection('user_points').where({
			user_id: userId
		}).get();
		
		let currentPoints = 1000; // 默认积分
		let userPointsId = null;
		
		if (userPointsResult.data && userPointsResult.data.length > 0) {
			currentPoints = parseInt(userPointsResult.data[0].points || 1000);
			userPointsId = userPointsResult.data[0]._id;
			console.log(`找到用户积分:`, currentPoints);
		} else {
			console.log(`未找到用户积分记录，将创建新记录`);
		}
		
		// 计算新积分（不允许低于0）
		const changeAmount = parseInt(pointsChange) || 0;
		const newPoints = Math.max(0, currentPoints + changeAmount);
		
		console.log(`用户积分变更: ${currentPoints} => ${newPoints} (${changeAmount})`);
		
		// 创建积分历史记录
		const historyRecord = {
			user_id: userId,
			points: changeAmount,
			type: changeAmount < 0 ? 'consume' : 'earn',
			description: reason || (changeAmount < 0 ? '积分消费' : '积分获取'),
			created_at: new Date()
		};
		
		await db.collection('point_history').add(historyRecord);
		console.log('积分历史记录已创建');
		
		// 更新或创建用户积分
		if (userPointsId) {
			await db.collection('user_points').doc(userPointsId).update({
				points: newPoints,
				updated_at: new Date()
			});
			console.log('用户积分已更新');
		} else {
			const newRecord = await db.collection('user_points').add({
				user_id: userId,
				points: newPoints,
				created_at: new Date(),
				updated_at: new Date()
			});
			console.log('用户积分记录已创建，ID:', newRecord.id);
		}
		
		return {
			success: true,
			message: '积分更新成功',
			data: {
				previous_points: currentPoints,
				current_points: newPoints,
				change: changeAmount,
				user_id: userId
			}
		};
	} catch (error) {
		console.error('更新用户积分失败:', error);
		return {
			success: false,
			message: '更新用户积分失败',
			error: error.message
		};
	}
}; 