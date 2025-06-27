'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const knowledgeCollection = db.collection('knowledge');
	
	const { _id, title, content, image, tags } = event;
	
	if (!_id) {
		return {
			code: 1,
			message: '缺少知识ID'
		}
	}
	
	if (!title || !content) {
		return {
			code: 1,
			message: '标题和内容不能为空'
		}
	}
	
	const data = {
		title,
		content,
		image: image || '',
		tags: tags || []
	}
	
	try {
		await knowledgeCollection.doc(_id).update(data);
		return {
			code: 0,
			message: '更新成功'
		}
	} catch (e) {
		return {
			code: 1,
			message: e.message || '更新失败'
		}
	}
}; 