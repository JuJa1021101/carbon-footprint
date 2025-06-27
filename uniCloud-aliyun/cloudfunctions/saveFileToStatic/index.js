'use strict';
const fs = require('fs');
const path = require('path');

exports.main = async (event, context) => {
  try {
    // 检查参数
    if (!event.fileContent || !event.fileName) {
      return {
        success: false,
        message: '缺少必要参数：fileContent 或 fileName'
      };
    }

    // 定义目标路径 - 保存到 /static/images/mall/ 目录
    const targetDir = path.join(__dirname, '../../../static/images/mall/');
    const fileName = event.fileName;
    const fullPath = path.join(targetDir, fileName);
    
    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('Created directory:', targetDir);
      } catch (mkdirErr) {
        console.error('创建目录失败:', mkdirErr);
        return {
          success: false,
          message: '创建目录失败: ' + mkdirErr.message,
          error: mkdirErr
        };
      }
    }
    
    // 解码Base64内容
    const fileBuffer = Buffer.from(event.fileContent, 'base64');
    
    // 写入文件
    try {
      fs.writeFileSync(fullPath, fileBuffer);
      console.log('写入文件成功:', fullPath);
    } catch (writeErr) {
      console.error('写入文件失败:', writeErr);
      return {
        success: false,
        message: '写入文件失败: ' + writeErr.message,
        error: writeErr
      };
    }
    
    // 构建返回的URL路径（保持一致的格式）
    // 数据库中存储不带前导斜杠的路径
    const fileUrl = `static/images/mall/${fileName}`;
    const displayUrl = `/${fileUrl}`;
    
    console.log('文件保存成功，数据库路径:', fileUrl);
    console.log('文件保存成功，显示路径:', displayUrl);
    
    return {
      success: true,
      message: '文件保存成功',
      data: {
        url: fileUrl, // 返回不带前导斜杠的路径给数据库存储
        display_url: displayUrl, // 带前导斜杠的路径用于前端显示
        fileName: fileName,
        fullPath: fullPath
      }
    };
  } catch (error) {
    console.error('保存文件出错:', error);
    return {
      success: false,
      message: error.message || '保存文件失败',
      error: error.toString(),
      stack: error.stack
    };
  }
}; 