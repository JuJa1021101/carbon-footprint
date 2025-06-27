'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('searchRewards function called with event:', event);
	
	try {
		const { query, page = 1, pageSize = 10 } = event;
		
		// 如果搜索关键词为空，返回空结果
		if (!query || query.trim() === '') {
			console.log('Empty search query');
			return {
				success: true,
				data: [],
				total: 0,
				message: '搜索关键词不能为空'
			};
		}
		
		// 获取用户ID
		const userId = event.userId || context.USERID || '';
		console.log('User ID from request:', userId);
		
		// 如果有用户ID，获取用户积分
		let userPoints = 300; // 默认设置为300积分
		if (userId) {
			try {
				// 尝试从user_points表获取积分
				const userPointsCollection = db.collection('user_points');
				const userPointsResult = await userPointsCollection.where({
					user_id: userId
				}).get();
				
				if (userPointsResult.data && userPointsResult.data.length > 0) {
					userPoints = userPointsResult.data[0].points || 300;
					console.log('搜索奖品 - 用户积分:', userPoints);
				} else {
					// 尝试从members表中获取积分
					const membersCollection = db.collection('members');
					const memberResult = await membersCollection.doc(userId).get();
					
					if (memberResult.data && memberResult.data.length > 0) {
						const member = memberResult.data[0];
						userPoints = member.points || 300;
						console.log('搜索奖品 - 从members表获取积分:', userPoints);
					} else {
						console.log('搜索奖品 - 未找到用户积分记录，使用默认值:', userPoints);
					}
				}
			} catch (err) {
				console.error('获取用户积分失败:', err);
				// 使用默认积分继续
			}
		}
		
		// 安全处理搜索关键词，确保是字符串并去除特殊字符
		const safeQuery = (query || '').toString().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		console.log('Safe search query:', safeQuery);
		
		// 构建查询条件 - 在name、description或category中搜索关键词
		const rewardsCollection = db.collection('rewards');
		
		// 使用正则表达式进行模糊匹配，不区分大小写
		const searchQuery = rewardsCollection.where(db.command.or([
			{
				name: new RegExp(safeQuery, 'i') // i表示不区分大小写
			},
			{
				description: new RegExp(safeQuery, 'i')
			},
			{
				category: new RegExp(safeQuery, 'i')
			}
		]));
		
		// 获取总数
		const countResult = await searchQuery.count();
		const total = countResult.total;
		console.log('搜索结果总数:', total);
		
		// 如果没有找到匹配的结果，直接返回
		if (total === 0) {
			return {
				success: true,
				data: [],
				total: 0,
				page,
				pageSize,
				query
			};
		}
		
		// 分页
		const skip = (page - 1) * pageSize;
		const result = await searchQuery.skip(skip).limit(pageSize).get();
		
		// 确保result.data存在
		if (!result.data) {
			console.log('查询结果为空');
			return {
				success: true,
				data: [],
				total: 0,
				page,
				pageSize,
				query
			};
		}
		
		// 处理每个奖品，添加状态信息
		const rewards = result.data.map(reward => {
			let status = 'available'; // 默认可用
			
			// 确保stock_quantity是数字
			const stockQuantity = typeof reward.stock_quantity === 'number' ? reward.stock_quantity : 0;
			
			// 自动计算状态
			if (stockQuantity <= 0) {
				status = 'sold_out'; // 已售罄
			} else {
				// 确保required_points是数字，并进行比较
				const requiredPoints = parseInt(reward.required_points) || 0;
				console.log(`搜索奖品 - 比较: 用户积分(${userPoints}) vs 所需积分(${requiredPoints})`);
				
				if (userPoints < requiredPoints) {
					status = 'unavailable'; // 积分不足
				} else {
					status = 'available'; // 可兑换
				}
			}
			
			// 处理限时奖品的剩余时间
			let remainingTime = null;
			if (reward.is_limited_time && reward.end_time) {
				try {
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
				} catch (err) {
					console.error('计算剩余时间失败:', err);
				}
			}
			
			// 确保图片URL正确
			const imageUrl = reward.image_url || '/static/images/mall/default-product.png';
			
			return {
				...reward,
				stock_quantity: stockQuantity, // 确保返回有效的库存数量
				status,
				remaining_time: remainingTime,
				image_url: imageUrl
			};
		});
		
		console.log(`找到 ${rewards.length} 个匹配查询的奖品: ${query}`);
		
		return {
			success: true,
			data: rewards,
			total,
			page,
			pageSize,
			query
		};
	} catch (error) {
		console.error('搜索奖品失败:', error);
		return {
			success: false,
			message: '搜索失败: ' + error.message,
			error: error.message,
			data: [] // 确保即使出错也返回空数组
		};
	}
}; 