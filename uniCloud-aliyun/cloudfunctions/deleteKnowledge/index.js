'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const knowledgeCollection = db.collection('knowledge');
	
	const { _id } = event;
	
	if (!_id) {
		return {
			code: 1,
			message: '缺少知识ID'
		}
	}
	
	try {
		await knowledgeCollection.doc(_id).remove();
		return {
			code: 0,
			message: '删除成功'
		}
	} catch (e) {
		return {
			code: 1,
			message: e.message || '删除失败'
		}
	}
}; 