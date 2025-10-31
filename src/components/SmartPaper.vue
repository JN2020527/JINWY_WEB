<template>
  <div class="smart-paper">
    <!-- 选题组卷 -->
    <div v-if="currentTab === 0" class="question-selection">
      <!-- 左侧筛选栏 -->
      <div class="left-sidebar">
        <div class="sidebar-header">
          <span class="version-text">版本/滚动迁移·中考...</span>
        </div>
        
        <div class="sidebar-tabs">
          <div 
            :class="['tab-item', { active: sidebarTab === 'chapter' }]"
            @click="sidebarTab = 'chapter'"
          >
            按章节筛选
          </div>
          <div class="tab-divider">|</div>
          <div 
            :class="['tab-item', { active: sidebarTab === 'knowledge' }]"
            @click="sidebarTab = 'knowledge'"
          >
            按知识点筛选
          </div>
        </div>

        <div class="sidebar-content">
          <div class="knowledge-tree">
            <div 
              v-for="item in knowledgeTree" 
              :key="item.id"
              class="tree-item"
            >
              <div 
                class="tree-node"
                @click="toggleNode(item)"
              >
                <el-icon v-if="item.children" class="expand-icon" :class="{ expanded: item.expanded }">
                  <ArrowRight />
                </el-icon>
                <span class="node-label">{{ item.label }}</span>
              </div>
              <div v-if="item.expanded && item.children" class="tree-children">
                <div 
                  v-for="child in item.children" 
                  :key="child.id"
                  class="tree-child"
                  @click="selectKnowledge(child)"
                >
                  {{ child.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <!-- 筛选条件 -->
        <div class="filter-section">
        <!-- 试题来源 -->
        <div class="filter-row">
          <label class="filter-label">试题来源：</label>
          <div class="filter-options">
            <el-radio 
              v-for="item in sourceOptions" 
              :key="item.value"
              v-model="filters.source"
              :label="item.value"
              class="custom-radio"
            >
              {{ item.label }}
            </el-radio>
          </div>
        </div>

        <!-- 试题类型 -->
        <div class="filter-row">
          <label class="filter-label">试题类型：</label>
          <div class="filter-options">
            <el-radio 
              v-for="item in typeOptions" 
              :key="item.value"
              v-model="filters.type"
              :label="item.value"
              class="custom-radio"
            >
              {{ item.label }}
            </el-radio>
          </div>
        </div>

        <!-- 试题难度 -->
        <div class="filter-row">
          <label class="filter-label">试题难度：</label>
          <div class="filter-options">
            <el-radio 
              v-for="item in difficultyOptions" 
              :key="item.value"
              v-model="filters.difficulty"
              :label="item.value"
              class="custom-radio"
            >
              {{ item.label }}
            </el-radio>
          </div>
        </div>

        <!-- 年份 -->
        <div class="filter-row">
          <label class="filter-label">年份：</label>
          <div class="filter-options">
            <el-radio 
              v-for="item in yearOptions" 
              :key="item.value"
              v-model="filters.year"
              :label="item.value"
              class="custom-radio"
            >
              {{ item.label }}
            </el-radio>
          </div>
        </div>
      </div>

      <div class="question-list">
        <div 
          v-for="(question, index) in questionList" 
          :key="question.id"
          class="question-item"
        >
          <div class="question-header">
            <div class="question-text" v-html="question.content"></div>
            <button class="btn-screen" title="大屏演示" @click="openScreenPresentation(question, index)">
              <el-icon><Monitor /></el-icon>
              <span>大屏演示</span>
            </button>
          </div>
          
          <!-- 答案解析区域 -->
          <div v-if="question.showAnalysis" class="analysis-section">
            <div class="analysis-item">
              <strong>答案：</strong>{{ question.answer }}
            </div>
            <div class="analysis-item" v-if="question.analysis">
              <strong>解析：</strong>{{ question.analysis }}
            </div>
          </div>

          <div class="question-footer">
            <div class="question-meta">
              <span class="meta-item">题型：{{ question.type }}</span>
              <span class="meta-item">年份：{{ question.year }}</span>
              <span class="meta-item">所属地区：{{ question.region }}</span>
              <span class="meta-item">试题来源：{{ question.source }}</span>
            </div>
            <div class="question-actions">
              <button class="btn-analysis" @click="toggleAnalysis(question)">
                <el-icon><View /></el-icon>
                <span>{{ question.showAnalysis ? '收起解析' : '答案解析' }}</span>
              </button>
              <button class="btn-add">
                <el-icon><Plus /></el-icon>
                <span>加入组卷</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 快速组卷 -->
    <div v-else class="quick-paper">
      <div class="placeholder-container">
        <p class="placeholder-hint">快速组卷</p>
      </div>
    </div>

    <!-- 大屏演示 -->
    <ScreenPresentation
      :visible="showScreenPresentation"
      :question="currentPresentationQuestion"
      :questions="questionList"
      :current-index="currentPresentationIndex"
      @close="closeScreenPresentation"
      @change-question="changePresentationQuestion"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight, Monitor, View, Plus } from '@element-plus/icons-vue'
import ScreenPresentation from './ScreenPresentation.vue'

defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

// 左侧边栏tab
const sidebarTab = ref('knowledge')

// 知识点树形数据
const knowledgeTree = ref([
  {
    id: 1,
    label: '语言文字基础',
    expanded: false,
    children: []
  },
  {
    id: 2,
    label: '阅读与鉴赏',
    expanded: false,
    children: []
  },
  {
    id: 3,
    label: '写作',
    expanded: false,
    children: []
  }
])

// 切换节点展开/收起
const toggleNode = (node) => {
  if (node.children) {
    node.expanded = !node.expanded
  }
}

// 选择知识点
const selectKnowledge = (node) => {
  console.log('选择知识点:', node.label)
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

// 试题类型选项
const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '字词书写', value: 'word-writing' },
  { label: '现代文阅读', value: 'modern-reading' },
  { label: '文言文阅读', value: 'classical-reading' },
  { label: '名句名篇默写', value: 'famous-sentences' },
  { label: '诗歌鉴赏', value: 'poetry' },
  { label: '语言表达', value: 'language-expression' },
  { label: '名著阅读', value: 'classics-reading' },
  { label: '综合性学习', value: 'comprehensive' },
  { label: '作文', value: 'composition' },
  { label: '其他', value: 'other' },
  { label: '单选题', value: 'single-choice' },
  { label: '多选题', value: 'multiple-choice' },
  { label: '翻译', value: 'translation' },
  { label: '问答题', value: 'qa' },
  { label: '非选择题', value: 'non-choice' },
  { label: '知识梳理', value: 'knowledge-sort' },
  { label: '核心命题点', value: 'core-point' },
  { label: '随堂检测', value: 'class-test' },
  { label: '基础巩固练', value: 'basic-practice' },
  { label: '能力提升练', value: 'ability-improve' },
  { label: '课外迁移练·读书学习', value: 'extra-reading' },
  { label: '课外迁移练·文人雅趣', value: 'extra-culture' },
  { label: '古诗文阅读', value: 'ancient-reading' },
  { label: '课标文言文对比阅读', value: 'contrast-reading' }
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
  { label: '2021', value: '2021' },
  { label: '更早', value: 'earlier' }
]

// 模拟题目数据
const questionList = ref([
  {
    id: 1,
    content: '根据例句的形式另选一组意象仿写，表达对祖国的拳拳赤子之心，至少仿写两句。<br/><br/>例句：我是你河边上破旧的老水车，数百年来纺着疲惫的歌。',
    type: '语言表达',
    year: '年',
    region: '全国',
    source: '平台题库',
    answer: '我是你天空中飞翔的小鸟，时时刻刻搏击着风雨。我是你衣服上小小的纽扣，永远倾听着你心脏跳动的声音。',
    analysis: '',
    showAnalysis: false
  },
  {
    id: 2,
    content: '阅读下面的文字，完成下列小题。<br/><br/>在中国古代文学中，"山水"是一个重要的文学意象。古人常常借助山水来抒发情感，表达志向。请简要分析"山水"意象在古代文学中的作用。',
    type: '现代文阅读',
    year: '2023',
    region: '山西',
    source: '中考真题',
    answer: '山水意象在古代文学中主要有以下作用：1.寄托情感，表达作者的喜怒哀乐；2.象征品格，表现高洁的情操和志向；3.营造意境，增强作品的艺术感染力。',
    analysis: '山水是中国古代文学中最常见的意象之一，文人墨客常常通过描写山水来抒发内心情感，表达人生志向，同时也体现了中国传统文化中"天人合一"的思想。',
    showAnalysis: false
  },
  {
    id: 3,
    content: '请用"虽然...但是..."的句式造句，要求句子通顺，语意完整。',
    type: '语言表达',
    year: '2024',
    region: '全国',
    source: '平台题库',
    answer: '虽然天气很冷，但是同学们仍然坚持早起锻炼身体。',
    analysis: '此题考查关联词的使用，"虽然...但是..."表示转折关系，前后分句意思相反或相对。',
    showAnalysis: false
  },
  {
    id: 4,
    content: '下列句子中，标点符号使用正确的一项是（　　）<br/>A. 今天，我们学习了《背影》这篇课文。<br/>B. 你是去图书馆？还是去操场？<br/>C. 他问我："你吃饭了吗"？<br/>D. 这是一个美丽的、富饶的、历史悠久的城市。',
    type: '语言知识',
    year: '2023',
    region: '北京',
    source: '模拟试题',
    answer: 'A',
    analysis: 'A项标点符号使用正确。B项应为"你是去图书馆，还是去操场？"C项问号应在引号内。D项最后一个顿号应删除。',
    showAnalysis: false
  },
  {
    id: 5,
    content: '阅读下面的诗歌，回答问题。<br/><br/>《春望》<br/>国破山河在，城春草木深。<br/>感时花溅泪，恨别鸟惊心。<br/>烽火连三月，家书抵万金。<br/>白头搔更短，浑欲不胜簪。<br/><br/>问：请赏析"白头搔更短，浑欲不胜簪"的表现手法。',
    type: '古诗词鉴赏',
    year: '2024',
    region: '全国',
    source: '平台题库',
    answer: '运用了细节描写和夸张的手法，通过"搔"这一动作和"更短"的夸张描写，生动形象地表现了诗人因忧国忧民而愁白了头发的形象，深刻地表达了诗人内心的痛苦和焦虑。',
    analysis: '这两句诗是全诗的点睛之笔，诗人通过自己白发的细节描写，将个人的遭遇与国家的命运紧密联系在一起，表达了深沉的爱国情怀。',
    showAnalysis: false
  }
])

// 大屏演示相关
const showScreenPresentation = ref(false)
const currentPresentationQuestion = ref(null)
const currentPresentationIndex = ref(0)

// 打开大屏演示
const openScreenPresentation = (question, index) => {
  currentPresentationQuestion.value = question
  currentPresentationIndex.value = index
  showScreenPresentation.value = true
}

// 关闭大屏演示
const closeScreenPresentation = () => {
  showScreenPresentation.value = false
}

// 切换演示题目
const changePresentationQuestion = (index) => {
  currentPresentationIndex.value = index
  currentPresentationQuestion.value = questionList.value[index]
}

// 切换答案解析显示状态
const toggleAnalysis = (question) => {
  question.showAnalysis = !question.showAnalysis
}
</script>

<style scoped>
.smart-paper {
  padding: 20px 24px;
  min-height: 100%;
  background-color: #ffffff;
  border-radius: 5px 0 0 0;
}

/* 选题组卷样式 */
.question-selection {
  width: 100%;
  display: flex;
  gap: 20px;
  animation: fadeIn 0.3s;
}

/* 左侧边栏样式 */
.left-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.version-text {
  font-size: 14px;
  color: #303133;
}

.sidebar-tabs {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.tab-item {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #2262FB;
}

.tab-item.active {
  color: #2262FB;
  font-weight: 500;
}

.tab-divider {
  color: #dcdfe6;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.knowledge-tree {
  padding: 0 12px;
}

.tree-item {
  margin-bottom: 4px;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.tree-node:hover {
  background-color: #f5f7fa;
}

.expand-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #909399;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.node-label {
  font-size: 14px;
  color: #303133;
}

.tree-children {
  margin-left: 24px;
  margin-top: 4px;
}

.tree-child {
  padding: 8px 12px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.tree-child:hover {
  background-color: #f5f7fa;
  color: #2262FB;
}

/* 右侧内容区样式 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

/* 未选中状态的外圈 */
.custom-radio :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
  border-color: #dcdfe6;
  background-color: #ffffff;
}

/* 未选中状态的内圈（隐藏） */
.custom-radio :deep(.el-radio__inner::after) {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
}

/* hover效果 */
.custom-radio:hover :deep(.el-radio__inner) {
  border-color: #2262FB;
}

.custom-radio:hover :deep(.el-radio__label) {
  color: #2262FB;
}

/* 选中状态 */
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.question-header {
  position: relative;
  margin-bottom: 16px;
}

.question-text {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  padding-right: 120px;
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

.question-text :deep(br) {
  display: block;
  margin: 8px 0;
  content: "";
}

.analysis-section {
  background-color: #f5f7fa;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 4px;
  line-height: 1.8;
  animation: slideDown 0.3s ease-out;
}

.analysis-item {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
}

.analysis-item:last-child {
  margin-bottom: 0;
}

.analysis-item strong {
  font-weight: 600;
  margin-right: 4px;
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

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  gap: 20px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  flex: 1;
}

.meta-item {
  font-size: 14px;
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
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
  background-color: transparent;
  color: #2262FB;
}

.btn-analysis {
  border: none;
}

.btn-analysis:hover {
  background-color: #f0f5ff;
}

.btn-add {
  border: none;
}

.btn-add:hover {
  background-color: #f0f5ff;
}

.btn-analysis .el-icon,
.btn-add .el-icon {
  font-size: 16px;
}

/* 快速组卷样式 */
.quick-paper {
  width: 100%;
  height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>


