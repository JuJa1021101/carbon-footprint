'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const knowledgeCollection = db.collection('knowledge');
	
	let res = await knowledgeCollection
		.orderBy('created_at', 'desc')
		.get();
	
	return {
		code: 0,
		data: res.data
	}
}; 