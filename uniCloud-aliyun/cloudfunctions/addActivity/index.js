'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	
	// 获取请求参数
	const { title, description, activity_time, location, status, point, created_by } = event;
	
	// 校验必填项
	if (!title || !description || !activity_time || !location || !status || !created_by) {
		return {
			code: 1,
			message: '缺少必要参数'
		};
	}
	
	// 添加活动
	const result = await db.collection('activity').add({
		title,
		description,
		activity_time,
		location,
		status,
		point: parseInt(point) || 0,
		created_by,
		createdAt: new Date()
	});
	
	return {
		code: 0,
		message: '添加活动成功',
		data: result
	};
}; 