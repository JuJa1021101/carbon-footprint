'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('saveAddress function called with event:', event);
	
	// 获取用户ID和地址信息
	const userId = event.userId || context.USERID;
	const { address, isEdit } = event;
	
	console.log('User ID from request:', userId);
	console.log('Address data:', address);
	
	let finalUserId = userId;
	
	if (!finalUserId) {
		// 如果没有userId，尝试创建或获取默认用户
		try {
			console.log('No userId found, attempting to find or create default user');
			
			// 首先尝试在members表中查找测试用户
			const membersCollection = db.collection('members');
			const testUsers = await membersCollection.where({
				mobile: '18379364964'  // 使用测试手机号作为默认用户标识
			}).get();
			
			if (testUsers.data.length > 0) {
				console.log('Found existing default user in members collection');
				finalUserId = testUsers.data[0]._id;
				console.log('Using default test user from members collection, ID:', finalUserId);
			} else {
				// 如果在members表中没找到，尝试在users表中查找
				const usersCollection = db.collection('users');
				const usersTestUsers = await usersCollection.where({
					username: 'default_user'
				}).get();
				
				if (usersTestUsers.data.length > 0) {
					finalUserId = usersTestUsers.data[0]._id;
					console.log('Using default test user from users collection, ID:', finalUserId);
				} else {
					// 创建测试用户
					console.log('Creating new default user in members collection');
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
					finalUserId = result.id;
					console.log('Created new default user with ID:', finalUserId);
				}
			}
		} catch (error) {
			console.error('无法获取或创建默认用户:', error);
		}
		
		if (!finalUserId) {
			console.log('Failed to get or create user');
			return {
				success: false,
				message: '未登录或登录已过期，请先登录'
			};
		}
	}
	
	if (!address || !address.receiver || !address.phone || !address.add || !address.addall) {
		console.log('Incomplete address information');
    return {
			success: false,
			message: '地址信息不完整'
    };
  }
  
	try {
		const addressCollection = db.collection('address');
  
		// 如果是默认地址，先将其他地址设置为非默认
		if (address.isDefault) {
			console.log('Setting address as default, removing default flag from other addresses');
			await addressCollection.where({
				user_id: finalUserId,
				isDefault: true
			}).update({
          isDefault: false
        });
			
			// 同时检查is_default字段
			await addressCollection.where({
				user_id: finalUserId,
				is_default: true
			}).update({
				is_default: false
			});
		}
		
		let result;
		if (isEdit && address._id) {
			// 更新地址
			console.log('Updating existing address with ID:', address._id);
			result = await addressCollection.doc(address._id).update({
				receiver: address.receiver,
				phone: address.phone,
				add: address.add,
				addall: address.addall,
				isDefault: address.isDefault,
				is_default: address.isDefault, // 同时更新is_default字段
				name: address.receiver, // 同时更新name字段
				address: address.addall, // 同时更新address字段
				region: address.add // 同时更新region字段
			});
    } else {
			// 添加新地址
			console.log('Creating new address for user with ID:', finalUserId);
			result = await addressCollection.add({
				user_id: finalUserId,
				receiver: address.receiver,
				phone: address.phone,
				add: address.add,
				addall: address.addall,
				isDefault: address.isDefault,
				is_default: address.isDefault, // 同时添加is_default字段
				name: address.receiver, // 同时添加name字段
				address: address.addall, // 同时添加address字段
				region: address.add // 同时添加region字段
			});
		}
		
		console.log('Address saved successfully, result:', result);
      return {
			success: true,
			message: isEdit ? '地址更新成功' : '地址添加成功',
			data: result
      };
	} catch (error) {
		console.error('保存地址失败:', error);
    return {
			success: false,
			message: '保存地址失败: ' + error.message,
			error: error.message
    };
  }
}; 