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
  { value: 'gundong-2026', label: '滚动迁移(2026) / 中考版' },
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
  'chapter-1': [
    { id: 'r1-1', title: '2025晋文源语文中考模拟卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-22', downloads: 1, views: 6, size: '0.47MB' },
    { id: 'r1-2', title: '第一章教学课件', category: '课件', fileType: 'PPT', date: '2025-10-20', downloads: 3, views: 12, size: '2.1MB' },
    { id: 'r1-3', title: '第一章教案设计', category: '教案', fileType: 'DOC', date: '2025-10-18', downloads: 2, views: 8, size: '0.8MB' },
    { id: 'r1-4', title: '第一章知识点讲解视频', category: '音视频', fileType: 'MP4', date: '2025-10-16', downloads: 15, views: 45, size: '38MB' },
    { id: 'r1-5', title: '第一章学习资料合集', category: '综合', fileType: 'PDF', date: '2025-10-15', downloads: 8, views: 24, size: '1.5MB' }
  ],
  'chapter-2': [
    { id: 'r2-1', title: '第二章知识点总结', category: '综合', fileType: 'PDF', date: '2025-10-21', downloads: 5, views: 15, size: '1.2MB' },
    { id: 'r2-2', title: '第二章配套视频教程', category: '音视频', fileType: 'MP4', date: '2025-10-19', downloads: 8, views: 25, size: '45MB' },
    { id: 'r2-3', title: '第二章互动教学课件', category: '课件', fileType: 'PPT', date: '2025-10-17', downloads: 6, views: 18, size: '3.5MB' },
    { id: 'r2-4', title: '第二章教学设计方案', category: '教案', fileType: 'DOC', date: '2025-10-15', downloads: 4, views: 12, size: '0.9MB' }
  ],
  'chapter-3': [
    { id: 'r3-1', title: '第三章实践案例集', category: '教案', fileType: 'DOC', date: '2025-10-17', downloads: 4, views: 18, size: '1.5MB' },
    { id: 'r3-2', title: '第三章练习题', category: '模拟卷', fileType: 'PDF', date: '2025-10-15', downloads: 6, views: 20, size: '0.6MB' },
    { id: 'r3-3', title: '第三章精品课件', category: '课件', fileType: 'PPT', date: '2025-10-13', downloads: 7, views: 22, size: '4.2MB' },
    { id: 'r3-4', title: '第三章微课视频', category: '音视频', fileType: 'MP4', date: '2025-10-11', downloads: 12, views: 35, size: '28MB' }
  ],
  'chapter-4': [
    { id: 'r4-1', title: '第四章进阶知识课件', category: '课件', fileType: 'PPT', date: '2025-10-14', downloads: 3, views: 10, size: '3.2MB' },
    { id: 'r4-2', title: '第四章综合测试卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-12', downloads: 9, views: 27, size: '0.8MB' },
    { id: 'r4-3', title: '第四章教学参考资料', category: '综合', fileType: 'PDF', date: '2025-10-10', downloads: 5, views: 16, size: '2.1MB' },
    { id: 'r4-4', title: '第四章详解视频', category: '音视频', fileType: 'MP4', date: '2025-10-08', downloads: 11, views: 32, size: '42MB' }
  ],
  'chapter-5': [
    { id: 'r5-1', title: '第五章综合练习卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-12', downloads: 7, views: 22, size: '0.9MB' },
    { id: 'r5-2', title: '第五章多媒体课件', category: '课件', fileType: 'PPT', date: '2025-10-10', downloads: 5, views: 17, size: '5.6MB' },
    { id: 'r5-3', title: '第五章教学实施方案', category: '教案', fileType: 'DOC', date: '2025-10-08', downloads: 3, views: 11, size: '1.1MB' },
    { id: 'r5-4', title: '第五章名师讲堂', category: '音视频', fileType: 'MP4', date: '2025-10-06', downloads: 14, views: 40, size: '56MB' }
  ],
  'chapter-6': [
    { id: 'r6-1', title: '第六章专题研究报告', category: '综合', fileType: 'PDF', date: '2025-10-10', downloads: 2, views: 9, size: '2.3MB' },
    { id: 'r6-2', title: '第六章专项训练题', category: '模拟卷', fileType: 'PDF', date: '2025-10-08', downloads: 8, views: 24, size: '0.7MB' },
    { id: 'r6-3', title: '第六章精讲课件', category: '课件', fileType: 'PPT', date: '2025-10-06', downloads: 6, views: 19, size: '3.8MB' }
  ],
  'chapter-7': [
    { id: 'r7-1', title: '第七章拓展阅读材料', category: '综合', fileType: 'PDF', date: '2025-10-08', downloads: 3, views: 11, size: '1.8MB' },
    { id: 'r7-2', title: '第七章互动课件', category: '课件', fileType: 'PPT', date: '2025-10-06', downloads: 4, views: 14, size: '4.5MB' },
    { id: 'r7-3', title: '第七章教学指导', category: '教案', fileType: 'DOC', date: '2025-10-04', downloads: 2, views: 8, size: '1.2MB' },
    { id: 'r7-4', title: '第七章讲解视频', category: '音视频', fileType: 'MP4', date: '2025-10-02', downloads: 10, views: 28, size: '35MB' }
  ],
  'chapter-8': [
    { id: 'r8-1', title: '第八章难点突破视频', category: '音视频', fileType: 'MP4', date: '2025-10-06', downloads: 10, views: 30, size: '52MB' },
    { id: 'r8-2', title: '第八章强化训练卷', category: '模拟卷', fileType: 'PDF', date: '2025-10-04', downloads: 7, views: 21, size: '0.9MB' },
    { id: 'r8-3', title: '第八章重点课件', category: '课件', fileType: 'PPT', date: '2025-10-02', downloads: 5, views: 16, size: '4.8MB' },
    { id: 'r8-4', title: '第八章教学方案', category: '教案', fileType: 'DOC', date: '2025-09-30', downloads: 3, views: 10, size: '1.3MB' }
  ],
  'chapter-9': [
    { id: 'r9-1', title: '第九章实战演练题库', category: '模拟卷', fileType: 'PDF', date: '2025-10-04', downloads: 9, views: 28, size: '1.1MB' },
    { id: 'r9-2', title: '第九章实战课件', category: '课件', fileType: 'PPT', date: '2025-10-02', downloads: 6, views: 19, size: '5.2MB' },
    { id: 'r9-3', title: '第九章实操视频', category: '音视频', fileType: 'MP4', date: '2025-09-30', downloads: 13, views: 38, size: '48MB' },
    { id: 'r9-4', title: '第九章教学设计', category: '教案', fileType: 'DOC', date: '2025-09-28', downloads: 4, views: 13, size: '1.0MB' }
  ],
  'chapter-10': [
    { id: 'r10-1', title: '第十章总复习课件', category: '课件', fileType: 'PPT', date: '2025-10-02', downloads: 5, views: 16, size: '2.8MB' },
    { id: 'r10-2', title: '第十章综合复习卷', category: '模拟卷', fileType: 'PDF', date: '2025-09-30', downloads: 11, views: 33, size: '1.4MB' },
    { id: 'r10-3', title: '第十章系统复习视频', category: '音视频', fileType: 'MP4', date: '2025-09-28', downloads: 16, views: 48, size: '62MB' },
    { id: 'r10-4', title: '第十章总结资料', category: '综合', fileType: 'PDF', date: '2025-09-26', downloads: 7, views: 22, size: '2.5MB' }
  ]
}

// 教辅目录树
const catalogTree = ref([
  { id: 'chapter-1', label: '第一章', contentId: 'chapter-1' },
  { id: 'chapter-2', label: '第二章', contentId: 'chapter-2' },
  { id: 'chapter-3', label: '第三章', contentId: 'chapter-3' },
  { id: 'chapter-4', label: '第四章', contentId: 'chapter-4' },
  { id: 'chapter-5', label: '第五章', contentId: 'chapter-5' },
  { id: 'chapter-6', label: '第六章', contentId: 'chapter-6' },
  { id: 'chapter-7', label: '第七章', contentId: 'chapter-7' },
  { id: 'chapter-8', label: '第八章', contentId: 'chapter-8' },
  { id: 'chapter-9', label: '第九章', contentId: 'chapter-9' },
  { id: 'chapter-10', label: '第十章', contentId: 'chapter-10' }
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
  
  // 切换章节时重置分类标签到"全部资源"
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

