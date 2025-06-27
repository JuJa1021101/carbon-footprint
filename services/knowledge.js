/**
 * 环保知识与小贴士服务
 */

// 获取环保知识列表
export async function getKnowledgeList() {
  try {
    const result = await uniCloud.callFunction({
      name: 'getKnowledge'
    });
    
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || '获取环保知识列表失败');
    }
  } catch (error) {
    console.error('获取环保知识列表失败:', error);
    throw error;
  }
}

// 获取环保知识详情
export async function getKnowledgeDetail(id) {
  try {
    const result = await uniCloud.callFunction({
      name: 'getKnowledgeDetail',
      data: { id }
    });
    
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || '获取环保知识详情失败');
    }
  } catch (error) {
    console.error('获取环保知识详情失败:', error);
    throw error;
  }
}

// 点赞/取消点赞环保知识
export async function toggleLikeKnowledge(id, isLike) {
  try {
    const result = await uniCloud.callFunction({
      name: 'updateKnowledgeLikes',
      data: { 
        id,
        action: isLike ? 'like' : 'unlike'
      }
    });
    
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      throw new Error(result.result.message || '更新点赞状态失败');
    }
  } catch (error) {
    console.error('更新点赞状态失败:', error);
    throw error;
  }
} 