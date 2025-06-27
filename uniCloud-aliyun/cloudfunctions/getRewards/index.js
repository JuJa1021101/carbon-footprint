'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		const { category, countOnly } = event;
		const rewardsCollection = db.collection('rewards');
		
		let query = rewardsCollection.where({});
		
		// 如果提供了分类，按分类筛选
		if (category && category !== '全部') {
			query = query.where({
				category: category
			});
		}
		
		// 如果只需要统计数量，则直接返回数量
		if (countOnly) {
			const countResult = await query.count();
			console.log("商品总数:", countResult.total);
			return {
				success: true,
				count: countResult.total
			};
		}
		
		const result = await query.orderBy('created_at', 'desc').get();
		console.log("数据库查询结果原始数据:", JSON.stringify(result.data));
		
		// 获取用户ID
		const userId = event.userId || context.USERID || '';
		
		// 使用传入的积分或从数据库获取
		let userPoints = event.userPoints !== undefined ? parseInt(event.userPoints) : 300;
		
		// 如果没有传入积分且有用户ID，从数据库获取积分
		if (event.userPoints === undefined && userId) {
			const userPointsCollection = db.collection('user_points');
			const userPointsResult = await userPointsCollection.where({
				user_id: userId
			}).get();
			
			if (userPointsResult.data && userPointsResult.data.length > 0) {
				userPoints = userPointsResult.data[0].points || 300;
				console.log('用户积分:', userPoints, '类型:', typeof userPoints);
			} else {
				console.log('未找到用户积分记录，使用默认值:', userPoints);
			}
		} else {
			console.log('使用传入的积分值:', userPoints);
		}
		
		// 确保userPoints是整数
		userPoints = parseInt(userPoints);
		console.log('转换后的用户积分:', userPoints, '类型:', typeof userPoints);
		
		// 处理每个奖品的状态
		const rewards = result.data.map(reward => {
			console.log(`处理商品: ${reward.name}, 原始库存:`, reward.stock, '类型:', typeof reward.stock);
			
			// 处理图片路径 - 确保不论存储格式如何，返回给前端的始终是正确路径
			let imageUrl = reward.image_url || reward.image || '';
			// 如果没有图片路径，使用默认图片
			if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
				imageUrl = 'static/images/mall/default-product.png';
			}
			
			// 适配字段名称差异
			const mappedReward = {
				...reward,
				// 映射字段名
				required_points: reward.points,
				stock_quantity: reward.stock,
				// 确保图片路径存在且格式正确
				image_url: imageUrl,
				is_hot: reward.is_hot,
				is_limited_time: reward.is_limited
			};
			
			console.log(`商品[${mappedReward.name}] 原始图片路径: ${imageUrl}`);
			
			// 确保stock_quantity是数字 - 更严格的转换
			let stockQuantity = 0;
			if (mappedReward.stock_quantity !== undefined && mappedReward.stock_quantity !== null) {
				// 尝试将任何类型转换为数字
				const parsedStock = Number(mappedReward.stock_quantity);
				stockQuantity = !isNaN(parsedStock) ? parsedStock : 0;
			}
			console.log(`${mappedReward.name} 转换后的库存: ${stockQuantity}, 类型: ${typeof stockQuantity}`);
			
			// 确保required_points是数字
			const requiredPoints = parseInt(mappedReward.required_points || 0);
			
			// 根据用户积分判断商品是否可兑换
			let status = 'available';
			
			// 检查原始status字段
			if (reward.status === 'sold_out') {
				status = 'soldout'; // 使用前端识别的status值
				console.log(`奖品[${mappedReward.name}] 状态: 数据库标记已售罄`);
			}
			// 检查库存
			else if (stockQuantity <= 0) {
				status = 'soldout'; // 库存不足
				console.log(`奖品[${mappedReward.name}] 状态: 库存为0，显示已售罄`);
			}
			// 检查积分
			else if (userPoints < requiredPoints) {
				status = 'unavailable'; // 积分不足
				console.log(`奖品[${mappedReward.name}] 状态: 积分不足 (需要${requiredPoints}, 用户有${userPoints})`);
			}
			else {
				console.log(`奖品[${mappedReward.name}] 状态: 可兑换`);
			}
			
			// 在返回值中包含调试信息
			const finalReward = {
				...mappedReward,
				stock_quantity: stockQuantity, // 保留转换后的库存值
				status,
				_debug: {
					original_stock: reward.stock,
					original_stock_type: typeof reward.stock,
					converted_stock: stockQuantity,
					original_status: reward.status,
					original_image: reward.image_url || reward.image
				}
			};
			
			console.log(`商品[${finalReward.name}] 最终状态: ${finalReward.status}, 库存: ${finalReward.stock_quantity}, 图片路径: ${finalReward.image_url}`);
			return finalReward;
		});
		
		return {
			success: true,
			data: rewards,
			user_points: userPoints
		};
	} catch (error) {
		console.error('获取奖品失败:', error);
		return {
			success: false,
			message: '获取奖品列表失败',
			error: error.message
		};
	}
}; 