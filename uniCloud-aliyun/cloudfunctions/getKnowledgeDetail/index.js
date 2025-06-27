'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const cmd = db.command;
	const knowledgeCollection = db.collection('knowledge');
	
	const { id } = event;
	
	if (!id) {
		return {
			code: 1,
			message: '参数不完整，缺少知识ID'
		}
	}
	
	try {
		// 先更新浏览量
		await knowledgeCollection.doc(id).update({
			views: cmd.inc(1)
		});
		
		// 获取更新后的数据
		const result = await knowledgeCollection.doc(id).get();
		
		if (result.data && result.data.length > 0) {
			return {
				code: 0,
				message: '获取成功',
				data: result.data[0]
			}
		} else {
			return {
				code: 1,
				message: '找不到该知识',
				data: null
			}
		}
	} catch (e) {
		console.error(e);
		return {
			code: 1,
			message: e.message || '获取知识详情失败'
		}
	}
}; 