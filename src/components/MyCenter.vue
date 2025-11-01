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
              <el-icon class="add-icon" @click.stop="showAddDialog = true">
                <Plus />
              </el-icon>
            </div>
            
            <!-- 自定义分组列表 -->
            <div 
              v-for="category in categoryList" 
              :key="category.id"
              :class="['category-item', { active: selectedCategory === category.id }]"
              @click="selectedCategory = category.id"
            >
              <span class="category-name">{{ category.name }}</span>
              <el-dropdown trigger="click" @click.stop>
                <el-icon class="more-icon">
                  <MoreFilled />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleRenameCategory(category)">
                      <el-icon><Edit /></el-icon>
                      <span>重命名</span>
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteCategory(category.id)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
            <el-table :data="examPrepList" style="width: 100%" :header-cell-style="{ fontWeight: '600' }">
              <el-table-column prop="name" label="作业名称" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="name-cell">
                    <span class="name-text">{{ row.name || '未命名' }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="作业类型" width="140" align="center" />
              <el-table-column prop="subject" label="学段/学科" width="160" align="center">
                <template #default="{ row }">
                  <div class="subject-cell">
                    <span>{{ row.stage }}-{{ row.subject }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="editTime" label="上次编辑时间" width="180" align="center" />
              <el-table-column prop="isLocked" label="是否解锁作业" width="140" align="center">
                <template #default="{ row }">
                  <span class="status-text">{{ row.isLocked ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" align="center" fixed="right">
                <template #default="{ row }">
                  <el-dropdown trigger="click" class="operation-dropdown">
                    <el-button text class="dropdown-btn">
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

    <!-- 添加分组对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="addCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="addCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmAdd" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重命名分组对话框 -->
    <el-dialog
      v-model="showRenameDialog"
      title="重命名分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="renameCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="renameCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmRename" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Reading, EditPen, Document, Plus, Search, Tickets, Upload, Edit, ArrowDown, Delete, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

// 我的备考 - 左侧分类
const selectedCategory = ref('all')
const showAddDialog = ref(false)
const addCategoryForm = ref({
  name: ''
})
const showRenameDialog = ref(false)
const renameCategoryForm = ref({
  id: '',
  name: ''
})
const categoryList = ref([]) // 自定义分组列表

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

// 确认添加分组
const handleConfirmAdd = () => {
  if (!addCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  // 创建新分组
  const newCategory = {
    id: `category_${Date.now()}`,
    name: addCategoryForm.value.name.trim()
  }
  
  // 添加到分组列表
  categoryList.value.push(newCategory)
  
  ElMessage.success(`分组"${addCategoryForm.value.name}"创建成功`)
  
  // 关闭对话框并重置表单
  showAddDialog.value = false
  addCategoryForm.value.name = ''
}

// 重命名分组
const handleRenameCategory = (category) => {
  renameCategoryForm.value.id = category.id
  renameCategoryForm.value.name = category.name
  showRenameDialog.value = true
}

// 确认重命名
const handleConfirmRename = () => {
  if (!renameCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  // 查找并更新分组名称
  const index = categoryList.value.findIndex(item => item.id === renameCategoryForm.value.id)
  if (index !== -1) {
    const oldName = categoryList.value[index].name
    categoryList.value[index].name = renameCategoryForm.value.name.trim()
    ElMessage.success(`分组"${oldName}"已重命名为"${renameCategoryForm.value.name}"`)
  }
  
  // 关闭对话框并重置表单
  showRenameDialog.value = false
  renameCategoryForm.value = { id: '', name: '' }
}

// 删除分组
const handleDeleteCategory = (categoryId) => {
  ElMessageBox.confirm(
    '确定要删除该分组吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 从列表中删除
      const index = categoryList.value.findIndex(item => item.id === categoryId)
      if (index !== -1) {
        const categoryName = categoryList.value[index].name
        categoryList.value.splice(index, 1)
        
        // 如果当前选中的是被删除的分组，切换到"全部"
        if (selectedCategory.value === categoryId) {
          selectedCategory.value = 'all'
        }
        
        ElMessage.success(`分组"${categoryName}"已删除`)
      }
    })
    .catch(() => {
      // 用户取消删除
    })
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
  padding: 16px 20px;
}

/* 内容区 */
.tab-content-area {
  width: 100%;
  height: calc(100vh - 140px);
}

/* 我的备考 - 左右两栏布局 */
.exam-prep-container {
  display: flex;
  gap: 16px;
  height: 100%;
}

/* 左侧分类 */
.left-category {
  width: 286px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-header {
  margin-bottom: 12px;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #E4E7ED;
}

.category-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}

.category-item:hover {
  background: #E9ECEF;
}

.category-item.active {
  background: #E8F4FF;
  color: #2262FB;
}

.category-item.active .category-name {
  color: #2262FB;
  font-weight: 600;
}

.category-name {
  font-size: 14px;
  color: #606266;
}

.add-icon {
  font-size: 14px;
  color: #2262FB;
  cursor: pointer;
  transition: all 0.3s;
}

.add-icon:hover {
  transform: scale(1.1);
}

.more-icon {
  font-size: 16px;
  color: #8F959E;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  transform: rotate(90deg);
}

.category-item:hover .more-icon {
  opacity: 1;
}

.more-icon:hover {
  color: #2262FB;
}

/* 分组操作下拉菜单样式 */
.category-item :deep(.el-dropdown) {
  display: flex;
  align-items: center;
}

.category-item :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
}

.category-item :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

.category-item :deep(.el-dropdown-menu__item:hover) {
  background-color: #F5F7FA;
  color: #2262FB;
}

/* 右侧内容 */
.right-content {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 筛选区 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 18px;
  color: #303133;
  white-space: nowrap;
  font-weight: 500;
}

.date-picker {
  width: 300px;
}

.date-picker :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #DCDFE6 inset;
  height: 36px !important;
  padding: 0 8px !important;
}

.date-picker :deep(.el-input__inner) {
  font-size: 18px;
  height: 36px !important;
  line-height: 36px !important;
}

.date-picker :deep(.el-range-input) {
  font-size: 18px;
  height: 36px !important;
  line-height: 36px !important;
}

.date-picker :deep(.el-range-separator) {
  font-size: 18px;
  line-height: 36px !important;
  height: 36px !important;
  display: flex;
  align-items: center;
}

.search-input {
  width: 260px;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #DCDFE6 inset;
  height: 36px !important;
}

.search-input :deep(.el-input__inner) {
  font-size: 18px;
  height: 36px !important;
}

.search-input :deep(.el-input__inner::placeholder) {
  font-size: 15px;
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
  gap: 10px;
}

.create-btn,
.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  height: 36px !important;
}

.create-btn {
  background: #2262FB;
  border-color: #2262FB;
  color: #ffffff;
}

.create-btn:hover {
  background: #1450d9;
  border-color: #1450d9;
}

.upload-btn {
  border: 1px solid #DCDFE6;
  color: #606266;
  background: #ffffff;
}

.upload-btn:hover {
  color: #2262FB;
  border-color: #2262FB;
}

.divider-text {
  color: #909399;
  font-size: 13px;
  padding: 0 4px;
}

/* 资源类型标签 */
.resource-type-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F0F2F5;
  min-height: 60px;
}

.type-label {
  font-size: 18px;
  color: #303133;
  white-space: nowrap;
  font-weight: 500;
  width: 100px;
}

.type-tags {
  display: flex;
  gap: 16px;
}

.type-tag {
  cursor: pointer;
  padding: 6px 16px;
  font-size: 18px;
  transition: all 0.3s;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border-color: transparent;
}

.type-tag.el-tag--primary {
  color: #2262FB;
  background-color: #F2F3F5;
  border-color: transparent;
  border-radius: 20px;
  font-weight: 600;
}

.type-tag.el-tag--info {
  background-color: transparent;
  border-color: transparent;
  color: #606266;
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

.table-container :deep(.el-table) {
  font-size: 14px;
  border-top: 1px solid #E4E7ED;
  border-bottom: 1px solid #E4E7ED;
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.table-container :deep(.el-table th) {
  background-color: #F5F7FA;
  color: #303133;
  font-weight: 600;
  font-size: 14px;
  height: 48px;
  padding: 12px 0;
}

.table-container :deep(.el-table th.el-table__cell) {
  border-bottom: 1px solid #E4E7ED;
  border-left: none;
  border-right: none;
}

.table-container :deep(.el-table td) {
  color: #303133;
  font-size: 14px;
  height: 44px;
  padding: 10px 0;
}

.table-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #F0F2F5;
  border-left: none;
  border-right: none;
}

.table-container :deep(.el-table__row) {
  transition: background-color 0.2s;
}

.table-container :deep(.el-table__row:hover) {
  background-color: #F8F9FA !important;
}

.table-container :deep(.el-table__body tr:last-child td) {
  border-bottom: none;
}

.table-container :deep(.el-table::before) {
  height: 0;
}

.table-container :deep(.el-table__empty-block) {
  padding: 40px 0;
}

.table-container :deep(.el-table__empty-text) {
  color: #909399;
  font-size: 14px;
}

.table-container :deep(.el-table .cell) {
  padding: 0 16px;
  line-height: 1.5;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  color: #303133;
  font-size: 14px;
}

.subject-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-text {
  color: #606266;
  font-size: 14px;
}

.edit-icon {
  color: #C0C4CC;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
  opacity: 0.7;
}

.edit-icon:hover {
  color: #2262FB;
  opacity: 1;
}

.operation-dropdown {
  display: inline-flex;
  align-items: center;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
  padding: 0 !important;
  height: auto !important;
}

.dropdown-btn:hover {
  color: #2262FB;
}

.dropdown-btn .el-icon {
  font-size: 12px;
}

/* 表格操作列样式优化 */
.table-container :deep(.el-table__fixed-right) {
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.04);
  border-left: none;
  border-right: none;
}

.table-container :deep(.el-table__fixed-right .el-table__cell) {
  border-left: none;
  border-right: none;
}

.table-container :deep(.el-dropdown) {
  font-size: 14px;
}

.table-container :deep(.el-button.is-text) {
  color: #606266;
  font-size: 14px;
  padding: 0;
}

.table-container :deep(.el-button.is-text:hover) {
  color: #2262FB;
}

.table-container :deep(.el-dropdown__popper .el-dropdown-menu__item) {
  font-size: 14px;
  padding: 10px 16px;
  color: #303133;
}

.table-container :deep(.el-dropdown__popper .el-dropdown-menu__item:hover) {
  background-color: #F5F7FA;
  color: #2262FB;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
}

.pagination-container :deep(.el-pagination) {
  font-size: 14px;
}

.pagination-container :deep(.el-pager li) {
  font-size: 14px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

.pagination-container :deep(.el-pager li.is-active) {
  background-color: #2262FB;
  color: #ffffff;
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

/* 表单项样式（scoped） */
.category-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.category-form :deep(.el-form-item__label) {
  font-size: 14px;
  color: #1F2329;
  font-weight: 500;
  line-height: 40px;
  padding-right: 16px;
}

.category-form :deep(.el-form-item__label::before) {
  color: #F53F3F;
  margin-right: 4px;
}

.category-form :deep(.el-form-item__content) {
  line-height: 40px;
}

.category-form :deep(.el-input) {
  height: 40px;
}

.category-form :deep(.el-input__wrapper) {
  padding: 9px 12px;
  box-shadow: 0 0 0 1px #E5E6EB inset;
  border-radius: 4px;
  transition: all 0.3s;
}

.category-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #C9CDD4 inset;
}

.category-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2262FB inset !important;
}

.category-form :deep(.el-input__inner) {
  height: 22px;
  font-size: 14px;
  color: #1F2329;
  line-height: 22px;
}

.category-form :deep(.el-input__inner::placeholder) {
  color: #C9CDD4;
}

.category-form :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
}

.category-form :deep(.el-input__count) {
  font-size: 12px;
  color: #8F959E;
  line-height: 22px;
}

.category-form :deep(.el-input__clear) {
  font-size: 14px;
  color: #C9CDD4;
}

.category-form :deep(.el-input__clear:hover) {
  color: #8F959E;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.confirm-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  background: #2262FB;
  border-color: #2262FB;
  border-radius: 4px;
  transition: all 0.3s;
}

.confirm-btn:hover {
  background: #4080FF;
  border-color: #4080FF;
}

.confirm-btn:active {
  background: #1450d9;
  border-color: #1450d9;
}
</style>

<style>
/* 添加分组对话框全局样式（非scoped） */
.add-category-dialog {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 日期选择器高度调整 */
.date-picker.el-date-editor {
  height: 36px !important;
}

.date-picker.el-date-editor .el-input__wrapper {
  height: 36px !important;
  min-height: 36px !important;
  padding: 0 8px !important;
}

.date-picker.el-date-editor .el-range-input {
  height: 36px !important;
  line-height: 36px !important;
  font-size: 14px !important;
}

.date-picker.el-date-editor .el-range-separator {
  height: 36px !important;
  line-height: 36px !important;
  font-size: 14px !important;
}

.date-picker.el-date-editor .el-input__prefix,
.date-picker.el-date-editor .el-input__suffix {
  height: 36px !important;
  display: flex !important;
  align-items: center !important;
}

.add-category-dialog .el-dialog__header {
  padding: 20px 24px 16px;
  margin: 0;
  border-bottom: 1px solid #E5E6EB;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-category-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2329;
  line-height: 26px;
}

.add-category-dialog .el-dialog__headerbtn {
  position: absolute;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
}

.add-category-dialog .el-dialog__close {
  font-size: 16px;
  color: #8F959E;
  transition: color 0.3s;
}

.add-category-dialog .el-dialog__close:hover {
  color: #1F2329;
}

.add-category-dialog .el-dialog__body {
  padding: 24px;
}

.add-category-dialog .el-dialog__footer {
  padding: 16px 24px 24px;
  border-top: none;
}
</style>

