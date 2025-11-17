<template>
  <div class="prepare-resource">
    <!-- 内容区域：左侧边栏 + 右侧内容 -->
    <div class="content-wrapper">
      <!-- 左侧教辅目录 -->
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-select 
            v-model="selectedTextbook" 
            class="textbook-selector"
            size="large"
            @change="handleTextbookChange"
          >
            <el-option
              v-for="item in textbookList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="sidebar-content">
          <div class="catalog-tree">
            <div 
              v-for="item in catalogTree" 
              :key="item.id"
              class="catalog-item"
            >
              <!-- 一级节点 -->
              <div 
                class="catalog-node level-1"
                :class="{ active: selectedCatalogId === item.id }"
                @click="toggleNode(item)"
              >
                <span class="expand-icon-wrapper">
                <el-icon v-if="item.children" class="expand-icon" :class="{ expanded: item.expanded }">
                    <CaretRight />
                </el-icon>
                </span>
                <span class="node-label">{{ item.label }}</span>
              </div>
              
              <!-- 二级节点 -->
              <div v-if="item.expanded && item.children" class="catalog-children level-2-wrapper">
                <div 
                  v-for="child in item.children" 
                  :key="child.id"
                  class="catalog-item"
                >
                  <div 
                    class="catalog-node level-2"
                    :class="{ active: selectedCatalogId === child.id }"
                    @click="toggleNode(child)"
                  >
                    <span class="expand-icon-wrapper">
                      <el-icon v-if="child.children" class="expand-icon" :class="{ expanded: child.expanded }">
                        <CaretRight />
                      </el-icon>
                    </span>
                    <span class="node-label">{{ child.label }}</span>
                </div>
                  
                  <!-- 三级节点 -->
                  <div v-if="child.expanded && child.children" class="catalog-children level-3-wrapper">
                    <div 
                      v-for="subChild in child.children" 
                      :key="subChild.id"
                      class="catalog-node level-3"
                      :class="{ active: selectedCatalogId === subChild.id }"
                      @click="selectCatalog(subChild)"
                    >
                      <span class="expand-icon-wrapper"></span>
                      <span class="node-label">{{ subChild.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
        </div>
      </div>

       <!-- 右侧内容区 -->
       <div class="right-content">
         <!-- 顶部分类标签 -->
         <div class="category-tabs">
           <div 
             v-for="(tab, index) in categoryTabs" 
             :key="index"
             class="tab-item"
             :class="{ active: currentTab === index }"
             @click="currentTab = index"
           >
             {{ tab }}
           </div>
         </div>

         <!-- 资源列表 -->
         <div class="resource-list">
           <div 
             v-for="resource in filteredResources" 
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
               <el-button text @click="handleCollectResource(resource)">
                 <el-icon><Star /></el-icon>
                 <span>收藏</span>
               </el-button>
             </div>
           </div>
         </div>
       </div>
    </div>

  <!-- 大屏演示 -->
  <ScreenPresentation
    :visible="screenDialogVisible"
    :question="currentScreenQuestion"
    :questions="filteredResources"
    :current-index="currentScreenIndex"
    @close="closeScreenPresentation"
    @change-question="changeScreenQuestion"
  />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CaretRight, Star, Download, View, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ScreenPresentation from './ScreenPresentation.vue'

// 教材版本列表
const textbookList = ref([
  { value: 'gundong-2026', label: '中考资源/2026' },
  { value: 'jinwenyuan-2025', label: '晋文源(2025) / 七年级上册' },
  { value: 'xinbiaozhun-2024', label: '新课标(2024) / 必修一' }
])

// 当前选中的教材版本
const selectedTextbook = ref('gundong-2026')

// 分类标签
const categoryTabs = ref(['全部资源', '课件', '教案', '音视频', '模拟卷'])
const currentTab = ref(0)

// 资源库（按章节存储）
const resourceLibrary = {
  'gundong': [
    { id: 'gd-1', title: '2026滚动迁移 英语 主题词汇', category: '模拟卷', fileType: 'PDF', date: '2025-10-22', downloads: 15, views: 45, size: '1.2MB' },
    { id: 'gd-2', title: '2026滚动迁移 英语 语法专项', category: '课件', fileType: 'PPT', date: '2025-10-20', downloads: 12, views: 38, size: '3.5MB' },
    { id: 'gd-3', title: '2026滚动迁移 英语 主题复习', category: '教案', fileType: 'DOC', date: '2025-10-18', downloads: 8, views: 25, size: '1.8MB' },
    { id: 'gd-4', title: '滚动迁移答题技巧视频', category: '音视频', fileType: 'MP4', date: '2025-10-16', downloads: 25, views: 78, size: '125MB' },
    { id: 'gd-5', title: '滚动迁移题型分析', category: '模拟卷', fileType: 'PDF', date: '2025-10-15', downloads: 18, views: 52, size: '2.3MB' }
  ],
  'lingpao': [
    { id: 'lp-1', title: '2026领跑卷 英语 第一卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-21', downloads: 22, views: 65, size: '1.5MB' },
    { id: 'lp-2', title: '2026领跑卷 英语 第二卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-19', downloads: 20, views: 58, size: '1.6MB' },
    { id: 'lp-3', title: '领跑卷解析课件', category: '课件', fileType: 'PPT', date: '2025-10-17', downloads: 15, views: 42, size: '4.2MB' },
    { id: 'lp-4', title: '领跑卷精讲视频', category: '音视频', fileType: 'MP4', date: '2025-10-15', downloads: 28, views: 85, size: '156MB' }
  ],
  'haoti': [
    { id: 'ht-1', title: '好题开练 阅读理解专项', category: '模拟卷', fileType: 'PDF', date: '2025-10-20', downloads: 18, views: 54, size: '1.1MB' },
    { id: 'ht-2', title: '好题开练 完形填空专项', category: '模拟卷', fileType: 'PDF', date: '2025-10-18', downloads: 16, views: 48, size: '0.9MB' },
    { id: 'ht-3', title: '好题开练 书面表达专项', category: '模拟卷', fileType: 'PDF', date: '2025-10-16', downloads: 14, views: 42, size: '0.8MB' },
    { id: 'ht-4', title: '好题开练讲解课件', category: '课件', fileType: 'PPT', date: '2025-10-14', downloads: 12, views: 35, size: '3.8MB' },
    { id: 'ht-5', title: '好题开练答题技巧', category: '音视频', fileType: 'MP4', date: '2025-10-12', downloads: 22, views: 68, size: '98MB' }
  ],
  'fangxiang': [
    { id: 'fx-1', title: '2026方向卷 英语 第一卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-19', downloads: 20, views: 60, size: '1.4MB' },
    { id: 'fx-2', title: '2026方向卷 英语 第二卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-17', downloads: 18, views: 55, size: '1.3MB' },
    { id: 'fx-3', title: '方向卷考点分析', category: '教案', fileType: 'DOC', date: '2025-10-15', downloads: 10, views: 32, size: '1.5MB' },
    { id: 'fx-4', title: '方向卷详解视频', category: '音视频', fileType: 'MP4', date: '2025-10-13', downloads: 24, views: 72, size: '145MB' }
  ],
  'chongci660': [
    { id: 'cc-1', title: '660冲刺卷 英语 第一卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-18', downloads: 25, views: 75, size: '1.6MB' },
    { id: 'cc-2', title: '660冲刺卷 英语 第二卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-16', downloads: 23, views: 70, size: '1.7MB' },
    { id: 'cc-3', title: '660冲刺卷 英语 第三卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-14', downloads: 21, views: 65, size: '1.5MB' },
    { id: 'cc-4', title: '660冲刺卷精讲课件', category: '课件', fileType: 'PPT', date: '2025-10-12', downloads: 18, views: 52, size: '5.2MB' },
    { id: 'cc-5', title: '660冲刺卷答题视频', category: '音视频', fileType: 'MP4', date: '2025-10-10', downloads: 30, views: 95, size: '178MB' }
  ],
  'baixiao': [
    { id: 'bx-1', title: '2026百校联考 英语 第一卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-17', downloads: 28, views: 82, size: '1.8MB' },
    { id: 'bx-2', title: '2026百校联考 英语 第二卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-15', downloads: 26, views: 78, size: '1.9MB' },
    { id: 'bx-3', title: '百校联考题型分析', category: '教案', fileType: 'DOC', date: '2025-10-13', downloads: 15, views: 45, size: '2.1MB' },
    { id: 'bx-4', title: '百校联考课件', category: '课件', fileType: 'PPT', date: '2025-10-11', downloads: 20, views: 58, size: '4.8MB' },
    { id: 'bx-5', title: '百校联考讲解视频', category: '音视频', fileType: 'MP4', date: '2025-10-09', downloads: 32, views: 98, size: '165MB' }
  ]
}

// 教辅目录树
const catalogTree = ref([
  { id: 'gundong', label: '滚动迁移', contentId: 'gundong' },
  { id: 'lingpao', label: '领跑卷', contentId: 'lingpao' },
  { id: 'haoti', label: '好题开练', contentId: 'haoti' },
  { id: 'fangxiang', label: '方向卷', contentId: 'fangxiang' },
  { id: 'chongci660', label: '660冲刺卷', contentId: 'chongci660' },
  { id: 'baixiao', label: '百校联考', contentId: 'baixiao' }
])

// 当前显示的资源列表
const currentResources = ref([])

// 当前选中的目录ID
const selectedCatalogId = ref(null)

// 根据当前选中的分类标签筛选资源
const filteredResources = computed(() => {
  if (currentTab.value === 0) {
    // 全部资源 - 显示所有资源
    return currentResources.value
  }
  
  const categoryName = categoryTabs.value[currentTab.value]
  return currentResources.value.filter(resource => resource.category === categoryName)
})

// 根据文件类型获取对应的图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'PDF': new URL('@/assets/icron/文件类型-pdf.svg', import.meta.url).href,
    'PPT': new URL('@/assets/icron/文件类型-ppt.svg', import.meta.url).href,
    'DOC': new URL('@/assets/icron/文件类型-文档.svg', import.meta.url).href,
    'MP4': new URL('@/assets/icron/文件类型-视频.svg', import.meta.url).href,
    'EXCEL': new URL('@/assets/icron/文件类型-excel.svg', import.meta.url).href,
    'ZIP': new URL('@/assets/icron/文件类型-压缩包.svg', import.meta.url).href,
    'IMAGE': new URL('@/assets/icron/文件类型-图片.svg', import.meta.url).href,
    'AUDIO': new URL('@/assets/icron/文件类型-音频.svg', import.meta.url).href
  }
  return iconMap[fileType] || new URL('@/assets/icron/文件类型-附件.svg', import.meta.url).href
}

// 切换节点展开/收起（当前是一级节点，直接选中）
const toggleNode = (node) => {
  // 直接选中节点，加载对应资源
  selectCatalog(node)
}

// 选择目录节点
const selectCatalog = (node) => {
  selectedCatalogId.value = node.id
  
  const resources = resourceLibrary[node.contentId]
  if (resources) {
    currentResources.value = resources
  } else {
    currentResources.value = []
    ElMessage.info('该章节暂无资源')
  }
  
  // 切换章节时重置分类标签到“全部资源”
  currentTab.value = 0
}

// 下载资源
const handleDownloadResource = (resource) => {
  ElMessage.success(`正在下载：${resource.title}`)
}

// 预览资源
const handlePreviewResource = (resource) => {
  ElMessage.info(`正在预览：${resource.title}`)
}

// 收藏资源
const handleCollectResource = (resource) => {
  ElMessage.success(`已收藏：${resource.title}`)
}

// 切换教材版本
const handleTextbookChange = (value) => {
  ElMessage.info(`已切换到：${textbookList.value.find(item => item.value === value)?.label}`)
  // 清空当前选中的目录和资源
  selectedCatalogId.value = null
  currentResources.value = []
  currentTab.value = 0
}

// 初始化：默认选择第一个章节
if (catalogTree.value.length > 0) {
  const firstNode = catalogTree.value[0]
  selectCatalog(firstNode)
}

// 大屏演示相关（保留以便兼容）
const screenDialogVisible = ref(false)
const currentScreenQuestion = ref(null)
const currentScreenIndex = ref(0)

const closeScreenPresentation = () => {
  screenDialogVisible.value = false
}

const changeScreenQuestion = (index) => {
  // 预留方法
}
</script>

<style scoped>
.prepare-resource {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: transparent;
}

/* 内容区域布局 */
.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 左侧教辅目录样式 */
.left-sidebar {
  width: 320px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.sidebar-header {
  text-align: center;
  padding-bottom: 16px;
}

/* 教材版本选择器 */
.textbook-selector {
  width: 100%;
}

.textbook-selector :deep(.el-input) {
  height: 48px;
}

.textbook-selector :deep(.el-input__wrapper) {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: none;
  transition: all 0.3s;
  min-height: 48px !important;
  height: 48px;
  padding: 8px 12px;
}

.textbook-selector :deep(.el-input__wrapper:hover) {
  border-color: #2262FB;
}

.textbook-selector :deep(.el-input__wrapper.is-focus) {
  border-color: #2262FB;
  box-shadow: 0 0 0 3px rgba(34, 98, 251, 0.1);
}

.textbook-selector :deep(.el-input__inner) {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: center;
  line-height: 32px;
  height: 32px;
}

.sidebar-content {
  margin-top: 8px;
}

.catalog-tree {
  display: flex;
  flex-direction: column;
}

.catalog-item {
  margin-bottom: 0;
}

.catalog-node {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  user-select: none;
}

.catalog-node:hover {
  background: #f5f7fa;
}

.catalog-node.active {
  background: #ecf5ff;
  color: #2262FB;
}

.catalog-node .expand-icon-wrapper {
  width: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.expand-icon {
  font-size: 14px;
  color: #909399;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.catalog-node.active .node-label {
  color: #2262FB;
  font-weight: 500;
}

.level-1 {
  font-size: 14px;
  font-weight: 500;
}

.level-2 {
  padding-left: 24px;
  font-size: 13px;
}

.level-3 {
  padding-left: 36px;
  font-size: 13px;
  color: #606266;
}

/* 子节点容器 */
.catalog-children {
  margin: 0;
}

/* 右侧内容区样式 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 0;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.tab-item {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  position: relative;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #2262FB;
}

.tab-item.active {
  color: #2262FB;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #2262FB;
}

/* 资源列表 */
.resource-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.3s;
}

.resource-item:hover {
  border-color: #2262FB;
  box-shadow: 0 2px 12px rgba(34, 98, 251, 0.1);
}

/* 左侧图标 */
.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  flex-shrink: 0;
  margin-right: 16px;
}

.file-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  transition: transform 0.3s;
}

.resource-item:hover .file-icon {
  transform: scale(1.1);
}

/* 中间信息区 */
.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.meta-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f2f5;
  color: #606266;
  border-radius: 3px;
  font-size: 12px;
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-text .el-icon {
  font-size: 14px;
}

/* 右侧操作按钮 */
.resource-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.resource-actions .el-button {
  padding: 10px 16px;
  font-size: 14px;
}

.resource-actions .el-button .el-icon {
  font-size: 16px;
}

</style>

