<template>
  <div class="my-center">
    <!-- 内容区 -->
    <div class="tab-content-area">
      <!-- 我的备考 -->
      <div v-if="currentTab === 0" class="exam-prep-container">
        <!-- 左侧分类 -->
        <div class="left-category">
          <div class="category-header">
            <span class="category-title">— 备考分类 —</span>
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
                    <el-icon class="edit-icon" @click="handleRenameWork(row)"><Edit /></el-icon>
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
      <div v-else-if="currentTab === 1" class="prepare-resource-container">
        <!-- 左侧分类 -->
        <div class="left-category">
          <div class="category-header">
            <span class="category-title">— 备课分类 —</span>
          </div>
          <div class="category-list">
            <div 
              :class="['category-item', { active: selectedPrepareCategory === 'all' }]"
              @click="selectedPrepareCategory = 'all'"
            >
              <span class="category-name">全部</span>
              <el-icon class="add-icon" @click.stop="showAddPrepareDialog = true">
                <Plus />
              </el-icon>
            </div>
            
            <!-- 自定义分组列表 -->
            <div 
              v-for="category in prepareCategoryList" 
              :key="category.id"
              :class="['category-item', { active: selectedPrepareCategory === category.id }]"
              @click="selectedPrepareCategory = category.id"
            >
              <span class="category-name">{{ category.name }}</span>
              <el-dropdown trigger="click" @click.stop>
                <el-icon class="more-icon">
                  <MoreFilled />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleRenamePrepareCategory(category)">
                      <el-icon><Edit /></el-icon>
                      <span>重命名</span>
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeletePrepareCategory(category.id)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            
            <div 
              :class="['category-item', { active: selectedPrepareCategory === 'uncategorized' }]"
              @click="selectedPrepareCategory = 'uncategorized'"
            >
              <span class="category-name">未分类</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="right-content">
          <!-- 顶部分类标签 -->
          <div class="category-tabs">
            <div 
              v-for="(tab, index) in prepareResourceTabs" 
              :key="index"
              class="tab-item"
              :class="{ active: currentPrepareTab === index }"
              @click="currentPrepareTab = index"
            >
              {{ tab }}
            </div>
          </div>

          <!-- 资源列表 -->
          <div class="resource-list">
            <div 
              v-for="resource in prepareResourceList" 
              :key="resource.id"
              class="resource-item"
            >
              <!-- 左侧图标 -->
              <div class="resource-icon">
                <img :src="getFileIcon(resource.fileType)" class="file-icon" :class="`icon-${resource.fileType.toLowerCase()}`" :alt="resource.fileType">
              </div>

              <!-- 中间信息 -->
              <div class="resource-info">
                <div class="resource-title">{{ resource.title }}</div>
                <div class="resource-meta">
                  <span class="meta-tag">{{ resource.category }}</span>
                  <span class="meta-text">
                    <el-icon><Clock /></el-icon>
                    {{ resource.date }}
                  </span>
                  <span class="meta-text">
                    <el-icon><Download /></el-icon>
                    {{ resource.downloads }}次
                  </span>
                  <span class="meta-text">
                    <el-icon><View /></el-icon>
                    {{ resource.views }}次
                  </span>
                  <span class="meta-text">文件大小 {{ resource.size }}</span>
                </div>
              </div>

              <!-- 右侧操作按钮 -->
              <div class="resource-actions">
                <el-button text @click="handleDownloadResource(resource)">
                  <el-icon><Download /></el-icon>
                  <span>下载</span>
                </el-button>
                <el-button text @click="handlePreviewResource(resource)">
                  <el-icon><View /></el-icon>
                  <span>预览</span>
                </el-button>
                <el-button text @click="handleMovePrepareResource(resource)">
                  <el-icon><FolderOpened /></el-icon>
                  <span>移动</span>
                </el-button>
                <el-button text @click="handleRemoveFromPrepare(resource)">
                  <el-icon><Delete /></el-icon>
                  <span>移除</span>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 校本试卷 -->
      <div v-else-if="currentTab === 2" class="exam-prep-container">
        <!-- 左侧分类 -->
        <div class="left-category">
          <div class="category-header">
            <span class="category-title">— 试卷分类 —</span>
        </div>
          <div class="category-list">
            <div 
              :class="['category-item', { active: schoolPaperCategory === 'all' }]"
              @click="schoolPaperCategory = 'all'"
            >
              <span class="category-name">全部</span>
              <el-icon class="add-icon" @click.stop="showAddSchoolPaperDialog = true">
                <Plus />
              </el-icon>
      </div>
            
            <!-- 自定义分组列表 -->
            <div 
              v-for="category in schoolPaperCategoryList" 
              :key="category.id"
              :class="['category-item', { active: schoolPaperCategory === category.id }]"
              @click="schoolPaperCategory = category.id"
            >
              <span class="category-name">{{ category.name }}</span>
              <el-dropdown trigger="click" @click.stop>
                <el-icon class="more-icon">
                  <MoreFilled />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleRenameSchoolPaperCategory(category)">
                      <el-icon><Edit /></el-icon>
                      <span>重命名</span>
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteSchoolPaperCategory(category.id)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
    </div>
            
            <div 
              :class="['category-item', { active: schoolPaperCategory === 'uncategorized' }]"
              @click="schoolPaperCategory = 'uncategorized'"
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
              <span class="filter-label">试卷查询：</span>
              <el-input 
                v-model="schoolPaperSearchKeyword" 
                placeholder="查询作业名称" 
                class="search-input"
                style="margin-right: 24px;"
              >
                <template #suffix>
                  <el-icon class="search-icon" @click="handleSchoolPaperSearch"><Search /></el-icon>
                </template>
              </el-input>
              <span class="filter-label">时间筛选：</span>
              <el-date-picker
                v-model="schoolPaperDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="date-picker"
              />
            </div>
          </div>

          <!-- 资源类型标签 -->
          <div class="resource-type-tags">
            <span class="type-label">资源类型：</span>
            <div class="type-tags">
              <el-tag 
                v-for="type in schoolPaperResourceTypes" 
                :key="type.value"
                :type="schoolPaperResourceType === type.value ? 'primary' : 'info'"
                @click="schoolPaperResourceType = type.value"
                class="type-tag"
              >
                {{ type.label }}
              </el-tag>
            </div>
          </div>

          <!-- 表格列表 -->
          <div class="table-container">
            <el-table :data="schoolPaperList" style="width: 100%" :header-cell-style="{ fontWeight: '600' }">
              <el-table-column prop="name" label="作业名称" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="name-cell">
                    <span class="name-text">{{ row.name || '未命名' }}</span>
                    <el-icon class="edit-icon" @click="handleRenameSchoolPaperWork(row)"><Edit /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="作业类型" width="160" align="center" />
              <el-table-column prop="creator" label="创建人" width="140" align="center" />
              <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
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
                v-model:current-page="schoolPaperCurrentPage"
                :page-size="schoolPaperPageSize"
                :total="schoolPaperTotal"
                layout="total, prev, pager, next"
                @current-change="handleSchoolPaperPageChange"
              />
            </div>
          </div>
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

    <!-- 重命名作业对话框 -->
    <el-dialog
      v-model="showRenameWorkDialog"
      title="重命名"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="renameWorkForm" label-width="85px" class="category-form">
        <el-form-item label="作业名称" required>
          <el-input
            v-model="renameWorkForm.name"
            placeholder="请填写作业名称"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmRenameWork" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移动资源对话框 -->
    <el-dialog
      v-model="showMoveResourceDialog"
      title="移动到"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="moveResourceForm" label-width="85px" class="category-form">
        <el-form-item label="目标分组" required>
          <el-select v-model="moveResourceForm.targetCategoryId" placeholder="请选择目标分组" style="width: 100%">
            <el-option label="未分类" value="uncategorized" />
            <el-option 
              v-for="category in prepareCategoryList" 
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmMoveResource" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加备课分组对话框 -->
    <el-dialog
      v-model="showAddPrepareDialog"
      title="添加分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="addPrepareCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="addPrepareCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmAddPrepareCategory" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重命名备课分组对话框 -->
    <el-dialog
      v-model="showRenamePrepareDialog"
      title="重命名分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="renamePrepareCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="renamePrepareCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmRenamePrepareCategory" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加校本试卷分组对话框 -->
    <el-dialog
      v-model="showAddSchoolPaperDialog"
      title="添加分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="addSchoolPaperCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="addSchoolPaperCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmAddSchoolPaperCategory" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重命名校本试卷分组对话框 -->
    <el-dialog
      v-model="showRenameSchoolPaperDialog"
      title="重命名分组"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="renameSchoolPaperCategoryForm" label-width="85px" class="category-form">
        <el-form-item label="分组名称" required>
          <el-input
            v-model="renameSchoolPaperCategoryForm.name"
            placeholder="请填写分组名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmRenameSchoolPaperCategory" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重命名校本试卷作业对话框 -->
    <el-dialog
      v-model="showRenameSchoolPaperWorkDialog"
      title="重命名"
      width="588px"
      :close-on-click-modal="false"
      class="add-category-dialog"
    >
      <el-form :model="renameSchoolPaperWorkForm" label-width="85px" class="category-form">
        <el-form-item label="作业名称" required>
          <el-input
            v-model="renameSchoolPaperWorkForm.name"
            placeholder="请填写作业名称"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirmRenameSchoolPaperWork" class="confirm-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Reading, EditPen, Document, Plus, Search, Tickets, Upload, Edit, ArrowDown, Delete, MoreFilled, Clock, Download, View, Star, FolderOpened } from '@element-plus/icons-vue'
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

// 重命名作业
const showRenameWorkDialog = ref(false)
const renameWorkForm = ref({
  id: null,
  name: ''
})

// 我的备课 - 左侧分类
const selectedPrepareCategory = ref('all')
const showAddPrepareDialog = ref(false)
const addPrepareCategoryForm = ref({
  name: ''
})
const showRenamePrepareDialog = ref(false)
const renamePrepareCategoryForm = ref({
  id: '',
  name: ''
})
const prepareCategoryList = ref([]) // 备课自定义分组列表
const currentPrepareTab = ref(0)
const prepareResourceTabs = ref(['全部资源', '课件', '教案', '音视频', '模拟卷'])

// 移动资源
const showMoveResourceDialog = ref(false)
const moveResourceForm = ref({
  resourceId: null,
  targetCategoryId: ''
})

// 我的备课 - 资源列表
const prepareResourceList = ref([
  { id: 'p1', title: '2025晋文源语文中考模拟卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-22', downloads: 1, views: 6, size: '0.47MB' },
  { id: 'p2', title: '第一章教学课件', category: '课件', fileType: 'PPT', date: '2025-10-20', downloads: 3, views: 12, size: '2.1MB' },
  { id: 'p3', title: '第一章教案设计', category: '教案', fileType: 'DOC', date: '2025-10-18', downloads: 2, views: 8, size: '0.8MB' },
  { id: 'p4', title: '第一章知识点讲解视频', category: '音视频', fileType: 'MP4', date: '2025-10-16', downloads: 15, views: 45, size: '38MB' },
  { id: 'p5', title: '第一章学习资料合集', category: '综合', fileType: 'PDF', date: '2025-10-15', downloads: 8, views: 24, size: '1.5MB' }
])

// 获取文件图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'PDF': '/src/assets/icron/文件类型-pdf.svg',
    'PPT': '/src/assets/icron/文件类型-ppt.svg',
    'DOC': '/src/assets/icron/文件类型-文档.svg',
    'EXCEL': '/src/assets/icron/文件类型-excel.svg',
    'MP4': '/src/assets/icron/文件类型-视频.svg',
    'MP3': '/src/assets/icron/文件类型-音频.svg',
    'ZIP': '/src/assets/icron/文件类型-压缩包.svg',
    'IMG': '/src/assets/icron/文件类型-图片.svg'
  }
  return iconMap[fileType] || '/src/assets/icron/文件类型-附件.svg'
}

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
const total = ref(3)

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

// 重命名作业
const handleRenameWork = (work) => {
  renameWorkForm.value.id = work.id
  renameWorkForm.value.name = work.name || ''
  showRenameWorkDialog.value = true
}

// 确认重命名作业
const handleConfirmRenameWork = () => {
  if (!renameWorkForm.value.name.trim()) {
    ElMessage.warning('请输入作业名称')
    return
  }
  
  // 查找并更新作业名称
  const index = examPrepList.value.findIndex(item => item.id === renameWorkForm.value.id)
  if (index !== -1) {
    const oldName = examPrepList.value[index].name || '未命名'
    examPrepList.value[index].name = renameWorkForm.value.name.trim()
    ElMessage.success(`作业"${oldName}"已重命名为"${renameWorkForm.value.name}"`)
  }
  
  // 关闭对话框并重置表单
  showRenameWorkDialog.value = false
  renameWorkForm.value = { id: null, name: '' }
}

// 我的备课 - 添加分组
const handleConfirmAddPrepareCategory = () => {
  if (!addPrepareCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  // 创建新分组
  const newCategory = {
    id: `prepare_category_${Date.now()}`,
    name: addPrepareCategoryForm.value.name.trim()
  }
  
  // 添加到分组列表
  prepareCategoryList.value.push(newCategory)
  
  ElMessage.success(`分组"${addPrepareCategoryForm.value.name}"创建成功`)
  
  // 关闭对话框并重置表单
  showAddPrepareDialog.value = false
  addPrepareCategoryForm.value.name = ''
}

// 我的备课 - 重命名分类
const handleRenamePrepareCategory = (category) => {
  renamePrepareCategoryForm.value.id = category.id
  renamePrepareCategoryForm.value.name = category.name
  showRenamePrepareDialog.value = true
}

// 我的备课 - 确认重命名
const handleConfirmRenamePrepareCategory = () => {
  if (!renamePrepareCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  // 查找并更新分组名称
  const index = prepareCategoryList.value.findIndex(item => item.id === renamePrepareCategoryForm.value.id)
  if (index !== -1) {
    const oldName = prepareCategoryList.value[index].name
    prepareCategoryList.value[index].name = renamePrepareCategoryForm.value.name.trim()
    ElMessage.success(`分组"${oldName}"已重命名为"${renamePrepareCategoryForm.value.name}"`)
  }
  
  // 关闭对话框并重置表单
  showRenamePrepareDialog.value = false
  renamePrepareCategoryForm.value = { id: '', name: '' }
}

// 我的备课 - 删除分类
const handleDeletePrepareCategory = (categoryId) => {
  ElMessageBox.confirm(
    '确定要删除该分类吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = prepareCategoryList.value.findIndex(item => item.id === categoryId)
      if (index !== -1) {
        const categoryName = prepareCategoryList.value[index].name
        prepareCategoryList.value.splice(index, 1)
        
        if (selectedPrepareCategory.value === categoryId) {
          selectedPrepareCategory.value = 'all'
        }
        
        ElMessage.success(`分类"${categoryName}"已删除`)
      }
    })
    .catch(() => {})
}

// 我的备课 - 资源操作
const handleDownloadResource = (resource) => {
  ElMessage.success(`下载资源：${resource.title}`)
}

const handlePreviewResource = (resource) => {
  ElMessage.info(`预览资源：${resource.title}`)
}

const handleMovePrepareResource = (resource) => {
  moveResourceForm.value.resourceId = resource.id
  moveResourceForm.value.targetCategoryId = ''
  showMoveResourceDialog.value = true
}

const handleConfirmMoveResource = () => {
  if (!moveResourceForm.value.targetCategoryId) {
    ElMessage.warning('请选择目标分组')
    return
  }
  
  // 查找资源
  const resource = prepareResourceList.value.find(item => item.id === moveResourceForm.value.resourceId)
  if (resource) {
    // 这里可以给资源添加 categoryId 属性来标记所属分组
    // resource.categoryId = moveResourceForm.value.targetCategoryId
    
    // 获取目标分组名称
    let targetName = '未分类'
    if (moveResourceForm.value.targetCategoryId !== 'uncategorized') {
      const targetCategory = prepareCategoryList.value.find(item => item.id === moveResourceForm.value.targetCategoryId)
      if (targetCategory) {
        targetName = targetCategory.name
      }
    }
    
    ElMessage.success(`已将"${resource.title}"移动到"${targetName}"`)
    
    // 关闭对话框并重置表单
    showMoveResourceDialog.value = false
    moveResourceForm.value = { resourceId: null, targetCategoryId: '' }
  }
}

const handleRemoveFromPrepare = (resource) => {
  ElMessageBox.confirm(
    `确定要从备课资源中移除"${resource.title}"吗？`,
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 从列表中移除
      const index = prepareResourceList.value.findIndex(item => item.id === resource.id)
      if (index !== -1) {
        prepareResourceList.value.splice(index, 1)
        ElMessage.success(`已从备课资源中移除"${resource.title}"`)
      }
    })
    .catch(() => {})
}

// ==================== 校本试卷相关 ====================

// 校本试卷 - 左侧分类
const schoolPaperCategory = ref('all')
const showAddSchoolPaperDialog = ref(false)
const addSchoolPaperCategoryForm = ref({
  name: ''
})
const showRenameSchoolPaperDialog = ref(false)
const renameSchoolPaperCategoryForm = ref({
  id: '',
  name: ''
})
const schoolPaperCategoryList = ref([]) // 自定义分组列表

// 校本试卷 - 重命名作业
const showRenameSchoolPaperWorkDialog = ref(false)
const renameSchoolPaperWorkForm = ref({
  id: null,
  name: ''
})

// 校本试卷 - 筛选条件
const schoolPaperDateRange = ref([])
const schoolPaperSearchKeyword = ref('')
const schoolPaperResourceType = ref('all')

// 校本试卷 - 资源类型
const schoolPaperResourceTypes = ref([
  { label: '全部', value: 'all' },
  { label: '自传试卷', value: 'uploaded' },
  { label: '试题组卷', value: 'composed' }
])

// 校本试卷 - 表格数据
const schoolPaperList = ref([
  {
    id: 1,
    name: '2025年全国初中语文试卷',
    type: '试题组卷',
    creator: '张老师',
    createTime: '2025-10-30 16:32:55'
  },
  {
    id: 2,
    name: '初中语文期末考试',
    type: '自传试卷',
    creator: '李老师',
    createTime: '2025-10-28 14:20:30'
  },
  {
    id: 3,
    name: '中考模拟卷一',
    type: '试题组卷',
    creator: '王老师',
    createTime: '2025-10-25 10:15:22'
  }
])

// 校本试卷 - 分页
const schoolPaperCurrentPage = ref(1)
const schoolPaperPageSize = ref(10)
const schoolPaperTotal = ref(3)

// 校本试卷 - 添加分组
const handleConfirmAddSchoolPaperCategory = () => {
  if (!addSchoolPaperCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const newCategory = {
    id: Date.now(),
    name: addSchoolPaperCategoryForm.value.name
  }

  schoolPaperCategoryList.value.push(newCategory)
  ElMessage.success('分组创建成功')
  showAddSchoolPaperDialog.value = false
  addSchoolPaperCategoryForm.value.name = ''
}

// 校本试卷 - 重命名分类
const handleRenameSchoolPaperCategory = (category) => {
  renameSchoolPaperCategoryForm.value.id = category.id
  renameSchoolPaperCategoryForm.value.name = category.name
  showRenameSchoolPaperDialog.value = true
}

// 校本试卷 - 确认重命名分类
const handleConfirmRenameSchoolPaperCategory = () => {
  if (!renameSchoolPaperCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const category = schoolPaperCategoryList.value.find(
    cat => cat.id === renameSchoolPaperCategoryForm.value.id
  )
  if (category) {
    category.name = renameSchoolPaperCategoryForm.value.name
    ElMessage.success('重命名成功')
  }
  showRenameSchoolPaperDialog.value = false
  renameSchoolPaperCategoryForm.value.id = ''
  renameSchoolPaperCategoryForm.value.name = ''
}

// 校本试卷 - 删除分类
const handleDeleteSchoolPaperCategory = (categoryId) => {
  ElMessageBox.confirm(
    '确定要删除该分类吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const index = schoolPaperCategoryList.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        schoolPaperCategoryList.value.splice(index, 1)
        ElMessage.success('删除成功')
        // 如果删除的是当前选中的分类，切换到"全部"
        if (schoolPaperCategory.value === categoryId) {
          schoolPaperCategory.value = 'all'
        }
      }
    })
    .catch(() => {})
}

// 校本试卷 - 重命名作业
const handleRenameSchoolPaperWork = (row) => {
  renameSchoolPaperWorkForm.value.id = row.id
  renameSchoolPaperWorkForm.value.name = row.name
  showRenameSchoolPaperWorkDialog.value = true
}

// 校本试卷 - 确认重命名作业
const handleConfirmRenameSchoolPaperWork = () => {
  if (!renameSchoolPaperWorkForm.value.name.trim()) {
    ElMessage.warning('请输入作业名称')
    return
  }

  const work = schoolPaperList.value.find(
    item => item.id === renameSchoolPaperWorkForm.value.id
  )
  if (work) {
    work.name = renameSchoolPaperWorkForm.value.name
    ElMessage.success('重命名成功')
  }
  showRenameSchoolPaperWorkDialog.value = false
  renameSchoolPaperWorkForm.value.id = null
  renameSchoolPaperWorkForm.value.name = ''
}

// 校本试卷 - 搜索
const handleSchoolPaperSearch = () => {
  ElMessage.info('搜索功能')
}

// 校本试卷 - 分页变化
const handleSchoolPaperPageChange = (page) => {
  schoolPaperCurrentPage.value = page
}

// ==================== 通用方法 ====================

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
  padding: 0;
}

/* 内容区 */
.tab-content-area {
  width: 100%;
  height: 100%;
}

/* 我的备考 - 左右两栏布局 */
.exam-prep-container {
  display: flex;
  gap: 16px;
  height: 100%;
  padding: 16px 20px;
}

/* 我的备课 - 左右两栏布局 */
.prepare-resource-container {
  display: flex;
  gap: 16px;
  height: 100%;
  padding: 16px 20px;
}

.prepare-resource-container .right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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
  overflow-y: auto;
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
  flex: 0 1 auto;
  overflow: visible;
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
  height: 52px;
  padding: 14px 0;
}

.table-container :deep(.el-table th.el-table__cell) {
  border-bottom: 1px solid #E4E7ED;
  border-left: none;
  border-right: none;
}

.table-container :deep(.el-table td) {
  color: #303133;
  font-size: 14px;
  height: 50px;
  padding: 13px 0;
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
  width: calc(100% - 40px);
  height: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
  background: #ffffff;
  border-radius: 8px;
  margin: 16px 20px;
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

.category-form :deep(.el-select) {
  width: 100%;
}

.category-form :deep(.el-select .el-select__wrapper) {
  min-height: 40px !important;
  padding: 9px 12px;
  box-shadow: 0 0 0 1px #E5E6EB inset;
  border-radius: 4px;
  transition: all 0.3s;
}

.category-form :deep(.el-select .el-input__wrapper) {
  padding: 9px 12px;
  box-shadow: 0 0 0 1px #E5E6EB inset;
  border-radius: 4px;
  transition: all 0.3s;
}

.category-form :deep(.el-select .el-select__wrapper:hover),
.category-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #C9CDD4 inset;
}

.category-form :deep(.el-select .el-select__wrapper.is-focused),
.category-form :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2262FB inset !important;
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

/* 我的备课 - 资源列表样式 */
.prepare-resource-container .category-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.prepare-resource-container .tab-item {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  position: relative;
  transition: color 0.3s;
}

.prepare-resource-container .tab-item:hover {
  color: #2262FB;
}

.prepare-resource-container .tab-item.active {
  color: #2262FB;
  font-weight: 600;
}

.prepare-resource-container .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #2262FB;
}

.prepare-resource-container .resource-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.prepare-resource-container .resource-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.3s;
}

.prepare-resource-container .resource-item:hover {
  border-color: #2262FB;
  box-shadow: 0 2px 12px rgba(34, 98, 251, 0.1);
}

.prepare-resource-container .resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  flex-shrink: 0;
  margin-right: 16px;
}

.prepare-resource-container .file-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  transition: transform 0.3s;
}

.prepare-resource-container .resource-item:hover .file-icon {
  transform: scale(1.1);
}

.prepare-resource-container .resource-info {
  flex: 1;
  min-width: 0;
}

.prepare-resource-container .resource-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prepare-resource-container .resource-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.prepare-resource-container .meta-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f2f5;
  color: #606266;
  border-radius: 3px;
  font-size: 12px;
}

.prepare-resource-container .meta-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.prepare-resource-container .meta-text .el-icon {
  font-size: 14px;
}

.prepare-resource-container .resource-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.prepare-resource-container .resource-actions .el-button {
  padding: 10px 16px;
  font-size: 14px;
}

.prepare-resource-container .resource-actions .el-button .el-icon {
  font-size: 16px;
}

.prepare-resource-container .resource-actions .el-button:nth-child(4):hover {
  color: #F56C6C;
  background: #FEF0F0;
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
  padding: 14px 24px 12px;
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

