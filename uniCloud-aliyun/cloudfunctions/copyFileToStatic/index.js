'use strict';
const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = require('fs');

exports.main = async (event, context) => {
  try {
    // 检查参数
    if (!event.fileID) {
      return {
        success: false,
        message: '缺少必要参数：fileID'
      };
    }

    // 从云存储下载文件
    const res = await uniCloud.downloadFile({
      fileID: event.fileID
    });
    
    const { tempFilePath } = res;
    
    // 获取文件名 (从cloudPath提取或使用默认生成的)
    let fileName = event.fileName;
    if (!fileName) {
      // 从fileID中提取文件名
      const fileIDParts = event.fileID.split('/');
      fileName = fileIDParts[fileIDParts.length - 1];
    }
    
    // 定义目标路径 - 保存到 /static/images/mall/ 目录
    const targetDir = path.resolve(__dirname, '../../../static/images/mall/');
    const fullPath = path.resolve(targetDir, fileName);
    
    // 确保目录存在
    await fsPromises.mkdir(targetDir, { recursive: true });
    
    // 读取临时文件内容并写入目标路径
    const fileContent = await fsPromises.readFile(tempFilePath);
    await fsPromises.writeFile(fullPath, fileContent);
    
    // 构建返回的URL路径（相对路径）
    const fileUrl = `static/images/mall/${fileName}`;
    
    return {
      success: true,
      message: '文件复制到static目录成功',
      data: {
        url: fileUrl,
        fileName: fileName
      }
    };
  } catch (error) {
    console.error('复制文件到static目录出错:', error);
    return {
      success: false,
      message: error.message || '复制文件到static目录失败',
      error: error
    };
  }
}; 