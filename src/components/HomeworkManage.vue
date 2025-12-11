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
      <!-- 筛选条件区域 -->
      <div class="list-filters">
        <!-- 第一行：班级筛选 + 时间筛选 + 查询输入框 -->
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">班级筛选：</span>
            <el-select v-model="selectedGrade" placeholder="全部" class="filter-select-grade" size="large">
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
              size="large"
            />
          </div>
          
          <div class="filter-item search-item">
            <el-input 
              v-model="homeworkSearchKeyword" 
              placeholder="查询作业名称" 
              class="filter-search-input"
              size="large"
            >
              <template #suffix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 第二行：所属学段 -->
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
        
        <!-- 第三行：所属学科 -->
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
          <!-- 主要内容区域：左右布局 -->
          <div class="homework-main">
            <!-- 左侧：标题和数据汇总 -->
            <div class="homework-left-container">
              <div class="homework-header">
              <el-tag type="primary" class="class-tag">{{ homework.class }}</el-tag>
              <span class="homework-title">{{ homework.title }}</span>
          </div>
          
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
            </div>
            
            <!-- 右侧：操作按钮 -->
            <div class="homework-right-container">
            <div class="homework-actions">
              <el-button class="action-btn-outline">作业讲评</el-button>
              <el-button class="action-btn-warning">试卷批阅</el-button>
              <el-button type="primary" class="action-btn-primary">查看学情</el-button>
              </div>
            </div>
          </div>
          
          <!-- 底部信息 -->
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
    <div v-else-if="currentTab === 2" class="question-selection">
      <!-- 左侧筛选栏 -->
      <div class="left-filter-area">
        <!-- 日期和年级筛选容器 -->
        <div class="date-grade-filter-container">
          <!-- 日期选择 -->
          <div class="filter-item-vertical">
            <label class="filter-item-label">日期</label>
            <el-date-picker
              v-model="wrongDateRange"
              type="daterange"
              range-separator="—"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              class="date-range-picker"
            />
          </div>

          <!-- 年级/班级选择 -->
          <div class="filter-item-vertical">
            <label class="filter-item-label">年级/班级</label>
            <el-select 
              v-model="selectedGradeClass" 
              placeholder="请选择年级班级"
              style="width: 100%"
              class="grade-class-selector"
            >
              <el-option label="七年级" value="grade-7" />
              <el-option label="八年级" value="grade-8" />
              <el-option label="九年级" value="grade-9" />
              <el-option label="七年级1班" value="grade-7-class-1" />
              <el-option label="八年级1班" value="grade-8-class-1" />
              <el-option label="九年级1班" value="grade-9-class-1" />
            </el-select>
          </div>
        </div>

        <!-- 作业名称筛选容器 -->
        <div class="homework-name-filter-container">
          <div class="container-header">
            <span class="header-title">— 作业名称 —</span>
          </div>

          <div class="sidebar-content">
            <div class="homework-name-list">
              <div 
                v-for="homework in filteredHomeworkList" 
                :key="homework.id"
                class="homework-name-item"
                :class="{ active: selectedHomeworkIds.includes(homework.id) }"
                @click="toggleHomeworkSelection(homework)"
              >
                <el-checkbox 
                  :model-value="selectedHomeworkIds.includes(homework.id)"
                  @click.stop="toggleHomeworkSelection(homework)"
                  class="homework-checkbox"
                />
                <span class="homework-name-text">{{ homework.title }}</span>
              </div>
              <div v-if="filteredHomeworkList.length === 0" class="empty-hint">
                暂无符合条件的作业
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <!-- 筛选条件 -->
        <div class="wrong-filter-section">
          <!-- 试题来源 -->
          <div class="wrong-filter-row">
            <label class="wrong-filter-label">试题来源：</label>
            <div class="wrong-filter-options">
              <el-radio 
                v-for="item in sourceOptions" 
                :key="item.value"
                v-model="wrongFilters.source"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </div>
          </div>

          <!-- 试题类型 -->
          <div class="wrong-filter-row">
            <label class="wrong-filter-label">试题类型：</label>
            <div class="wrong-filter-options">
              <el-radio 
                v-for="item in typeOptions" 
                :key="item.value"
                v-model="wrongFilters.type"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </div>
          </div>

          <!-- 试题难度 -->
          <div class="wrong-filter-row">
            <label class="wrong-filter-label">试题难度：</label>
            <div class="wrong-filter-options">
              <el-radio 
                v-for="item in difficultyOptions" 
                :key="item.value"
                v-model="wrongFilters.difficulty"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </div>
          </div>

          <!-- 年份 -->
          <div class="wrong-filter-row">
            <label class="wrong-filter-label">年份：</label>
            <div class="wrong-filter-options">
              <el-radio 
                v-for="item in yearOptions" 
                :key="item.value"
                v-model="wrongFilters.year"
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
            v-for="(question, index) in wrongQuestionList" 
            :key="question.id"
            class="question-item"
          >
            <div class="new-tag" v-if="index === 0">本月上新</div>
            <div class="question-header">
              <div class="question-main">
                <div class="feature-tags" v-if="question.tags && question.tags.length > 0">
                  <span class="feature-tag">{{ question.tags[0] }}</span>
                </div>
                <div class="question-text" v-html="question.content"></div>
              </div>
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
                <button class="btn-screen" title="大屏演示" @click="openScreenPresentation(question, index)">
                  <el-icon><Monitor /></el-icon>
                  <span>大屏演示</span>
                </button>
                <button class="btn-analysis" @click="toggleWrongAnalysis(question)">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Camera, Search, Delete, CaretRight, Monitor, View, Plus } from '@element-plus/icons-vue'

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
  },
  {
    id: 5,
    class: '2302班',
    title: '阶段测试卷（二）——法治教育',
    totalCount: 17,
    submitted: 4,
    reviewed: 4,
    unsubmitted: 13,
    source: '校本库',
    editTime: '2025-10-24'
  },
  {
    id: 6,
    class: '2302班',
    title: '中国古代史·第五单元 隋唐时期：繁荣与开放的时代',
    totalCount: 17,
    submitted: 6,
    reviewed: 6,
    unsubmitted: 11,
    source: '校本库',
    editTime: '2025-10-24'
  },
  {
    id: 7,
    class: '2302班',
    title: '基础篇',
    totalCount: 17,
    submitted: 7,
    reviewed: 7,
    unsubmitted: 10,
    source: '校本库',
    editTime: '2025-10-24'
  }
])

// 错题重练 - 日期范围选择
const wrongDateRange = ref([])

// 错题重练 - 年级/班级选择
const selectedGradeClass = ref('')

// 错题重练 - 选中的作业ID列表
const selectedHomeworkIds = ref([])

// 错题重练 - 作业列表数据（模拟数据）
const wrongHomeworkList = ref([
  {
    id: 'hw-1',
    title: '语文随堂测试',
    grade: 'grade-7',
    class: 'grade-7-class-1',
    date: '2025-11-05'
  },
  {
    id: 'hw-2',
    title: '第1节 实数',
    grade: 'grade-7',
    class: 'grade-7-class-1',
    date: '2025-11-06'
  },
  {
    id: 'hw-3',
    title: '课题1 物质的分类',
    grade: 'grade-8',
    class: 'grade-8-class-1',
    date: '2025-11-07'
  },
  {
    id: 'hw-4',
    title: '第三章 透镜及其应用',
    grade: 'grade-8',
    class: 'grade-8-class-1',
    date: '2025-11-08'
  },
  {
    id: 'hw-5',
    title: '阶段测试卷（二）——法治教育',
    grade: 'grade-9',
    class: 'grade-9-class-1',
    date: '2025-11-09'
  },
  {
    id: 'hw-6',
    title: '中国古代史·第五单元 隋唐时期',
    grade: 'grade-9',
    class: 'grade-9-class-1',
    date: '2025-11-10'
  },
  {
    id: 'hw-7',
    title: '现代文阅读理解专项训练',
    grade: 'grade-7',
    class: 'grade-7-class-1',
    date: '2025-11-11'
  }
])

// 错题重练 - 根据日期和年级班级筛选作业列表
const filteredHomeworkList = computed(() => {
  let result = wrongHomeworkList.value

  // 根据年级/班级筛选
  if (selectedGradeClass.value) {
    result = result.filter(hw => {
      // 如果选择的是年级（如"grade-7"），匹配该年级的所有班级
      if (selectedGradeClass.value.indexOf('class') === -1) {
        return hw.grade === selectedGradeClass.value
      }
      // 如果选择的是具体班级，精确匹配
      return hw.class === selectedGradeClass.value
    })
  }

  // 根据日期范围筛选
  if (wrongDateRange.value && wrongDateRange.value.length === 2) {
    const [startDate, endDate] = wrongDateRange.value
    result = result.filter(hw => {
      return hw.date >= startDate && hw.date <= endDate
    })
  }

  return result
})

// 错题重练 - 选择作业（多选）
const toggleHomeworkSelection = (homework) => {
  const index = selectedHomeworkIds.value.indexOf(homework.id)
  if (index > -1) {
    selectedHomeworkIds.value.splice(index, 1)
  } else {
    selectedHomeworkIds.value.push(homework.id)
  }
  console.log('当前选中的作业ID:', selectedHomeworkIds.value)
}

// 错题重练 - 筛选条件
const wrongFilters = ref({
  source: 'platform',
  type: 'all',
  difficulty: 'all',
  year: 'all'
})

// 错题重练 - 试题来源选项
const sourceOptions = [
  { label: '平台题库', value: 'platform' },
  { label: '本校上传', value: 'school' }
]

// 错题重练 - 试题类型选项
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
  { label: '作文', value: 'composition' }
]

// 错题重练 - 试题难度选项
const difficultyOptions = [
  { label: '全部', value: 'all' },
  { label: '容易', value: 'easy' },
  { label: '较易', value: 'moderate-easy' },
  { label: '一般', value: 'medium' },
  { label: '较难', value: 'moderate-hard' },
  { label: '困难', value: 'hard' }
]

// 错题重练 - 年份选项
const yearOptions = [
  { label: '全部', value: 'all' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '更早', value: 'earlier' }
]

// 错题重练 - 试题列表数据
const wrongQuestionList = ref([
  {
    id: 1,
    content: '根据例句仿句子，要求句式相同，修辞一致。<br/>例句：我是你河边上破旧的老水车，数百年来纺着疲惫的歌。',
    type: '语言表达',
    year: '2025',
    region: '山西',
    source: '原创好题',
    tags: ['教材母题', '新题型'],
    answer: '我是你黑夜中点亮的灯塔，为你照亮前行的路',
    analysis: '本题考查仿写句子的能力，需要保持句式结构和修辞手法的一致性。',
    showAnalysis: false
  },
  {
    id: 2,
    content: '在中国古代文学中，"山水"是一个重要的文学意象。请简要分析"山水"意象在古代文学中的作用。',
    type: '现代文阅读',
    year: '2025',
    region: '山西',
    source: '原创好题',
    tags: ['大单元', '跨学科'],
    answer: '"山水"意象在古代文学中具有多重作用：1.寄托情感；2.表达志向；3.营造意境。',
    analysis: '山水意象是中国古代文学的重要组成部分，常用来表达作者的情感、志向和人生态度。',
    showAnalysis: false
  }
])

// 错题重练 - 切换答案解析
const toggleWrongAnalysis = (question) => {
  question.showAnalysis = !question.showAnalysis
}

// 大屏演示相关（共用）
const showScreenPresentation = ref(false)
const currentPresentationQuestion = ref(null)

const openScreenPresentation = (question, index) => {
  currentPresentationQuestion.value = { ...question, index }
  showScreenPresentation.value = true
  console.log('打开大屏演示:', question.content)
}
</script>

<style scoped>
.homework-manage {
  padding: 20px 24px;
  min-height: 100%;
  border-radius: 5px 0 0 0;
}

/* 作业扫描样式 */
.scan-content {
  width: 100%;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
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
  font-size: 18px;
  background: #ffffff;
  padding: 20px;
  border-radius: 4px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-row:not(:first-child) {
  padding: 20px 0px 0px;
  height: 60px;
}

.filter-row .filter-label {
  font-size: 18px;
  color: #303133;
  white-space: nowrap;
  font-weight: 500;
  width: 100px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select-grade {
  width: 200px;
}

.filter-select-grade :deep(.el-input__inner) {
  font-size: 18px;
}

.filter-date-range {
  width: 350px;
}

.filter-date-range :deep(.el-input__inner) {
  font-size: 18px;
}

.search-item {
  margin-left: auto;
}

.filter-search-input {
  width: 300px;
}

.filter-search-input :deep(.el-input__inner) {
  font-size: 18px;
}

.filter-search-input :deep(.el-input__inner::placeholder) {
  font-size: 15px;
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
  font-size: 18px;
  border-radius: 4px;
  transition: all 0.3s;
  height: 40px;
  line-height: 40px;
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border-color: transparent;
}

.filter-tag-item.el-tag--primary {
  color: #2262FB;
  background-color: #F2F3F5;
  border-color: transparent;
  border-radius: 20px;
  font-weight: 600;
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
  padding: 16px 20px;
  transition: all 0.3s;
}

.homework-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 主要内容区域：左右布局 */
.homework-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f7fa;
}

/* 左侧容器：标题和数据汇总 */
.homework-left-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.homework-header {
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
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.homework-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
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

/* 右侧容器：操作按钮 */
.homework-right-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.homework-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  padding-top: 8px;
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

/* 错题重练样式 */
.question-selection {
  width: 100%;
  display: flex;
  gap: 20px;
  animation: fadeIn 0.3s;
}

/* 左侧筛选区域 */
.left-filter-area {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 日期和年级筛选容器 */
.date-grade-filter-container {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  padding: 16px;
}

.filter-item-vertical {
  margin-bottom: 16px;
}

.filter-item-vertical:last-child {
  margin-bottom: 0;
}

.filter-item-label {
  display: block;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  margin-bottom: 8px;
}

.date-range-picker :deep(.el-input__wrapper) {
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 12px !important;
  box-shadow: 0 0 0 1px #E4E7ED inset;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex !important;
  align-items: center !important;
}

.date-range-picker :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #C0C4CC inset;
}

.date-range-picker :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2262FB inset;
}

.date-range-picker :deep(.el-input__inner) {
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker :deep(.el-range-input) {
  font-size: 13px;
  text-align: center;
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker :deep(.el-range-separator) {
  font-size: 13px;
  color: #909399;
  padding: 0 4px;
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker :deep(.el-input__prefix),
.date-range-picker :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
  height: 40px !important;
}

.date-range-picker :deep(.el-input__prefix .el-icon),
.date-range-picker :deep(.el-input__suffix .el-icon) {
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker :deep(.el-range-editor) {
  height: 40px !important;
}

.date-range-picker :deep(.el-date-editor) {
  height: 40px !important;
}

.grade-class-selector :deep(.el-select__wrapper) {
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 12px !important;
  box-shadow: 0 0 0 1px #E4E7ED inset;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex !important;
  align-items: center !important;
}

.grade-class-selector :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #C0C4CC inset;
}

.grade-class-selector :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #2262FB inset;
}

.grade-class-selector :deep(.el-select__input) {
  height: 40px !important;
  line-height: 40px !important;
}

.grade-class-selector :deep(.el-select__placeholder) {
  line-height: 40px !important;
}

.grade-class-selector :deep(.el-select__suffix) {
  height: 40px !important;
  display: flex;
  align-items: center;
}

/* 知识点筛选容器 */
.knowledge-filter-container {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  max-height: calc(100vh - 380px);
  padding: 16px;
}

/* 容器头部 */
.container-header {
  margin-bottom: 12px;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #E4E7ED;
}

.header-title {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.homework-name-filter-container {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 16px;
}


.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  min-height: 0;
}

.knowledge-tree {
  display: flex;
  flex-direction: column;
}

.catalog-item {
  margin-bottom: 0;
}

.catalog-item + .catalog-item {
  margin-top: 2px;
}

.catalog-node {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  user-select: none;
  min-height: 32px;
}

.catalog-node:hover {
  background: #f5f7fa;
}

.homework-name-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  margin-bottom: 4px; /* 减少间距 */
}

.homework-name-item:hover {
  background: #f5f7fa;
}

.homework-name-item.active {
  background: #ecf5ff;
}

.homework-checkbox {
  margin-right: 12px; /* Checkbox与文字的间距 */
  height: auto;
}

.homework-name-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  flex: 1;
}

.homework-name-item.active .homework-name-text {
  color: #2262FB;
  font-weight: 500;
}

.catalog-node .expand-icon-wrapper {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-right: 6px;
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
  line-height: 20px;
  user-select: none;
}

.catalog-node.active .node-label {
  color: #2262FB;
  font-weight: 500;
}

.level-1 {
  font-size: 14px;
  font-weight: 500;
  min-height: 32px;
}

.level-1 .node-label {
  line-height: 20px;
  font-size: 14px;
}

.level-1 .expand-icon-wrapper {
  margin-right: 6px;
}

.level-2 {
  padding-left: 34px;
  font-size: 14px;
  min-height: 28px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.level-2 .node-label {
  line-height: 20px;
  font-size: 14px;
}

.catalog-children {
  margin: 0;
}

/* 右侧内容区样式 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 错题重练 - 筛选区域样式 */
.wrong-filter-section {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.wrong-filter-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.wrong-filter-row:last-child {
  margin-bottom: 0;
}

.wrong-filter-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 14px;
  color: #303133;
  line-height: 32px;
  text-align: right;
  padding-right: 12px;
}

.wrong-filter-options {
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
  position: relative;
  overflow: hidden;
}

.new-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #F56C6C, #E64242);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 0 0 0 8px;
  z-index: 2;
  box-shadow: -1px 1px 4px rgba(245, 108, 108, 0.2);
  font-weight: 500;
}

.question-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.question-header {
  position: relative;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.question-main {
  flex: 1;
  min-width: 0;
}

.feature-tags {
  float: left;
  margin-right: 8px;
  margin-top: 3px;
}

.feature-tag {
  font-size: 12px;
  padding: 1px 10px;
  border-radius: 12px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  color: #2262FB;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.question-text {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
}

.btn-screen {
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
  border: none;
}

.btn-screen:hover {
  background-color: #f0f5ff;
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
  border: 1px solid #2262FB;
}

.btn-add:hover {
  background-color: #f0f5ff;
}

.btn-analysis .el-icon,
.btn-add .el-icon {
  font-size: 16px;
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

<style>
/* 错题重练 - 日期选择器全局样式覆盖 */
.date-range-picker.el-date-editor {
  height: 40px !important;
}

.date-range-picker.el-date-editor .el-input__wrapper {
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 12px !important;
}

.date-range-picker.el-date-editor .el-range-input {
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker.el-date-editor .el-range-separator {
  height: 40px !important;
  line-height: 40px !important;
}

.date-range-picker.el-date-editor .el-input__prefix,
.date-range-picker.el-date-editor .el-input__suffix {
  height: 40px !important;
}
</style>


