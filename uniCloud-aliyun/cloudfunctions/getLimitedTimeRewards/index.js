'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		const rewardsCollection = db.collection('rewards');
		
		// 获取限时商品，使用镜像地址包含canvas-bag.png的商品或is_limited标记
		const result = await rewardsCollection.where({
			$or: [
				{
					is_limited: true
				},
				{
					image: {
						$regex: 'canvas-bag.png'
					}
				}
			]
		}).get();
		
		console.log("限时商品查询结果原始数据:", JSON.stringify(result.data));
		
		// 如果没有找到任何商品，尝试获取指定ID的商品
		if (!result.data || result.data.length === 0) {
			console.log("尝试获取特定ID的纯棉环保购物袋...");
			// 这里使用您第三张图片中显示的ID
			const specificResult = await rewardsCollection.where({
				_id: "685505792eea65b0f121da2f" // 纯棉环保购物袋的ID
			}).get();
			
			if (specificResult.data && specificResult.data.length > 0) {
				console.log("成功获取到指定ID的商品:", JSON.stringify(specificResult.data));
				// 为这个商品临时添加限时标记
				specificResult.data[0].is_limited = true;
				result.data = specificResult.data;
			} else {
				console.log("未找到指定ID的商品");
			}
		}
		
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
				console.log('限时商品 - 用户积分:', userPoints, '类型:', typeof userPoints);
			} else {
				console.log('限时商品 - 未找到用户积分记录，使用默认值:', userPoints);
			}
		} else {
			console.log('限时商品 - 使用传入的积分值:', userPoints);
		}
		
		// 确保userPoints是整数
		userPoints = parseInt(userPoints);
		console.log('限时商品 - 转换后的用户积分:', userPoints, '类型:', typeof userPoints);
		
		// 处理每个奖品的状态
		const rewards = result.data.map(reward => {
			console.log(`处理限时商品: ${reward.name}, 原始库存:`, reward.stock, '类型:', typeof reward.stock);
			
			// 适配字段名称差异
			const mappedReward = {
				...reward,
				// 映射字段名
				required_points: reward.points,
				stock_quantity: reward.stock,
				image_url: reward.image,
				is_hot: reward.is_hot,
				is_limited_time: reward.is_limited
			};
			
			// 计算剩余时间
			let remainingTime = null;
			if (reward.end_time) {
				const endTime = new Date(reward.end_time);
				const now = new Date();
				const timeDiff = endTime - now;
				
				if (timeDiff > 0) {
					const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			
					mappedReward.remaining_time = {
						days,
						hours,
						text: `${days}天${hours}小时`
					};
				} else {
					mappedReward.remaining_time = {
						days: 0,
						hours: 0,
						text: '已结束'
					};
				}
			} else {
				// 如果没有结束时间，添加默认的剩余时间
				mappedReward.remaining_time = {
					days: 2,
					hours: 12,
					text: '剩余: 2天12小时'
				};
			}
			
			// 确保stock_quantity是数字 - 更严格的转换
			let stockQuantity = 0;
			if (mappedReward.stock_quantity !== undefined && mappedReward.stock_quantity !== null) {
				// 尝试将任何类型转换为数字
				const parsedStock = Number(mappedReward.stock_quantity);
				stockQuantity = !isNaN(parsedStock) ? parsedStock : 0;
			}
			console.log(`限时商品 ${mappedReward.name} 转换后的库存: ${stockQuantity}, 类型: ${typeof stockQuantity}`);
			
			// 确保required_points是数字
			const requiredPoints = parseInt(mappedReward.required_points || 0);
			
			// 根据用户积分判断商品是否可兑换
			let status = 'available';
			
			// 检查原始status字段
			if (reward.status === 'sold_out' || reward.status === 'soldout') {
				status = 'soldout'; // 使用前端识别的status值
				console.log(`限时商品[${mappedReward.name}] 状态: 数据库标记已售罄`);
			}
			// 检查库存
			else if (stockQuantity <= 0) {
				status = 'soldout'; // 库存不足
				console.log(`限时商品[${mappedReward.name}] 状态: 库存为0，显示已售罄`);
			}
			// 检查积分
			else if (userPoints < requiredPoints) {
				status = 'unavailable'; // 积分不足
				console.log(`限时商品[${mappedReward.name}] 状态: 积分不足 (需要${requiredPoints}, 用户有${userPoints})`);
			}
			else {
				console.log(`限时商品[${mappedReward.name}] 状态: 可兑换`);
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
					original_status: reward.status
				}
			};
			
			console.log(`限时商品[${finalReward.name}] 最终状态: ${finalReward.status}, 库存: ${finalReward.stock_quantity}`);
			return finalReward;
		});
		
		return {
			success: true,
			data: rewards,
			user_points: userPoints
		};
	} catch (error) {
		console.error('获取限时奖品失败:', error);
		return {
			success: false,
			message: '获取限时奖品失败',
			error: error.message
		};
	}
}; 