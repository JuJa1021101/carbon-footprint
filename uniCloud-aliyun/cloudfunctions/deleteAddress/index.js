'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('deleteAddress function called with event:', event);
	
	// 获取用户ID和地址ID
	const userId = event.userId || context.USERID;
	const { addressId } = event;
	
	console.log('User ID from request:', userId);
	console.log('Address ID to delete:', addressId);
	
	if (!addressId) {
		console.log('No address ID provided');
		return {
			success: false,
			message: '未提供地址ID'
		};
	}
	
	try {
		const addressCollection = db.collection('address');
		
		// 查询地址是否存在且属于该用户
		const addressResult = await addressCollection.doc(addressId).get();
		
		if (!addressResult.data || addressResult.data.length === 0) {
			console.log('Address not found');
			return {
				success: false,
				message: '地址不存在'
			};
		}
		
		const address = addressResult.data[0];
		
		// 如果提供了用户ID，验证地址是否属于该用户
		if (userId && address.user_id !== userId) {
			console.log('Address does not belong to the user');
			return {
				success: false,
				message: '无权删除此地址'
			};
		}
		
		// 删除地址
		const result = await addressCollection.doc(addressId).remove();
		
		console.log('Address deleted successfully, result:', result);
		
		// 如果删除的是默认地址，将第一个地址设为默认
		if (address.isDefault || address.is_default) {
			// 查询用户的其他地址
			const otherAddresses = await addressCollection.where({
				user_id: address.user_id
			}).get();
			
			if (otherAddresses.data && otherAddresses.data.length > 0) {
				// 将第一个地址设为默认
				await addressCollection.doc(otherAddresses.data[0]._id).update({
					isDefault: true,
					is_default: true
				});
				
				console.log('Set new default address:', otherAddresses.data[0]._id);
			}
		}
		
		return {
			success: true,
			message: '地址删除成功'
		};
	} catch (error) {
		console.error('删除地址失败:', error);
		return {
			success: false,
			message: '删除地址失败: ' + error.message,
			error: error.message
		};
	}
}; 