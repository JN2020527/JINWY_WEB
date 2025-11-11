<template>
  <div class="paper-center">
    <!-- 主体内容区 -->
    <div class="paper-content">
      <div class="content-container">
        <!-- 左侧操作按钮 -->
        <div class="action-buttons">
          <el-button @click="previewPaper" size="small" plain>
            <el-icon><View /></el-icon>
            预览试卷
          </el-button>
          <el-button @click="exportWord" size="small" plain>
            <el-icon><Document /></el-icon>
            导出Word
          </el-button>
          <el-button @click="exportPDF" size="small" plain>
            <el-icon><Printer /></el-icon>
            导出PDF
          </el-button>
          <el-button type="primary" @click="savePaper" size="small">
            <el-icon><Check /></el-icon>
            保存试卷
          </el-button>
        </div>

        <!-- 试题列表（居中显示） -->
        <div class="question-list-panel">
        <!-- 试卷标题区域 -->
        <div class="paper-title-area">
          <el-input 
            v-model="paperInfo.title" 
            class="paper-title-input"
            placeholder="请输入试卷标题"
            size="large"
          />
          <div class="paper-stats">
            <span class="stat-item">共 <strong>{{ totalQuestions }}</strong> 题</span>
            <span class="stat-divider">|</span>
            <span class="stat-item">满分 <strong>{{ totalScore }}</strong> 分</span>
          </div>
        </div>

        <!-- 试题内容区 -->
        <div class="questions-area">

        <div class="question-groups">
          <div 
            v-for="(group, groupIndex) in questionGroups" 
            :key="groupIndex"
            class="question-group"
            :class="{ selected: group.selected }"
          >
            <!-- 题型标题 -->
            <div class="group-header">
              <div class="group-title" @click="toggleGroupSelection(group)">
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

            <!-- 试题列表 -->
            <div class="group-questions">
                <div 
                  v-for="(question, qIndex) in group.questions"
                  :key="question.id"
                  class="question-item"
                  :class="{ active: activeQuestionId === question.id }"
                  @click="toggleQuestionActive(question.id)"
                >
                  <div class="question-main">
                    <span v-if="!group.hideNumber" class="question-number">{{ qIndex + 1 }}.</span>
                    <span v-if="!group.hideScore" class="question-score">（{{ question.score }}分）</span>
                    <div class="question-content-wrapper">
                      <div class="question-content" v-html="question.content"></div>
                    </div>
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
              </div>
            </div>
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
          <div class="section-content">{{ selectedQuestion.answer }}</div>
        </div>

        <!-- 解析 -->
        <div class="content-section" v-if="selectedQuestion.analysis">
          <div class="section-title">试题解析</div>
          <div class="section-content">{{ selectedQuestion.analysis }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, Delete, ArrowUp, ArrowDown, View, Document, Printer, Check, Edit, Top, Bottom } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  paperConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back', 'save'])

// 试卷信息
const paperInfo = ref({
  title: props.paperConfig.title || '未命名试卷',
  knowledgePoints: props.paperConfig.knowledgeIds || [],
  difficultyRatio: props.paperConfig.difficultyRatio || {}
})

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
          { label: 'D', text: 'a⁶ ÷ a² = a³' }
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

// 试题详情弹窗
const showDetailDialog = ref(false)
const selectedQuestion = ref(null)

// 当前激活的题目（用于显示操作按钮）
const activeQuestionId = ref(null)

// 计算总题数
const totalQuestions = computed(() => {
  return questionGroups.value.reduce((sum, group) => sum + group.questions.length, 0)
})

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
}

// 下移
const moveDown = (group, index) => {
  if (index === group.questions.length - 1) return
  const temp = group.questions[index]
  group.questions[index] = group.questions[index + 1]
  group.questions[index + 1] = temp
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
            font-family: "Times New Roman", "宋体", SimSun, serif;
            font-size: 12pt;
            line-height: 1.8;
            margin: 0;
            padding: 0;
          }
          .paper-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10pt;
          }
          .paper-info {
            text-align: center;
            font-size: 10.5pt;
            margin-bottom: 20pt;
          }
          .group-title {
            font-size: 14pt;
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
        <div class="paper-info">
          共 ${totalQuestions.value} 题&nbsp;&nbsp;|&nbsp;&nbsp;满分 ${totalScore.value} 分
        </div>
    `

    // 遍历题型组
    questionGroups.value.forEach((group, groupIndex) => {
      const groupMeta = group.hideScore 
        ? `（共 ${group.questions.length} 题）`
        : `（共 ${group.questions.length} 题，${group.totalScore} 分）`
      
      htmlContent += `
        <div class="group-title">
          ${getChineseNumber(groupIndex + 1)}、${group.typeName}${groupMeta}
        </div>
      `

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
</script>

<style scoped>
.paper-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
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
  gap: 0;
  max-width: 1000px;
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
  margin-bottom: 16px;
}

.paper-title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  border: none;
  padding: 8px 16px;
}

.paper-title-input :deep(.el-input__inner:focus) {
  border: 1px solid #2262FB;
}

.paper-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
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
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
  align-items: flex-end;
}

.action-buttons .el-button {
  width: 72px;
  height: 72px;
  padding: 0;
  border-radius: 0;
}

/* 除第一个按钮外，其他按钮向上移动1px，让边框重叠 */
.action-buttons .el-button:not(:first-child) {
  margin-top: -1px;
}

.action-buttons .el-button :deep(span) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.action-buttons .el-button :deep(.el-icon) {
  font-size: 24px;
  margin: 0;
}

/* 试题内容区 */
.questions-area {
  padding: 20px;
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
    margin-bottom: 0;
  }
  
  .question-number {
    display: inline;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    line-height: 1.8;
    margin-right: 4px;
  }
  
  .question-score {
    display: inline;
    font-size: 13px;
    color: #999;
    font-weight: 500;
    line-height: 1.8;
    white-space: nowrap;
    margin-right: 4px;
  }
  
  .question-content-wrapper {
    display: inline;
  }
  
  .question-content {
    display: inline;
    font-size: 14px;
    line-height: 1.8;
    color: #606266;
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .question-content :deep(p) {
    display: inline;
    line-height: 1.8;
  }
  
  .question-content :deep(*) {
    line-height: 1.8;
  }

.question-content :deep(br) {
  display: block;
  content: "";
  margin: 12px 0 8px 0;
  line-height: 0;
}

/* 选择题选项样式 */
.question-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
  margin-top: 8px;
  margin-bottom: 8px;
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
  margin-top: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-top: 12px;
  padding-left: 16px;
  padding-right: 16px;
  border-top: 1px solid #2262FB;
}

.question-operations {
  display: flex;
  gap: 2px;
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

