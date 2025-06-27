'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('redeemReward function called with event:', event);
	
	try {
		// 获取请求参数
		const { rewardId, addressId } = event;
		
		// 获取用户ID，优先使用传入的userId，其次是context.USERID
		const userId = event.userId || context.USERID;
		console.log('Redeeming reward for userId:', userId);
		
		// 参数验证
		if (!rewardId) {
			return {
				success: false,
				message: '奖品ID不能为空'
			};
		}
		
		if (!addressId) {
			return {
				success: false,
				message: '地址ID不能为空'
			};
		}
		
		if (!userId) {
			return {
				success: false,
				message: '未提供有效的用户ID'
			};
		}
		
		// 获取奖品信息
		const rewardsCollection = db.collection('rewards');
		const rewardResult = await rewardsCollection.doc(rewardId).get();
		
		if (!rewardResult.data || rewardResult.data.length === 0) {
			return {
				success: false,
				message: '奖品不存在'
			};
		}
		
		const reward = rewardResult.data[0];
		console.log('Found reward:', reward);
		
		// 确保stock_quantity是数字
		const stockQuantity = typeof reward.stock_quantity === 'number' ? reward.stock_quantity : 0;
		
		// 检查库存
		if (stockQuantity <= 0) {
			return {
				success: false,
				message: '奖品已售罄'
			};
		}
		
		// 获取地址信息
		const addressesCollection = db.collection('address');
		const addressResult = await addressesCollection.doc(addressId).get();
		
		if (!addressResult.data || addressResult.data.length === 0) {
			return {
				success: false,
				message: '收货地址不存在'
			};
		}
		
		const address = addressResult.data[0];
		console.log('Found address:', address);
		
		// 获取用户积分
		let userPoints = 0;
		let userPointsId = null;
		
		// 尝试从user_points表获取积分
		const userPointsCollection = db.collection('user_points');
		const userPointsResult = await userPointsCollection.where({
			user_id: userId
		}).get();
		
		if (userPointsResult.data && userPointsResult.data.length > 0) {
			userPoints = userPointsResult.data[0].points || 300;
			userPointsId = userPointsResult.data[0]._id;
			console.log('Found user points in user_points table:', userPoints);
		} else {
			// 尝试从members表获取积分
			const membersCollection = db.collection('members');
			const memberResult = await membersCollection.doc(userId).get();
			
			if (memberResult.data && memberResult.data.length > 0) {
				const member = memberResult.data[0];
				userPoints = member.points || 300;
				console.log('Found user points in members table:', userPoints);
			} else {
				// 用户积分记录不存在，设置为默认值300
				userPoints = 300;
				console.log('User points record not found, using default value:', userPoints);
				
				// 创建一个新的用户积分记录
				const newUserPoints = {
					user_id: userId,
					points: 300,
					created_at: new Date(),
					updated_at: new Date()
				};
				
				const insertResult = await userPointsCollection.add(newUserPoints);
				userPointsId = insertResult.id;
				console.log('Created new user points record with ID:', userPointsId);
			}
		}
		
		// 检查积分是否足够
		const requiredPoints = parseInt(reward.required_points);
		if (userPoints < requiredPoints) {
			return {
				success: false,
				message: '积分不足'
			};
		}
		
		// 计算剩余积分
		const remainingPoints = userPoints - requiredPoints;
		
		// 创建积分历史记录 - 在事务之外创建，避免命名空间冲突
		const pointHistory = {
			user_id: userId,
			points: -requiredPoints,
			type: 'redeem',
			description: `兑换商品: ${reward.name}`,
			created_at: new Date()
		};
		
		await db.collection('point_history').add(pointHistory);
		console.log('Created point history record');
		
		// 开始事务 - 仅包含必要的更新操作
		const transaction = await db.startTransaction();
		
		try {
			// 更新库存
			await transaction.collection('rewards').doc(rewardId).update({
				stock_quantity: stockQuantity - 1,
				updated_at: new Date()
			});
			console.log('Updated reward stock quantity');
			
			// 更新用户积分 - 从user_points表更新
			if (userPointsId) {
				// 如果找到了用户积分记录，则更新
				await transaction.collection('user_points').doc(userPointsId).update({
					points: remainingPoints,
					updated_at: new Date()
				});
				console.log('Updated user points in user_points table');
			} else {
				// 尝试从members表更新
				await transaction.collection('members').doc(userId).update({
					points: remainingPoints,
					updated_at: new Date()
				});
				console.log('Updated user points in members table');
			}
			
			// 创建兑换记录
			const redemption = {
				user_id: userId,
				reward_id: rewardId,
				reward_name: reward.name,
				reward_image: reward.image_url,
				points_used: requiredPoints,
				address_id: addressId,
				address: {
					name: address.name,
					phone: address.phone,
					region: address.region,
					address: address.address,
					is_default: address.is_default
				},
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date()
			};
			
			const redemptionResult = await transaction.collection('reward_redemptions').add(redemption);
			console.log('Created redemption record');
			
			// 提交事务
			await transaction.commit();
			
			return {
				success: true,
				message: '兑换成功',
				data: {
					redemption_id: redemptionResult.id,
					remaining_points: remainingPoints
				}
			};
		} catch (error) {
			// 回滚事务
			await transaction.rollback();
			console.error('Transaction failed:', error);
			
			return {
				success: false,
				message: '兑换失败: ' + error.message,
				error: error.message
			};
		}
	} catch (error) {
		console.error('兑换奖品失败:', error);
		return {
			success: false,
			message: '兑换失败: ' + error.message,
			error: error.message
		};
	}
}; 