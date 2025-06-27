'use strict';
exports.main = async (event, context) => {
  // 获取客户端参数
  const { account, nickname, gender, birthdate, city, occupation, avatar } = event;
  
  if (!account) {
    return {
      code: -1,
      msg: '账号不能为空'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 查询是否已存在该账号的用户
    const user = await db.collection('users').where({ account }).get();
    
    // 处理birthdate字段，确保为正确的Date类型
    let birthdateValue = null;
    if (birthdate) {
      try {
        // 如果birthdate是日期字符串，则尝试转换为Date对象
        if (typeof birthdate === 'string') {
          birthdateValue = new Date(birthdate);
        } 
        // 如果birthdate已经是日期对象（通过JSON传递时会变为时间戳数字）
        else if (typeof birthdate === 'number') {
          birthdateValue = new Date(birthdate);
        }
        // 如果birthdate是包含日期信息的对象
        else if (typeof birthdate === 'object') {
          birthdateValue = new Date(birthdate);
        }
        
        // 验证日期是否有效
        if (isNaN(birthdateValue.getTime())) {
          birthdateValue = null;
        }
      } catch (e) {
        console.error('日期转换错误:', e);
        birthdateValue = null;
      }
    }
    
    if (user.data.length > 0) {
      // 已存在，更新用户信息
      const userId = user.data[0]._id;
      
      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (gender) updateData.gender = gender;
      if (birthdateValue !== null) updateData.birthdate = birthdateValue;
      if (city) updateData.city = city;
      if (occupation) updateData.occupation = occupation;
      if (avatar) updateData.avatar = avatar;
      
      if (Object.keys(updateData).length === 0) {
        return {
          code: -2,
          msg: '没有更新的数据'
        };
      }
      
      const updated = await db.collection('users').doc(userId).update(updateData);
      
      return {
        code: 0,
        msg: '更新成功',
        data: {
          updated: updated.updated,
          id: userId
        }
      };
    } else {
      // 不存在，创建新用户
      const result = await db.collection('users').add({
        account,
        nickname: nickname || account,
        gender: gender || '男',
        birthdate: birthdateValue,
        city: city || '',
        occupation: occupation || '',
        avatar: avatar || ''
      });
      
      return {
        code: 0,
        msg: '创建成功',
        data: {
          id: result.id
        }
      };
    }
  } catch (e) {
    return {
      code: -3,
      msg: '操作失败',
      error: e.message
    };
  }
}; 