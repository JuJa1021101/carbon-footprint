'use strict';
exports.main = async (event, context) => {
  const { type, code, encryptedData, iv, phoneNumber } = event;
  
  // 连接数据库
  const db = uniCloud.database();
  const membersCollection = db.collection('members');
  
  try {
    // 根据登录类型处理
    if (type === 'wxmin') {
      // 微信小程序手机号登录
      // 这里应该使用真实的小程序信息解密手机号
      // 由于是演示，我们模拟处理
      
      // 模拟解密后的手机号
      const mobile = '18379364964';
      
      // 检查用户是否已存在
      let userInfo = await membersCollection.where({ mobile }).get();
      
      if (userInfo.data.length > 0) {
        // 用户已存在，更新登录时间
        const userId = userInfo.data[0]._id;
        await membersCollection.doc(userId).update({
          lastLoginDate: new Date(),
          token: 'wxtoken_' + Date.now()
        });
        
        // 重新获取最新的用户信息
        userInfo = await membersCollection.doc(userId).get();
        
        return {
          code: 0,
          message: '登录成功',
          data: userInfo.data[0]
        };
      } else {
        // 创建新用户
        const newUser = {
          account: 'wx_' + Date.now().toString(36),
          avatar: '/static/images/avatars/default-avatar.png',
          mobile: mobile,
          nickname: '环保用户',
          token: 'wxtoken_' + Date.now(),
          gender: '未知',
          level: 1,
          points: 0,
          ecoDays: 0
        };
        
        const result = await membersCollection.add(newUser);
        newUser._id = result.id;
        
        return {
          code: 0,
          message: '注册成功',
          data: newUser
        };
      }
    } else if (type === 'simple') {
      // 模拟登录
      // 检查是否是测试手机号
      if (phoneNumber !== '18379364964') {
        return {
          code: -1,
          message: '请使用测试账号登录'
        };
      }
      
      // 检查用户是否已存在
      let userInfo = await membersCollection.where({ mobile: phoneNumber }).get();
      
      if (userInfo.data.length > 0) {
        // 用户已存在，更新登录时间
        const userId = userInfo.data[0]._id;
        await membersCollection.doc(userId).update({
          lastLoginDate: new Date(),
          token: 'simpletoken_' + Date.now()
        });
        
        // 重新获取最新的用户信息
        userInfo = await membersCollection.doc(userId).get();
        
        return {
          code: 0,
          message: '登录成功',
          data: userInfo.data[0]
        };
      } else {
        // 创建新用户
        const newUser = {
          account: 'test_account',
          avatar: '/static/images/avatars/default-avatar.png',
          mobile: phoneNumber,
          nickname: '测试用户',
          token: 'simpletoken_' + Date.now(),
          gender: '未知',
          level: 1,
          points: 0,
          ecoDays: 0
        };
        
        const result = await membersCollection.add(newUser);
        newUser._id = result.id;
        
        return {
          code: 0,
          message: '注册成功',
          data: newUser
        };
      }
    } else {
      return {
        code: -2,
        message: '未知的登录类型'
      };
    }
  } catch (e) {
    return {
      code: -3,
      message: '登录失败',
      error: e.message
    };
  }
}; 