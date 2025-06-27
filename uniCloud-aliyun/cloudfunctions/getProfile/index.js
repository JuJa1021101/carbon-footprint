'use strict';
exports.main = async (event, context) => {
  // 获取客户端参数
  const { account } = event;
  
  if (!account) {
    return {
      code: -1,
      msg: '缺少用户账号参数'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 获取用户基本信息
    const userInfo = await db.collection('users').where({ account }).get();
    if (userInfo.data.length === 0) {
      return {
        code: -2,
        msg: '未找到用户信息'
      };
    }
    
    const user = userInfo.data[0];
    
    // 处理日期数据，转换为ISO字符串格式方便前端解析
    if (user.birthdate && user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString();
    }
    
    // 获取用户地址列表
    const addressList = await db.collection('address').where({ user_id: user._id }).get();
    
    // 返回结果
    return {
      code: 0,
      msg: '获取成功',
      data: {
        userInfo: user,
        addressList: addressList.data
      }
    };
  } catch (e) {
    return {
      code: -3,
      msg: '服务器异常',
      error: e.message
    };
  }
}; 