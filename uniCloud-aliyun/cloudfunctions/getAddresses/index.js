'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('getAddresses function called with event:', event);
	
	// 获取用户ID
	const userId = event.userId || context.USERID;
	
	console.log('User ID from request:', userId);
	
	let queryUserId = userId;
	
	// 如果没有用户ID，尝试使用默认用户
	if (!queryUserId) {
		console.log('No userId provided, attempting to use default user');
		try {
			// 首先尝试在members表中查找测试用户
			const membersCollection = db.collection('members');
			const testUsers = await membersCollection.where({
				mobile: '18379364964'  // 使用测试手机号作为默认用户标识
			}).get();
			
			if (testUsers.data.length > 0) {
				queryUserId = testUsers.data[0]._id;
				console.log('Using default test user from members collection, ID:', queryUserId);
			} else {
				// 如果在members表中没找到，尝试在users表中查找
				const usersCollection = db.collection('users');
				const usersTestUsers = await usersCollection.where({
					username: 'default_user'
				}).get();
				
				if (usersTestUsers.data.length > 0) {
					queryUserId = usersTestUsers.data[0]._id;
					console.log('Using default test user from users collection, ID:', queryUserId);
				} else {
					// 创建默认用户
					console.log('Creating default test user in members collection');
					const newUser = {
						account: 'test_account',
						avatar: '/static/images/avatars/default-avatar.png',
						mobile: '18379364964',
						nickname: '测试用户',
						token: 'simpletoken_' + Date.now(),
						gender: '未知',
						level: 1,
						points: 300,  // 默认300积分
						ecoDays: 0,
						created_at: new Date(),
						updated_at: new Date()
					};
					
					const result = await membersCollection.add(newUser);
					newUser._id = result.id;
					queryUserId = newUser._id;
					console.log('Created new default test user with ID:', queryUserId);
				}
			}
		} catch (error) {
			console.error('Error finding or creating default user:', error);
		}
	}
	
	// 如果仍然没有用户ID，返回错误
	if (!queryUserId) {
		console.log('No valid user ID available');
		return {
			success: false,
			message: '未提供有效的用户ID'
		};
	}
	
	try {
		console.log('Querying addresses for user ID:', queryUserId);
		
		// 查询用户地址
		const addressCollection = db.collection('address');
		const result = await addressCollection.where({
			user_id: queryUserId
		}).get();
		
		console.log('Found addresses:', result.data);
		
		// 找出默认地址
		let defaultAddress = null;
		const addresses = result.data.map(addr => {
			// 将字段名规范化，以适配前端
			const formatted = {
				_id: addr._id,
				user_id: addr.user_id,
				name: addr.receiver || addr.name,  // 支持两种字段名
				phone: addr.phone,
				address: addr.addall || addr.address,  // 支持两种字段名
				region: addr.add || addr.region,      // 支持两种字段名
				is_default: addr.isDefault || addr.is_default  // 支持两种字段名
			};
			
			if (addr.isDefault || addr.is_default) {
				defaultAddress = formatted;
			}
			
			return formatted;
		});
		
		// 如果没有默认地址但有地址，将第一个设为默认
		if (!defaultAddress && addresses.length > 0) {
			defaultAddress = addresses[0];
		}
		
		console.log('Returning addresses:', addresses.length);
		
		return {
			success: true,
			data: addresses,
			default_address: defaultAddress
		};
	} catch (error) {
		console.error('获取地址失败:', error);
		return {
			success: false,
			message: '获取地址失败: ' + error.message,
			error: error.message
		};
	}
}; 