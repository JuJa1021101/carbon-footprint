'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	
	// 获取请求参数
	const { _id, title, description, activity_time, location, status, point } = event;
	
	// 校验必填项
	if (!_id || !title || !description || !activity_time || !location || !status) {
		return {
			code: 1,
			message: '缺少必要参数'
		};
	}
	
	// 更新活动
	const result = await db.collection('activity').doc(_id).update({
		title,
		description,
		activity_time,
		location,
		status,
		point: parseInt(point) || 0
	});
	
	return {
		code: 0,
		message: '更新活动成功',
		data: result
	};
}; 