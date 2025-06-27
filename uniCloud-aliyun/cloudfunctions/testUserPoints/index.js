'use strict';

const db = uniCloud.database();

// 测试用户积分更新和同步
exports.main = async (event, context) => {
	console.log('testUserPoints function called with event:', event);
	
	try {
		// 获取用户ID和要设置的积分
		const { userId, points } = event;
		
		if (!userId) {
			return {
				success: false,
				message: '用户ID不能为空'
			};
		}
		
		// 查询用户现有积分
		const userPointsResult = await db.collection('user_points').where({
			user_id: userId
		}).get();
		
		let userPointsId = null;
		let currentPoints = 0;
		
		if (userPointsResult.data && userPointsResult.data.length > 0) {
			currentPoints = parseInt(userPointsResult.data[0].points || 0);
			userPointsId = userPointsResult.data[0]._id;
		}
		
		// 设置新的积分值
		const newPoints = points !== undefined ? parseInt(points) : currentPoints;
		
		console.log(`测试积分设置: ${currentPoints} => ${newPoints}`);
		
		// 更新或创建用户积分记录
		if (userPointsId) {
			// 更新现有记录
			await db.collection('user_points').doc(userPointsId).update({
				points: newPoints,
				updated_at: new Date()
			});
		} else {
			// 创建新记录
			await db.collection('user_points').add({
				user_id: userId,
				points: newPoints,
				created_at: new Date(),
				updated_at: new Date()
			});
		}
		
		// 创建积分历史记录
		const pointChange = newPoints - currentPoints;
		const historyRecord = {
			user_id: userId,
			points: pointChange,
			type: pointChange >= 0 ? 'test_add' : 'test_deduct',
			description: '测试积分同步',
			created_at: new Date()
		};
		
		await db.collection('point_history').add(historyRecord);
		
		return {
			success: true,
			message: '测试积分设置成功',
			data: {
				previous_points: currentPoints,
				current_points: newPoints,
				change: pointChange
			}
		};
	} catch (error) {
		console.error('测试积分设置失败:', error);
		return {
			success: false,
			message: '测试积分设置失败',
			error: error.message
		};
	}
}; 