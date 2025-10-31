<template>
  <div class="homework-manage">
    <!-- 作业扫描 -->
    <div v-if="currentTab === 0" class="scan-content">
      <!-- 顶部标题和操作区 -->
      <div class="scan-header">
        <h2 class="scan-title">扫描试卷</h2>
        <el-button type="primary" size="large" class="scan-button">
          <el-icon><Camera /></el-icon>
          <span>扫描试卷</span>
        </el-button>
      </div>

      <!-- 统计信息栏 -->
      <div class="scan-stats">
        <div class="stats-item">
          <span class="stats-label">共上传了：</span>
          <span class="stats-value">{{ uploadCount }}</span>
          <span class="stats-unit">张</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">识别了：</span>
          <span class="stats-value">{{ recognizedCount }}</span>
          <span class="stats-unit">张</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">数辅试卷</span>
          <el-switch v-model="digitalPaperEnabled" class="stats-switch" />
        </div>
        <div class="stats-item stats-tag">答题卡</div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-left">
          <span class="filter-label">试卷列表</span>
          <el-select v-model="sortOrder" placeholder="顺序" class="filter-select-small">
            <el-option label="顺序" value="asc" />
            <el-option label="倒序" value="desc" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedClass" placeholder="九年级 * 2302班" class="filter-select-class">
            <el-option label="九年级 * 2302班" value="class-1" />
            <el-option label="九年级 * 2303班" value="class-2" />
            <el-option label="九年级 * 2304班" value="class-3" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="请输入" class="filter-input" />
          <el-button class="filter-button">查询</el-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="scan-list-area">
        <div class="empty-state">
          <span class="empty-text">暂无数据</span>
        </div>
      </div>
    </div>

    <!-- 作业列表 -->
    <div v-else-if="currentTab === 1" class="homework-list-content">
      <!-- 筛选条件 -->
      <div class="list-filters">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">班级筛选：</span>
            <el-select v-model="selectedGrade" placeholder="全部" class="filter-select-grade">
              <el-option label="全部" value="all" />
              <el-option label="九年级 * 2302班" value="class-2302" />
              <el-option label="九年级 * 2303班" value="class-2303" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">时间筛选：</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="filter-date-range"
            />
          </div>
          
          <div class="filter-item search-item">
            <el-input 
              v-model="homeworkSearchKeyword" 
              placeholder="查询作业名称" 
              class="filter-search-input"
            >
              <template #suffix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 学段筛选 -->
        <div class="filter-row">
          <span class="filter-label">所属学段：</span>
          <div class="filter-tags">
            <el-tag 
              :type="selectedStage === 'middle' ? 'primary' : 'info'"
              @click="selectedStage = 'middle'"
              class="filter-tag-item"
            >
              初中
            </el-tag>
          </div>
        </div>
        
        <!-- 学科筛选 -->
        <div class="filter-row">
          <span class="filter-label">所属学科：</span>
          <div class="filter-tags subject-tags">
            <el-tag 
              v-for="subject in subjectList" 
              :key="subject.value"
              :type="selectedSubject === subject.value ? 'primary' : 'info'"
              @click="selectedSubject = subject.value"
              class="filter-tag-item"
            >
              {{ subject.label }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <!-- 作业列表 -->
      <div class="homework-list">
        <div 
          v-for="homework in homeworkList" 
          :key="homework.id"
          class="homework-item"
        >
          <div class="homework-item-header">
            <div class="homework-left">
              <el-tag type="primary" class="class-tag">{{ homework.class }}</el-tag>
              <span class="homework-title">{{ homework.title }}</span>
            </div>
          </div>
          
          <div class="homework-item-body">
            <div class="homework-stats">
              <span class="stat-item">
                总人数：<span class="stat-value">{{ homework.totalCount }}人</span>
              </span>
              <span class="stat-item">
                已提交：<span class="stat-value green">{{ homework.submitted }}份</span>
              </span>
              <span class="stat-item">
                已批阅：<span class="stat-value orange">{{ homework.reviewed }}份</span>
              </span>
              <span class="stat-item">
                未提交：<span class="stat-value red">{{ homework.unsubmitted }}份</span>
              </span>
            </div>
            
            <div class="homework-actions">
              <el-button class="action-btn-outline">作业讲评</el-button>
              <el-button class="action-btn-warning">试卷批阅</el-button>
              <el-button type="primary" class="action-btn-primary">查看学情</el-button>
            </div>
          </div>
          
          <div class="homework-item-footer">
            <span class="homework-source">作业来源：{{ homework.source }}</span>
            <div class="footer-right">
              <span class="edit-time">上次编辑时间：{{ homework.editTime }}</span>
              <el-button text class="clear-btn">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错题重练 -->
    <div v-else-if="currentTab === 2" class="tab-content">
      <div class="placeholder-container">
        <p class="placeholder-hint">错题重练</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, Search, Delete } from '@element-plus/icons-vue'

defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

// 作业扫描 - 统计数据
const uploadCount = ref(0)
const recognizedCount = ref(0)
const digitalPaperEnabled = ref(false)

// 作业扫描 - 筛选条件
const sortOrder = ref('asc')
const selectedClass = ref('class-1')
const searchKeyword = ref('')

// 作业列表 - 筛选条件
const selectedGrade = ref('all')
const dateRange = ref([])
const homeworkSearchKeyword = ref('')
const selectedStage = ref('middle')
const selectedSubject = ref('all')

// 学科列表
const subjectList = ref([
  { label: '全部', value: 'all' },
  { label: '语文', value: 'chinese' },
  { label: '数学', value: 'math' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '道德与法治', value: 'politics' },
  { label: '历史', value: 'history' },
  { label: '生物学', value: 'biology' },
  { label: '地理', value: 'geography' }
])

// 作业列表数据
const homeworkList = ref([
  {
    id: 1,
    class: '2302班',
    title: '语文随堂测试',
    totalCount: 17,
    submitted: 4,
    reviewed: 1,
    unsubmitted: 13,
    source: '校本库',
    editTime: '2025-10-28'
  },
  {
    id: 2,
    class: '2302班',
    title: '第1节 实数',
    totalCount: 17,
    submitted: 6,
    reviewed: 3,
    unsubmitted: 11,
    source: '校本库',
    editTime: '2025-10-27'
  },
  {
    id: 3,
    class: '2302班',
    title: '课题1 物质的分类',
    totalCount: 17,
    submitted: 10,
    reviewed: 10,
    unsubmitted: 7,
    source: '校本库',
    editTime: '2025-10-24'
  },
  {
    id: 4,
    class: '2302班',
    title: '第三章 透镜及其应用',
    totalCount: 17,
    submitted: 5,
    reviewed: 4,
    unsubmitted: 12,
    source: '校本库',
    editTime: '2025-10-24'
  }
])
</script>

<style scoped>
.homework-manage {
  padding: 20px 24px;
  min-height: 100%;
  background-color: #ffffff;
  border-radius: 5px 0 0 0;
}

/* 作业扫描样式 */
.scan-content {
  width: 100%;
}

.scan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.scan-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.scan-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
}

.scan-button .el-icon {
  font-size: 18px;
}

/* 统计信息栏 */
.scan-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-label {
  font-size: 14px;
  color: #606266;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #2262FB;
}

.stats-unit {
  font-size: 14px;
  color: #606266;
}

.stats-switch {
  margin-left: 8px;
}

.stats-tag {
  padding: 4px 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 20px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.filter-select-small {
  width: 120px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select-class {
  width: 200px;
}

.filter-input {
  width: 240px;
}

.filter-button {
  padding: 8px 24px;
}

/* 列表区域 */
.scan-list-area {
  min-height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-text {
  font-size: 16px;
  color: #c0c4cc;
}

/* 其他标签页样式 */
.tab-content {
  width: 100%;
  height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-hint {
  font-size: 24px;
  color: #909399;
  margin: 0;
}

/* 作业列表样式 */
.homework-list-content {
  width: 100%;
}

.list-filters {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.filter-row .filter-label {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  font-weight: 500;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select-grade {
  width: 200px;
}

.filter-date-range {
  width: 350px;
}

.search-item {
  margin-left: auto;
}

.filter-search-input {
  width: 300px;
}

.search-icon {
  color: #909399;
  cursor: pointer;
}

.filter-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.subject-tags {
  gap: 16px;
}

.filter-tag-item {
  cursor: pointer;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s;
}

.filter-tag-item:hover {
  transform: translateY(-2px);
}

/* 作业列表 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.homework-item {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.homework-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.homework-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.homework-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.class-tag {
  font-size: 14px;
  padding: 4px 12px;
  font-weight: 500;
}

.homework-title {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.homework-item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #f5f7fa;
  border-bottom: 1px solid #f5f7fa;
}

.homework-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat-item {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-weight: 600;
  color: #303133;
  margin-left: 4px;
}

.stat-value.green {
  color: #67C23A;
}

.stat-value.orange {
  color: #E6A23C;
}

.stat-value.red {
  color: #F56C6C;
}

.homework-actions {
  display: flex;
  gap: 12px;
}

.action-btn-outline {
  border: 1px solid #dcdfe6;
  color: #606266;
}

.action-btn-outline:hover {
  border-color: #2262FB;
  color: #2262FB;
}

.action-btn-warning {
  border: 1px solid #E6A23C;
  color: #E6A23C;
  background: #fef5e7;
}

.action-btn-warning:hover {
  background: #E6A23C;
  color: #ffffff;
}

.action-btn-primary {
  background: #2262FB;
  border-color: #2262FB;
}

.action-btn-primary:hover {
  background: #1450d9;
}

.homework-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.homework-source {
  font-size: 13px;
  color: #909399;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.edit-time {
  font-size: 13px;
  color: #909399;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
  padding: 4px 8px;
}

.clear-btn:hover {
  color: #F56C6C;
}
</style>


