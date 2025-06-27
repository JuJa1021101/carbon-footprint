'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const knowledgeCollection = db.collection('knowledge');
	
	const { title, content, image, tags } = event;
	
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
		tags: tags || [],
		views: 0,
		likes: 0,
		created_at: new Date()
	}
	
	try {
		const res = await knowledgeCollection.add(data);
		return {
			code: 0,
			message: '添加成功',
			data: res
		}
	} catch (e) {
		return {
			code: 1,
			message: e.message || '添加失败'
		}
	}
}; 