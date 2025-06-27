'use strict';

const db = uniCloud.database();

// 获取用户积分的云函数
exports.main = async (event, context) => {
	console.log('getUserPoints function called with event:', event);
	
	try {
		// 使用固定的默认用户ID
		const userId = '10086420';
		console.log('使用固定用户ID:', userId);
		
		// 获取用户积分
		const userPointsResult = await db.collection('user_points').where({
			user_id: userId
		}).get();
		
		// 默认积分
		let points = 1000;
		
		if (userPointsResult.data && userPointsResult.data.length > 0) {
			points = parseInt(userPointsResult.data[0].points || 1000);
			console.log('找到用户积分:', points);
		} else {
			console.log('未找到用户积分记录，使用默认积分:', points);
			
			// 创建用户积分记录
			try {
				const newUserPoints = {
					user_id: userId,
					points: points,
					created_at: new Date(),
					updated_at: new Date()
				};
				
				const insertResult = await db.collection('user_points').add(newUserPoints);
				console.log('创建新的用户积分记录，ID:', insertResult.id);
			} catch (error) {
				console.error('创建用户积分记录失败:', error);
			}
		}
		
		return {
			success: true,
			message: '获取积分成功',
			data: {
				points: points,
				user_id: userId
			}
		};
	} catch (error) {
		console.error('获取用户积分失败:', error);
		return {
			success: false,
			message: '获取用户积分失败',
			error: error.message,
			data: {
				points: 1000
			}
		};
	}
}; 