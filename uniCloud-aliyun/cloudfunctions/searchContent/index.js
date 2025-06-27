'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('searchContent function called with event:', event);
	
	try {
		const { keyword, page = 1, pageSize = 10 } = event;
		
		// 如果搜索关键词为空，返回空结果
		if (!keyword || keyword.trim() === '') {
			console.log('Empty search keyword');
			return {
				code: 0,
				data: {
					results: [],
					total: 0,
					message: '搜索关键词不能为空'
				}
			};
		}
		
		// 安全处理搜索关键词，确保是字符串并去除特殊字符
		const safeKeyword = (keyword || '').toString().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		console.log('Safe search keyword:', safeKeyword);
		
		// 使用正则表达式进行模糊匹配，不区分大小写
		const regExp = new RegExp(safeKeyword, 'i'); // i表示不区分大小写
		
		// 构建查询条件 - 在知识表的title和content中搜索关键词
		const knowledgeCollection = db.collection('knowledge');
		const knowledgeQuery = knowledgeCollection.where(db.command.or([
			{
				title: regExp
			},
			{
				content: regExp
			},
			{
				tags: regExp
			}
		]));
		
		// 构建查询条件 - 在活动表的title和description中搜索关键词
		const activityCollection = db.collection('activity');
		const activityQuery = activityCollection.where(db.command.or([
			{
				title: regExp
			},
			{
				description: regExp
			},
			{
				location: regExp
			}
		]));
		
		// 查询知识表
		const knowledgeResult = await knowledgeQuery.get();
		const knowledgeData = (knowledgeResult.data || []).map(item => ({
			...item,
			type: 'knowledge',
			typeText: '环保知识',
			createdAt: item.created_at || Date.now()
		}));
		
		// 查询活动表
		const activityResult = await activityQuery.get();
		const activityData = (activityResult.data || []).map(item => ({
			...item,
			type: 'activity',
			typeText: '环保活动',
			createdAt: item.created_at || Date.now()
		}));
		
		// 合并结果
		let results = [...knowledgeData, ...activityData];
		
		// 按相关性和时间排序（标题匹配优先，然后是创建时间降序）
		results.sort((a, b) => {
			const aTitleMatch = a.title && a.title.toLowerCase().includes(safeKeyword.toLowerCase());
			const bTitleMatch = b.title && b.title.toLowerCase().includes(safeKeyword.toLowerCase());
			
			if (aTitleMatch && !bTitleMatch) return -1;
			if (!aTitleMatch && bTitleMatch) return 1;
			
			// 如果标题匹配相同，则按创建时间降序排序
			return (b.createdAt || 0) - (a.createdAt || 0);
		});
		
		// 获取总数
		const total = results.length;
		console.log('搜索结果总数:', total);
		
		// 分页
		const skip = (page - 1) * pageSize;
		results = results.slice(skip, skip + pageSize);
		
		return {
			code: 0,
			data: {
				results,
				total,
				page,
				pageSize,
				keyword
			}
		};
	} catch (error) {
		console.error('搜索内容失败:', error);
		return {
			code: -1,
			data: {
				results: [],
				total: 0,
			},
			message: '搜索失败: ' + error.message
		};
	}
}; 