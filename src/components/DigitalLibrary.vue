<template>
  <div class="platform-sharing" :class="{ 'question-mode': showQuestionList }">
    <!-- 图书列表视图 -->
    <div v-if="!showQuestionList" class="book-list-view">
      <!-- 顶部筛选工具栏 -->
      <div class="selection-top">
      <el-select v-model="revisionStatus" placeholder="请选择" size="default" style="width: 140px;">
        <el-option label="正在修订" value="editing" />
        <el-option label="修订完成" value="completed" />
      </el-select>
      
      <el-date-picker
        v-model="selectedYear"
        type="year"
        placeholder="选择默认年份"
        size="default"
        style="width: 160px;"
      />
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索教辅名称"
        :prefix-icon="Search"
        size="default"
        style="width: 240px;"
      />
    </div>

    <!-- 分类导航 -->
    <div class="selection-nav">
      <ul class="nav-list">
        <li 
          v-for="(item, index) in categoryTabs" 
          :key="index"
          :class="{ active: currentTab === index }"
          @click="currentTab = index"
        >
          {{ item }}
        </li>
      </ul>
      <div class="view-toggle">
        <el-icon 
          :class="['view-icon', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
        >
          <Menu />
        </el-icon>
        <el-icon 
          :class="['view-icon', { active: viewMode === 'grid' }]"
          @click="viewMode = 'grid'"
        >
          <Grid />
        </el-icon>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <el-table :data="filteredResources" border stripe>
        <el-table-column prop="name" label="资源名称" width="400" />
        <el-table-column prop="stage" label="学段/学科" width="120" align="center" />
        <el-table-column prop="version" label="版本/册别" width="120" align="center" />
      </el-table>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="grid-view">
      <div class="resource-grid">
        <div 
          v-for="item in filteredResources" 
          :key="item.id"
          class="card-wrapper"
          @click="handleBookClick(item)"
        >
          <div class="resource-card">
            <div class="card-cover">
              <el-image :src="item.cover" fit="contain" lazy>
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <div class="card-title">{{ item.name }}</div>
        </div>
      </div>
    </div>
    </div>

    <!-- 题目列表视图 -->
    <div v-else class="question-view">
      <!-- 左侧边栏 + 右侧内容 -->
      <div class="question-content-wrapper">
        <!-- 左侧筛选栏 -->
        <div class="left-sidebar">
          <div class="sidebar-header">
            <el-icon class="back-btn" @click="showQuestionList = false" title="返回图书列表">
              <ArrowLeft />
            </el-icon>
            <span class="catalog-title">— 教辅目录 —</span>
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
                  <div class="catalog-more" @click.stop>
                    <el-dropdown trigger="click">
                      <el-icon class="more-icon">
                        <MoreFilled />
                      </el-icon>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="handleCollectCatalog(item)">
                            <el-icon><Star /></el-icon>
                            <span>收藏本节</span>
                          </el-dropdown-item>
                          <el-dropdown-item @click="handleEditCatalog(item)">
                            <el-icon><Download /></el-icon>
                            <span>下载本节</span>
                          </el-dropdown-item>
                          
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
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
                      <div class="catalog-more" @click.stop>
                        <el-dropdown trigger="click">
                          <el-icon class="more-icon">
                            <MoreFilled />
                          </el-icon>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item @click="handleCollectCatalog(child)">
                                <el-icon><Star /></el-icon>
                                <span>收藏本节</span>
                              </el-dropdown-item>
                              <el-dropdown-item @click="handleEditCatalog(child)">
                                <el-icon><Download /></el-icon>
                                <span>下载本节</span>
                              </el-dropdown-item>
                              
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
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
                        <div class="catalog-more" @click.stop>
                          <el-dropdown trigger="click">
                            <el-icon class="more-icon">
                              <MoreFilled />
                            </el-icon>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item @click="handleCollectCatalog(subChild)">
                                  <el-icon><Star /></el-icon>
                                  <span>收藏本节</span>
                                </el-dropdown-item>
                                <el-dropdown-item @click="handleEditCatalog(subChild)">
                                  <el-icon><Download /></el-icon>
                                  <span>下载本节</span>
                                </el-dropdown-item>
                                
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </div>
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
      <!-- Tab 切换区 - 只要选中了目录就显示 -->
      <div v-if="currentCatalogName" class="content-tabs">
        <div class="tab-list">
          <div 
            v-for="(tab, index) in contentTabs" 
            :key="index"
            :class="['tab-item', { active: contentTab === index }]"
            @click="contentTab = index"
          >
            <el-icon class="tab-icon">
              <Reading v-if="index === 0" />
              <FolderOpened v-else />
            </el-icon>
            <span>{{ tab }}</span>
          </div>
          
          <!-- 试题&知识 Tab 的操作按钮 -->
          <div v-if="contentTab === 0" class="tab-actions">
            <el-button class="btn-collect" @click="handleCollectCurrentSection">
              <el-icon><Star /></el-icon>
              <span>收藏本节</span>
            </el-button>
            <el-button class="btn-download" @click="handleDownloadCurrentSection">
              <el-icon><Download /></el-icon>
              <span>下载本节</span>
            </el-button>
            <el-button class="btn-add-all" @click="handleAddAllToExam">
              <el-icon><Plus /></el-icon>
              <span>一键加入备考篮</span>
            </el-button>
          </div>
          
          <!-- 配套资源 Tab 的操作按钮 -->
          <div v-else-if="contentTab === 1" class="tab-actions">
            <el-button class="btn-batch-download" @click="handleBatchDownloadResources">
              <el-icon><Download /></el-icon>
              <span>批量下载</span>
            </el-button>
            <el-button class="btn-batch-collect" @click="handleBatchCollectResources">
              <el-icon><Star /></el-icon>
              <span>批量收藏</span>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 初始状态提示 - 未选择任何目录 -->
      <div v-if="!currentCatalogName" class="empty-state">
        <el-icon class="empty-icon"><Reading /></el-icon>
        <div class="empty-text">请从左侧教辅目录中选择章节，开始学习</div>
      </div>

      <!-- 题目列表 - 试题&知识 tab -->
      <div v-if="contentTab === 0 && currentCatalogName" class="question-list">
        <!-- 有内容时显示题目列表 -->
        <template v-if="questionList.length > 0">
        <div 
          v-for="(question, index) in questionList" 
          :key="question.id"
          class="question-item"
        >
          <div class="question-header">
            <div class="question-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="question-text" v-html="question.content"></div>
            <button class="btn-screen" title="大屏演示" @click="handleScreenShow(question)">
              <el-icon><Monitor /></el-icon>
              <span>大屏演示</span>
            </button>
          </div>
          
          <!-- 详细讲解区域 -->
          <div v-if="question.showAnalysis" class="analysis-section">
            <div class="analysis-block" v-if="question.answer">
              <div class="analysis-title">【答案】</div>
              <div class="analysis-content" v-html="question.answer"></div>
            </div>
            <div class="analysis-block" v-if="question.analysis">
              <div class="analysis-title">【解析】</div>
              <div class="analysis-content" v-html="question.analysis"></div>
            </div>
            <div class="analysis-block" v-if="!question.answer && !question.analysis">
              <div class="analysis-content" style="color: #909399; text-align: center; padding: 20px 0;">暂无答案与解析</div>
            </div>
          </div>

          <div class="question-footer">
            <div class="question-meta">
              <span class="meta-item">类型：{{ question.type }}</span>
            </div>
            <div class="question-actions">
              <button class="btn-analysis" @click="toggleAnalysis(question)">
                <el-icon><View /></el-icon>
                <span>{{ question.showAnalysis ? '收起详解' : '展开详解' }}</span>
              </button>
              <button class="btn-add" @click="addQuestionToBasket(question)">
                <el-icon><Plus /></el-icon>
                <span>加入备考</span>
              </button>
            </div>
          </div>
        </div>
        </template>
        
        <!-- 无内容时显示空状态 -->
        <div v-else class="empty-state-inline">
          <el-icon class="empty-icon-small"><FolderOpened /></el-icon>
          <div class="empty-text-small">该章节暂无对应试题与知识</div>
        </div>
      </div>

      <!-- 配套资源 tab -->
      <div v-else-if="contentTab === 1 && currentCatalogName" class="resources-content">
        <!-- 有资源时显示列表 -->
        <div v-if="resourceList.length > 0" class="resource-list">
          <div 
            v-for="(resource, index) in resourceList" 
            :key="index"
            class="resource-item"
          >
            <!-- 左侧图标 -->
            <div class="resource-icon">
              <img :src="getFileIcon(resource.fileType)" class="file-icon" :alt="resource.type">
            </div>
            
            <!-- 中间信息 -->
            <div class="resource-info">
              <div class="resource-title">{{ resource.name }}</div>
              <div class="resource-meta">
                <span class="meta-tag">{{ resource.type }}</span>
                <span class="meta-text">
                  <el-icon><Files /></el-icon>
                  {{ resource.size }}
                </span>
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
        <!-- 无资源时显示空状态 -->
        <div v-else class="resources-empty">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <div class="empty-text">该章节暂无配套资源</div>
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 大屏展示 -->
  <ScreenPresentation
    :visible="screenDialogVisible"
    :question="currentScreenQuestion"
    :questions="questionList"
    :current-index="currentScreenIndex"
    @close="closeScreenPresentation"
    @change-question="changeScreenQuestion"
  />

</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Menu, Grid, Picture, ArrowLeft, Monitor, View, Plus, CaretRight, Star, Edit, Download, DocumentChecked, Delete, MoreFilled, FolderOpened, Reading, Document, Files } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockResources } from '../mock/data'
import { useExamBasket } from '../store/examBasket'
import ScreenPresentation from './ScreenPresentation.vue'

// 定义 emits
const emit = defineEmits(['goto-paper-center'])

// 使用备考篮
const { addToBasket, saveToMyExamPrep } = useExamBasket()

// 内容区 Tab 切换
const contentTab = ref(0) // 0: 试题&知识, 1: 配套资源
const contentTabs = ['试题&知识', '配套资源']

// 图书列表相关
const revisionStatus = ref('completed')
const selectedYear = ref('')
const searchKeyword = ref('')
const currentTab = ref(0)
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)

const categoryTabs = ['滚动迁移', '领跑卷', '好题开练', '方向卷', '660冲刺卷', '百校联考']

const filteredResources = computed(() => {
  let result = mockResources
  
  if (searchKeyword.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const totalCount = computed(() => mockResources.length)

// 题目列表相关
const showQuestionList = ref(false)
const currentBook = ref(null)

// 教辅目录树形数据（添加contentId关联内容）
const catalogTree = ref([
  {
    id: 1,
    label: '课标文言文',
    expanded: false,
    children: [
      {
        id: 11,
        label: '课标文言文阅读',
        expanded: false,
        contentId: 'unit-overview', // 单元知识梳理
        children: [
          { id: 111, label: '第1篇《论语》十二章（七上）', contentId: 'lunyu' },
          { id: 112, label: '第2篇《诫子书》（七下）', contentId: 'jiezishu' },
          { id: 113, label: '第3篇《爱莲说》（七下）', contentId: 'ailiansuo' }
        ]
      },
      {
        id: 12,
        label: '课标文言文对比探究',
    expanded: false,
        contentId: 'comparison'
      }
    ]
  },
  {
    id: 2,
    label: '课标古诗词',
    expanded: false,
    contentId: 'poetry'
  },
  {
    id: 3,
    label: '课外文言文',
    expanded: false,
    contentId: 'extra-classical'
  },
  {
    id: 4,
    label: '语言文字积累与梳理',
    expanded: false,
    contentId: 'language'
  },
  {
    id: 5,
    label: '整本书阅读',
    expanded: false,
    contentId: 'whole-book'
  },
  {
    id: 6,
    label: '现代文读写',
    expanded: false,
    contentId: 'modern-writing'
  },
  {
    id: 7,
    label: '写作',
    expanded: false,
    contentId: 'writing'
  }
])

// 当前选中的目录节点
const selectedCatalogId = ref(null)
// 当前选中的目录名称
const currentCatalogName = ref('')

// 配套资源列表
const resourceList = ref([])

// 递归收集节点及其所有子节点的contentId
const collectContentIds = (node) => {
  const contentIds = []
  
  // 如果当前节点有contentId，添加到列表
  if (node.contentId) {
    contentIds.push(node.contentId)
  }
  
  // 递归收集子节点的contentId
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      contentIds.push(...collectContentIds(child))
    })
  }
  
  return contentIds
}

// 切换节点展开/收起
const toggleNode = (node) => {
  if (node.children) {
    node.expanded = !node.expanded
    // 如果节点有子节点，也可以点击加载内容
    if (node.contentId || node.children.length > 0) {
      selectCatalog(node)
    }
  } else if (node.contentId) {
    // 如果是叶子节点且有内容，则选中
    selectCatalog(node)
  }
}

// 选择目录项
const selectCatalog = (node) => {
  selectedCatalogId.value = node.id
  currentCatalogName.value = node.label
  
  // 重置 Tab 到第一个（试题&知识）
  contentTab.value = 0
  
  // 只加载当前节点自己的内容，不包括子节点
  if (node.contentId) {
    // 根据当前节点的contentId加载内容
    loadContentByIds([node.contentId])
    const level = node.children ? (node.children[0]?.children ? '一级' : '二级') : '三级'
    console.log(`选择${level}目录:`, node.label, `共加载 ${questionList.value.length} 个知识点`)
    
    // 加载配套资源（模拟数据）
    loadResourcesByContentId(node.contentId)
  } else {
    questionList.value = []
    resourceList.value = []
    ElMessage.info('该节点暂无内容')
  }
}

// 收藏目录节点（直接保存到我的备考）
const handleCollectCatalog = (node) => {
  // 先选中该节点并加载内容
  selectCatalog(node)
  // 等待内容加载完成后执行收藏
  setTimeout(() => {
    if (questionList.value.length === 0) {
      ElMessage.warning('该节点暂无内容可收藏')
      return
    }
    
    // 直接保存为作业，不经过备考篮
    saveToMyExamPrep(node.label, questionList.value, '初中', '英语')
  }, 100)
}

// 编辑目录节点
const handleEditCatalog = (node) => {
  // 先选中该节点并加载内容
  selectCatalog(node)
  // 等待内容加载完成后跳转到组卷中心
  setTimeout(() => {
    if (questionList.value.length === 0) {
      ElMessage.warning('该节点暂无内容可编辑')
      return
    }
    
    emit('goto-paper-center', {
      catalogName: node.label,
      questions: questionList.value
    })
  }, 100)
}

// 下载目录节点
const handleDownloadCatalog = async (node) => {
  // 先选中该节点并加载内容
  selectCatalog(node)
  
  // 等待内容加载完成后执行下载
  setTimeout(async () => {
    if (questionList.value.length === 0) {
      ElMessage.warning('该节点暂无内容可下载')
      return
    }

    try {
      ElMessage.info('正在生成Word文档...')
      
      // 创建Word文档内容
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 2.54cm;
            }
            body {
              font-family: "Times New Roman", "宋体", SimSun, serif;
              font-size: 12pt;
              line-height: 1.8;
              margin: 0;
              padding: 0;
            }
            .document-title {
              text-align: center;
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 20pt;
            }
            .content-item {
              margin-bottom: 20pt;
            }
            .item-title {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 10pt;
              color: #303133;
            }
            .item-content {
              font-size: 12pt;
              line-height: 1.8;
              text-indent: 2em;
            }
            .item-meta {
              font-size: 10pt;
              color: #909399;
              margin-top: 8pt;
            }
          </style>
        </head>
        <body>
          <div class="document-title">${node.label}</div>
      `

      // 遍历知识点
      questionList.value.forEach((item, index) => {
        htmlContent += `
          <div class="content-item">
            <div class="item-title">${index + 1}. ${item.title || '知识点' + (index + 1)}</div>
            <div class="item-content">${item.content || item.description || ''}</div>
            ${item.source ? `<div class="item-meta">来源：${item.source}</div>` : ''}
          </div>
        `
      })

      htmlContent += `
        </body>
        </html>
      `

      // 创建Blob对象
      const blob = new Blob(['\ufeff' + htmlContent], {
        type: 'application/msword;charset=utf-8'
      })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${node.label}.doc`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      ElMessage.success('Word文档下载成功！')
    } catch (error) {
      console.error('下载Word失败:', error)
      ElMessage.error('下载Word文档失败，请重试')
    }
  }, 100)
}

// 收藏当前内容
const handleAddCurrentToExam = () => {
  if (questionList.value.length === 0) {
    ElMessage.warning('暂无内容可收藏')
    return
  }
  
  questionList.value.forEach(question => {
    addToBasket(question)
  })
  ElMessage.success('已收藏！可在「我的」→「我的备考」中查看')
}

// 一键加入备考
const handleAddAllToExam = () => {
  if (questionList.value.length === 0) {
    ElMessage.warning('暂无内容可加入备考篮')
    return
  }
  
  questionList.value.forEach(question => {
    addToBasket(question)
  })
  ElMessage.success(`已将${questionList.value.length}个知识点加入备考篮！`)
}

// 收藏当前节（直接保存到我的备考）
 const handleCollectCurrentSection = () => {
  if (questionList.value.length === 0) {
    ElMessage.warning('暂无内容可收藏')
    return
  }
  
  // 直接保存为作业，不经过备考篮
  saveToMyExamPrep(currentCatalogName.value, questionList.value, '初中', '英语')
}

// 下载当前节（跳转到组卷中心）
const handleDownloadCurrentSection = () => {
  if (!currentCatalogName.value || questionList.value.length === 0) {
    ElMessage.warning('请先选择内容再进入组卷中心')
    return
  }
  
  // 触发父组件跳转事件
  emit('goto-paper-center', {
    catalogName: currentCatalogName.value,
    questions: questionList.value
  })
}

// 跳转到组卷中心
const handleGotoPaperCenter = () => {
  if (!currentCatalogName.value || questionList.value.length === 0) {
    ElMessage.warning('请先选择内容再进入组卷中心')
    return
  }
  
  // 触发父组件跳转事件
  emit('goto-paper-center', {
    catalogName: currentCatalogName.value,
    questions: questionList.value
  })
}

// 预览
const handlePreview = () => {
  ElMessage.info('预览功能')
}

// 下载编辑内容
const handleDownloadEdit = () => {
  ElMessage.info('下载功能')
}

// 编辑单个知识点
// 下载当前内容
const handleDownloadCurrent = async () => {
  if (!currentCatalogName.value || questionList.value.length === 0) {
    ElMessage.warning('暂无内容可下载')
    return
  }

  try {
    ElMessage.info('正在生成Word文档...')
    
    // 创建Word文档内容
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 2.54cm;
          }
          body {
            font-family: "Times New Roman", "宋体", SimSun, serif;
            font-size: 12pt;
            line-height: 1.8;
            margin: 0;
            padding: 0;
          }
          .document-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 20pt;
          }
          .content-item {
            margin-bottom: 20pt;
          }
          .item-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10pt;
            color: #303133;
          }
          .item-content {
            font-size: 12pt;
            line-height: 1.8;
            text-indent: 2em;
          }
          .item-meta {
            font-size: 10pt;
            color: #909399;
            margin-top: 8pt;
          }
        </style>
      </head>
      <body>
        <div class="document-title">${currentCatalogName.value}</div>
    `

    // 遍历知识点
    questionList.value.forEach((item, index) => {
      htmlContent += `
        <div class="content-item">
          <div class="item-title">${index + 1}. ${item.title || '知识点' + (index + 1)}</div>
          <div class="item-content">${item.content || item.description || ''}</div>
          ${item.source ? `<div class="item-meta">来源：${item.source}</div>` : ''}
        </div>
      `
    })

    htmlContent += `
      </body>
      </html>
    `

    // 创建Blob对象
    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8'
    })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentCatalogName.value}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('Word文档下载成功！')
  } catch (error) {
    console.error('下载Word失败:', error)
    ElMessage.error('下载Word文档失败，请重试')
  }
}

// 筛选条件
const filters = ref({
  source: 'platform',
  type: 'all',
  difficulty: 'all',
  year: 'all'
})

// 试题来源选项
const sourceOptions = [
  { label: '平台题库', value: 'platform' },
  { label: '本校上传', value: 'school' }
]

// 试题类型选项（简化版）
const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '字词书写', value: 'word-writing' },
  { label: '现代文阅读', value: 'modern-reading' },
  { label: '文言文阅读', value: 'classical-reading' },
  { label: '名句名篇默写', value: 'famous-sentences' },
  { label: '诗歌鉴赏', value: 'poetry' },
  { label: '语言表达', value: 'language-expression' },
  { label: '作文', value: 'composition' }
]

// 试题难度选项
const difficultyOptions = [
  { label: '全部', value: 'all' },
  { label: '容易', value: 'easy' },
  { label: '较易', value: 'fairly-easy' },
  { label: '一般', value: 'medium' },
  { label: '较难', value: 'fairly-hard' },
  { label: '困难', value: 'hard' }
]

// 年份选项
const yearOptions = [
  { label: '全部', value: 'all' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' }
]

// 知识内容库（按contentId存储，每个contentId对应一个数组）
const contentLibrary = {
  // 《论语》十二章
  'lunyu': [
    {
      id: 101,
      content: '<strong>【原文节选】</strong><br/>子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"<br/><br/><strong>【重点字词】</strong><br/>• 时习：按时温习<br/>• 说（yuè）：通"悦"，愉快<br/>• 愠（yùn）：生气，发怒<br/><br/><strong>【句子翻译】</strong><br/>孔子说："学习了（知识）并且按时温习它，不也是很愉快的吗？有志同道合的人从远方来，不也是很快乐的吗？别人不了解自己却不生气，不也是君子吗？"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这三句话阐述了学习的乐趣、交友的快乐以及修养的境界，体现了孔子"学而不厌，诲人不倦"的教育思想和宽容大度的君子之风。<br/><br/>第一句强调学习要及时复习，温故知新，学习本身就是快乐的事情；第二句说明朋友之间的交流能够促进学习，增进友谊；第三句则体现了君子的修养，即使不被理解也不会生气，保持平和的心态。',
      analysis: '1. 运用设问句式，引人思考，三个"不亦...乎"构成排比，增强语势，富有感染力。<br/><br/>2. 内容层层递进，从学习到交友再到修养，体现了孔子完整的人格培养观念。<br/><br/>3. 这三句话不仅适用于古代的学习，对今天的我们同样具有重要的指导意义，教导我们要勤于学习、善于交友、宽容待人。',
    showAnalysis: false
  },
  {
      id: 102,
      content: '<strong>【原文节选】</strong><br/>子曰："温故而知新，可以为师矣。"<br/><br/><strong>【重点字词】</strong><br/>• 温：温习，复习<br/>• 故：旧的知识<br/>• 新：新的理解、体会<br/>• 为师：成为老师<br/><br/><strong>【句子翻译】</strong><br/>孔子说："温习旧知识从而得到新的理解和体会，凭借这一点就可以做老师了。"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这句话强调了温习旧知识的重要性。通过不断复习已学的知识，能够获得新的理解和体会，达到这样的程度，就可以做老师了。<br/><br/>体现了孔子对学习方法的重视，认为学习不仅要不断获取新知识，还要善于温习旧知识，在温习中加深理解，产生新的感悟。',
      analysis: '1. "温故"和"知新"形成对比，说明学习是一个循环往复、螺旋上升的过程。<br/><br/>2. 提出了"温故知新"的学习方法，对今天的学习仍然有重要的指导意义。<br/><br/>3. 最后一句"可以为师矣"说明达到这种境界就具备了做老师的资格，体现了孔子对教师的高标准要求。',
    showAnalysis: false
  },
  {
      id: 103,
      content: '<strong>【原文节选】</strong><br/>子曰："学而不思则罔，思而不学则殆。"<br/><br/><strong>【重点字词】</strong><br/>• 罔（wǎng）：迷惑，感到迷茫而无所得<br/>• 殆（dài）：疑惑，危险<br/><br/><strong>【句子翻译】</strong><br/>孔子说："只学习却不思考，就会迷惑而无所得；只空想却不学习，就会疑惑而无所获。"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这句话阐述了学习和思考的辩证关系，强调二者必须相互结合。只学习不思考，知识就不能消化理解；只思考不学习，就会陷入空想，没有根基。<br/><br/>学习和思考是认识过程中的两个阶段，学习是思考的基础，思考是学习的深化。',
      analysis: '1. 运用对比手法，将"学而不思"和"思而不学"两种片面做法进行比较，说明两者的弊端。<br/><br/>2. 提出了"学思结合"的学习方法，这是认识和掌握知识的根本方法。<br/><br/>3. 对今天的学习有重要启示：既要认真学习，又要善于思考，将学习和思考有机统一起来。',
      showAnalysis: false
    },
    {
      id: 104,
      content: '<strong>【原文节选】</strong><br/>子曰："三人行，必有我师焉。择其善者而从之，其不善者而改之。"<br/><br/><strong>【重点字词】</strong><br/>• 三人行：三个人一起走路（泛指多人）<br/>• 焉：于此，在其中<br/>• 善者：优点、长处<br/>• 从：跟从，学习<br/><br/><strong>【句子翻译】</strong><br/>孔子说："几个人一起走路，其中必定有可以做我老师的人。选择他们的优点学习，看到他们的缺点就对照自己改正。"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这句话体现了谦虚好学的态度，强调要善于向他人学习，无论是学习别人的长处，还是以别人的短处为戒，都能使自己得到提高。<br/><br/>这种学习态度包含两个方面：一是虚心向他人学习长处，二是以他人的缺点为镜，反省自己，避免犯同样的错误。',
      analysis: '1. "三人行，必有我师焉"体现了孔子虚心好学的态度，认为每个人都有值得学习的地方。<br/><br/>2. "择其善者而从之，其不善者而改之"说明学习要有辨别能力，既要学习别人的长处，也要以别人的缺点为镜，反省自己。<br/><br/>3. 这种学习态度对今天仍然有重要意义，提醒我们要保持谦虚，善于向他人学习。',
      showAnalysis: false
    },
    {
      id: 105,
      content: '<strong>【原文节选】</strong><br/>子曰："知之为知之，不知为不知，是知也。"<br/><br/><strong>【重点字词】</strong><br/>• 知之为知之：知道就是知道<br/>• 不知为不知：不知道就是不知道<br/>• 是知也：这才是真正的智慧<br/><br/><strong>【句子翻译】</strong><br/>孔子说："知道就说知道，不知道就说不知道，这才是真正的智慧。"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这句话强调了实事求是的学习态度，反对不懂装懂。真正的聪明智慧，不在于知道多少，而在于对待知识的诚实态度。<br/><br/>这体现了孔子对求知态度的重视，认为诚实是获取真知的前提。只有承认自己的不足，才能虚心学习，不断进步。',
      analysis: '1. 运用反复手法，"知之"与"不知"形成对比，强调对待知识要诚实。<br/><br/>2. 批评了不懂装懂的学习态度，提倡实事求是的求知精神。<br/><br/>3. 这种态度在今天仍然具有重要意义，提醒我们在学习中要诚实，不能自欺欺人。',
      showAnalysis: false
    },
    {
      id: 106,
      content: '<strong>【原文节选】</strong><br/>子曰："默而识之，学而不厌，诲人不倦，何有于我哉？"<br/><br/><strong>【重点字词】</strong><br/>• 默：默默地<br/>• 识（zhì）：记住<br/>• 厌：满足<br/>• 诲：教导<br/>• 何有于我哉：我做到了哪些呢<br/><br/><strong>【句子翻译】</strong><br/>孔子说："默默地记住所学的知识，学习不感到满足，教导别人不知疲倦，这些我做到了哪些呢？"',
      type: '重点句段讲解',
      year: '2026',
      answer: '这句话体现了孔子的谦虚态度和对自己的严格要求。他提出了三个标准：默默记忆、勤奋好学、热心教人，但又谦虚地说自己不知做到了哪些。<br/><br/>实际上这是孔子的自我勉励，也是对学生的期望和要求。这三点涵盖了学习的各个方面：积累知识、刻苦学习、无私传授。',
      analysis: '1. "默而识之"强调积累的重要性，学习要善于记忆和积累。<br/><br/>2. "学而不厌"体现了对学习的热爱和永不满足的求知精神。<br/><br/>3. "诲人不倦"展现了无私传授知识、热心教导他人的精神。<br/><br/>4. 最后的反问"何有于我哉"体现了孔子的谦虚，虽然做到了这些，却不自夸，这是君子的品格。',
      showAnalysis: false
    },
    {
      id: 107,
      content: '<strong>命题点一 个人修养</strong><br/>１．本文中有不少格言警句已经成为很多人提高自身修养的座右铭。请任选一句谈谈你获得的启示。<br/><br/><strong>命题点二 为学之道</strong><br/>２．（教材“思考探究”第二题）孔子及其弟子在学习态度和学习方法上有哪些观点？选择其中一点谈谈你的体会。',
      type: '命题探究',
      year: '2026',
      answer: '<p><strong>命题点一·示例一：</strong>“三军可夺帅也，匹夫不可夺志也。”孔子认为即使是一个普通人，也要有坚定的志向。一个人的志向能否被改变，取决于他自己。这启示我们，越是在危急的时刻，越要捍卫自己的人格，坚守自己的志向。</p><br/><p><strong>命题点一·示例二：</strong>“博学而笃志，切问而近思，仁在其中矣。”子夏认为博学、笃志、切问、近思是提高个人修养的重要方法。这启示我们要博览群书，坚定自己的志向，同时要恳切地提出问题，联系现实自我思考，这样才能提高自身修养。</p><br/><p><strong>命题点二·观点汇总：</strong></p><ol><li>学而时习之，不亦说乎？</li><li>温故而知新，可以为师矣。</li><li>学而不思则罔，思而不学则殆。</li><li>知之者不如好之者，好之者不如乐之者。</li><li>三人行，必有我师焉。择其善者而从之，其不善者而改之。</li></ol><br/><p><strong>命题点二·体会示例一：</strong>“学而不思则罔，思而不学则殆”这句话警醒我们要边读书边思考，只读书而不思考就不能深刻理解，甚至会陷入迷茫；只空想而不读书，则会感到疑惑而一无所得。只有做到学思结合，才能真正将知识融会贯通。</p><br/><p><strong>命题点二·体会示例二：</strong>“三人行……其不善者而改之”这句话体现了一种谦虚的学习态度。善于发现他人优点和缺点的人，也往往是善于向他人学习的人。无论在什么环境下，我们都应该端正学习态度，虚心向他人请教，从中吸取经验教训，这样才能得到提高。</p>',
      analysis: '1. 命题点一聚焦个人修养，可从格言中提炼价值与方法并结合自我体会阐述。<br/><br/>2. 命题点二聚焦为学之道，建议先归纳典型观点，再选择一点结合自身学习实践进行论述，形成“观点+体会”的结构。<br/><br/>3. 作答结构建议：分段表达、条理清晰，适度使用例证与对比，语言朴实有力，更贴近考试书写规范。',
      showAnalysis: false
    },
    {
      id: 108,
      content: '<strong>命题探究 学习生态</strong><br/>１．结合“学而时习之”“三人行，必有我师焉”等语句，谈谈如何在日常学习中形成良好的学习生态（学习方法、同伴互助、反思复盘）。<br/><br/><strong>命题探究 应用拓展</strong><br/>２．任选《论语》中的一句，联系现实学习场景，提出一项可落地的改进措施并说明理由。',
      type: '命题探究',
      year: '2026',
      answer: '<p><strong>思路框架：</strong></p><ol><li>学习方法：践行“时习、温故知新”，设定每日回顾与每周小测。</li><li>同伴互助：以“取善改不善”为准则，进行同伴互评与经验分享。</li><li>反思复盘：落实“学思结合”，每次学习后记录问题与改进方案。</li></ol><br/><p><strong>示例措施：</strong>以“三人行，必有我师焉”为例，建立每周互评与分享机制，每人记录他人优点与自身改进项，并在下一周跟进落实；同时设立“温故知新”清单，复习旧知并输出新的理解。</p>',
      analysis: '1. 命题围绕《论语》的核心学习观：时习、温故知新、学思结合、向人学习。<br/><br/>2. 建议采用“框架+示例”的表达方式，先归纳可行路径，再给出一条可落地的场景化举措。<br/><br/>3. 书写要点：标题明确、条理清晰、结合个人实践，体现真实改进与反馈闭环。',
      showAnalysis: false
    },
    {
      id: 109,
      content: '对“学而时习之”的理解，正确的一项是：<br/>A．“时习”指偶尔复习一次<br/>B．“时习”指按时学习新知识<br/>C．“时习”指按时温习旧知识并巩固理解<br/>D．“时习”与学习的快乐无关',
      type: '课后练习',
      year: '2026',
      answer: '<strong>答案：</strong>C',
      analysis: '“时习”是“按时温习”的意思，强调在既定频率上复习巩固旧知识，由此产生学习的快乐（“不亦说乎”）。',
      showAnalysis: false
    },
    {
      id: 110,
      content: '对“温故而知新，可以为师矣”的理解，正确的一项是：<br/>A．只要温习旧知识就一定能成为老师<br/>B．通过温习旧知获得新的理解与体会，达到此境可以为师<br/>C．“知新”仅指学到全新的知识，与旧知无关<br/>D．“可以为师矣”是对学生的勉励，没有标准意义',
      type: '课后练习',
      year: '2026',
      answer: '<strong>答案：</strong>B',
      analysis: '孔子强调在复习旧知的过程中产生“新的理解和体会”，知识理解螺旋上升；达到这种水平的人具备“为师”的资格。',
      showAnalysis: false
    },
    {
      id: 111,
      content: '补写名句：学而不思则____，思而不学则____。',
      type: '课后练习',
      year: '2026',
      answer: '<strong>答案：</strong>罔；殆',
      analysis: '“罔”指迷惑无所得；“殆”指疑惑或危险，意在强调学习与思考的辩证统一。',
      showAnalysis: false
    },
    {
      id: 112,
      content: '补写名句：三人行，____。择其善者而从之，____。',
      type: '课后练习',
      year: '2026',
      answer: '<strong>答案：</strong>必有我师焉；其不善者而改之',
      analysis: '体现谦虚好学的态度：善者从之、不善者为镜，进而自我改正。',
      showAnalysis: false
    },
    {
      id: 113,
      content: '下列对《论语》十二章的理解，不正确的一项是：<br/>A. "学而时习之"强调了按时复习的重要性。<br/>B. "温故而知新"说明了复习旧知可以获得新知。<br/>C. "三人行，必有我师焉"表现了孔子谦虚好学的态度。<br/>D. "逝者如斯夫，不舍昼夜"感叹了时光流逝，劝人及时行乐。',
      type: '课后练习',
      year: '2026',
      answer: '<strong>答案：</strong>D',
      analysis: '',
      showAnalysis: false
    },
    {
      id: 114,
      content: '请解释下列加点词语的意思：<br/>(1) 不亦<strong>说</strong>乎<br/>(2) 人不知而不<strong>愠</strong><br/>(3) 吾日三<strong>省</strong>吾身<br/>(4) <strong>好</strong>之者不如乐之者',
      type: '课后练习',
      year: '2026',
      answer: '',
      analysis: '(1) 说：同"悦"，愉快。<br/>(2) 愠：生气，恼怒。<br/>(3) 省：自我检查，反省。<br/>(4) 好：喜爱，爱好。',
      showAnalysis: false
    },
    {
      id: 115,
      content: '默写《论语》十二章中关于"学习与思考关系"的句子。',
      type: '课后练习',
      year: '2026',
      answer: '',
      analysis: '',
      showAnalysis: false
    }
  ],
  
  // 《诫子书》
  'jiezishu': [
    {
      id: 201,
      content: '<strong>【原文】</strong><br/>夫君子之行，静以修身，俭以养德。非淡泊无以明志，非宁静无以致远。夫学须静也，才须学也，非学无以广才，非志无以成学。<br/><br/><strong>【作品背景】</strong><br/>这是诸葛亮写给儿子诸葛瞻的一封家书，作于蜀汉建兴十二年（234年）。诸葛亮一生为国操劳，临终前写下这篇文章，希望儿子能够修身养性、成才报国。<br/><br/><strong>【重点词语】</strong><br/>• 夫：句首发语词，无实义<br/>• 静：宁静、平静<br/>• 俭：俭朴、节俭<br/>• 淡泊：内心恬淡，不慕名利<br/>• 明志：表明志向<br/>• 致远：实现远大目标<br/>• 广才：增长才干',
      type: '文章整体讲解',
      year: '2026',
      answer: '文章阐述了修身养性、治学做人的深刻道理。诸葛亮认为君子的品行修养，应当以"静"和"俭"为根本：宁静可以修养身心，俭朴可以培养品德。<br/><br/>文章强调只有内心恬淡、不追求名利，才能树立远大志向；只有心境宁静、专心致志，才能实现远大目标。同时指出学习需要宁静的环境和心境，才干需要通过学习来增长，不学习就无法增长才干，没有志向就无法学有所成。',
      analysis: '1. 全文围绕"静"字展开，"静"是修身、明志、治学的前提条件，体现了古人"静以修身"的思想。<br/><br/>2. 逻辑严密：先谈修身之道（静、俭），再谈立志之法（淡泊、宁静），最后谈治学之要（学、志），层层深入。<br/><br/>3. 文章既有人生哲理，又有实践指导，充分体现了诸葛亮作为一代名相的智慧和对儿子的殷切期望。',
      showAnalysis: false
    },
    {
      id: 202,
      content: '<strong>【名句赏析】</strong><br/>"静以修身，俭以养德"<br/><br/><strong>【句意理解】</strong><br/>以宁静来修养身心，以俭朴来培养品德。',
      type: '名句赏析',
      year: '2026',
      answer: '这是全文的总领句，提出了修身养德的两个关键：静和俭。<br/><br/>"静"指内心平静，不受外界干扰，能够专注于自我修养。"俭"指生活俭朴，不追求物质享受，保持朴素的生活作风。<br/><br/>两者相辅相成：心静才能深入思考，俭朴才能不为物欲所累。这是诸葛亮一生践行的准则，也是他对儿子最重要的教诲。',
      analysis: '1. 对偶工整："静以修身"对"俭以养德"，结构相同，音韵和谐。<br/><br/>2. 言简意赅：用最简洁的语言概括了修身养德的核心方法。<br/><br/>3. 体现了儒家传统的修身观念，强调内在修养和品德培养的重要性。',
      showAnalysis: false
    },
    {
      id: 203,
      content: '<strong>【名句赏析】</strong><br/>"非淡泊无以明志，非宁静无以致远"<br/><br/><strong>【句意理解】</strong><br/>不恬淡寡欲就不能明确志向，不宁静就不能实现远大目标。',
      type: '名句赏析',
      year: '2026',
      answer: '这是全文最著名的句子，千百年来被广泛传诵。<br/><br/>"淡泊"指不追求名利，保持内心的平和；"明志"指明确自己的志向和目标。只有不被名利所困，才能看清自己真正想要的是什么。<br/><br/>"宁静"指心境平和，不浮躁；"致远"指实现远大的目标。只有心境宁静，才能沉下心来，一步一个脚印地走向目标。<br/><br/>这两句道出了立志与成才的关系，对今天的我们仍然具有重要的指导意义。',
      analysis: '1. 运用双重否定句式"非...无以..."，语气强烈，强调内心修养对实现人生目标的重要性。<br/><br/>2. 对偶工整，音韵和谐："非淡泊无以明志"对"非宁静无以致远"。<br/><br/>3. 逻辑严密：先要"明志"（明确目标），才能"致远"（实现目标）；先要"淡泊"（不慕名利），才能"宁静"（心境平和）。<br/><br/>4. 这句话成为千古名句，被后人铭记和践行。',
      showAnalysis: false
    },
    {
      id: 204,
      content: '<strong>【重点句段】</strong><br/>"夫学须静也，才须学也，非学无以广才，非志无以成学"<br/><br/><strong>【句意理解】</strong><br/>学习需要宁静，才干需要学习来增长，不学习就无法增长才干，没有志向就无法使学业有成。',
      type: '重点句段讲解',
      year: '2026',
      answer: '这几句话阐述了学习、才干、志向三者之间的关系。<br/><br/>首先强调"学须静"，学习必须在宁静的环境和心境中进行，这是前文"静以修身"的延续。<br/><br/>其次指出"才须学"，才能需要通过学习来培养和提高。<br/><br/>然后用双重否定强调："非学无以广才"—不学习就无法增长才干；"非志无以成学"—没有志向就无法使学业有成。<br/><br/>这四句环环相扣，构成了完整的治学之道。',
      analysis: '1. 逻辑链条：静→学→才→志，层层递进，构成完整的学习成才之路。<br/><br/>2. 强调了志向对学习的重要性，有了远大志向，才能持之以恒地学习。<br/><br/>3. 体现了诸葛亮对教育的深刻理解，学习不仅需要好的环境和方法，更需要坚定的志向。',
      showAnalysis: false
    },
    {
      id: 205,
      content: '<strong>【写作特色】</strong><br/>骈散结合，言简意赅',
      type: '写作特色分析',
      year: '2026',
      answer: '1. 骈散结合：全文既有对偶工整的骈句，如"静以修身，俭以养德"、"非淡泊无以明志，非宁静无以致远"，又有散句，如"夫学须静也，才须学也"，使文章既有节奏美，又不显呆板。<br/><br/>2. 言简意赅：全文仅86字（原文更长），却涵盖了修身、立志、治学等多个方面，可谓字字珠玑。<br/><br/>3. 层次分明：先谈修身（静、俭），再谈立志（淡泊、宁静），后谈治学（学、才、志），逻辑严密，层次清晰。',
      analysis: '1. 多用双重否定句式："非...无以..."，语气强烈，增强说服力。<br/><br/>2. 善用对偶：全文多处使用对偶，音韵和谐，易于记诵。<br/><br/>3. 论证严密：通过"静→俭→淡泊→宁静→学→才→志"的逻辑链条，构建了完整的人生修养体系。',
      showAnalysis: false
    },
    {
      id: 206,
      content: '<strong>【思想内涵】</strong><br/>儒家修身思想与道家清静无为的结合',
      type: '思想内涵探究',
      year: '2026',
      answer: '《诫子书》体现了儒家和道家思想的融合：<br/><br/>1. 儒家思想：强调修身、立志、治学，追求"修身齐家治国平天下"的人生理想。"静以修身，俭以养德"体现了儒家重视道德修养的传统。<br/><br/>2. 道家思想："淡泊"、"宁静"等概念体现了道家清静无为、不争名利的思想。强调内心的平和与超脱。<br/><br/>3. 两者结合：诸葛亮将儒家的积极进取与道家的超然物外相结合，既有远大志向，又能保持内心平和，体现了中国传统文化的智慧。',
      analysis: '1. 这种思想融合在诸葛亮的人生中得到充分体现：他既鞠躬尽瘁为国效力，又能在纷乱中保持内心的宁静。<br/><br/>2. 对今天的启示：在追求事业成功的同时，也要注重内心修养，保持平和的心态。<br/><br/>3. 体现了中国传统文化的包容性和综合性。',
      showAnalysis: false
    }
  ],
  
  // 《爱莲说》
  'ailiansuo': [
    {
      id: 301,
      content: '<strong>【原文】</strong><br/>水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。<br/><br/><strong>【作者简介】</strong><br/>周敦颐（1017-1073），字茂叔，北宋理学家、哲学家。他是宋代理学的开山鼻祖，提出了"太极说"，对后世影响深远。<br/><br/><strong>【重点字词】</strong><br/>• 蕃（fán）：多<br/>• 淤（yū）泥：河沟或池塘里积存的污泥<br/>• 濯（zhuó）：洗涤<br/>• 清涟（lián）：水清而有微波的样子<br/>• 妖：妖艳<br/>• 中通外直：内部贯通，外形挺直<br/>• 亵（xiè）玩：玩弄',
      type: '课文精讲',
      year: '2026',
      answer: '作者通过描写莲花"出淤泥而不染"的高洁品质，托物言志，表达了自己不慕名利、洁身自好的生活态度，以及在污浊环境中保持高洁品格的人生追求。<br/><br/>文章首先列举了陶渊明爱菊、世人爱牡丹的例子，然后引出自己独爱莲花。莲花生长在污泥之中却不沾染污秽，经过清水洗涤却不显得妖艳，象征君子身处浊世而能保持清白的品格。',
      analysis: '1. 托物言志：借莲花的自然特征来表达作者的人生理想和道德追求，"莲"象征高洁品格，"淤泥"象征污浊的社会环境。<br/><br/>2. 对比衬托：用陶渊明爱菊象征隐逸，世人爱牡丹象征富贵，衬托出作者爱莲的独特之处，突出莲的高洁品质。<br/><br/>3. 正面描写：从形态、香气、姿态等多角度描写莲花，形象生动。',
      showAnalysis: false
    },
    {
      id: 302,
      content: '<strong>【名句赏析】</strong><br/>"出淤泥而不染，濯清涟而不妖"<br/><br/><strong>【句意理解】</strong><br/>从淤泥中长出来却不沾染污秽，经过清水洗涤却不显得妖艳。',
      type: '名句赏析',
      year: '2026',
      answer: '这是全文最著名的句子，成为描写高洁品格的千古名句。<br/><br/>"出淤泥而不染"：莲花生长在污泥之中，却不被污泥所玷污，象征君子身处污浊环境却能保持高洁的品格。<br/><br/>"濯清涟而不妖"：经过清水洗涤，却不显得妖艳，说明莲花的美是自然朴素的美，不是刻意装扮的美。<br/><br/>两句从不同角度赞美莲花的品质：一是不受环境影响，二是不追求外表华丽。这正是君子应有的品格。',
      analysis: '1. 对偶工整："出淤泥而不染"对"濯清涟而不妖"，结构相同，音韵和谐。<br/><br/>2. 用字精准："染"字写出了环境的污浊，"妖"字点出了世俗的华丽，两字对比鲜明。<br/><br/>3. 象征深刻："淤泥"象征污浊的社会环境，"清涟"象征世俗的诱惑，"不染"、"不妖"展现了君子的品格。<br/><br/>4. 这两句成为后世形容高洁品格的经典名句。',
      showAnalysis: false
    },
    {
      id: 303,
      content: '<strong>【名句赏析】</strong><br/>"中通外直，不蔓不枝"<br/><br/><strong>【句意理解】</strong><br/>（茎）内部贯通，外形挺直，不生蔓藤，不长旁枝。',
      type: '名句赏析',
      year: '2026',
      answer: '这两句从莲花的形态特征进一步刻画其品格。<br/><br/>"中通外直"：内部贯通象征内心通达，外形挺直象征品行正直。内外一致，表里如一，这是君子的重要品质。<br/><br/>"不蔓不枝"：不生蔓藤，不长旁枝，说明莲花生长专一，不旁逸斜出。象征君子做人专注，不攀附权贵，不趋炎附势。<br/><br/>这两句赞美莲花品格的纯正和专一。',
      analysis: '1. 由外到内，层层深入：先写外形（直），再写内部（通），最后写生长特点（不蔓不枝）。<br/><br/>2. 托物言志：通过莲花的形态特征，暗喻君子应当内心通达、品行正直、为人专一的品格。<br/><br/>3. 语言简洁：用短短六个字，刻画出莲花完整的形态特征和精神品质。',
      showAnalysis: false
    },
    {
      id: 304,
      content: '<strong>【写作手法】</strong><br/>对比衬托',
      type: '写作手法分析',
      year: '2026',
      answer: '文章通过三种花的对比，层层衬托出莲花的高洁品格：<br/><br/>1. 菊花——隐逸之士：陶渊明独爱菊，菊花象征隐居避世、不与世俗同流合污的隐逸之士。但隐逸是消极的，逃避现实的。<br/><br/>2. 牡丹——富贵之人：世人甚爱牡丹，牡丹象征富贵荣华，追求物质享受的人。但这是庸俗的，缺乏精神追求的。<br/><br/>3. 莲花——君子之风：作者独爱莲，莲花象征既不逃避现实（生于淤泥），又能保持高洁品格（不染）的君子。这是积极的，既入世又超脱的。<br/><br/>通过对比，突出了莲花（君子）的可贵之处。',
      analysis: '1. 三种花代表三种人生态度：菊花代表消极避世，牡丹代表追求富贵，莲花代表洁身自好。<br/><br/>2. 层层推进：先写众人之爱（菊、牡丹），再写"予"之爱（莲），突出作者的独特选择。<br/><br/>3. 以物喻人：通过对花的喜爱，表达对不同人生态度的评价和自己的人生追求。',
      showAnalysis: false
    },
    {
      id: 305,
      content: '<strong>【托物言志手法】</strong><br/>以莲喻君子，寄托理想',
      type: '托物言志详解',
      year: '2026',
      answer: '托物言志是《爱莲说》最主要的写作手法，作者通过对莲花的描写和赞美，寄托了自己的人生理想和道德追求。<br/><br/>1. 物的选择：作者选择莲花，是因为莲花生长在淤泥之中却能保持洁净，这与作者所处的社会环境和他的人生追求相契合。<br/><br/>2. 物的特征：作者重点描写了莲花的几个特征——出淤泥而不染、濯清涟而不妖、中通外直、不蔓不枝，这些都是君子应有的品格。<br/><br/>3. 志的表达：通过对莲花的赞美，表达了作者不慕名利、洁身自好、品行正直的人生追求。',
      analysis: '1. 自然与人格的契合：莲花的自然特征与君子的道德品质完美契合，使得托物言志水到渠成。<br/><br/>2. 含蓄蕴藉：不直接说教，而是通过对莲花的描写，让读者自然领悟其中的道理。<br/><br/>3. 情景交融：作者的情感与莲花的形象融为一体，既是写花，也是写人，更是写理想。',
      showAnalysis: false
    },
    {
      id: 306,
      content: '<strong>【语言特色】</strong><br/>骈散结合，音韵和谐',
      type: '语言特色分析',
      year: '2026',
      answer: '《爱莲说》的语言具有鲜明的特色：<br/><br/>1. 骈散结合：全文以散句为主，但关键处使用骈句，如"出淤泥而不染，濯清涟而不妖"、"中通外直，不蔓不枝"，使文章既有节奏美，又不失自然流畅。<br/><br/>2. 对偶工整：多处使用对偶句，如"予独爱莲之出淤泥而不染，濯清涟而不妖"，音韵和谐，朗朗上口。<br/><br/>3. 用词精练：如"染"、"妖"、"植"等字，一字传神，准确生动。<br/><br/>4. 句式多变：长短句交错使用，使文章富有节奏感和韵律美。',
      analysis: '1. 全文仅119字（原文），却涵盖了对莲花的全面描写和深刻寓意，堪称言简意赅的典范。<br/><br/>2. 音韵和谐：多用"之"、"而"等虚词，增强了文章的音韵美。<br/><br/>3. 形象生动：用"出"、"濯"、"通"、"直"等动词，使静态的莲花具有了动态美。<br/><br/>4. 这种语言风格既符合古文的典雅，又具有散文的自然流畅，成为后世散文的典范。',
      showAnalysis: false
    }
  ],
  'unit-overview': {
    id: 4,
    content: '<strong>【课文导读】</strong><br/>《论语》是儒家经典著作之一，记录了孔子及其弟子的言行。本单元选取的十二章，涉及学习方法、学习态度、修身做人等多个方面，对今天的我们仍有重要的启示意义。<br/><br/><strong>【学习方法篇】</strong><br/>• "学而时习之"——强调及时复习的重要性<br/>• "温故而知新"——从已学知识中获得新的理解<br/>• "学而不思则罔，思而不学则殆"——学习与思考相结合<br/><br/><strong>【学习态度篇】</strong><br/>• "三人行，必有我师焉"——虚心向他人学习<br/>• "知之为知之，不知为不知"——实事求是的态度<br/>• "敏而好学，不耻下问"——勤奋好学，谦虚请教',
    type: '单元知识梳理',
    year: '2026',
    answer: '《论语》十二章从多个角度阐述了学习和修身的道理，主要包括三个方面：<br/><br/>1. 学习方法：强调温故知新、学思结合，既要勤于复习，又要善于思考，将学习和思考有机结合起来。<br/><br/>2. 学习态度：提倡虚心求教、实事求是，要善于向他人学习，对于知识要诚实，知道就是知道，不知道就是不知道。<br/><br/>3. 修身做人：要求宽容待人、见贤思齐，遵循"己所不欲，勿施于人"的原则，向优秀的人学习，不断提升自己的品格修养。',
    analysis: '1. 这些语句言简意赅，却蕴含着深刻的教育哲理，两千多年来一直被奉为经典，影响着一代又一代人。<br/><br/>2. 学习建议：熟读成诵，在反复诵读中理解文意；联系实际，将所学道理与自己的学习生活相结合；活学活用，在日常学习和生活中践行这些道理；积累背诵，重点句子要能够准确默写，内化为自己的语言财富。<br/><br/>3. 现实意义：这些语句不仅适用于古代，对今天的我们同样具有重要的指导意义，帮助我们树立正确的学习观和人生观。',
    showAnalysis: false
  }
}

// 当前显示的内容列表
const questionList = ref([])

// 大屏展示相关
const screenDialogVisible = ref(false)
const currentScreenQuestion = ref(null)
const currentScreenIndex = ref(0)

// 根据contentId加载内容（单个）
const loadContentById = (contentId) => {
  const contents = contentLibrary[contentId]
  if (contents) {
    // 如果是数组，直接使用；如果是单个对象，转为数组
    questionList.value = Array.isArray(contents) ? contents : [contents]
  } else {
    questionList.value = []
    ElMessage.info('该章节内容正在编写中...')
  }
}

// 根据多个contentId加载内容（聚合）
const loadContentByIds = (contentIds) => {
  const allContents = []
  
  contentIds.forEach(contentId => {
    const contents = contentLibrary[contentId]
    if (contents) {
      // 如果是数组，展开所有内容；如果是单个对象，作为一项添加
      if (Array.isArray(contents)) {
        allContents.push(...contents)
      } else {
        allContents.push(contents)
      }
    }
  })
  
  questionList.value = allContents
}

// 根据contentId加载配套资源（模拟数据）
const loadResourcesByContentId = (contentId) => {
  // 模拟配套资源数据
  const resourceMap = {
    'lunyu': [
      { name: '《论语》十二章教案.docx', type: 'Word文档', fileType: 'DOC', size: '2.3MB' },
      { name: '《论语》十二章课件.pptx', type: 'PPT演示', fileType: 'PPT', size: '5.8MB' },
      { name: '《论语》十二章课后练习.pdf', type: 'PDF文档', fileType: 'PDF', size: '1.2MB' }
    ],
    'jiezishu': [
      { name: '《诫子书》教案.docx', type: 'Word文档', fileType: 'DOC', size: '1.8MB' },
      { name: '《诫子书》课件.pptx', type: 'PPT演示', fileType: 'PPT', size: '4.5MB' }
    ],
    'ailiansuo': [
      { name: '《爱莲说》教案.docx', type: 'Word文档', fileType: 'DOC', size: '2.1MB' },
      { name: '《爱莲说》课件.pptx', type: 'PPT演示', fileType: 'PPT', size: '6.2MB' },
      { name: '《爱莲说》拓展阅读.pdf', type: 'PDF文档', fileType: 'PDF', size: '3.5MB' }
    ],
    'unit-overview': [
      { name: '课标文言文阅读单元概述.docx', type: 'Word文档', fileType: 'DOC', size: '3.2MB' },
      { name: '单元总结课件.pptx', type: 'PPT演示', fileType: 'PPT', size: '7.5MB' }
    ]
  }
  
  resourceList.value = resourceMap[contentId] || []
}

// 根据文件类型获取对应的图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'PDF': new URL('../assets/icron/文件类型-pdf.svg', import.meta.url).href,
    'PPT': new URL('../assets/icron/文件类型-ppt.svg', import.meta.url).href,
    'DOC': new URL('../assets/icron/文件类型-文档.svg', import.meta.url).href,
    'MP4': new URL('../assets/icron/文件类型-视频.svg', import.meta.url).href,
    'EXCEL': new URL('../assets/icron/文件类型-excel.svg', import.meta.url).href,
    'ZIP': new URL('../assets/icron/文件类型-压缩包.svg', import.meta.url).href
  }
  return iconMap[fileType] || new URL('../assets/icron/文件类型-附件.svg', import.meta.url).href
}

// 下载资源
const handleDownloadResource = (resource) => {
  ElMessage.success(`正在下载：${resource.name}`)
}

// 预览资源
const handlePreviewResource = (resource) => {
  ElMessage.info(`正在预览：${resource.name}`)
}

// 收藏资源
const handleCollectResource = (resource) => {
  ElMessage.success(`已收藏：${resource.name}`)
}

// 批量下载资源
const handleBatchDownloadResources = async () => {
  if (resourceList.value.length === 0) {
    ElMessage.warning('暂无资源可下载')
    return
  }
  
  try {
    ElMessage.info('正在生成压缩包...')
    
    // 动态导入 JSZip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    // 为每个资源创建一个模拟文件
    resourceList.value.forEach((resource, index) => {
      // 创建文本内容作为示例（实际应该下载真实文件）
      const content = `资源名称：${resource.name}
类型：${resource.type}
大小：${resource.size}

这是 ${resource.name} 的内容示例。
实际应用中，这里应该是真实的文件内容。`
      
      // 根据文件类型确定扩展名
      let ext = '.txt'
      if (resource.fileType === 'PDF') ext = '.pdf'
      else if (resource.fileType === 'DOC') ext = '.docx'
      else if (resource.fileType === 'PPT') ext = '.pptx'
      else if (resource.fileType === 'MP4') ext = '.mp4'
      
      // 添加文件到压缩包
      const fileName = `${index + 1}_${resource.name}`
      zip.file(fileName, content)
    })
    
    // 生成压缩包
    const blob = await zip.generateAsync({ type: 'blob' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentCatalogName.value}_配套资源.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success(`已成功下载 ${resourceList.value.length} 个资源的压缩包`)
  } catch (error) {
    console.error('批量下载失败:', error)
    ElMessage.error('批量下载失败，请重试')
  }
}

// 批量收藏资源
const handleBatchCollectResources = () => {
  if (resourceList.value.length === 0) {
    ElMessage.warning('暂无资源可收藏')
    return
  }
  ElMessage.success(`已批量收藏 ${resourceList.value.length} 个资源`)
}

// 点击图书卡片
const handleBookClick = (book) => {
  currentBook.value = book
  showQuestionList.value = true
  // 默认展开第一个一级目录并加载其所有内容
  if (catalogTree.value.length > 0) {
    const firstNode = catalogTree.value[0]
    firstNode.expanded = true
    selectCatalog(firstNode)
  }
}

// 切换答案解析显示状态
const toggleAnalysis = (question) => {
  question.showAnalysis = !question.showAnalysis
}

// 添加题目到备考篮
const addQuestionToBasket = (question) => {
  addToBasket(question)
  ElMessage.success(`已将"${question.type}"加入备考篮`)
}

// 大屏展示
const handleScreenShow = (question) => {
  // 找到当前题目在列表中的索引
  currentScreenIndex.value = questionList.value.findIndex(q => q.id === question.id)
  currentScreenQuestion.value = question
  screenDialogVisible.value = true
}

// 关闭大屏展示
const closeScreenPresentation = () => {
  screenDialogVisible.value = false
}

// 切换大屏展示的题目
const changeScreenQuestion = (index) => {
  if (index >= 0 && index < questionList.value.length) {
    currentScreenIndex.value = index
    currentScreenQuestion.value = questionList.value[index]
  }
}

// 重置组件状态
const resetState = () => {
  selectedCatalogId.value = null
  currentCatalogName.value = ''
  questionList.value = []
}

// 暴露方法给父组件
defineExpose({
  resetState
})
</script>

<style scoped>
.platform-sharing {
  padding: 20px 24px;
  min-height: 100%;
  background-color: #ffffff;
  border-radius: 5px 0 0 0;
}

/* 试题模式下使用透明背景 */
.platform-sharing.question-mode {
  background-color: transparent;
  border-radius: 0;
}

.selection-top {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.selection-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding: 0 20px;
  background: #fff;
  height: 52px;
  border-bottom: 2px solid #e4e7ed;
  position: relative;
}

.nav-list {
  display: flex;
  gap: 36px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list li {
  font-size: 16px;
  color: #606266;
  cursor: pointer;
  padding: 10px 0;
  margin-bottom: -2px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.nav-list li:hover {
  color: #2262FB;
}

.nav-list li.active {
  color: #2262FB;
  font-weight: 500;
  border-bottom-color: #2262FB;
}

.view-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: -2px;
  padding-bottom: 10px;
}

.view-icon {
  font-size: 22px;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.3s;
}

.view-icon:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.view-icon.active {
  color: #409eff;
  background: rgba(64, 158, 255, 0.12);
}

.list-view {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  margin: 0 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.grid-view {
  background: transparent;
  border-radius: 0;
  padding: 0 40px;
  box-shadow: none;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 180px));
  gap: 16px 64px;
  margin-bottom: 16px;
  justify-content: space-between;
}

.card-wrapper {
  cursor: pointer;
}

.resource-card {
  background: transparent;
  border: none;
  overflow: visible;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.card-wrapper:hover .card-cover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.card-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 3/4;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.card-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.card-cover :deep(.el-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #ccc;
  font-size: 48px;
}

.card-title {
  padding: 6px 0 0 0;
  font-size: 13px;
  color: #606266;
  font-weight: 400;
  min-height: 36px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .platform-sharing {
    padding: 16px;
  }
  
  .selection-top {
    flex-direction: column;
  }
  
  .selection-top > * {
    width: 100% !important;
  }
  
  .resource-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}

/* 题目列表样式 */
.question-view {
  animation: fadeIn 0.3s;
}

/* 题目内容区域布局 */
.question-content-wrapper {
  display: flex;
  gap: 20px;
  background-color: transparent;
  align-items: flex-start;
}

/* 左侧边栏样式 */
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-bottom: 16px;
}

.sidebar-header .back-btn {
  position: absolute;
  left: 0;
  font-size: 18px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.sidebar-header .back-btn:hover {
  color: #2262FB;
  transform: translateX(-2px);
}

.catalog-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.catalog-more {
  opacity: 1;
  margin-left: 8px;
  flex-shrink: 0;
}

.catalog-more .more-icon {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  transition: color 0.2s;
  transform: rotate(90deg);
}

.catalog-more .more-icon:hover {
  color: #2262FB;
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
  padding: 20px;
  min-width: 0;
}

/* Tab 切换区域 */
.content-tabs {
  margin-bottom: 20px;
  padding-top: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.tab-list {
  display: flex;
  gap: 0;
  position: relative;
  align-items: center;
  padding: 0;
}

.tab-item {
  padding: 10px 24px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  position: relative;
  background: transparent;
  user-select: none;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-icon {
  font-size: 15px;
}

.tab-item:hover {
  color: #2262FB;
  background: #f5f7fa;
}

.tab-item.active {
  color: #2262FB;
  font-weight: 500;
  border-bottom-color: #2262FB;
  background: #f0f5ff;
}

/* Tab 操作按钮区 */
.tab-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: -2px;
}

.tab-actions .el-button {
  padding: 8px 14px;
  font-size: 14px;
  border: 1px solid #2262FB;
  color: #2262FB;
  background: transparent;
}

.tab-actions .el-button:hover {
  background: #f0f5ff;
  border-color: #2262FB;
  color: #2262FB;
}

.tab-actions .el-button:active {
  background: #e6f0ff;
  border-color: #2262FB;
  color: #2262FB;
}

.tab-actions .el-button .el-icon {
  font-size: 15px;
}

/* 配套资源内容区 */
.resources-content {
  min-height: 400px;
}

.resource-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
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

.resources-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
}

.resources-empty .empty-icon {
  font-size: 80px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.resources-empty .empty-text {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
}

.empty-icon {
  font-size: 80px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #909399;
  text-align: center;
  line-height: 1.6;
}

/* 内联空状态样式（用于Tab内容区） */
.empty-state-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 300px;
}

.empty-icon-small {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-text-small {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

/* 筛选区域样式 */
.filter-section {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.filter-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 14px;
  color: #303133;
  line-height: 32px;
  text-align: right;
  padding-right: 12px;
}

.filter-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

/* Element Plus Radio 自定义样式 */
.custom-radio {
  margin-right: 0;
  height: 32px;
}

.custom-radio :deep(.el-radio__label) {
  font-size: 14px;
  color: #606266;
  padding-left: 8px;
}

.custom-radio :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
  border-color: #dcdfe6;
  background-color: #ffffff;
}

.custom-radio :deep(.el-radio__inner::after) {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
}

.custom-radio:hover :deep(.el-radio__inner) {
  border-color: #2262FB;
}

.custom-radio:hover :deep(.el-radio__label) {
  color: #2262FB;
}

.custom-radio.is-checked :deep(.el-radio__inner) {
  border-color: #2262FB;
  background-color: #2262FB;
}

.custom-radio.is-checked :deep(.el-radio__inner::after) {
  background-color: #ffffff;
}

.custom-radio.is-checked :deep(.el-radio__label) {
  color: #2262FB;
  font-weight: 500;
}

/* 题目列表 */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  transition: all 0.3s;
}

.question-item:hover {
  border-color: #2262FB;
  box-shadow: 0 2px 8px rgba(34, 98, 251, 0.15);
}

.question-header {
  position: relative;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.question-number {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: #2262FB;
  line-height: 1.8;
  /* 与内容区分的视觉背景 */
  background-color: #f0f5ff;
  border: 1px solid #e6efff;
  padding: 2px 8px;
  border-radius: 2px;
  display: inline-block;
}

.question-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  /* 预留按钮宽度 + 12px 间距 */
  padding-right: 132px;
}

.question-text :deep(br) {
  display: block;
  margin: 8px 0;
  content: "";
}

.btn-screen {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background-color: #2262FB;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.btn-screen:hover {
  background-color: #4a7dfc;
}

.btn-screen .el-icon {
  font-size: 16px;
}

.analysis-section {
  background-color: #f5f7fa;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 4px;
  line-height: 1.8;
  animation: slideDown 0.3s ease-out;
}

.analysis-block {
  margin-bottom: 16px;
}

.analysis-block:last-child {
  margin-bottom: 0;
}

.analysis-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.analysis-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
}

/* 详解内容HTML样式 */
.analysis-content :deep(strong) {
  font-weight: 600;
  color: #2262FB;
  margin-bottom: 6px;
}

.analysis-content :deep(br) {
  display: block;
  margin: 4px 0;
  content: "";
}

.analysis-content :deep(ul),
.analysis-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  gap: 16px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  flex: 1;
}

.meta-item {
  font-size: 13px;
  color: #909399;
}

.question-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-analysis,
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
  background-color: transparent;
  color: #2262FB;
  border: none;
}

.btn-analysis:hover,
.btn-add:hover {
  background-color: #f0f5ff;
}

.btn-add:active {
  background-color: #e0edff;
  transform: scale(0.98);
}

.btn-analysis .el-icon,
.btn-add .el-icon {
  font-size: 15px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

</style>

