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
            <span class="stat-divider">|</span>
            <span class="stat-item">预计用时 <strong>{{ estimatedTime }}</strong> 分钟</span>
          </div>
        </div>

        <!-- 试题内容区 -->
        <div class="questions-area">

        <div class="question-groups">
          <div 
            v-for="(group, groupIndex) in questionGroups" 
            :key="groupIndex"
            class="question-group"
          >
            <!-- 题型标题 -->
            <div class="group-header">
              <div class="group-title">
                <span class="title-text">{{ getChineseNumber(groupIndex + 1) }}、{{ group.typeName }}</span>
                <span class="title-meta">（共 {{ group.questions.length }} 题，{{ group.totalScore }} 分）</span>
              </div>
              <div class="group-actions">
                <el-button text size="small" @click.stop="batchReplace(group)">批量替换</el-button>
              </div>
            </div>

            <!-- 试题列表 -->
            <div class="group-questions">
                <div 
                  v-for="(question, qIndex) in group.questions"
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-main">
                    <span class="question-number">{{ qIndex + 1 }}.</span>
                    <span class="question-score">（{{ question.score }}分）</span>
                    <div class="question-content-wrapper">
                      <div class="question-content" v-html="question.content"></div>
                    </div>
                  </div>
                  <div class="question-footer">
                    <div class="question-tags">
                      <el-tag size="small" type="info">{{ question.difficulty }}</el-tag>
                      <el-tag size="small" type="info">{{ question.source }}</el-tag>
                    </div>
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

        <!-- 试题内容 -->
        <div class="content-section">
          <div class="section-title">试题内容</div>
          <div class="section-content" v-html="selectedQuestion.content"></div>
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

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replaceQuestion(selectedQuestion)">
            <el-icon><Refresh /></el-icon>
            替换此题
          </el-button>
          <el-button type="danger" @click="deleteCurrentQuestion">
            <el-icon><Delete /></el-icon>
            删除此题
          </el-button>
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, Delete, ArrowUp, ArrowDown, View, Document, Printer, Check } from '@element-plus/icons-vue'
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
    questions: [
      {
        id: 1,
        displayNumber: '1',
        type: '选择题',
        score: 3,
        difficulty: '容易',
        source: '平台题库',
        content: '下列实数中，是无理数的是（　　）<br/>A. 3.14　　B. √9　　C. -2　　D. √2',
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
        content: '下列运算正确的是（　　）<br/>A. a² + a² = a⁴　　B. a³ × a² = a⁶　　C. (a²)³ = a⁶　　D. a⁶ ÷ a² = a³',
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
        content: '如图，在△ABC中，∠C=90°，AC=3，BC=4，则sinA的值是（　　）<br/>A. 3/5　　B. 4/5　　C. 3/4　　D. 4/3',
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
        content: '一元二次方程x² - 4x + 3 = 0的解是（　　）<br/>A. x₁=1, x₂=3　　B. x₁=-1, x₂=-3　　C. x₁=1, x₂=-3　　D. x₁=-1, x₂=3',
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
        content: '如图，抛物线y=ax²+bx+c的对称轴为直线x=1，与x轴的一个交点在点(3,0)和(4,0)之间，其部分图象如图所示，则下列结论：①abc<0；②4a+c<0；③2a-b=0；④-1<a<0。其中正确的有（　　）<br/>A. 1个　　B. 2个　　C. 3个　　D. 4个',
        answer: 'C',
        analysis: '根据抛物线的开口方向、对称轴和与坐标轴的交点位置，可以逐一判断各个结论的正误。'
      }
    ]
  },
  {
    typeName: '填空题',
    typeValue: 'blank',
    expanded: true,
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
const exportWord = () => {
  ElMessage.success('正在导出Word文档...')
  // TODO: 调用导出Word接口
}

// 导出PDF
const exportPDF = () => {
  ElMessage.success('正在导出PDF文档...')
  // TODO: 调用导出PDF接口
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
  background: #f5f7fa;
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
  gap: 12px;
}

/* 题型分组 */
.question-group {
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 8px 0;
}

.question-item {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.question-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.question-main {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 8px;
}

.question-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
  line-height: 1.6;
}

.question-content-wrapper {
  flex: 1;
  min-width: 0;
}

.question-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.question-score {
  font-size: 13px;
  color: #999;
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1.6;
  white-space: nowrap;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-tags {
  display: flex;
  gap: 8px;
}

.question-operations {
  display: flex;
  gap: 4px;
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

