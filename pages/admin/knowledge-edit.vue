<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header bg-white px-4 pt-10 pb-3">
			<view class="flex items-center relative">
				<!-- 左侧返回按钮 -->
				<view @tap="goBack" class="p-2 z-10">
					<image src="/static/images/icons/icon-back.svg" class="back-icon"></image>
				</view>
				
				<!-- 中间标题 -->
				<view class="flex-1 text-center">
					<text class="text-gray-900 text-lg font-medium">编辑环保知识</text>
				</view>
				
				<!-- 右侧修改按钮 -->
				<view class="z-10">
					<button 
						class="publish-btn text-white text-sm bg-green-500 rounded-full px-4 py-1"
						:disabled="!canPublish"
						:class="{'bg-gray-300': !canPublish}"
						@tap="updateKnowledge">
						修改
					</button>
				</view>
			</view>
		</view>

		<!-- 内容区 -->
		<view class="p-4">
			<!-- 标题 -->
			<input 
				v-model="title" 
				class="w-full p-3 bg-white rounded-lg mb-4" 
				placeholder="请输入标题..." 
				maxlength="50" />
			
			<!-- 内容 -->
			<textarea 
				v-model="content" 
				class="w-full p-3 bg-white rounded-lg mb-4" 
				placeholder="请输入环保知识内容..." 
				maxlength="2000"
				auto-height>
			</textarea>
			
			<!-- 图片上传 -->
			<view class="image-upload bg-white rounded-lg p-4 mb-4">
				<view class="flex flex-wrap">
					<!-- 已上传的图片 -->
					<view 
						v-if="image" 
						class="image-item relative m-1">
						<image 
							:src="image" 
							class="w-full h-full object-cover" 
							mode="aspectFill">
						</image>
						<view 
							class="delete-btn" 
							@tap.stop="removeImage">
							<text class="iconfont icon-close text-white"></text>
						</view>
					</view>
					
					<!-- 添加图片按钮 -->
					<view 
						class="image-add-btn m-1" 
						@tap="chooseImage" 
						v-if="!image">
						<text class="iconfont icon-camera text-gray-400 text-2xl"></text>
						<text class="text-xs text-gray-400 mt-1">上传图片</text>
					</view>
				</view>
			</view>
			
			<!-- 标签选择 -->
			<view class="bg-white rounded-lg p-4">
				<view class="flex items-center pb-3 border-b">
					<text class="text-gray-700">添加标签</text>
					<text class="text-xs text-gray-500 ml-2">(推荐选择相关标签，便于内容被发现)</text>
				</view>
				
				<!-- 已选标签 -->
				<view class="flex flex-wrap mt-3 mb-2" v-if="selectedTags.length > 0">
					<view 
						v-for="(tag, index) in selectedTags" 
						:key="index"
						class="tag-item flex items-center bg-green-50 text-green-500 rounded-full px-3 py-1 mr-2 mb-2">
						<text class="text-sm"># {{ tag }}</text>
						<view class="close-tag-btn ml-1" @tap="removeTag(index)">
							<image src="/static/images/icons/icon-close-circle.svg" class="close-icon"></image>
						</view>
					</view>
				</view>
				
				<!-- 添加自定义标签 -->
				<view class="flex mt-2">
					<input 
						type="text" 
						v-model="customTag" 
						class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm" 
						placeholder="输入自定义标签..."
						maxlength="20"
						@confirm="addCustomTag" />
					<button 
						class="ml-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm"
						@tap="addCustomTag">
						添加
					</button>
				</view>
				
				<!-- 热门标签 -->
				<view class="mt-4">
					<text class="text-sm text-gray-700 mb-2 block">热门标签</text>
					<view class="flex flex-wrap">
						<view 
							v-for="(tag, index) in popularTags" 
							:key="index"
							class="tag-item bg-gray-100 text-gray-600 rounded-full px-3 py-1 mr-2 mb-2"
							:class="{ 'bg-green-50 text-green-500': isTagSelected(tag) }"
							@tap="toggleTag(tag)">
							<text class="text-sm"># {{ tag }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				title: '',
				content: '',
				image: '',
				customTag: '',
				selectedTags: [],
				popularTags: [
					'垃圾分类', '环保行动', '节约用水', '低碳生活', 
					'废物利用', '创意改造', '环保科普', '绿色出行',
					'减塑行动', '二手交易', '能源节约', '植树造林'
				]
			}
		},
		computed: {
			canPublish() {
				return this.title.trim().length > 0 && this.content.trim().length > 0;
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = options.id;
				this.getKnowledgeDetail();
			}
		},
		methods: {
			// 获取知识详情
			async getKnowledgeDetail() {
				try {
					const res = await uniCloud.callFunction({
						name: 'getKnowledgeDetail',
						data: {
							id: this.id
						}
					});
					
					if (res.result.code === 0) {
						const data = res.result.data;
						this.title = data.title;
						this.content = data.content;
						this.image = data.image;
						this.selectedTags = data.tags || [];
					} else {
						uni.showToast({
							title: '获取知识详情失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error(e);
					uni.showToast({
						title: '获取知识详情失败',
						icon: 'none'
					});
				}
			},
			
			// 返回上一页
			goBack() {
				uni.showModal({
					title: '提示',
					content: '是否放弃编辑？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateBack();
						}
					}
				});
			},
			
			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 模拟上传，实际开发中需要调用上传API
						this.image = res.tempFilePaths[0];
					}
				});
			},
			
			// 移除图片
			removeImage() {
				this.image = '';
			},
			
			// 检查标签是否已选中
			isTagSelected(tag) {
				return this.selectedTags.includes(tag);
			},
			
			// 切换标签选择状态
			toggleTag(tag) {
				const index = this.selectedTags.indexOf(tag);
				if (index > -1) {
					this.selectedTags.splice(index, 1);
				} else {
					// 最多选择5个标签
					if (this.selectedTags.length >= 5) {
						uni.showToast({
							title: '最多可选5个标签',
							icon: 'none'
						});
						return;
					}
					this.selectedTags.push(tag);
				}
			},
			
			// 移除已选标签
			removeTag(index) {
				this.selectedTags.splice(index, 1);
			},
			
			// 添加自定义标签
			addCustomTag() {
				const tag = this.customTag.trim();
				
				if (!tag) {
					uni.showToast({
						title: '标签不能为空',
						icon: 'none'
					});
					return;
				}
				
				// 最多选择5个标签
				if (this.selectedTags.length >= 5) {
					uni.showToast({
						title: '最多可选5个标签',
						icon: 'none'
					});
					return;
				}
				
				// 避免重复添加
				if (this.isTagSelected(tag)) {
					uni.showToast({
						title: '该标签已添加',
						icon: 'none'
					});
					return;
				}
				
				this.selectedTags.push(tag);
				this.customTag = '';
			},
			
			// 更新知识
			async updateKnowledge() {
				// 验证内容
				if (!this.title.trim()) {
					uni.showToast({
						title: '请输入标题',
						icon: 'none'
					});
					return;
				}
				
				if (!this.content.trim()) {
					uni.showToast({
						title: '请输入内容',
						icon: 'none'
					});
					return;
				}
				
				try {
					const knowledgeData = {
						_id: this.id,
						title: this.title,
						content: this.content,
						image: this.image,
						tags: this.selectedTags
					};
					
					const result = await uniCloud.callFunction({
						name: 'updateKnowledge',
						data: knowledgeData
					});
					
					if (result.result.code === 0) {
						uni.showToast({
							title: '更新成功',
							icon: 'success'
						});
						
						// 延时返回，让用户看到更新成功提示
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: result.result.message || '更新失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: error.message || '更新失败',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
.container {
	background-color: #f8f9fa;
	min-height: 100vh;
}

.header {
	position: relative;
}

.publish-btn {
	border: none;
	min-width: 70px;
	line-height: 1.8;
}

.image-item {
	width: 200px;
	height: 150px;
	overflow: hidden;
	border-radius: 8px;
}

.image-add-btn {
	width: 200px;
	height: 150px;
	border-radius: 8px;
	border: 1px dashed #d1d5db;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.delete-btn {
	position: absolute;
	top: -6px;
	right: -6px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 工具类 */
.bg-white { background-color: #ffffff; }
.bg-green-50 { background-color: #ecfdf5; }
.bg-green-500 { background-color: #4CAF50; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-300 { background-color: #d1d5db; }

.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.text-green-500 { color: #4CAF50; }

.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-lg { font-size: 18px; }
.text-2xl { font-size: 24px; }
.font-medium { font-weight: 500; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pt-10 { padding-top: 40px; }
.pb-3 { padding-bottom: 12px; }

.m-1 { margin: 4px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }

.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }

.back-icon {
	width: 18px;
	height: 18px;
}

.close-icon {
	width: 16px;
	height: 16px;
}

.close-tag-btn {
	display: flex;
	align-items: center;
	justify-content: center;
}

.absolute {
	position: absolute;
}

.inset-x-0 {
	left: 0;
	right: 0;
}

.z-10 {
	z-index: 10;
}
</style> 