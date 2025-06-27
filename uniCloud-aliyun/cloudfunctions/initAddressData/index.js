'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('initAddressData function called with event:', event);
	
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
		console.log('Initializing address data for user ID:', queryUserId);
		
		// 清除现有地址
		const addressCollection = db.collection('address');
		const existingAddresses = await addressCollection.where({
			user_id: queryUserId
		}).get();
		
		if (existingAddresses.data && existingAddresses.data.length > 0) {
			console.log(`Found ${existingAddresses.data.length} existing addresses, deleting...`);
			
			for (const addr of existingAddresses.data) {
				await addressCollection.doc(addr._id).remove();
			}
			
			console.log('Existing addresses deleted');
		}
		
		// 准备测试地址数据
		const testAddresses = [
			{
				user_id: queryUserId,
				receiver: '张三',
				phone: '13112345678',
				add: '广东省 广州市 天河区',
				addall: '珠江新城58号环保花园C座301室',
				isDefault: true,
				is_default: true,
				name: '张三',
				address: '珠江新城58号环保花园C座301室',
				region: '广东省 广州市 天河区',
				create_date: new Date()
			},
			{
				user_id: queryUserId,
				receiver: '李四',
				phone: '13444444444',
				add: '北京市 北京市 昌平区',
				addall: '回龙观西大街金隅万科广场',
				isDefault: false,
				is_default: false,
				name: '李四',
				address: '回龙观西大街金隅万科广场',
				region: '北京市 北京市 昌平区',
				create_date: new Date()
			},
			{
				user_id: queryUserId,
				receiver: '王五',
				phone: '13555555555',
				add: '北京市 北京市 朝阳区',
				addall: '建国路88号SOHO现代城',
				isDefault: false,
				is_default: false,
				name: '王五',
				address: '建国路88号SOHO现代城',
				region: '北京市 北京市 朝阳区',
				create_date: new Date()
			}
		];
		
		// 添加测试地址
		for (const addr of testAddresses) {
			await addressCollection.add(addr);
		}
		
		console.log(`Added ${testAddresses.length} test addresses`);
		
		return {
			success: true,
			message: `成功初始化${testAddresses.length}个测试地址`,
			userId: queryUserId
		};
	} catch (error) {
		console.error('初始化地址数据失败:', error);
		return {
			success: false,
			message: '初始化地址数据失败: ' + error.message,
			error: error.message
		};
	}
};