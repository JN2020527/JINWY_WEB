<template>
  <div class="my-center">
    <!-- 内容区 -->
    <div class="tab-content-area">
      <!-- 我的备考 -->
      <div v-if="currentTab === 0" class="exam-prep-container">
        <!-- 左侧分类 -->
        <div class="left-category">
          <div class="category-header">
            <span class="category-title">— 试卷分类 —</span>
          </div>
          <div class="category-list">
            <div 
              :class="['category-item', { active: selectedCategory === 'all' }]"
              @click="selectedCategory = 'all'"
            >
              <span class="category-name">全部</span>
              <el-icon class="add-icon" @click.stop="handleAddCategory">
                <Plus />
              </el-icon>
            </div>
            <div 
              :class="['category-item', { active: selectedCategory === 'uncategorized' }]"
              @click="selectedCategory = 'uncategorized'"
            >
              <span class="category-name">未分类</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="right-content">
          <!-- 筛选区 -->
          <div class="filter-bar">
            <div class="filter-left">
              <span class="filter-label">时间筛选：</span>
              <el-date-picker
                v-model="examPrepDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="date-picker"
              />
              <el-input 
                v-model="examPrepSearchKeyword" 
                placeholder="查询作业名称" 
                class="search-input"
              >
                <template #suffix>
                  <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="filter-right">
              <el-button class="create-btn">
                <el-icon><Tickets /></el-icon>
                <span>创建答题卡</span>
              </el-button>
              <span class="divider-text">或</span>
              <el-button class="upload-btn">
                <el-icon><Upload /></el-icon>
                <span>自传试卷</span>
              </el-button>
            </div>
          </div>

          <!-- 资源类型标签 -->
          <div class="resource-type-tags">
            <span class="type-label">资源类型：</span>
            <div class="type-tags">
              <el-tag 
                v-for="type in resourceTypes" 
                :key="type.value"
                :type="selectedResourceType === type.value ? 'primary' : 'info'"
                @click="selectedResourceType = type.value"
                class="type-tag"
              >
                {{ type.label }}
              </el-tag>
            </div>
          </div>

          <!-- 表格列表 -->
          <div class="table-container">
            <el-table :data="examPrepList" style="width: 100%">
              <el-table-column prop="name" label="作业名称" min-width="200">
                <template #default="{ row }">
                  <div class="name-cell">
                    <span>{{ row.name }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="作业类型" width="150" />
              <el-table-column prop="subject" label="学段/学科" width="150">
                <template #default="{ row }">
                  <span>{{ row.stage }}-{{ row.subject }}</span>
                  <el-icon class="edit-icon"><Edit /></el-icon>
                </template>
              </el-table-column>
              <el-table-column prop="editTime" label="上次编辑时间" width="180" />
              <el-table-column prop="isLocked" label="是否解锁作业" width="120">
                <template #default="{ row }">
                  <span>{{ row.isLocked ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-dropdown trigger="click">
                    <el-button text>
                      <span>下拉菜单</span>
                      <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item>编辑</el-dropdown-item>
                        <el-dropdown-item>删除</el-dropdown-item>
                        <el-dropdown-item>移动</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                layout="total, prev, pager, next"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 我的备课 -->
      <div v-else-if="currentTab === 1" class="content-wrapper">
        <div class="placeholder-container">
          <el-icon class="placeholder-icon"><EditPen /></el-icon>
          <p class="placeholder-hint">我的备课</p>
          <p class="placeholder-desc">这里将展示您收藏和准备的备课资源</p>
        </div>
      </div>

      <!-- 校本试卷 -->
      <div v-else-if="currentTab === 2" class="content-wrapper">
        <div class="placeholder-container">
          <el-icon class="placeholder-icon"><Document /></el-icon>
          <p class="placeholder-hint">校本试卷</p>
          <p class="placeholder-desc">这里将展示您学校的试卷库</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Reading, EditPen, Document, Plus, Search, Tickets, Upload, Edit, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

// 我的备考 - 左侧分类
const selectedCategory = ref('all')

// 我的备考 - 筛选条件
const examPrepDateRange = ref([])
const examPrepSearchKeyword = ref('')
const selectedResourceType = ref('all')

// 资源类型
const resourceTypes = ref([
  { label: '全部', value: 'all' },
  { label: '自传试卷', value: 'uploaded' },
  { label: '试题组卷', value: 'composed' },
  { label: '题卡作业', value: 'cardwork' }
])

// 我的备考 - 表格数据
const examPrepList = ref([
  {
    id: 1,
    name: '2025年全国初中语文试卷',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-30 16:32:55',
    isLocked: false
  },
  {
    id: 2,
    name: '课标文言文',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-30 14:32:55',
    isLocked: false
  },
  {
    id: 3,
    name: '',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-30 13:31:13',
    isLocked: false
  },
  {
    id: 4,
    name: '',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-28 15:15:59',
    isLocked: false
  },
  {
    id: 5,
    name: '古诗文默写',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-24 14:40:08',
    isLocked: false
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(5)

// 添加分类
const handleAddCategory = () => {
  ElMessage.info('添加分类功能')
}

// 搜索
const handleSearch = () => {
  ElMessage.info('搜索功能')
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}
</script>

<style scoped>
.my-center {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 5px 0 0 0;
  padding: 20px;
}

/* 内容区 */
.tab-content-area {
  width: 100%;
  height: calc(100vh - 140px);
}

/* 我的备考 - 左右两栏布局 */
.exam-prep-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 左侧分类 */
.left-category {
  width: 280px;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.category-header {
  margin-bottom: 16px;
  text-align: center;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: #ecf5ff;
  color: #2262FB;
}

.category-item.active .category-name {
  color: #2262FB;
  font-weight: 500;
}

.category-name {
  font-size: 14px;
  color: #606266;
}

.add-icon {
  font-size: 16px;
  color: #2262FB;
  cursor: pointer;
}

.add-icon:hover {
  transform: scale(1.2);
}

/* 右侧内容 */
.right-content {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 筛选区 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.date-picker {
  width: 320px;
}

.search-input {
  width: 280px;
}

.search-icon {
  color: #909399;
  cursor: pointer;
}

.search-icon:hover {
  color: #2262FB;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-btn,
.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-btn {
  background: #2262FB;
  border-color: #2262FB;
  color: #ffffff;
}

.create-btn:hover {
  background: #1450d9;
}

.upload-btn {
  border: 1px solid #2262FB;
  color: #2262FB;
  background: #ffffff;
}

.upload-btn:hover {
  background: #ecf5ff;
}

.divider-text {
  color: #909399;
  font-size: 14px;
}

/* 资源类型标签 */
.resource-type-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.type-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.type-tags {
  display: flex;
  gap: 12px;
}

.type-tag {
  cursor: pointer;
  padding: 6px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

.type-tag:hover {
  transform: translateY(-2px);
}

/* 表格容器 */
.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  color: #909399;
  cursor: pointer;
  font-size: 14px;
}

.edit-icon:hover {
  color: #2262FB;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 其他标签页 */
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
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
  text-align: center;
}

.placeholder-icon {
  font-size: 80px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.placeholder-hint {
  font-size: 24px;
  color: #303133;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.placeholder-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
</style>

