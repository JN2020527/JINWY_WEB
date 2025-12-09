<template>
  <div class="home-container">
    <!-- 顶部轮播图 -->
    <div class="carousel-section">
      <el-carousel :interval="4000" type="card" height="200px">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <div class="carousel-item-content" :style="{ background: item.color }">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 全局搜索 -->
    <div class="search-section">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索试卷、试题、教辅资源..."
          class="global-search-input"
          size="large"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <div class="hot-search">
          <span>热门搜索：</span>
          <span v-for="tag in hotTags" :key="tag" class="tag" @click="searchKeyword = tag; handleSearch()">{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- 中考备考方案 -->
    <div class="section-container">
      <div class="section-header">
        <div class="title-wrapper">
          <el-icon><Reading /></el-icon>
          <h2>中考备考方案</h2>
        </div>
        <el-button link type="primary">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      <div class="prep-plan-cards">
        <div class="plan-card" v-for="(plan, index) in prepPlans" :key="index">
          <div class="plan-icon" :class="`icon-${index + 1}`">
            <span class="round-num">{{ index + 1 }}</span>
          </div>
          <div class="plan-info">
            <h3>{{ plan.title }}</h3>
            <p class="time">{{ plan.time }}</p>
            <p class="desc">{{ plan.desc }}</p>
            <el-button type="primary" plain size="small" class="action-btn">立即查看</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 双栏布局：最近上线 + 政策解读 -->
    <div class="content-row">
      <!-- 左侧：最近上线 (70%) -->
      <div class="main-column">
        <div class="section-container">
          <div class="section-header">
            <div class="title-wrapper">
              <el-icon><Timer /></el-icon>
              <h2>最近上线</h2>
            </div>
            <el-button link type="primary">更多资源 <el-icon><ArrowRight /></el-icon></el-button>
          </div>
          <div class="recent-grid">
            <div class="resource-card" v-for="item in recentResources" :key="item.id">
              <div class="card-cover">
                <span class="tag">{{ item.subject }}</span>
                <div class="cover-placeholder">
                  <el-icon><Document /></el-icon>
                </div>
              </div>
              <div class="card-info">
                <h4 class="title" :title="item.title">{{ item.title }}</h4>
                <div class="meta">
                  <span class="date">{{ item.date }}</span>
                  <span class="views"><el-icon><View /></el-icon> {{ item.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：政策解读 (30%) -->
      <div class="side-column">
        <div class="section-container">
          <div class="section-header">
            <div class="title-wrapper">
              <el-icon><DataAnalysis /></el-icon>
              <h2>中考政策解读</h2>
            </div>
            <el-button link type="primary">更多 <el-icon><ArrowRight /></el-icon></el-button>
          </div>
          <div class="policy-list">
            <div class="policy-item" v-for="item in policyItems" :key="item.id">
              <div class="policy-content">
                <h3 class="policy-title">{{ item.title }}</h3>
                <div class="policy-meta">
                  <span class="tag" :class="item.typeClass">{{ item.type }}</span>
                  <span class="date">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Reading, Timer, ArrowRight, Document, View, DataAnalysis, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchKeyword = ref('')
const hotTags = ['2024真题', '数学模拟', '英语听力', '物理实验']

const carouselItems = [
  { id: 1, title: '2024中考冲刺计划启动', desc: '全方位助力中考，提分攻略大公开', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, title: '名师在线答疑', desc: '每周三晚8点，专家坐镇解答疑难', color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
  { id: 3, title: '新课标资源更新', desc: '紧跟最新教学大纲，优质资源同步上线', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
]

const prepPlans = [
  { title: '一轮复习：夯实基础', time: '9月 - 1月', desc: '全面梳理知识点，构建知识网络，扫除盲点。' },
  { title: '二轮复习：专题突破', time: '2月 - 4月', desc: '针对重点难点进行专题训练，提升解题能力。' },
  { title: '三轮复习：模拟冲刺', time: '5月 - 6月', desc: '全真模拟考试，查漏补缺，调整心态，适应考场。' },
]

const policyItems = [
  { 
    id: 1, 
    title: '2024年中考改革新动向：体育分值权重增加', 
    desc: '教育部最新通知，各地将逐步提高中考体育分值，旨在促进青少年身心健康发展。本文深度解读新政背后的意义及应对策略。', 
    type: '政策解读',
    typeClass: 'tag-policy',
    date: '2023-12-09',
    img: true
  },
  { 
    id: 2, 
    title: '如何科学规划中考志愿填报？专家给出三点建议', 
    desc: '志愿填报是中考的关键一环，如何根据自身成绩和兴趣选择合适的学校？资深教育专家为您支招。', 
    type: '报考指南',
    typeClass: 'tag-guide',
    date: '2023-12-08',
    img: true
  },
  { 
    id: 3, 
    title: '2024年中考英语听力考试说明发布', 
    desc: '市教育局发布最新英语听力考试说明，明确了考试题型、时长及分值分布，考生需注意这些变化。', 
    type: '考试通知',
    typeClass: 'tag-notice',
    date: '2023-12-05',
    img: false
  },
  { 
    id: 4, 
    title: '中考心理辅导：考前焦虑怎么办？', 
    desc: '面对中考，很多同学会出现焦虑情绪。本文分享几种实用的心理调节方法，助你轻松备考。', 
    type: '心理辅导',
    typeClass: 'tag-psych',
    date: '2023-12-01',
    img: true
  }
]

const recentResources = [
  { id: 1, title: '2024年某市中考数学模拟试卷（一）', subject: '数学', date: '2023-12-08', views: 1205 },
  { id: 2, title: '初中英语核心词汇专项训练', subject: '英语', date: '2023-12-07', views: 890 },
  { id: 3, title: '九年级物理电学实验总结', subject: '物理', date: '2023-12-06', views: 650 },
  { id: 4, title: '2023年中考语文满分作文赏析', subject: '语文', date: '2023-12-05', views: 2100 },
  { id: 5, title: '化学方程式配平技巧详解', subject: '化学', date: '2023-12-04', views: 540 },
  { id: 6, title: '道德与法治时事热点汇总', subject: '道法', date: '2023-12-03', views: 1500 },
]

const handleSearch = () => {
  if (!searchKeyword.value) return
  ElMessage.success(`正在搜索：${searchKeyword.value}`)
  // 实际项目中这里会跳转到搜索结果页
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 轮播图 */
.carousel-section {
  margin-bottom: 30px;
}

.carousel-item-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-radius: 8px;
}

.carousel-item-content h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.carousel-item-content p {
  font-size: 16px;
  opacity: 0.9;
}

/* 搜索区 */
.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.search-box {
  width: 100%;
  max-width: 700px;
  text-align: center;
}

.global-search-input :deep(.el-input__wrapper) {
  border-radius: 24px 0 0 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.global-search-input :deep(.el-input-group__append) {
  border-radius: 0 24px 24px 0;
  background-color: #2262FB;
  border-color: #2262FB;
  color: #fff;
  box-shadow: 0 4px 12px rgba(34, 98, 251, 0.2);
}

.global-search-input :deep(.el-button:hover) {
  background-color: #1a53db;
  border-color: #1a53db;
}

.hot-search {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}

.hot-search .tag {
  margin: 0 6px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.hot-search .tag:hover {
  color: #2262FB;
  text-decoration: underline;
}

/* 通用板块样式 */
.section-container {
  margin-bottom: 40px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-wrapper .el-icon {
  font-size: 24px;
  color: #2262FB;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 备考方案卡片 */
.prep-plan-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.plan-card {
  background: #f9fafc;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  border-color: #c6e2ff;
}

.plan-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.icon-1 { background: #e1f3d8; color: #67c23a; }
.icon-2 { background: #faecd8; color: #e6a23c; }
.icon-3 { background: #fde2e2; color: #f56c6c; }

.plan-info {
  flex: 1;
}

.plan-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.plan-info .time {
  font-size: 13px;
  color: #2262FB;
  background: rgba(34, 98, 251, 0.1);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.plan-info .desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 15px;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.action-btn {
  width: 100%;
}

/* 双栏布局 */
.content-row {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.main-column {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.side-column {
  width: 320px;
  flex-shrink: 0;
}

.main-column .section-container,
.side-column .section-container {
  margin-bottom: 0;
  height: 100%;
}

/* 政策解读列表 - 侧边栏样式 */
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-item {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.2s;
}

.policy-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.policy-item:hover .policy-title {
  color: #2262FB;
}

.policy-title {
  font-size: 14px;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
  font-weight: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.policy-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.policy-meta .tag {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  transform: scale(0.9);
  transform-origin: left center;
}

.tag-policy { background: #e8f3ff; color: #409eff; }
.tag-guide { background: #fdf6ec; color: #e6a23c; }
.tag-notice { background: #fef0f0; color: #f56c6c; }
.tag-psych { background: #f0f9eb; color: #67c23a; }

.policy-meta .date {
  color: #c0c4cc;
  font-size: 12px;
}

/* 最近上线网格 */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.resource-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  cursor: pointer;
}

.resource-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-cover {
  height: 120px;
  background: #f5f7fa;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  font-size: 40px;
  color: #dcdfe6;
}

.card-cover .tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-info {
  padding: 12px;
}

.card-info .title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-info .meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.meta .views {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 992px) {
  .content-row {
    flex-direction: column;
  }
  
  .side-column {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .prep-plan-cards {
    grid-template-columns: 1fr;
  }
  
  .carousel-section :deep(.el-carousel__container) {
    height: 150px !important;
  }
}
</style>
