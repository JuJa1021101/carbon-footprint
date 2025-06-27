'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('getUserRedemptions function called with event:', event);
	
	// 获取用户ID
	let userId = event.userId || context.USERID;
	
	console.log('User ID from request:', userId);
	
	// 如果没有userId，尝试查找或创建默认测试用户
	if (!userId) {
		console.log('No userId provided, attempting to find or create default user');
		try {
			const membersCollection = db.collection('members');
			const testUsers = await membersCollection.where({
				mobile: '18379364964'  // 使用测试手机号作为默认用户标识
			}).get();
			
			if (testUsers.data.length > 0) {
				userId = testUsers.data[0]._id;
				console.log('Using default user ID:', userId);
			} else {
				// 创建默认用户
				console.log('Creating default user in members collection');
				const newUser = {
					account: 'test_account',
					avatar: '/static/images/avatars/default-avatar.png',
					mobile: '18379364964',
					nickname: '测试用户',
					token: 'simpletoken_' + Date.now(),
					gender: '未知',
					level: 1,
					points: 300,  // 默认300积分
					ecoDays: 0
				};
				
				const result = await membersCollection.add(newUser);
				userId = result.id;
				console.log('Created new default user with ID:', userId);
			}
		} catch (error) {
			console.error('Error finding or creating default user:', error);
		}
	}
	
	if (!userId) {
		console.log('No valid user ID available');
		return {
			success: false,
			message: '未提供有效的用户ID'
		};
	}
	
	try {
		console.log('Getting redemptions for user:', userId);
		
		// 查询用户兑换记录
		const redemptionsCollection = db.collection('reward_redemptions');
		
		// 关联查询奖品信息和地址信息
		const $ = db.command.aggregate;
		const result = await redemptionsCollection.aggregate()
			.match({
				user_id: userId
			})
			.lookup({
				from: 'rewards',
				localField: 'reward_id',
				foreignField: '_id',
				as: 'reward'
			})
			.lookup({
				from: 'address',
				localField: 'address_id',
				foreignField: '_id',
				as: 'address'
			})
			.sort({
				redemption_time: -1
			})
			.end();
		
		console.log('Found redemptions:', result.data.length);
		
		// 处理查询结果，简化数据结构
		const redemptions = result.data.map(item => {
			return {
				...item,
				reward: item.reward.length > 0 ? item.reward[0] : null,
				address: item.address.length > 0 ? item.address[0] : null
			};
		});
		
		return {
			success: true,
			data: redemptions
		};
	} catch (error) {
		console.error('获取兑换记录失败:', error);
		return {
			success: false,
			message: '获取兑换记录失败: ' + error.message,
			error: error.message
		};
	}
}; 