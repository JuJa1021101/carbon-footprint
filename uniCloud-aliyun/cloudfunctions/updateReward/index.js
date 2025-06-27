'use strict';

const db = uniCloud.database();
const rewardsCollection = db.collection('rewards');

exports.main = async (event, context) => {
	console.log('updateReward function called with event:', event);
	
	try {
		// 验证必要信息
		if (!event._id) {
			return {
				success: false,
				message: '商品ID不能为空'
			};
		}
		
		// 处理图片路径
		let imageUrl = event.image_url;
		if (!imageUrl) {
			// 如果没有提供图片路径，使用默认图片
			imageUrl = '/static/images/mall/default-product.png';
		}
		// 确保路径正确格式（移除前导/）
		if (imageUrl.startsWith('/static/')) {
			imageUrl = imageUrl.substring(1);
		}
		
		// 准备数据
		const updateData = {
			name: event.name,
			description: event.description || '',
			image_url: imageUrl,
			points: event.points || 0,
			stock: event.stock || 0,
			category: event.category || 'daily',
			is_hot: event.is_hot === true,
			is_limited: event.is_limited === true,
			is_limited_time: event.is_limited === true, // 保持字段一致
			updated_at: new Date()
		};
		
		// 更新数据库
		const res = await rewardsCollection.doc(event._id).update(updateData);
		
		console.log('更新商品成功，结果:', res);
		
		return {
			success: true,
			message: '更新商品成功',
			data: {
				...updateData,
				_id: event._id
			}
		};
	} catch (error) {
		console.error('更新商品失败:', error);
		return {
			success: false,
			message: '更新商品失败：' + error.message
		};
	}
}; 