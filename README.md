# 晋文源智慧助教平台 - 前端复刻版

这是一个使用 Vue 3 + Vite + Element Plus 快速开发的教育平台前端项目。

## ✨ 特性

- 🎨 高还原度的 UI 设计
- 📱 响应式布局，支持移动端
- 🎯 基于 Vue 3 组合式 API
- 🚀 Vite 构建，开发体验极佳
- 💎 Element Plus UI 组件库
- 📦 Mock 数据，无需后端

## 🛠️ 技术栈

- Vue 3.3+
- Vite 4.5+
- Element Plus 2.4+
- @element-plus/icons-vue

## 📦 安装依赖

```bash
npm install
```

## 🚀 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 🏗️ 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
jinwy_web/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Header.vue      # 顶部导航
│   │   ├── LeftNav.vue     # 左侧菜单
│   │   ├── PlatformSharing.vue  # 主内容区
│   │   └── FloatTools.vue  # 悬浮工具栏
│   ├── mock/               # Mock 数据
│   │   └── data.js
│   ├── styles/             # 全局样式
│   │   └── global.css
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── logo.png                # Logo 图片
├── bg.3e971a55.png        # 背景图
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
└── package.json            # 依赖配置
```

## 🎯 功能模块

### 已实现功能

- ✅ 顶部导航栏（多标签页切换）
- ✅ 左侧功能菜单（可收起）
- ✅ 学段/学科选择器
- ✅ 资源筛选（状态、年份、关键词）
- ✅ 列表/卡片视图切换
- ✅ 资源展示（12个Mock数据）
- ✅ 分页功能
- ✅ 右侧悬浮工具栏
- ✅ 试题篮功能
- ✅ 响应式布局

### 交互功能

- 导航菜单切换
- 视图模式切换
- 搜索过滤
- 悬浮按钮
- 下拉菜单

## 🎨 样式说明

- 主色调：紫色渐变 (#667eea → #764ba2)
- 布局：顶部固定 + 左侧固定 + 主内容滚动
- 响应式断点：768px

## 📝 备注

- 本项目仅为前端展示，不包含后端接口
- 所有数据均为 Mock 数据
- 图片资源使用占位图和CDN链接
- 未实现权限管理和用户认证

## 📄 License

MIT

