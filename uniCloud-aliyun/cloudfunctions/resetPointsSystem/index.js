'use strict';

const db = uniCloud.database();

// 重置积分系统的云函数
exports.main = async (event, context) => {
	console.log('resetPointsSystem function called with event:', event);
	
	try {
		// 1. 删除所有用户积分记录
		console.log('正在删除所有用户积分记录...');
		await db.collection('user_points').remove();
		console.log('所有用户积分记录已删除');
		
		// 2. 删除所有积分历史记录
		console.log('正在删除所有积分历史记录...');
		await db.collection('point_history').remove();
		console.log('所有积分历史记录已删除');
		
		// 3. 创建一个统一的默认用户积分记录
		console.log('正在创建默认用户积分记录...');
		const defaultPoints = 1000; // 设置默认积分为1000
		
		const defaultUser = {
			user_id: '10086420', // 使用固定的默认用户ID
			points: defaultPoints,
			created_at: new Date(),
			updated_at: new Date()
		};
		
		const result = await db.collection('user_points').add(defaultUser);
		console.log('默认用户积分记录已创建，ID:', result.id);
		
		// 4. 创建一个初始积分历史记录
		const historyRecord = {
			user_id: '10086420',
			points: defaultPoints,
			type: 'system',
			description: '系统初始化积分',
			created_at: new Date()
		};
		
		await db.collection('point_history').add(historyRecord);
		console.log('初始积分历史记录已创建');
		
		// 返回成功
		return {
			success: true,
			message: '积分系统已重置',
			data: {
				default_points: defaultPoints
			}
		};
	} catch (error) {
		console.error('重置积分系统失败:', error);
		return {
			success: false,
			message: '重置积分系统失败',
			error: error.message
		};
	}
}; 
 