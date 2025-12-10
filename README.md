# CarbonFootprint 项目

![GitHub stars](https://img.shields.io/github/stars/CarbonFootprint-Team/CarbonFootprint.svg?style=social)
![GitHub forks](https://img.shields.io/github/forks/CarbonFootprint-Team/CarbonFootprint.svg?style=social)
![GitHub issues](https://img.shields.io/github/issues/CarbonFootprint-Team/CarbonFootprint.svg)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## 项目介绍

CarbonFootprint 是一款致力于环保行动激励的跨平台应用，通过积分机制鼓励用户养成低碳生活习惯，记录环保行为，共同建设可持续发展的绿色未来。

## 📑 目录
- [项目介绍](#项目介绍)
- [项目概述](#项目概述)
- [核心功能](#核心功能)
- [技术架构](#技术架构)
- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [使用指南](#使用指南)
- [API文档](#api文档)
- [贡献规范](#贡献规范)
- [许可证信息](#许可证信息)
- [联系方式](#联系方式)

## 📊 项目概述

CarbonFootprint 是一个基于uni-app开发的跨平台环保应用，旨在通过积分激励机制引导用户采取环保行动，记录日常环保行为，并提供环保知识学习和社区交流功能。应用支持多端运行，包括微信小程序、H5以及APP等平台，为用户提供便捷的环保参与体验。

**主要价值：**
- 提高用户环保意识，培养低碳生活习惯
- 量化环保行为贡献，通过积分系统激励持续参与
- 建立环保社区交流，促进用户间互动分享
- 提供环保知识普及，增强用户环保认知
- 数据可视化展示，让用户直观了解自己的环保贡献

## ✨ 核心功能

### 环保打卡系统
- **多样化打卡类型**：支持垃圾分类、资源回收、低碳出行、节约用水、节约用电等多种环保行为记录
- **打卡记录管理**：用户可查看历史打卡记录，追踪个人环保行为变化
- **积分奖励机制**：不同类型的环保行为获得对应积分奖励
- **等级体系**：基于积分累积建立用户环保等级，激励长期参与

### 积分商城
- **商品兑换**：用户使用积分兑换环保商品、优惠券等奖励
- **商品分类**：环保用品、绿植花卉、优惠券等多种商品类型
- **兑换记录**：追踪用户积分兑换历史
- **积分明细**：查看积分获取和消耗详情

### 环保社区
- **动态发布**：用户分享环保心得、环保实践经验
- **互动功能**：点赞、评论、关注其他用户
- **环保活动**：发布和参与环保主题活动
- **知识分享**：用户间交流环保知识和技巧

### 环保知识
- **知识文章**：提供环保科普文章，提高用户环保认知
- **知识分类**：按主题分类展示环保知识内容
- **学习记录**：追踪用户学习进度

### 个人中心
- **用户信息管理**：编辑个人资料、头像等信息
- **收货地址管理**：维护积分商城收货地址
- **设置功能**：应用个性化设置

### 管理员功能
- **活动管理**：创建、编辑、管理环保活动
- **知识管理**：发布和管理环保知识文章
- **奖励管理**：管理积分商城商品
- **积分重置**：特殊情况下的积分调整功能

## 🏗️ 技术架构

### 前端技术栈
- **框架**: uni-app（跨平台应用开发框架）
- **UI组件库**: @dcloudio/uni-ui ^1.5.7
- **开发语言**: JavaScript/HTML/CSS
- **响应式框架**: Vue（同时支持Vue2和Vue3环境）
- **状态管理**: 本地缓存 + 事件广播机制
- **UI设计**: 自定义组件 + uni-ui组件

### 后端技术栈
- **云开发平台**: uniCloud（阿里云）
- **数据库**: uniCloud文档型数据库
- **函数计算**: 云函数（Cloud Functions）
- **认证服务**: uni-id（内置用户认证系统）
- **存储服务**: uniCloud存储

### 架构模式
- **前后端分离架构**: 前端负责UI展示和用户交互，后端通过云函数提供服务
- **云开发架构**: 充分利用uniCloud的BaaS（Backend as a Service）能力，简化后端开发
- **模块化设计**: 按功能领域划分模块，降低耦合度
- **本地缓存策略**: 合理使用本地缓存提升用户体验，减少网络请求

### 核心数据模型
- **用户表(users)**: 存储用户基本信息（账号、昵称、头像等）
- **积分表(user_points)**: 管理用户积分余额和更新记录
- **打卡记录表(userAction)**: 记录用户环保打卡行为
- **商城商品表(rewards)**: 积分商城商品信息
- **兑换记录表(reward_redemptions)**: 积分兑换记录
- **社区动态表(posts)**: 用户发布的社区动态
- **评论表(comments)**: 社区互动评论
- **地址表(address)**: 用户收货地址信息

## 📋 环境要求

### 开发环境
- **开发工具**: HBuilderX 3.0+
- **Node.js**: 10.0+
- **微信开发者工具**: 用于微信小程序预览和调试
- **浏览器**: Chrome、Firefox等现代浏览器（用于H5调试）

### 账号要求
- **阿里云账号**: 用于uniCloud云服务部署
- **微信小程序账号**: 用于小程序开发和发布（如需发布到微信平台）

### 系统要求
- **操作系统**: Windows 7/10/11, macOS
- **内存**: 至少4GB RAM，推荐8GB+
- **硬盘空间**: 至少5GB可用空间
- **网络**: 稳定的网络连接（用于云服务部署和依赖安装）

## 🚀 安装步骤

### 1. 环境准备

1. **安装HBuilderX**
   - 访问[HBuilderX官网](https://www.dcloud.io/hbuilderx.html)下载并安装最新版本
   - 安装时选择"标准版"或"App开发版"

2. **安装Node.js**
   - 访问[Node.js官网](https://nodejs.org/)下载并安装Node.js 10.0+版本
   - 安装完成后，通过命令行运行`node -v`确认安装成功

3. **安装微信开发者工具**（如果需要开发微信小程序）
   - 访问[微信开发者工具官网](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)下载并安装

### 2. 项目初始化

1. **克隆项目代码**
   ```bash
   git clone https://github.com/your-username/CarbonFootprint.git
   cd CarbonFootprint
   ```

2. **打开项目**
   - 启动HBuilderX
   - 选择"文件" > "导入" > "从本地目录导入"
   - 选择克隆的项目文件夹

3. **安装依赖**
   - 在HBuilderX中，右键点击项目根目录
   - 选择"运行" > "npm install"
   - 或者在命令行中运行：
     ```bash
     npm install
     ```

### 3. 云服务配置

1. **关联uniCloud环境**
   - 在HBuilderX中，点击项目根目录下的"uniCloud-aliyun"文件夹
   - 点击工具栏中的"关联云服务空间"
   - 登录阿里云账号
   - 创建或选择现有的云服务空间

2. **部署云函数**
   - 右键点击"cloudfunctions"文件夹
   - 选择"上传部署"上传所有云函数

3. **创建数据库集合**
   - 右键点击"database"文件夹
   - 选择"初始化数据库"创建所需的数据库集合
   - 集合会根据schema.json文件自动创建

### 4. 运行项目

1. **运行到浏览器**
   - 点击工具栏中的运行按钮
   - 选择"运行到浏览器" > 选择一个浏览器

2. **运行到微信小程序**
   - 点击工具栏中的运行按钮
   - 选择"运行到小程序模拟器" > "微信开发者工具"
   - 确保微信开发者工具已开启服务端口

3. **运行到手机或模拟器**
   - 点击工具栏中的运行按钮
   - 选择"运行到手机或模拟器"
   - 按照提示进行相关配置

## 📖 使用指南

### 用户功能使用

#### 登录与注册
- 打开应用后，进入登录页面
- 可以选择微信一键登录或模拟账号登录
- 首次登录会自动创建用户账户

#### 环保打卡
1. 在底部导航栏点击"打卡"图标
2. 选择要打卡的环保行为类型（如：垃圾分类、低碳出行等）
3. 填写打卡信息并提交
4. 系统会自动发放相应积分奖励

#### 积分商城
1. 在底部导航栏点击"商城"图标
2. 浏览可用商品，可按分类筛选
3. 选择心仪商品，点击"立即兑换"
4. 确认收货地址并完成兑换
5. 兑换成功后可在"兑换记录"中查看

#### 环保社区
1. 在底部导航栏点击"社区"图标
2. 浏览其他用户的环保动态
3. 可以点赞、评论互动
4. 点击"发布"按钮分享自己的环保经验

#### 环保知识
1. 在首页或通过导航进入环保知识模块
2. 浏览各类环保知识文章
3. 阅读文章并学习环保知识

#### 个人中心
1. 在底部导航栏点击"我的"图标
2. 查看个人信息、积分和等级
3. 进入设置页面管理账号
4. 管理收货地址信息

### 管理员功能使用

1. 访问`/pages/admin/login`页面
2. 使用管理员账号登录
3. 在管理后台可以：
   - 管理环保活动（创建、编辑、删除）
   - 管理环保知识文章
   - 管理积分商城商品
   - 特殊情况下重置用户积分

## 🔌 API文档

### 云函数API

#### 用户相关
- **getUserPoints**
  - 功能：获取用户当前积分
  - 参数：无（使用固定用户ID 10086420）
  - 返回：`{success: boolean, message: string, data: {points: number, user_id: string}}`

#### 登录认证
- **postLoginWxMin**
  - 功能：微信小程序登录
  - 参数：`{code: string, userInfo: object}`
  - 返回：`{success: boolean, token: string, userInfo: object}`

- **postLoginSimple**
  - 功能：模拟账号登录
  - 参数：`{account: string, password: string}`
  - 返回：`{success: boolean, token: string, userInfo: object}`

- **checkLoginStatus**
  - 功能：检查登录状态
  - 参数：无
  - 返回：`{isLoggedIn: boolean, userInfo: object}`

- **getCurrentUser**
  - 功能：获取当前用户信息
  - 参数：无
  - 返回：`{success: boolean, userInfo: object}`

- **logout**
  - 功能：退出登录
  - 参数：无
  - 返回：`{success: boolean}`

### 服务层API

#### 积分管理 (services/points.js)
- **getUserPoints()**
  - 功能：获取用户积分（包含缓存机制）
  - 返回：Promise，解析为积分数值

- **updatePointsCache(points)**
  - 功能：更新本地积分缓存
  - 参数：points (number) - 新的积分值
  - 返回：void

- **broadcastPointsUpdate(points)**
  - 功能：广播积分更新事件
  - 参数：points (number) - 新的积分值
  - 返回：void

## 🤝 贡献规范

我们欢迎并感谢社区贡献！为了保持代码质量和项目一致性，请遵循以下贡献指南：

### 提交代码

1. **Fork 项目仓库**
   - 点击 GitHub 上项目页面右上角的 "Fork" 按钮

2. **克隆你自己的仓库**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CarbonFootprint.git
   cd CarbonFootprint
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   或修复分支
   ```bash
   git checkout -b fix/your-fix-name
   ```

4. **提交修改**
   - 请确保你的代码风格与项目一致
   - 编写有意义的提交信息
   ```bash
   git commit -m "简洁明了的提交信息"
   ```

5. **推送到你的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 回到原项目仓库
   - 点击 "Pull requests" 标签
   - 点击 "New pull request"
   - 选择你的分支并提交

### 代码规范

1. **JavaScript 编码规范**
   - 使用 2 个空格进行缩进
   - 使用单引号定义字符串
   - 行尾不添加分号（遵循 Vue 风格）
   - 变量和函数命名使用小驼峰命名法
   - 组件命名使用大驼峰命名法

2. **Vue 组件规范**
   - 组件文件使用 PascalCase 命名
   - 组件名称与文件名保持一致
   - 避免在模板中使用复杂表达式，尽量使用计算属性
   - 组件的 props 定义类型和默认值

3. **注释规范**
   - 为复杂函数和逻辑添加注释
   - 为 API 接口添加参数和返回值说明
   - 关键业务逻辑应有中文注释

### 问题报告

如果你发现 Bug 或有新功能建议，请在 GitHub Issues 中提交：

1. 清晰描述问题或建议
2. 如果是 Bug，请提供：
   - 重现步骤
   - 期望行为
   - 实际行为
   - 相关截图（如适用）
3. 如果是功能建议，请说明：
   - 功能描述
   - 实现方式建议
   - 为什么需要这个功能

## 📄 许可证信息

CarbonFootprint 项目采用 MIT 许可证开源：

```
MIT License

Copyright (c) 2023 CarbonFootprint Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📬 联系方式

### 项目团队
- **项目负责人**: [负责人姓名]
- **邮箱**: [contact@carbonfootprint.com]
- **GitHub**: [https://github.com/CarbonFootprint-Team]

### 社区支持
- **Issue 反馈**: [https://github.com/CarbonFootprint-Team/CarbonFootprint/issues]
- **Discussions**: [https://github.com/CarbonFootprint-Team/CarbonFootprint/discussions]

我们欢迎任何形式的反馈和建议！

## 📱 应用截图

![首页截图](https://example.com/screenshots/home.png)
![打卡页面](https://example.com/screenshots/checkin.png)
![积分商城](https://example.com/screenshots/mall.png)
![社区动态](https://example.com/screenshots/community.png)

> **注意**: 以上截图链接为示例，请在实际部署时替换为真实的截图链接。

## 🎯 未来规划

- [ ] 增加环保数据可视化分析功能
- [ ] 支持更多环保行为类型的识别和记录
- [ ] 添加环保挑战活动系统
- [ ] 优化社区互动功能，增加环保小组
- [ ] 实现环保知识问答和测验功能
- [ ] 扩展多语言支持(国际化，i18n)

---

感谢您对 CarbonFootprint 项目的关注与支持！让我们一起为环保事业贡献力量！ 🌍💚
