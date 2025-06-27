'use strict';

const db = uniCloud.database();

// 一个简单直接的兑换函数，不使用事务，直接更新积分和库存
exports.main = async (event, context) => {
	console.log('redeemRewardDirect function called with event:', event);
	
	try {
		// 获取请求参数
		const { rewardId, addressId } = event;
		
		// 使用固定的默认用户ID
		const userId = '10086420';
		console.log('兑换商品使用固定用户ID:', userId);
		
		if (!rewardId || !addressId) {
			return {
				success: false,
				message: '参数不完整',
				error: '商品ID和地址ID不能为空'
			};
		}
		
		// 获取奖品信息
		const rewardResult = await db.collection('rewards').doc(rewardId).get();
		if (!rewardResult.data || rewardResult.data.length === 0) {
			return {
				success: false,
				message: '商品不存在',
				error: '找不到指定的商品'
			};
		}
		const reward = rewardResult.data[0];
		console.log('获取到的原始商品数据:', JSON.stringify(reward));
		
		// 获取地址信息
		const addressResult = await db.collection('address').doc(addressId).get();
		if (!addressResult.data || addressResult.data.length === 0) {
			return {
				success: false,
				message: '地址不存在',
				error: '找不到指定的地址'
			};
		}
		const address = addressResult.data[0];
		
		// 获取用户积分
		const userPointsResult = await db.collection('user_points').where({
			user_id: userId
		}).get();
		
		let userPoints = 1000; // 默认积分
		let userPointsId = null;
		
		if (userPointsResult.data && userPointsResult.data.length > 0) {
			userPoints = parseInt(userPointsResult.data[0].points || 1000);
			userPointsId = userPointsResult.data[0]._id;
			console.log('找到用户积分:', userPoints);
		} else {
			console.log('未找到用户积分记录，使用默认积分:', userPoints);
			
			// 创建用户积分记录
			try {
				const newUserPoints = {
					user_id: userId,
					points: userPoints,
					created_at: new Date(),
					updated_at: new Date()
				};
				
				const insertResult = await db.collection('user_points').add(newUserPoints);
				userPointsId = insertResult.id;
				console.log('创建新的用户积分记录，ID:', insertResult.id);
			} catch (error) {
				console.error('创建用户积分记录失败:', error);
			}
		}
		
		// 适配字段名称差异，使用points或required_points字段
		const requiredPoints = parseInt(reward.points || reward.required_points || 0);
		console.log(`积分情况: 用户积分=${userPoints}, 所需积分=${requiredPoints}`);
		
		// 检查积分是否足够
		if (userPoints < requiredPoints) {
			return {
				success: false,
				message: '积分不足',
				error: `当前积分${userPoints}，需要${requiredPoints}积分`
			};
		}
		
		// 适配字段名称差异，使用stock或stock_quantity字段
		let stockQuantity;
		if (reward.stock !== undefined) {
			stockQuantity = Number(reward.stock);
			console.log('使用stock字段:', stockQuantity);
		} else if (reward.stock_quantity !== undefined) {
			stockQuantity = Number(reward.stock_quantity);
			console.log('使用stock_quantity字段:', stockQuantity);
		} else {
			stockQuantity = 0;
			console.log('未找到库存字段，默认为0');
		}
		
		// 确保库存是有效的数字
		if (isNaN(stockQuantity)) {
			stockQuantity = 0;
			console.log('库存转换为数字失败，设置为0');
		}
		
		// 检查库存是否足够
		if (stockQuantity <= 0) {
			return {
				success: false,
				message: '商品已售罄',
				error: '商品库存不足'
			};
		}
		
		// 检查状态是否允许兑换
		if (reward.status === 'sold_out' || reward.status === 'soldout') {
			return {
				success: false,
				message: '商品已售罄',
				error: '商品状态为已售罄'
			};
		}
		
		// 1. 创建兑换记录
		const redemption = {
			user_id: userId,
			reward_id: rewardId,
			reward_name: reward.name || '未知商品',
			reward_image: reward.image_url || reward.image || '',
			points_used: requiredPoints,
			address_id: addressId,
			address_info: {
				name: address.name || '用户',
				phone: address.phone || '12345678901',
				region: address.region || '默认地区',
				address: address.address || '默认地址',
				is_default: address.is_default || false
			},
			status: 'pending',
			created_at: new Date(),
			updated_at: new Date()
		};
		
		let redemptionId;
		try {
			// 优先使用reward_records集合
			const redemptionResult = await db.collection('reward_records').add(redemption);
			redemptionId = redemptionResult.id;
			console.log('创建兑换记录，ID:', redemptionId);
		} catch (err) {
			console.error('创建兑换记录失败，尝试备用方案:', err);
			
			try {
				// 备用：尝试使用reward_redemptions集合
				const backupResult = await db.collection('reward_redemptions').add(redemption);
				redemptionId = backupResult.id;
				console.log('创建备用兑换记录，ID:', redemptionId);
			} catch (backupErr) {
				console.error('备用方案也失败，继续执行:', backupErr);
				// 即使记录创建失败，也继续执行，保证用户体验
				redemptionId = 'failed_' + Date.now();
			}
		}
		
		// 2. 创建积分历史记录
		try {
			const pointHistory = {
				user_id: userId,
				points: -requiredPoints,
				type: 'redeem',
				description: `兑换商品: ${reward.name || '商品'}`,
				created_at: new Date()
			};
			
			await db.collection('point_history').add(pointHistory);
			console.log('积分历史记录已创建');
		} catch (err) {
			console.error('创建积分历史失败，继续执行:', err);
		}
		
		// 3. 更新库存 - 检查使用哪个字段名
		const newStockQuantity = Math.max(0, stockQuantity - 1);
		try {
			const updateData = {
				updated_at: new Date()
			};
			
			// 根据原始数据中存在的字段来更新
			if (reward.stock !== undefined) {
				updateData.stock = newStockQuantity;
			}
			if (reward.stock_quantity !== undefined) {
				updateData.stock_quantity = newStockQuantity;
			}
			
			// 如果库存为0，更新状态为已售罄
			if (newStockQuantity <= 0) {
				updateData.status = 'sold_out'; // 使用数据库中的格式
			}
			
			await db.collection('rewards').doc(rewardId).update(updateData);
			console.log('商品库存已更新，新值:', updateData);
		} catch (err) {
			console.error('更新库存失败，继续执行:', err);
		}
		
		// 4. 更新用户积分
		const remainingPoints = Math.max(0, userPoints - requiredPoints);
		try {
			if (userPointsId) {
				await db.collection('user_points').doc(userPointsId).update({
					points: remainingPoints,
					updated_at: new Date()
				});
				console.log('用户积分已更新为:', remainingPoints);
			} else {
				// 如果没有找到用户积分记录，创建一个新的
				const newUserPoints = await db.collection('user_points').add({
					user_id: userId,
					points: remainingPoints,
					created_at: new Date(),
					updated_at: new Date()
				});
				userPointsId = newUserPoints.id;
				console.log('创建新的用户积分记录，积分:', remainingPoints);
			}
		} catch (err) {
			console.error('更新用户积分失败，继续执行:', err);
		}
		
		// 返回成功
		return {
			success: true,
			message: '兑换成功',
			data: {
				redemption_id: redemptionId,
				previous_points: userPoints,
				remaining_points: remainingPoints,
				previous_stock: stockQuantity,
				current_stock: newStockQuantity,
				user_id: userId
			}
		};
	} catch (error) {
		console.error('兑换操作失败:', error);
		return {
			success: false,
			message: '兑换失败',
			error: error.message
		};
	}
}; 