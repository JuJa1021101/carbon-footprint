'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	// 获取奖品ID
	const rewardId = event.rewardId || '';
	
	if (!rewardId) {
		return {
			success: false,
			message: '未提供有效的奖品ID'
		};
	}
	
	try {
		// 查询奖品详情
		const rewardsCollection = db.collection('rewards');
		const result = await rewardsCollection.doc(rewardId).get();
		
		if (result.data.length === 0) {
			return {
				success: false,
				message: '未找到该奖品'
			};
		}
		
		const reward = result.data[0];
		
		// 获取用户ID
		const userId = event.userId || context.USERID || '';
		
		// 如果有用户ID，获取用户积分
		let userPoints = 300; // 默认设置为300积分
		if (userId) {
			const userPointsCollection = db.collection('user_points');
			const userPointsResult = await userPointsCollection.where({
				user_id: userId
			}).get();
			
			if (userPointsResult.data && userPointsResult.data.length > 0) {
				userPoints = userPointsResult.data[0].points || 300;
				console.log('奖品详情 - 用户积分:', userPoints);
			} else {
				console.log('奖品详情 - 未找到用户积分记录，使用默认值:', userPoints);
			}
		}
		
		// 确保stock_quantity是数字
		const stockQuantity = typeof reward.stock_quantity === 'number' ? reward.stock_quantity : 0;
		
		// 计算奖品状态
		let status = 'available'; // 默认可用
		
		// 自动计算状态
		if (stockQuantity <= 0) {
			status = 'sold_out'; // 已售罄
		} else {
			// 确保required_points是数字，并进行比较
			const requiredPoints = parseInt(reward.required_points);
			console.log(`奖品详情 - 比较: 用户积分(${userPoints}) vs 所需积分(${requiredPoints})`);
			
			if (!isNaN(requiredPoints) && userPoints < requiredPoints) {
				status = 'unavailable'; // 积分不足
			} else {
				status = 'available'; // 可兑换
			}
		}
		
		// 处理限时奖品
		let remainingTime = null;
		if (reward.is_limited_time && reward.end_time) {
			const now = new Date();
			const endTime = new Date(reward.end_time);
			const timeLeft = Math.max(0, endTime.getTime() - now.getTime());
			
			const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
			const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			
			remainingTime = {
				milliseconds: timeLeft,
				days,
				hours,
				text: `${days}天${hours}小时`
			};
		}
		
		return {
			success: true,
			data: {
				...reward,
				stock_quantity: stockQuantity, // 确保返回有效的库存数量
				status,
				remaining_time: remainingTime
			},
			user_points: userPoints,
			can_redeem: status === 'available'
		};
	} catch (error) {
		console.error('获取奖品详情失败:', error);
		return {
			success: false,
			message: '获取奖品详情失败',
			error: error.message
		};
	}
}; 