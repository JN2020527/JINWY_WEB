<template>
  <div class="paper-center">
    <!-- 主体内容区 -->
    <div class="paper-content">
      <div class="content-container">
        <!-- 右侧操作与模板 -->
        <div class="right-sidebar">
          <div class="operation-panel">
            <div class="panel-header">
              <span class="panel-title">试卷操作</span>
            </div>
            <div class="operation-actions">
              <el-button @click="savePaper" size="small" plain>
                <el-icon><Check /></el-icon>
                保存
              </el-button>
              <el-button @click="previewPaper" size="small" plain>
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button @click="downloadZip" size="small" plain>
                <el-icon><Document /></el-icon>
                下载
              </el-button>
            </div>
          </div>

          <div class="template-panel">
          <div class="panel-header">
            <span class="panel-title">试卷模板</span>
            <div class="panel-actions">
              <el-button link size="small" @click="resetTemplate">重置</el-button>
              <el-button link size="small" @click="applyTemplate">完成</el-button>
            </div>
          </div>
          <div class="panel-section grid">
            <el-checkbox v-model="templateConfig.showTitle">主标题</el-checkbox>
            <el-checkbox v-model="templateConfig.showSubtitle">副标题</el-checkbox>
            <el-checkbox v-model="templateConfig.showInfoBar">试卷信息栏</el-checkbox>
            <el-checkbox v-model="templateConfig.showCandidateBar">考生输入栏</el-checkbox>
            <el-checkbox v-model="templateConfig.showScoreRegistry">得分框</el-checkbox>
            <el-checkbox v-model="templateConfig.showNotice">注意事项</el-checkbox>
          </div>

          <div class="panel-divider"></div>

          <div class="panel-section grid">
            <el-checkbox v-model="templateConfig.showGroupNote">展示题型名称</el-checkbox>
            <el-checkbox v-model="templateConfig.showQuestionNumber">展示题目编号</el-checkbox>
            <el-checkbox v-model="templateConfig.showQuestionScore">展示题目分数</el-checkbox>
            <el-checkbox v-model="templateConfig.useGroupIndependentNumbering">题型内排序</el-checkbox>
          </div>
          </div>
          
          <!-- 分组与排序（独立面板） -->
          <div class="sort-panel">
          <div class="panel-header">
            <span class="panel-title">分组与排序</span>
          </div>
          <div class="panel-section">
            <div class="sort-tabs">
              <div class="sort-tab active">按题型</div>
              <div class="sort-tab disabled">按知识点</div>
              <div class="sort-tab disabled">按加入顺序</div>
            </div>
          </div>
          
          <!-- 题型分组列表 -->
          <div class="panel-section group-list-section">
            <div class="group-section-header">
              <span class="section-number">第I卷</span>
              <span class="section-subtitle">选择题</span>
            </div>
            <div 
              v-for="(group, index) in questionGroups" 
              :key="group.typeName"
              class="group-list-item"
            >
              <div class="group-item-header">
                <span class="group-number">{{ getChineseNumber(index + 1) }}、</span>
                <span class="group-name">{{ group.typeName }}</span>
              </div>
              <div class="group-item-range">{{ getGroupQuestionRange(group, index) }}</div>
            </div>
            
            <!-- 自定义题型按钮 -->
            <div class="custom-type-btn" @click="addCustomType">
              <el-icon><Plus /></el-icon>
              <span>自定义题型</span>
            </div>
          </div>
          
          <!-- 清空按钮 -->
          <div class="panel-section">
            <el-button class="clear-button" @click="clearAllQuestions">
              清空试题
            </el-button>
          </div>
        </div>
        </div>

        <!-- 试题列表（居中显示） -->
        <div class="question-list-panel">
        <!-- 试卷标题区域 -->
        <div class="paper-title-area">
          <el-input 
            v-if="templateConfig.showTitle"
            v-model="paperInfo.title" 
            class="paper-title-input"
            placeholder="请输入试卷主标题"
            size="large"
          />
          <el-input 
            v-if="templateConfig.showSubtitle"
            v-model="paperInfo.subtitle"
            class="paper-subtitle-input"
            placeholder="请输入试卷副标题"
            size="default"
          />
          <div class="paper-stats" v-if="templateConfig.showInfoBar">
            <span class="stat-item">共 <strong>{{ totalQuestions }}</strong> 题</span>
            <span class="stat-divider">|</span>
            <span class="stat-item">满分 <strong>{{ totalScore }}</strong> 分</span>
          </div>
          <div class="candidate-bar" v-if="templateConfig.showCandidateBar">
            <div class="candidate-row">
              <span class="label">姓名：</span><span class="line"></span>
              <span class="label">班级：</span><span class="line"></span>
              <span class="label">学号：</span><span class="line"></span>
            </div>
          </div>
        </div>

        <!-- 试题内容区 -->
        <div class="questions-area">
        <div v-if="templateConfig.showNotice" class="notice-area">
          <div class="notice-title">注意事项</div>
          <div class="notice-content">{{ templateConfig.noticeText || '请在规定时间内完成试卷。答题内容书写规范、工整，保持卷面整洁。' }}</div>
        </div>

        
        <!-- 分组排序 -->
        <div class="question-groups">
          <!-- 组间排序（改为普通列表） -->
          <template v-for="(group, groupIndex) in questionGroups" :key="group.typeName">
              <div 
                class="question-group"
                :class="{ selected: group.selected }"
              >
                <!-- 题型标题 -->
                <div class="group-header">
                  <div class="group-title" v-if="templateConfig.showGroupNote" @click="toggleGroupSelection(group)">
                    <span class="title-text">{{ getChineseNumber(groupIndex + 1) }}、{{ group.typeName }}</span>
                    <span class="title-meta" v-if="!group.hideScore">（共 {{ group.questions.length }} 题，{{ group.totalScore }} 分）</span>
                    <span class="title-meta" v-else>（共 {{ group.questions.length }} 题）</span>
                  </div>
                  <div v-if="group.selected" class="group-operations">
                    <el-button text size="small" @click.stop="toggleQuestionNumber(group)">
                      <el-icon><View /></el-icon>
                      {{ group.hideNumber ? '显示序号' : '隐藏序号' }}
                    </el-button>
                    <el-button text size="small" @click.stop="toggleQuestionScore(group)">
                      <el-icon><View /></el-icon>
                      {{ group.hideScore ? '显示分数' : '隐藏分数' }}
                    </el-button>
                    <el-button text size="small" @click.stop="setBatchScore(group)">
                      <el-icon><Edit /></el-icon>
                      批量设置分数
                    </el-button>
                    <el-button text size="small" @click.stop="moveGroupUp(groupIndex)" :disabled="groupIndex === 0">
                      <el-icon><Top /></el-icon>
                      上移
                    </el-button>
                    <el-button text size="small" @click.stop="moveGroupDown(groupIndex)" :disabled="groupIndex === questionGroups.length - 1">
                      <el-icon><Bottom /></el-icon>
                      下移
                    </el-button>
                  </div>
                </div>

                <!-- 组内题目列表 -->
                <template v-for="(question, qIndex) in group.questions" :key="question.id">
                    <div 
                      class="question-item"
                      :class="{ active: activeQuestionId === question.id }"
                      @click="toggleQuestionActive(question.id)"
                    >
                      <div class="question-main">
                        <div class="question-content-wrapper">
                          <div class="question-content">
                            <span v-if="templateConfig.showQuestionNumber && !group.hideNumber" class="question-number">{{ formatSerial(templateConfig.useGroupIndependentNumbering ? qIndex + 1 : getGlobalQuestionIndex(groupIndex, qIndex)) }}</span>
                            <span v-if="templateConfig.showQuestionScore && !group.hideScore" class="question-score">（{{ question.score }}分）</span>
                            <span class="question-text" v-html="question.content"></span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 得分框：当启用得分框且不是选择题时显示 -->
                      <div v-if="templateConfig.showScoreRegistry && (!question.options || question.options.length === 0)" class="score-container">
                        <table class="score-box-table">
                          <tbody>
                            <tr>
                              <td class="score-label">得分：</td>
                              <td class="score-input-cell"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <!-- 选择题选项 -->
                      <div v-if="question.options && question.options.length > 0" class="question-options">
                        <div 
                          v-for="option in question.options" 
                          :key="option.label"
                          class="option-item"
                        >
                          <span class="option-label">{{ option.label }}.</span>
                          <span class="option-text">{{ option.text }}</span>
                        </div>
                      </div>
                      <div v-if="activeQuestionId === question.id" class="question-footer">
                        <div class="question-operations">
                          <el-button text size="small" @click.stop="viewDetail(question, group, qIndex)">
                            <el-icon><View /></el-icon>
                            详情
                          </el-button>
                          <el-button text size="small" @click.stop="replaceQuestion(question)">
                            <el-icon><Refresh /></el-icon>
                            替换
                          </el-button>
                          <el-button text size="small" @click.stop="deleteQuestion(group, qIndex)">
                            <el-icon><Delete /></el-icon>
                            删除
                          </el-button>
                          <el-button text size="small" @click.stop="moveUp(group, qIndex)" :disabled="qIndex === 0">
                            <el-icon><ArrowUp /></el-icon>
                          </el-button>
                          <el-button text size="small" @click.stop="moveDown(group, qIndex)" :disabled="qIndex === group.questions.length - 1">
                            <el-icon><ArrowDown /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                </template>
              </div>
          </template>
        </div>

        
      </div>
      </div>
    </div>
    </div>

    <!-- 试题详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      title="试题详情"
      width="800px"
      :close-on-click-modal="false"
      class="question-detail-dialog"
    >
      <div v-if="selectedQuestion" class="dialog-detail-content">
        <!-- 试题信息 -->
        <div class="info-section">
          <div class="info-row">
            <span class="label">题号：</span>
            <span class="value">{{ selectedQuestion.displayNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">分值：</span>
            <span class="value">{{ selectedQuestion.score }} 分</span>
          </div>
          <div class="info-row">
            <span class="label">难度：</span>
            <span class="value">{{ selectedQuestion.difficulty }}</span>
          </div>
          <div class="info-row">
            <span class="label">题型：</span>
            <span class="value">{{ selectedQuestion.type }}</span>
          </div>
          <div class="info-row">
            <span class="label">来源：</span>
            <span class="value">{{ selectedQuestion.source }}</span>
          </div>
        </div>

        <!-- 答案 -->
        <div class="content-section">
          <div class="section-title">参考答案</div>
          <div class="section-content" v-html="selectedQuestion.answer"></div>
        </div>

        <!-- 解析 -->
        <div class="content-section" v-if="selectedQuestion.analysis">
          <div class="section-title">试题解析</div>
          <div class="section-content" v-html="selectedQuestion.analysis"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, Delete, ArrowUp, ArrowDown, View, Document, Printer, Check, Edit, Top, Bottom, Menu, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'

const props = defineProps({
  paperConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back', 'save'])

// 试卷信息
const paperInfo = ref({
  title: (props.paperConfig.title || props.paperConfig.catalogName) || '未命名试卷',
  subtitle: '',
  knowledgePoints: props.paperConfig.knowledgeIds || [],
  difficultyRatio: props.paperConfig.difficultyRatio || {}
})

// 试卷模板配置
const templateConfig = ref({
  kind: '测试',
  showTitle: true,
  showSubtitle: false,
  showInfoBar: true,
  showCandidateBar: false,
  showNotice: false,
  noticeText: '',
  showScoreRegistry: false,
  showSectionNote: false,
  showGroupNote: true,
  showQuestionNumber: true,
  showQuestionScore: true,
  useGroupIndependentNumbering: false,
  serialStyle: 'dot', // dot | paren
})

const resetTemplate = () => {
  templateConfig.value = {
    kind: '测试',
    showTitle: true,
    showSubtitle: false,
    showInfoBar: true,
    showCandidateBar: false,
    showNotice: false,
    noticeText: '',
    showScoreRegistry: false,
    showSectionNote: false,
    showGroupNote: true,
    showQuestionNumber: true,
    showQuestionScore: true,
    useGroupIndependentNumbering: false,
    serialStyle: 'dot',
  }
}

const applyTemplate = () => {
  ElMessage.success('模板设置已应用')
}

// 获取题组题号范围
const getGroupQuestionRange = (group, groupIndex) => {
  if (group.questions.length === 0) return '非选择题'
  
  const startNum = getGlobalQuestionIndex(groupIndex, 0)
  const endNum = getGlobalQuestionIndex(groupIndex, group.questions.length - 1)
  
  if (startNum === endNum) {
    return startNum
  }
  return `${startNum}-${endNum}`
}

// 清空所有试题
const clearAllQuestions = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有试题吗？此操作不可恢复！',
      '清空试题',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清空所有题组的题目
    questionGroups.value.forEach(group => {
      group.questions = []
      group.totalScore = 0
    })
    
    ElMessage.success('已清空所有试题')
  } catch {
    // 用户取消操作
  }
}

// 添加自定义题型
const addCustomType = () => {
  ElMessage.info('自定义题型功能开发中...')
}




// 更新组总分
const updateGroupTotalScore = (group) => {
  group.totalScore = group.questions.reduce((sum, question) => sum + (question.score || 0), 0)
}


// 试题分组数据（初中数学模拟数据）
const questionGroups = ref([
  {
    typeName: '选择题',
    typeValue: 'choice',
    expanded: true,
    selected: false,
    hideNumber: false,
    hideScore: false,
    questions: [
      {
        id: 1,
        displayNumber: '1',
        type: '选择题',
        score: 3,
        difficulty: '容易',
        source: '平台题库',
        content: '下列实数中，是无理数的是（　　）',
        options: [
          { label: 'A', text: '3.14' },
          { label: 'B', text: '√9' },
          { label: 'C', text: '-2' },
          { label: 'D', text: '√2' }
        ],
        answer: 'D',
        analysis: '无理数是指无限不循环小数。A选项3.14是有限小数，属于有理数；B选项√9=3是整数，属于有理数；C选项-2是整数，属于有理数；D选项√2是无限不循环小数，属于无理数。'
      },
      {
        id: 2,
        displayNumber: '2',
        type: '选择题',
        score: 3,
        difficulty: '容易',
        source: '2024年中考真题',
        content: '下列运算正确的是（　　）',
        options: [
          { label: 'A', text: 'a² + a² = a⁴' },
          { label: 'B', text: 'a³ × a² = a⁶' },
          { label: 'C', text: '(a²)³ = a⁶' },
          { label: 'D', text: 'a⁶ ÷ a² = a⁳' }
        ],
        answer: 'C',
        analysis: 'A选项应为a² + a² = 2a²；B选项应为a³ × a² = a⁵；C选项正确，(a²)³ = a⁶；D选项应为a⁶ ÷ a² = a⁴。'
      },
      {
        id: 3,
        displayNumber: '3',
        type: '选择题',
        score: 3,
        difficulty: '中等',
        source: '平台题库',
        content: '如图，在△ABC中，∠C=90°，AC=3，BC=4，则sinA的值是（　　）',
        options: [
          { label: 'A', text: '3/5' },
          { label: 'B', text: '4/5' },
          { label: 'C', text: '3/4' },
          { label: 'D', text: '4/3' }
        ],
        answer: 'B',
        analysis: '在Rt△ABC中，由勾股定理可得AB=5，因此sinA=BC/AB=4/5。'
      },
      {
        id: 4,
        displayNumber: '4',
        type: '选择题',
        score: 3,
        difficulty: '中等',
        source: '2023年中考真题',
        content: '一元二次方程x² - 4x + 3 = 0的解是（　　）',
        options: [
          { label: 'A', text: 'x₁=1, x₂=3' },
          { label: 'B', text: 'x₁=-1, x₂=-3' },
          { label: 'C', text: 'x₁=1, x₂=-3' },
          { label: 'D', text: 'x₁=-1, x₂=3' }
        ],
        answer: 'A',
        analysis: '因式分解：x² - 4x + 3 = (x-1)(x-3) = 0，所以x₁=1，x₂=3。'
      },
      {
        id: 5,
        displayNumber: '5',
        type: '选择题',
        score: 3,
        difficulty: '较难',
        source: '平台题库',
        content: '已知二次函数y=x²-2x-3的图象与x轴交于A、B两点（点A在点B的左侧），与y轴交于点C，顶点为D。下列说法正确的是（　　）',
        options: [
          { label: 'A', text: '点A的坐标为(-1, 0)' },
          { label: 'B', text: '点C的坐标为(0, 3)' },
          { label: 'C', text: '顶点D的坐标为(1, -4)' },
          { label: 'D', text: '当x>1时，y随x的增大而减小' }
        ],
        answer: 'C',
        analysis: 'A选项：令y=0，得x²-2x-3=0，解得x₁=-1，x₂=3，因为点A在点B的左侧，所以A(-1, 0)，B(3, 0)，A选项正确；B选项：令x=0，得y=-3，所以C(0, -3)，B选项错误；C选项：y=x²-2x-3=(x-1)²-4，所以顶点D(1, -4)，C选项正确；D选项：抛物线开口向上，对称轴为x=1，当x>1时，y随x的增大而增大，D选项错误。因此只有A和C正确，但题目要求选择一个答案，根据常见题型，应选C。'
      }
    ]
  },
  {
    typeName: '填空题',
    typeValue: 'blank',
    expanded: true,
    selected: false,
    hideNumber: false,
    hideScore: false,
    questions: [
      {
        id: 6,
        displayNumber: '6',
        type: '填空题',
        score: 4,
        difficulty: '容易',
        source: '平台题库',
        content: '计算：(-2)³ = _______。',
        answer: '-8',
        analysis: '(-2)³ = (-2)×(-2)×(-2) = -8。'
      },
      {
        id: 7,
        displayNumber: '7',
        type: '填空题',
        score: 4,
        difficulty: '容易',
        source: '平台题库',
        content: '分解因式：x² - 9 = _______。',
        answer: '(x+3)(x-3)',
        analysis: '利用平方差公式：x² - 9 = x² - 3² = (x+3)(x-3)。'
      },
      {
        id: 8,
        displayNumber: '8',
        type: '填空题',
        score: 4,
        difficulty: '中等',
        source: '2024年中考真题',
        content: '已知关于x的方程x² + mx + 1 = 0有两个相等的实数根，则m的值为_______。',
        answer: '±2',
        analysis: '方程有两个相等的实数根，则判别式Δ=m²-4=0，解得m=±2。'
      },
      {
        id: 9,
        displayNumber: '9',
        type: '填空题',
        score: 4,
        difficulty: '中等',
        source: '平台题库',
        content: '如图，在平面直角坐标系中，点A的坐标为(3,4)，则OA的长度为_______。',
        answer: '5',
        analysis: '由勾股定理：OA = √(3²+4²) = √25 = 5。'
      },
      {
        id: 10,
        displayNumber: '10',
        type: '填空题',
        score: 4,
        difficulty: '较难',
        source: '平台题库',
        content: '如图，在⊙O中，半径OA=5，弦AB=8，则圆心O到弦AB的距离为_______。',
        answer: '3',
        analysis: '过O作OC⊥AB于C，则AC=4，在Rt△OAC中，OC = √(OA²-AC²) = √(25-16) = 3。'
      }
    ]
  },
  {
    typeName: '解答题',
    typeValue: 'answer',
    expanded: true,
    selected: false,
    hideNumber: false,
    hideScore: false,
    questions: [
      {
        id: 11,
        displayNumber: '11',
        type: '解答题',
        score: 8,
        difficulty: '中等',
        source: '平台题库',
        content: '计算：<br/>（1）(-1)²⁰²⁴ + (π-3.14)⁰ - |1-√2| + √8<br/>（2）先化简，再求值：(a+2)² - (a+1)(a-1)，其中a=-1/2。',
        answer: '（1）原式 = 1 + 1 - (√2-1) + 2√2 = 3 - √2 + 2√2 = 3 + √2<br/>（2）原式 = a² + 4a + 4 - (a²-1) = 4a + 5，当a=-1/2时，原式 = 4×(-1/2) + 5 = 3',
        analysis: '第一小题考查实数的混合运算，注意运算顺序和符号；第二小题考查整式的化简求值。'
      },
      {
        id: 12,
        displayNumber: '12',
        type: '解答题',
        score: 8,
        difficulty: '中等',
        source: '2024年中考真题',
        content: '解方程：<br/>（1）x² - 4x - 5 = 0<br/>（2）3x(x-1) = 2(x-1)',
        answer: '（1）分解因式：(x-5)(x+1)=0，解得x₁=5，x₂=-1<br/>（2）移项得：3x(x-1)-2(x-1)=0，提取公因式：(x-1)(3x-2)=0，解得x₁=1，x₂=2/3',
        analysis: '第一小题用因式分解法求解；第二小题先移项再提取公因式。'
      },
      {
        id: 13,
        displayNumber: '13',
        type: '解答题',
        score: 10,
        difficulty: '较难',
        source: '平台题库',
        content: '如图，在△ABC中，AB=AC，点D在BC上，且AD⊥BC，点E在AC上，BE与AD交于点F。<br/>（1）求证：∠BAD=∠CAD；<br/>（2）若∠C=30°，AE=2，EC=3，求BF的长。',
        answer: '（1）证明：∵AB=AC，AD⊥BC，∴AD是BC的垂直平分线，∴∠BAD=∠CAD<br/>（2）在Rt△ACD中，∠C=30°，∴∠CAD=60°，由（1）知∠BAD=60°，∴∠BAC=120°...',
        analysis: '本题考查等腰三角形的性质和解直角三角形的应用。'
      }
    ]
  },
  {
    typeName: '几何证明题',
    typeValue: 'proof',
    expanded: true,
    questions: [
      {
        id: 14,
        displayNumber: '14',
        type: '几何证明题',
        score: 10,
        difficulty: '较难',
        source: '2023年中考真题',
        content: '如图，在平行四边形ABCD中，对角线AC、BD相交于点O，点E、F分别在AD、BC上，且AE=CF。<br/>求证：四边形EBFD是平行四边形。',
        answer: '证明：∵四边形ABCD是平行四边形，∴AD∥BC，AD=BC，OA=OC，OB=OD<br/>∵AE=CF，∴DE=BF<br/>∵AD∥BC，∴DE∥BF<br/>∴四边形EBFD是平行四边形',
        analysis: '本题考查平行四边形的判定与性质，关键是利用对角线互相平分的性质。'
      },
      {
        id: 15,
        displayNumber: '15',
        type: '几何证明题',
        score: 10,
        difficulty: '困难',
        source: '平台题库',
        content: '如图，在Rt△ABC中，∠ACB=90°，D是AB的中点，E是CD的中点，过点C作CF∥AB交AE的延长线于点F。<br/>（1）求证：四边形ADCF是菱形；<br/>（2）若AC=4，BC=3，求菱形ADCF的面积。',
        answer: '（1）证明：∵D是AB的中点，E是CD的中点，∴DE∥AC且DE=1/2AC...<br/>（2）在Rt△ABC中，AB=5，∴AD=2.5，CD=2.5，∴菱形ADCF的边长为2.5...',
        analysis: '本题综合考查菱形的判定、直角三角形的性质和勾股定理。'
      }
    ]
  },
  {
    typeName: '应用题',
    typeValue: 'application',
    expanded: true,
    questions: [
      {
        id: 16,
        displayNumber: '16',
        type: '应用题',
        score: 10,
        difficulty: '中等',
        source: '2024年中考真题',
        content: '某商店购进一批单价为20元的商品，经调查发现，该商品每天的销售量y（件）与销售单价x（元）满足一次函数关系y=-2x+80（20≤x≤40）。<br/>（1）求该商品每天的销售利润w（元）与销售单价x（元）之间的函数关系式；<br/>（2）当销售单价定为多少元时，每天可获得最大利润？最大利润是多少？',
        answer: '（1）w = (x-20)y = (x-20)(-2x+80) = -2x²+120x-1600<br/>（2）w = -2(x-30)²+200，∴当x=30时，w最大=200元',
        analysis: '本题考查一次函数和二次函数在实际问题中的应用。'
      },
      {
        id: 17,
        displayNumber: '17',
        type: '应用题',
        score: 12,
        difficulty: '较难',
        source: '平台题库',
        content: '甲、乙两地相距300km，一辆货车和一辆轿车先后从甲地出发驶向乙地。如图是它们离甲地的距离s（km）与货车行驶时间t（h）之间的函数图象。<br/>（1）求轿车离甲地的距离s与货车行驶时间t之间的函数关系式；<br/>（2）货车出发多长时间后，轿车追上货车？<br/>（3）轿车到达乙地时，货车距乙地还有多远？',
        answer: '（1）设轿车的函数关系式为s=kt+b，代入(1,60)和(4,300)，得s=80t-20<br/>（2）货车：s=60t，令60t=80t-20，解得t=1，∴货车出发1小时后轿车追上货车<br/>（3）轿车到达乙地时t=4，此时货车s=60×4=240km，∴距乙地还有60km',
        analysis: '本题考查一次函数的实际应用和行程问题的分析能力。'
      }
    ]
  },
  {
    typeName: '函数与图象',
    typeValue: 'function',
    expanded: true,
    questions: [
      {
        id: 18,
        displayNumber: '18',
        type: '函数与图象',
        score: 12,
        difficulty: '困难',
        source: '2023年中考真题',
        content: '如图，抛物线y=ax²+bx+c经过点A(-1,0)、B(3,0)、C(0,3)。<br/>（1）求抛物线的解析式；<br/>（2）点P在抛物线上，当△PAB的面积为8时，求点P的坐标；<br/>（3）点M在抛物线的对称轴上，点N在抛物线上，是否存在点M、N使得以A、B、M、N为顶点的四边形是平行四边形？若存在，求出点N的坐标；若不存在，请说明理由。',
        answer: '（1）设y=a(x+1)(x-3)，代入C(0,3)得：3=a×1×(-3)，∴a=-1，∴y=-(x+1)(x-3)=-x²+2x+3<br/>（2）AB=4，设P(x,y)，S△PAB=1/2×4×|y|=8，∴|y|=4...<br/>（3）对称轴为x=1，存在三种情况：①AB为边...②AB为对角线...',
        analysis: '本题是二次函数综合题，考查待定系数法、三角形面积、平行四边形的判定等知识。'
      }
    ]
  }
])

// 如果教辅目录传入了题目，按类型动态分组替换默认数据
const buildQuestionGroups = (questions = []) => {
  const mapType = (t) => {
    if (t === '选择题') return 'choice'
    if (t === '填空题') return 'blank'
    if (t === '解答题') return 'answer'
    if (t === '几何证明题') return 'proof'
    if (t === '应用题') return 'application'
    return 'other'
  }

  const groups = new Map()
  questions.forEach((q) => {
    const typeName = (q.type || '其他题').toString()
    if (!groups.has(typeName)) {
      groups.set(typeName, {
        typeName,
        typeValue: mapType(typeName),
        expanded: true,
        selected: false,
        hideNumber: false,
        hideScore: true,
        questions: []
      })
    }
    const group = groups.get(typeName)
    group.questions.push({
      id: q.id,
      displayNumber: '',
      type: typeName,
      score: q.score ?? 0,
      difficulty: q.difficulty ?? '',
      source: q.source ?? '教辅目录',
      content: q.content ?? '',
      options: q.options ?? [],
      answer: q.answer ?? '',
      analysis: q.analysis ?? ''
    })
  })

  const result = Array.from(groups.values())
  result.forEach(g => {
    g.totalScore = g.questions.reduce((sum, qq) => sum + (qq.score || 0), 0)
  })
  return result
}

if (props.paperConfig?.questions && Array.isArray(props.paperConfig.questions) && props.paperConfig.questions.length > 0) {
  questionGroups.value = buildQuestionGroups(props.paperConfig.questions)
}

// 试题详情弹窗
const showDetailDialog = ref(false)
const selectedQuestion = ref(null)

// 当前激活的题目（用于显示操作按钮）
const activeQuestionId = ref(null)

// 计算总题数
const totalQuestions = computed(() => {
  return questionGroups.value.reduce((sum, group) => sum + group.questions.length, 0)
})

// 获取题目全局索引（从1开始连续编号）
const getGlobalQuestionIndex = (groupIndex, qIndex) => {
  let globalIndex = 1
  // 累加前面所有组的题目数量
  for (let i = 0; i < groupIndex; i++) {
    globalIndex += questionGroups.value[i].questions.length
  }
  // 加上当前组内的索引
  globalIndex += qIndex
  return globalIndex
}

// 计算总分
const totalScore = computed(() => {
  return questionGroups.value.reduce((sum, group) => {
    return sum + group.questions.reduce((groupSum, q) => groupSum + q.score, 0)
  }, 0)
})

// 计算每个题组的总分
questionGroups.value.forEach(group => {
  group.totalScore = group.questions.reduce((sum, q) => sum + q.score, 0)
})

// 预计用时（按每分1分钟计算）
const estimatedTime = computed(() => {
  return Math.ceil(totalScore.value * 1.5)
})

// 将数字转换为中文数字
const getChineseNumber = (num) => {
  const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) {
    return chineseNumbers[num]
  } else if (num < 20) {
    return '十' + chineseNumbers[num - 10]
  } else if (num < 100) {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return chineseNumbers[tens] + '十' + (ones > 0 ? chineseNumbers[ones] : '')
  }
  return num.toString()
}

// 题号样式格式化
const formatSerial = (n) => {
  if (templateConfig.value.serialStyle === 'paren') {
    return `(${n})`
  }
  return `${n}.`
}

// 切换题目激活状态
const toggleQuestionActive = (questionId) => {
  if (activeQuestionId.value === questionId) {
    activeQuestionId.value = null
  } else {
    activeQuestionId.value = questionId
    // 取消所有题型组的选中状态
    questionGroups.value.forEach(group => {
      group.selected = false
    })
  }
}

// 查看试题详情
const viewDetail = (question, group, qIndex) => {
  selectedQuestion.value = {
    ...question,
    displayNumber: qIndex + 1,
    groupName: group.typeName
  }
  showDetailDialog.value = true
}

// 替换试题
const replaceQuestion = (question) => {
  ElMessage.info(`替换试题：${question.displayNumber}`)
  // TODO: 打开试题选择对话框
}

// 批量替换
const batchReplace = (group) => {
  ElMessage.info(`批量替换 ${group.typeName}`)
  // TODO: 打开批量替换对话框
}

// 删除试题
const deleteQuestion = (group, index) => {
  ElMessageBox.confirm(
    '确定要删除这道试题吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const deletedId = group.questions[index]?.id
    group.questions.splice(index, 1)
    // 重新计算题组总分
    group.totalScore = group.questions.reduce((sum, q) => sum + q.score, 0)
    ElMessage.success('删除成功')
    // 如果删除的是弹窗中显示的试题，关闭弹窗
    if (selectedQuestion.value?.id === deletedId) {
      showDetailDialog.value = false
      selectedQuestion.value = null
    }
  }).catch(() => {})
}

// 删除当前选中的试题（从弹窗中删除）
const deleteCurrentQuestion = () => {
  if (!selectedQuestion.value) return
  
  // 找到该试题所在的组和索引
  for (const group of questionGroups.value) {
    const index = group.questions.findIndex(q => q.id === selectedQuestion.value.id)
    if (index > -1) {
      deleteQuestion(group, index)
      break
    }
  }
}

// 上移
const moveUp = (group, index) => {
  if (index === 0) return
  const temp = group.questions[index]
  group.questions[index] = group.questions[index - 1]
  group.questions[index - 1] = temp
  // 更新组总分
  updateGroupTotalScore(group)
}

// 下移
const moveDown = (group, index) => {
  if (index === group.questions.length - 1) return
  const temp = group.questions[index]
  group.questions[index] = group.questions[index + 1]
  group.questions[index + 1] = temp
  // 更新组总分
  updateGroupTotalScore(group)
}

// 预览试卷
const previewPaper = () => {
  ElMessage.info('预览试卷功能')
  // TODO: 打开试卷预览对话框
}

// 导出Word
const exportWord = async () => {
  if (!paperInfo.value.title || paperInfo.value.title.trim().length === 0) {
    ElMessage.warning('请先输入试卷标题')
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
            font-family: "宋体", SimSun, serif;
            font-size: 12pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          .paper-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10pt;
          }
          .group-title {
            font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
            font-size: 12pt;
            font-weight: bold;
            margin-top: 15pt;
            margin-bottom: 10pt;
          }
          .question {
            margin-bottom: 15pt;
          }
          .question-number {
            display: inline;
          }
          .question-score {
            display: inline;
          }
          .question-content {
            display: inline;
          }
          .question-options {
            margin-top: 8pt;
            margin-left: 20pt;
          }
          .option {
            margin-bottom: 5pt;
          }
        </style>
      </head>
      <body>
        <div class="paper-title">${paperInfo.value.title}</div>
    `

    // 遍历题型组
    questionGroups.value.forEach((group, groupIndex) => {
      const groupMeta = group.hideScore 
        ? `（共 ${group.questions.length} 题）`
        : `（共 ${group.questions.length} 题，${group.totalScore} 分）`
      
      if (templateConfig.value.showGroupNote) {
        htmlContent += `
          <div class="group-title">
            ${getChineseNumber(groupIndex + 1)}、${group.typeName}${groupMeta}
          </div>
        `
      }

      // 遍历题目
      group.questions.forEach((question, qIndex) => {
        htmlContent += `<div class="question">`
        
        // 题号和分数
        if (!group.hideNumber) {
          htmlContent += `<span class="question-number">${qIndex + 1}. </span>`
        }
        if (!group.hideScore) {
          htmlContent += `<span class="question-score">（${question.score}分）</span>`
        }
        
        // 题目内容
        htmlContent += `<span class="question-content">${question.content}</span>`
        
        // 选项
        if (question.options && question.options.length > 0) {
          htmlContent += `<div class="question-options">`
          question.options.forEach(option => {
            htmlContent += `<div class="option">${option.label}. ${option.text}</div>`
          })
          htmlContent += `</div>`
        }
        
        htmlContent += `</div>`
      })
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
    link.download = `${paperInfo.value.title}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('Word文档导出成功！')
  } catch (error) {
    console.error('导出Word失败:', error)
    ElMessage.error('导出Word文档失败，请重试')
  }
}

// 导出PDF
const exportPDF = () => {
  ElMessage.success('正在导出PDF文档...')
  // TODO: 调用导出PDF接口
}

// 切换题型组选中状态
const toggleGroupSelection = (group) => {
  const wasSelected = group.selected
  // 先取消所有题型组的选中状态
  questionGroups.value.forEach(g => {
    g.selected = false
  })
  // 如果之前未选中，则选中当前题型组
  if (!wasSelected) {
    group.selected = true
    // 取消激活的题目
    activeQuestionId.value = null
  }
}

// 切换题号显示/隐藏
const toggleQuestionNumber = (group) => {
  group.hideNumber = !group.hideNumber
  ElMessage.success(group.hideNumber ? '已隐藏序号' : '已显示序号')
}

// 切换分数显示/隐藏
const toggleQuestionScore = (group) => {
  group.hideScore = !group.hideScore
  ElMessage.success(group.hideScore ? '已隐藏分数' : '已显示分数')
}

// 批量设置分数
const setBatchScore = async (group) => {
  const { value: score } = await ElMessageBox.prompt('请输入每题分数', '批量设置分数', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[0-9]+(\.[0-9]{1,2})?$/,
    inputErrorMessage: '请输入有效的分数（支持小数）',
    inputValue: group.questions[0]?.score || 0
  })
  
  if (score) {
    const numScore = parseFloat(score)
    group.questions.forEach(q => {
      q.score = numScore
    })
    // 重新计算该题组总分
    group.totalScore = group.questions.reduce((sum, q) => sum + q.score, 0)
    ElMessage.success(`已将 ${group.typeName} 的所有题目设置为 ${numScore} 分`)
  }
}

// 题型组上移
const moveGroupUp = (index) => {
  if (index === 0) return
  const temp = questionGroups.value[index]
  questionGroups.value[index] = questionGroups.value[index - 1]
  questionGroups.value[index - 1] = temp
  ElMessage.success('已上移')
}

// 题型组下移
const moveGroupDown = (index) => {
  if (index === questionGroups.value.length - 1) return
  const temp = questionGroups.value[index]
  questionGroups.value[index] = questionGroups.value[index + 1]
  questionGroups.value[index + 1] = temp
  ElMessage.success('已下移')
}

// 保存试卷
const savePaper = () => {
  if (!paperInfo.value.title || paperInfo.value.title.trim().length === 0) {
    ElMessage.warning('请输入试卷标题')
    return
  }
  
  ElMessage.success('试卷保存成功！')
  emit('save', {
    paperInfo: paperInfo.value,
    questionGroups: questionGroups.value
  })
}

// 生成 Word Blob（复用导出逻辑但不直接下载）
const buildWordHtml = () => {
  let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 2.54cm; }
          body { font-family: "宋体", SimSun, serif; font-size: 12pt; line-height: 1.3; margin: 0; padding: 0; }
          .paper-title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 10pt; }
          .group-title { font-family: "Microsoft YaHei", "微软雅黑", sans-serif; font-size: 12pt; font-weight: bold; margin-top: 15pt; margin-bottom: 10pt; }
          .question { margin-bottom: 15pt; }
          .question-number { display: inline; }
          .question-score { display: inline; }
          .question-content { display: inline; }
          .question-options { margin-top: 8pt; margin-left: 20pt; }
          .option { margin-bottom: 5pt; }
        </style>
      </head>
      <body>
        <div class="paper-title">${paperInfo.value.title}</div>
    `

  questionGroups.value.forEach((group, groupIndex) => {
    const groupMeta = group.hideScore 
      ? `（共 ${group.questions.length} 题）`
      : `（共 ${group.questions.length} 题，${group.totalScore} 分）`
    if (templateConfig.value.showGroupNote) {
      htmlContent += `
          <div class="group-title">
            ${getChineseNumber(groupIndex + 1)}、${group.typeName}${groupMeta}
          </div>
        `
    }
    group.questions.forEach((question, qIndex) => {
      htmlContent += `<div class="question">`
      if (!group.hideNumber) {
        htmlContent += `<span class="question-number">${qIndex + 1}. </span>`
      }
      if (!group.hideScore) {
        htmlContent += `<span class="question-score">（${question.score}分）</span>`
      }
      htmlContent += `<span class="question-content">${question.content}</span>`
      if (question.options && question.options.length > 0) {
        htmlContent += `<div class="question-options">`
        question.options.forEach(option => {
          htmlContent += `<div class="option">${option.label}. ${option.text}</div>`
        })
        htmlContent += `</div>`
      }
      htmlContent += `</div>`
    })
  })

  htmlContent += `</body></html>`
  return htmlContent
}

const generateWordBlob = () => {
  const htmlContent = buildWordHtml()
  return new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' })
}

// 生成 PDF Blob（简化文本版）
const stripHtml = (html) => {
  return (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
}

const generatePdfBlob = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginLeft = 40
  const marginTop = 60
  const lineHeight = 18
  let y = marginTop

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(16)
  doc.text(paperInfo.value.title || '未命名试卷', marginLeft, y)
  y += 26

  questionGroups.value.forEach((group, gi) => {
    doc.setFontSize(12)
    const meta = group.hideScore ? `（共 ${group.questions.length} 题）` : `（共 ${group.questions.length} 题，${group.totalScore} 分）`
    const title = `${getChineseNumber(gi + 1)}、${group.typeName}${meta}`
    if (y > 780) { doc.addPage(); y = marginTop }
    doc.text(title, marginLeft, y)
    y += lineHeight

    group.questions.forEach((q, qi) => {
      const num = group.hideNumber ? '' : `${qi + 1}. `
      const score = group.hideScore ? '' : `（${q.score}分）`
      const text = `${num}${stripHtml(q.content)}${score}`
      const chunks = doc.splitTextToSize(text, 500)
      chunks.forEach(chunk => {
        if (y > 780) { doc.addPage(); y = marginTop }
        doc.text(chunk, marginLeft, y)
        y += lineHeight
      })
      y += 4
    })
    y += 6
  })

  return doc.output('blob')
}

// 下载 Word+PDF 压缩包
const downloadZip = async () => {
  if (!paperInfo.value.title || paperInfo.value.title.trim().length === 0) {
    ElMessage.warning('请输入试卷标题')
    return
  }
  try {
    ElMessage.info('正在打包试卷（Word+PDF）...')
    const zip = new JSZip()
    const wordBlob = generateWordBlob()
    const pdfBlob = generatePdfBlob()
    const baseName = paperInfo.value.title
    zip.file(`${baseName}.doc`, wordBlob)
    zip.file(`${baseName}.pdf`, pdfBlob)

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName}-试卷包.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('试卷压缩包已下载！')
  } catch (e) {
    console.error('下载压缩包失败', e)
    ElMessage.error('下载压缩包失败，请重试')
  }
}
</script>

<style scoped>
.paper-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  --el-color-primary: #2262FB;
}

/* 主体内容区 */
.paper-content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 24px;
  overflow-y: auto;
}

/* 内容容器 */
.content-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 1200px;
  width: 100%;
}

/* 试题列表（A4纸宽度） */
.question-list-panel {
  flex: 1;
  max-width: 800px;
  background: #ffffff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 试卷标题区域 */
.paper-title-area {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.paper-title-input {
  width: 100%;
  margin-bottom: 12px;
}

.paper-title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  border: none;
  padding: 8px 16px;
}

.paper-title-input :deep(.el-input__inner:focus) {
  border: none;
  outline: none;
}

.paper-title-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent;
  padding: 0;
  transition: background-color 0.2s ease;
}

.paper-title-input :deep(.el-input__wrapper:hover) {
  box-shadow: none !important;
  background-color: #f5f7ff;
}

.paper-title-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
  background-color: #eef3ff;
  border: 1px solid #2262FB !important;
}

.paper-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-top: 0;
}

.stat-item strong {
  font-weight: 600;
  color: #2262FB;
  margin: 0 4px;
}

.stat-divider {
  color: #dcdfe6;
}

/* 左侧操作按钮 */
.right-sidebar {
  order: 3;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 0px;
  align-self: flex-start;
}

.operation-panel {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 12px;
}

.operation-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  grid-auto-rows: 36px;
  grid-auto-flow: row dense;
}

.operation-actions .el-button {
  width: 100%;
  height: 36px;
  padding: 0;
  border-radius: 3px;
  box-sizing: border-box;
  font-weight: 500;
  box-shadow: none;
}

.operation-actions .el-button {
  margin: 0; /* 清除默认外边距，避免栅格下不一致 */
}
.operation-actions .el-button + .el-button {
  margin-left: 0; /* 覆盖 Element Plus 默认的相邻按钮左边距 */
}

.operation-actions .el-button :deep(span) {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 0 12px;
}

.operation-actions .el-button :deep(.el-icon) {
  font-size: 18px;
  width: 18px;
  height: 18px;
  min-width: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Plain 样式统一为卡片按钮 */
.operation-actions .el-button.is-plain {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.operation-actions .el-button.is-plain:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #111827;
}

.operation-actions .el-button.is-plain:active {
  background-color: #e5e7eb;
}

/* Primary 强调按钮 */
.operation-actions .el-button.el-button--primary {
  background-color: #2262FB;
  border-color: #2262FB;
  color: #fff;
}

.operation-actions .el-button.el-button--primary:hover {
  background-color: #1e54d9;
  border-color: #1e54d9;
}

.operation-actions .el-button.el-button--primary:active {
  background-color: #1848bb;
  border-color: #1848bb;
}

/* 下载按钮占满一行（不再使用，已改为三列一行） */

/* 焦点可访问态 */
.operation-actions .el-button:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

/* 响应式：窄宽度时单列显示 */
@media (max-width: 240px) {
  .operation-actions {
    grid-template-columns: 1fr;
  }
}

/* 试题内容区 */
.questions-area {
  padding: 20px;
}

/* 右侧模板面板 */
.template-panel {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px 16px 8px;
}

/* 分组与排序面板（独立面板） */
.sort-panel {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px 16px 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.panel-title {
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.panel-title::before {
  content: "";
  display: inline-block;
  width: 2px;
  height: 16px;
  background-color: #2262FB;
  border-radius: 0;
  margin-right: 8px;
}
.panel-actions .el-button {
  color: #2877FF;
}
.panel-section {
  margin: 6px 0;
}
.panel-section.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
  justify-items: start;
  align-items: center;
}
.panel-divider {
  height: 0;
  background: transparent;
  border: none;
  margin: 10px 0;
}

.template-panel > .panel-divider:last-child {
  margin-top: 4px;
  margin-bottom: 0;
}

/* 分组与排序样式 */
.sort-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.sort-tab {
  padding: 6px 12px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  user-select: none;
  position: relative;
  bottom: -1px;
}

.sort-tab.active {
  color: #2262FB;
  border-bottom-color: #2262FB;
  font-weight: 500;
}

.sort-tab.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.sort-tab:not(.disabled):not(.active):hover {
  color: #2262FB;
}

/* 题组列表样式 */
.group-list-section {
  margin-top: 10px;
}

.group-section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #e4e7ed;
}

.section-number {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.section-subtitle {
  font-size: 12px;
  color: #909399;
}

.group-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px dashed #f0f0f0;
}

.group-list-item:last-child {
  border-bottom: none;
}

.group-item-header {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.group-number {
  font-weight: 600;
  color: #303133;
}

.group-name {
  color: #606266;
}

.group-item-range {
  color: #909399;
  font-size: 12px;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 2px;
}

/* 自定义题型按钮 */
.custom-type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  margin-top: 12px;
  color: #2877FF;
  font-size: 13px;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
  user-select: none;
}

.custom-type-btn:hover {
  color: #2262FB;
  border-color: #2877FF;
  background: #f5f7ff;
}

.custom-type-btn .el-icon {
  font-size: 14px;
}

/* 清空按钮样式 */
.clear-button {
  width: 100%;
  margin-top: 8px;
  color: #2877FF;
  border-color: #2877FF;
}

.clear-button:hover {
  color: #fff;
  background-color: #2877FF;
  border-color: #2877FF;
}

.panel-subtitle {
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
}

 

/* 副标题输入样式 */
.paper-subtitle-input {
  width: 100%;
  margin: 0 0 12px;
}
.paper-subtitle-input :deep(.el-input__inner) {
  font-size: 14px;
  text-align: center;
  border: none;
}
.paper-subtitle-input :deep(.el-input__inner:focus) {
  border: none;
  outline: none;
}
.paper-subtitle-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent;
  padding: 0;
  transition: background-color 0.2s ease;
}
.paper-subtitle-input :deep(.el-input__wrapper:hover) {
  box-shadow: none !important;
  background-color: #f5f7ff;
}

.paper-subtitle-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
  background-color: #eef3ff;
  border: 1px solid #2262FB !important;
}

/* 考生信息栏 */
.candidate-bar {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
.candidate-row {
  display: flex;
  gap: 16px;
  align-items: baseline;
  font-size: 14px;
}
.candidate-row .label {
  color: #606266;
}
.candidate-row .line {
  display: inline-block;
  width: 100px;
  border-bottom: 1px solid #dcdfe6;
  height: 0;
  line-height: 0;
  transform: translateY(-1px);
}

/* 注意事项 */
.notice-area {
  background: #fafafa;
  border: 1px dashed #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}
.notice-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.group-note {
  margin: 10px 20px 0;
  color: #909399;
  font-size: 13px;
}

/* 大题评分区（标题右上角占位） */
.group-header {
  position: relative;
}
.group-score-area {
  position: absolute;
  right: 0;
  top: 0;
}
.score-box {
  width: 68px;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  background: #fff;
}

.question-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 题型分组 */
.question-group {
  margin-bottom: 0;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 0;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.question-group.selected {
  background: #ffffff;
  border: 1px dashed #2262FB;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  user-select: none;
}

.group-operations {
  display: flex;
  gap: 4px;
  align-items: center;
}

.group-operations .el-button {
  padding: 4px 8px;
  font-size: 13px;
}

.group-operations .el-button .el-icon {
  margin-right: 2px;
}

/* 题型标题右侧操作按钮颜色：#2877FF */
.group-operations :deep(.el-button.is-text) {
  color: #2877FF;
}

.group-operations :deep(.el-button.is-text .el-icon) {
  color: #2877FF;
}

/* 禁用态降低对比度但保持蓝色系 */
.group-operations :deep(.el-button.is-text.is-disabled),
.group-operations :deep(.el-button.is-text.is-disabled .el-icon) {
  color: #AFC5FF;
}

.title-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.title-meta {
  font-size: 13px;
  color: #909399;
}

.group-actions {
  display: flex;
  gap: 8px;
}

/* 试题项 */
.group-questions {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.question-item {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0;
  padding: 12px 16px;
  margin: 0 -16px;
  transition: background-color 0.3s, border-color 0.3s;
  cursor: pointer;
}

.question-group.selected .question-item {
  background: #ffffff;
  border: 1px solid transparent;
}

.question-item:hover {
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
}

.question-item.active {
  background-color: transparent;
  border: 1px solid #2262FB;
}

.question-group.selected .question-item:hover {
  background-color: #f8f9ff;
  border-color: #2262FB;
}

.question-group.selected .question-item.active {
  background-color: transparent;
  border-color: #2262FB;
}

.question-main {
  display: block;
}

.question-number {
  display: inline;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 4px;
}

.question-score {
  display: inline;
  font-size: 13px;
  color: #999;
  font-weight: 500;
  margin-right: 8px;
}

.question-content-wrapper {
  display: block;
  width: 100%;
}

.question-content {
  display: block;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.question-text {
  display: inline;
}

/* 得分框容器样式 */
.score-container {
  display: flex;
  justify-content: flex-end;
  margin: 8px 0;
}

/* 得分框表格样式 */
.score-box-table {
  width: 130px;
  border: 1px solid #000000; /* 黑色边框 */
  border-collapse: collapse;
  font-size: 14px;
}

.score-box-table td {
  height: 32px;
  padding: 4px 8px;
  line-height: 1;
}

.score-label {
  width: 60px;
  text-align: right;
  border-right: 1px solid #000000; /* 黑色边框 */
}

.score-input-cell {
  width: 60px;
}

/* 选择题选项样式 */
.question-options {
  margin-top: 8px;
  margin-left: 0;
  margin-bottom: 8px;
  padding-left: 0;
}

.option-item {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  min-height: 25px;
}

.option-label {
  font-weight: 600;
  color: #303133;
  margin-right: 6px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.8;
}

.question-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
  margin-bottom: -6px; /* 抵消父级 question-item 的底部 12px 内边距，使上下间距一致 */
  margin-left: -16px;
  margin-right: -16px;
  padding-top: 6px;
  padding-bottom: 0; /* 与顶部 6px 配合、底部外边距抵消后，实现上下一致视觉距离 */
  padding-left: 16px;
  padding-right: 16px;
  border-top: 1px solid #2262FB;
}

.question-operations {
  display: flex;
  gap: 2px;
}

/* 压缩按钮高度与间距，整体栏更紧凑 */
.question-operations .el-button {
  padding: 0 6px;
  height: 26px;
  line-height: 26px;
  font-size: 12px;
}

.question-operations .el-button .el-icon {
  font-size: 14px;
}

/* 底部操作按钮与文字统一为品牌蓝色 */
.question-operations :deep(.el-button.is-text) {
  color: #2262FB;
}

.question-operations :deep(.el-button.is-text .el-icon) {
  color: #2262FB;
}

/* 禁用状态降低对比度但保持蓝色系 */
.question-operations :deep(.el-button.is-text.is-disabled),
.question-operations :deep(.el-button.is-text.is-disabled .el-icon) {
  color: #A7B9F9;
}

/* 弹窗内容 */
.dialog-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.info-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  padding: 6px 0;
  font-size: 14px;
}

.info-row .label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
}

.info-row .value {
  color: #303133;
  font-weight: 500;
}

.content-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #2262FB;
}

.section-content {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

/* 弹窗底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
