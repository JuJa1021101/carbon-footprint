<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header bg-green px-4 py-3">
			<view class="flex items-center">
				<view @tap="goBack" class="p-2">
					<image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
				</view>
				<view class="flex-1 text-center">
					<text class="text-white text-lg font-medium">环保知识和小贴士</text>
				</view>
				<view class="w-24px"></view> <!-- 为了居中标题的占位 -->
			</view>
		</view>
		
		<view class="knowledge-list p-4">
			<view class="empty-tip" v-if="knowledgeList.length === 0">
				<text>暂无环保知识，点击右下角按钮添加</text>
			</view>
			<view class="knowledge-item" v-for="(item, index) in knowledgeList" :key="item._id">
				<view class="knowledge-content" @click="goToEdit(item)">
					<view class="knowledge-title">{{item.title}}</view>
					<view class="knowledge-info">
						<image v-if="item.image" class="knowledge-image" :src="item.image" mode="aspectFill"></image>
						<view class="knowledge-meta">
							<view class="knowledge-tags">
								<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex"># {{tag}}</text>
							</view>
							<view class="knowledge-date">{{formatDate(item.created_at)}}</view>
						</view>
					</view>
				</view>
				<view class="knowledge-actions">
					<image src="/static/images/icons/icon-more.svg" class="icon-more" @click="showActionSheet(item)"></image>
				</view>
			</view>
		</view>
		
		<!-- 添加按钮 -->
		<view class="float-btn" @click="goToAdd">
			<view class="float-btn-inner">
				<text class="plus-text">+</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				knowledgeList: []
			}
		},
		onShow() {
			this.getKnowledgeList();
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			async getKnowledgeList() {
				try {
					const res = await uniCloud.callFunction({
						name: 'getKnowledge'
					});
					
					if (res.result.code === 0) {
						this.knowledgeList = res.result.data;
					} else {
						uni.showToast({
							title: '获取知识列表失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error(e);
					uni.showToast({
						title: '获取知识列表失败',
						icon: 'none'
					});
				}
			},
			formatDate(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			},
			goToAdd() {
				uni.navigateTo({
					url: '/pages/admin/knowledge-add'
				});
			},
			goToEdit(item) {
				uni.navigateTo({
					url: `/pages/admin/knowledge-edit?id=${item._id}`
				});
			},
			showActionSheet(item) {
				uni.showActionSheet({
					itemList: ['删除'],
					itemColor: '#FF0000',
					success: res => {
						if (res.tapIndex === 0) {
							this.deleteKnowledge(item._id);
						}
					}
				});
			},
			async deleteKnowledge(id) {
				try {
					const res = await uniCloud.callFunction({
						name: 'deleteKnowledge',
						data: {
							_id: id
						}
					});
					
					if (res.result.code === 0) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						this.getKnowledgeList();
					} else {
						uni.showToast({
							title: res.result.message || '删除失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error(e);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f8f9fa;
	}
	
	.header {
		padding-top: 44px;
		padding-bottom: 12px;
		box-sizing: content-box;
	}
	
	.bg-green {
		background-color: #4CAF50;
	}
	
	.w-24px {
		width: 24px;
	}
	
	.knowledge-list {
		.empty-tip {
			text-align: center;
			padding: 50rpx 0;
			color: #999;
		}
		
		.knowledge-item {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			padding: 20rpx;
			margin-bottom: 20rpx;
			background-color: #FFFFFF;
			border-radius: 10rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.knowledge-content {
				flex: 1;
				
				.knowledge-title {
					font-size: 32rpx;
					font-weight: bold;
					margin-bottom: 10rpx;
				}
				
				.knowledge-info {
					display: flex;
					flex-direction: column;
					
					.knowledge-image {
						width: 100%;
						height: 300rpx;
						border-radius: 8rpx;
						margin-bottom: 10rpx;
						object-fit: cover;
					}
					
					.knowledge-meta {
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.knowledge-tags {
							display: flex;
							flex-wrap: wrap;
							
							.tag {
								font-size: 24rpx;
								color: #4CAF50;
								margin-right: 10rpx;
							}
						}
						
						.knowledge-date {
							font-size: 24rpx;
							color: #999;
							white-space: nowrap;
						}
					}
				}
			}
			
			.knowledge-actions {
				padding: 0 10rpx;
			}
		}
	}
	
	.back-icon {
		width: 18px;
		height: 18px;
	}
	
	.float-btn {
		position: fixed;
		bottom: 80px;
		right: 20px;
		width: 50px;
		height: 50px;
		z-index: 100;
	}
	
	.float-btn-inner {
		width: 50px;
		height: 50px;
		border-radius: 25px;
		background-color: #4CAF50;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 24px;
	}
	
	.plus-text {
		color: white;
		font-size: 30px;
		font-weight: bold;
		line-height: 30px;
		text-align: center;
		margin-top: -2px; /* 轻微上移调整垂直位置 */
	}
	
	/* 工具类 */
	.flex { display: flex; }
	.flex-1 { flex: 1; }
	.items-center { align-items: center; }
	.justify-center { justify-content: center; }
	.text-center { text-align: center; }
	.text-white { color: #ffffff; }
	.text-lg { font-size: 18px; }
	.font-medium { font-weight: 500; }
	.px-4 { padding-left: 16px; padding-right: 16px; }
	.py-3 { padding-top: 12px; padding-bottom: 12px; }
	.p-4 { padding: 16px; }
	
	.icon-more {
		width: 20px;
		height: 20px;
		padding: 4px;
	}
</style> 