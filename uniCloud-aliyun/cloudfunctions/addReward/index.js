'use strict';

const db = uniCloud.database();
const rewardsCollection = db.collection('rewards');

exports.main = async (event, context) => {
	console.log('addReward function called with event:', event);
	
	try {
		// 验证必要信息
		if (!event.name) {
			return {
				success: false,
				message: '商品名称不能为空'
			};
		}
		
		// 处理图片路径
		let imageUrl = event.image_url;
		if (!imageUrl) {
			// 如果没有提供图片路径，使用默认图片
			imageUrl = '/static/images/mall/default-product.png';
		}
		
		// 确保路径正确格式（处理前导斜杠）
		// 数据库中应该存储不带前导斜杠的路径
		if (imageUrl.startsWith('/static/')) {
			imageUrl = imageUrl.substring(1); // 移除前导斜杠用于存储
			console.log('移除前导斜杠后的图片路径:', imageUrl);
		} else if (imageUrl === '/static/images/mall/default-product.png') {
			imageUrl = 'static/images/mall/default-product.png';
			console.log('使用默认图片路径:', imageUrl);
		}
		
		// 准备数据
		const rewardData = {
			name: event.name,
			description: event.description || '',
			image_url: imageUrl,
			points: event.points || 0,
			stock: event.stock || 0,
			stock_quantity: event.stock || 0, // 兼容两个字段
			category: event.category || 'daily',
			is_hot: event.is_hot === true,
			is_limited: event.is_limited === true,
			is_limited_time: event.is_limited === true, // 保持字段一致
			created_at: new Date(),
			updated_at: new Date(),
			created_by: event.created_by || 'admin',
			status: 'active' // 确保状态字段存在
		};
		
		// 记录要保存的图片路径
		console.log('即将存储到数据库的商品图片路径:', imageUrl);
		
		// 添加到数据库
		try {
			const res = await rewardsCollection.add(rewardData);
			
			console.log('添加商品成功，结果:', res);
			
			// 返回规范化后的数据 - 前端需要带斜杠的路径
			const returnData = {
				...rewardData,
				_id: res.id,
				// 确保返回给前端的图片路径带有前导斜杠
				image_url: imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl
			};
			
			console.log('返回给前端的商品数据:', {
				name: returnData.name,
				image_url: returnData.image_url
			});
			
			return {
				success: true,
				message: '添加商品成功',
				data: returnData
			};
		} catch (dbError) {
			console.error('添加到数据库失败:', dbError);
			return {
				success: false,
				message: '添加到数据库失败: ' + dbError.message
			};
		}
	} catch (error) {
		console.error('添加商品失败:', error);
		return {
			success: false,
			message: '添加商品失败：' + error.message
		};
	}
}; 