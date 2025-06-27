'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    // 获取rewards集合引用
    const rewardsCollection = db.collection('rewards');
    
    // 先清空现有数据（可选）
    try {
      const clearResult = await rewardsCollection.remove();
      console.log('清除原有数据结果:', clearResult);
    } catch (clearError) {
      console.error('清除数据出错，可能集合为空:', clearError);
    }
    
    // 准备要插入的商品数据
    const rewardsData = [
      {
        name: '环保竹牙刷',
        image_url: '/static/images/mall/bamboo-toothbrush.png',
        required_points: 200,
        stock_quantity: 50,
        status: 'available',
        is_hot: true,
        is_limited_time: false,
        category: '环保用品',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '可降解餐具套装',
        image_url: '/static/images/mall/eco-tableware.png',
        required_points: 350,
        stock_quantity: 30,
        status: 'available',
        is_hot: true,
        is_limited_time: false,
        category: '环保用品',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '可爱多肉植物',
        image_url: '/static/images/mall/succulent.jpeg',
        required_points: 180,
        stock_quantity: 45,
        status: 'available',
        is_hot: false,
        is_limited_time: false,
        category: '绿植花卉',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '不锈钢保温杯',
        image_url: '/static/images/mall/thermos.jpg',
        required_points: 300,
        stock_quantity: 40,
        status: 'available',
        is_hot: false,
        is_limited_time: false,
        category: '环保用品',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '可降解帆布袋',
        image_url: '/static/images/mall/canvas-bag.png',
        required_points: 120,
        stock_quantity: 100,
        status: 'available',
        is_hot: true,
        is_limited_time: false,
        category: '环保用品',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '环保购物袋',
        image_url: '/static/images/mall/tote-bag.png',
        required_points: 150,
        stock_quantity: 80,
        status: 'available',
        is_hot: false,
        is_limited_time: false,
        category: '环保用品',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '素食餐厅优惠券',
        image_url: '/static/images/mall/veg-coupon.jpeg',
        required_points: 100,
        stock_quantity: 200,
        status: 'available',
        is_hot: false,
        is_limited_time: true,
        end_time: new Date(new Date().setDate(new Date().getDate() + 30)), // 30天后过期
        category: '优惠券',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 批量插入数据
    const result = await rewardsCollection.add(rewardsData);
    console.log('初始化商品数据结果:', result);
    
    return {
      success: true,
      message: '积分商城数据初始化成功',
      data: result
    };
  } catch (error) {
    console.error('初始化商城数据失败:', error);
    return {
      success: false,
      message: '积分商城数据初始化失败',
      error: error.message
    };
  }
}; 