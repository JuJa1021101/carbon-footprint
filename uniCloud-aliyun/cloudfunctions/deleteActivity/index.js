'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	
	// 获取活动ID
	const { _id } = event;
	
	// 校验必填项
	if (!_id) {
		return {
			code: 1,
			message: '缺少活动ID'
		};
	}
	
	// 删除活动
	const result = await db.collection('activity').doc(_id).remove();
	
	return {
		code: 0,
		message: '删除活动成功',
		data: result
	};
}; 