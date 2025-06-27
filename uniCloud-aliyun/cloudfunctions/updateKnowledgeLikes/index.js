'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const cmd = db.command;
	const knowledgeCollection = db.collection('knowledge');
	
	const { id, action } = event;
	
	if (!id || !action) {
		return {
			code: 1,
			message: '参数不完整'
		}
	}
	
	try {
		let updateData = {};
		
		if (action === 'like') {
			updateData.likes = cmd.inc(1);
		} else if (action === 'unlike') {
			updateData.likes = cmd.inc(-1);
		} else {
			return {
				code: 1,
				message: '无效的操作类型'
			}
		}
		
		const result = await knowledgeCollection.doc(id).update(updateData);
		
		// 获取更新后的数据
		const updatedData = await knowledgeCollection.doc(id).get();
		
		return {
			code: 0,
			message: '更新成功',
			data: updatedData.data[0]
		}
	} catch (e) {
		return {
			code: 1,
			message: e.message || '更新点赞状态失败'
		}
	}
}; 