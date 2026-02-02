<template>
  <div class="smart-paper">
    <!-- 选题组卷 -->
    <div v-if="currentTab === 0" class="question-selection">
      <!-- 左侧筛选栏 -->
      <div class="left-filter-area">
        <!-- 教材版本筛选容器 -->
        <div class="textbook-filter-container">
          <div class="container-header">
            <span class="header-title">教材版本</span>
        </div>
          <div class="textbook-selector">
            <el-select 
              v-model="selectedTextbook" 
              placeholder="请选择教材版本"
              style="width: 100%"
            >
              <el-option label="滚动迁移(2026)／中考版" value="gundong-2026-zhongkao" />
              <el-option label="人教版·七年级上" value="renjiao-7-1" />
              <el-option label="苏教版·八年级下" value="sujiao-8-2" />
            </el-select>
          </div>
          </div>

        <!-- 知识点筛选容器 -->
        <div class="knowledge-filter-container">
          <div class="filter-tabs">
            <div 
              class="filter-tab" 
              :class="{ active: currentFilterTab === 'knowledge' }"
              @click="currentFilterTab = 'knowledge'"
            >
              知识点
            </div>
            <div 
              class="filter-tab" 
              :class="{ active: currentFilterTab === 'topic' }"
              @click="currentFilterTab = 'topic'"
            >
              专题
            </div>
          </div>

          <div class="sidebar-content">
            <!-- 知识点树 -->
            <div class="knowledge-tree" v-show="currentFilterTab === 'knowledge'">
              <div 
                v-for="item in knowledgeTree" 
                :key="item.id"
                class="catalog-item"
              >
                <div 
                  class="catalog-node level-1"
                  :class="{ active: selectedKnowledgeId === item.id }"
                  @click="toggleNode(item)"
                >
                  <span class="expand-icon-wrapper">
                    <el-icon v-if="item.children && item.children.length > 0" class="expand-icon" :class="{ expanded: item.expanded }">
                      <CaretRight />
                    </el-icon>
                  </span>
                  <span class="node-label">{{ item.label }}</span>
                </div>
                <div v-if="item.expanded && item.children && item.children.length > 0" class="catalog-children">
                  <div 
                    v-for="child in item.children" 
                    :key="child.id"
                    class="catalog-node level-2"
                    :class="{ active: selectedKnowledgeId === child.id }"
                    @click="selectKnowledge(child)"
                  >
                    <span class="node-label">{{ child.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 专题树 -->
            <div class="knowledge-tree" v-show="currentFilterTab === 'topic'">
              <div 
                v-for="item in topicTree" 
                :key="item.id"
                class="catalog-item"
              >
                <div 
                  class="catalog-node level-1"
                  :class="{ active: selectedTopicId === item.id }"
                  @click="toggleTopicNode(item)"
                >
                  <span class="expand-icon-wrapper">
                    <el-icon v-if="item.children && item.children.length > 0" class="expand-icon" :class="{ expanded: item.expanded }">
                      <CaretRight />
                    </el-icon>
                  </span>
                  <span class="node-label">{{ item.label }}</span>
                </div>
                <div v-if="item.expanded && item.children && item.children.length > 0" class="catalog-children">
                  <div 
                    v-for="child in item.children" 
                    :key="child.id"
                    class="catalog-node level-2"
                    :class="{ active: selectedTopicId === child.id }"
                    @click="selectTopic(child)"
                  >
                    <span class="node-label">{{ child.label }}</span>
                  </div>
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


        <!-- 特色筛选 -->


        <!-- 试题来源 -->
        <!-- 试题来源 -->
        <div class="filter-row" style="display: none;">
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

        <!-- 题源类型 -->
        <div class="filter-row" v-if="filters.source === 'platform'">
          <label class="filter-label">题源：</label>
          <div class="filter-options">
            <template v-if="!isMultiSelectSourceType">
              <el-radio
                v-for="item in sourceTypeOptions"
                :key="item.value"
                v-model="filters.sourceType"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </template>
            <template v-else>
              <el-checkbox
                v-for="item in sourceTypeOptions"
                :key="item.value"
                v-model="filters.sourceType"
                :label="item.value"
                class="custom-checkbox"
                @change="(val) => handleSourceTypeChange(val, item.value)"
              >
                {{ item.label }}
              </el-checkbox>
            </template>

            <div
              class="multi-select-btn"
              :class="{ active: isMultiSelectSourceType }"
              @click="handleSourceTypeModeChange(!isMultiSelectSourceType)"
            >
              <span v-if="!isMultiSelectSourceType">+ 多选</span>
              <span v-else>取消多选</span>
            </div>
          </div>
        </div>

        <!-- 试题类型 -->
        <div class="filter-row">
          <label class="filter-label">题型：</label>
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

        <!-- 子题型（动态显示） -->
        <div class="filter-row sub-type-row" v-if="subTypeOptions.length > 0" :style="{ '--arrow-left': arrowLeft }">
          <label class="filter-label">子题型：</label>
          <div class="filter-options">
            <div
              v-for="item in subTypeOptions"
              :key="item.value"
              class="sub-type-tag"
              :class="{ active: filters.subType === item.value }"
              @click="filters.subType = item.value"
            >
              {{ item.label }}
            </div>
          </div>
        </div>

        <!-- 试题难度 -->
        <div class="filter-row">
          <label class="filter-label">难度：</label>
          <div class="filter-options">
            <template v-if="!isMultiSelectDifficulty">
              <el-radio
                v-for="item in difficultyOptions"
                :key="item.value"
                v-model="filters.difficulty"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </template>
            <template v-else>
              <el-checkbox
                v-for="item in difficultyOptions"
                :key="item.value"
                v-model="filters.difficulty"
                :label="item.value"
                class="custom-checkbox"
                @change="(val) => handleDifficultyChange(val, item.value)"
              >
                {{ item.label }}
              </el-checkbox>
            </template>

            <div
              class="multi-select-btn"
              :class="{ active: isMultiSelectDifficulty }"
              @click="handleDifficultyModeChange(!isMultiSelectDifficulty)"
            >
              <span v-if="!isMultiSelectDifficulty">+ 多选</span>
              <span v-else>取消多选</span>
            </div>
          </div>
        </div>

        <!-- 中考特色重点强调区域 -->
        <div class="featured-row">
          <div class="hot-badge">学科特色</div>
          <!-- 中考特色 -->
          <div class="filter-row">
            <label class="filter-label">特色：</label>
            <div class="filter-options">
              <el-radio
                v-for="item in featureOptions"
                :key="item.value"
                v-model="filters.features"
                :label="item.value"
                class="custom-radio"
              >
                {{ item.label }}
              </el-radio>
            </div>
          </div>
        </div>

        <!-- 更多筛选 -->
        <div class="filter-row">
          <label class="filter-label">更多：</label>
          <div class="filter-options">

            <!-- 年份 -->
            <el-dropdown trigger="hover" @command="(val) => filters.year = val" class="filter-dropdown">
              <span class="el-dropdown-link borderless-select">
                {{ getLabel(yearOptions, filters.year, '年份') }}
                <el-icon
                  class="el-icon--right"
                  v-if="filters.year === 'all'"
                >
                  <arrow-down />
                </el-icon>
                <el-icon
                  class="el-icon--right clear-icon"
                  v-else
                  @click.stop="filters.year = 'all'"
                >
                  <Close />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all" :class="{ 'is-selected': filters.year === 'all' }">全部年份</el-dropdown-item>
                  <el-dropdown-item v-for="item in yearOptions.filter(o => o.value !== 'all')" :key="item.value" :command="item.value" :class="{ 'is-selected': filters.year === item.value }">{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 地区 -->
            <el-dropdown trigger="hover" @command="(val) => filters.region = val" class="filter-dropdown">
              <span class="el-dropdown-link borderless-select">
                {{ getLabel(regionOptions, filters.region, '地区') }}
                <el-icon
                  class="el-icon--right"
                  v-if="filters.region === 'national'"
                >
                  <arrow-down />
                </el-icon>
                <el-icon
                  class="el-icon--right clear-icon"
                  v-else
                  @click.stop="filters.region = 'national'"
                >
                  <Close />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in regionOptions" :key="item.value" :command="item.value" :class="{ 'is-selected': filters.region === item.value }">{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 素养 -->
            <el-dropdown trigger="hover" @command="(val) => filters.examMethod = val" class="filter-dropdown">
              <span class="el-dropdown-link borderless-select">
                {{ getLabel(examMethodOptions, filters.examMethod, '素养') }}
                <el-icon
                  class="el-icon--right"
                  v-if="filters.examMethod === 'all'"
                >
                  <arrow-down />
                </el-icon>
                <el-icon
                  class="el-icon--right clear-icon"
                  v-else
                  @click.stop="filters.examMethod = 'all'"
                >
                  <Close />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all" :class="{ 'is-selected': filters.examMethod === 'all' }">全部素养</el-dropdown-item>
                  <el-dropdown-item v-for="item in examMethodOptions.filter(o => o.value !== 'all')" :key="item.value" :command="item.value" :class="{ 'is-selected': filters.examMethod === item.value }">{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>


          </div>
        </div>
      </div>

         <div class="question-list-container">
          <!-- 排序选项卡 -->
          <div class="sort-tabs">
            <div class="sort-options">
              <span class="sort-label">排序：</span>
              <span
                :class="['sort-tab', { active: currentSort === 'latest' }]"
                @click="currentSort = 'latest'"
              >
                最新
              </span>
              <span
                :class="['sort-tab', { active: currentSort === 'hottest' }]"
                @click="currentSort = 'hottest'"
              >
                最热
              </span>
            </div>
           <div class="search-wrapper">
             <el-input
               v-model="searchKeyword"
               placeholder="搜索试题内容"
               :prefix-icon="Search"
               size="default"
               clearable
               class="search-input"
               @clear="searchKeyword = ''"
             />
           </div>
           <span class="question-count">试题总数：<strong>{{ sortedQuestionList.length }}</strong></span>
         </div>
        <div class="question-list">
          <div 
            v-for="(question, index) in sortedQuestionList" 
            :key="question.id"
            class="question-item"
            @click="toggleAnalysis(question)"
          >
            <div class="new-tag" v-if="getNewTag(question.uploadTime)">{{ getNewTag(question.uploadTime) }}</div>
            <div class="question-header">
              <div class="question-main">
                <div class="tags-row">
                  <span class="feature-tag" v-if="question.tags && question.tags.length > 0">{{ question.tags[0] }}</span>
                  <div class="meta-items">
                    <span class="meta-item">{{ question.type }}{{ question.subType ? '-' + question.subType : '' }}</span>
                    <span class="meta-divider">|</span>
                    <span class="meta-item">{{ question.difficulty }}</span>
                    <template v-if="question.knowledgePoints && question.knowledgePoints.length > 0">
                      <span class="meta-divider">|</span>
                      <div
                        class="kp-wrapper"
                        :class="{ 'can-expand': overflowStates[question.id] }"
                        @mouseenter="checkSingleOverflow(question.id)"
                      >
                        <span
                          class="kp-text-truncated"
                          :ref="(el) => setKpRef(el, question.id)"
                        >
                          {{ question.knowledgePoints.join('、') }}
                        </span>
                        <div class="kp-text-full" v-if="overflowStates[question.id]">
                          {{ question.knowledgePoints.join('、') }}
                          <el-icon class="collapse-icon"><ArrowUp /></el-icon>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="question-text-wrapper">
                  <div class="question-text" v-html="highlightKeyword(question.content)"></div>
                </div>
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
              <div class="footer-info">
                <span class="info-item">更新时间：{{ question.uploadTime }}</span>
                <span class="info-divider">|</span>
                <span class="info-item">组卷次数：{{ question.usageCount }}次</span>
                <span class="info-divider">|</span>
                <span class="source-tag">《{{ question.source }}》</span>
              </div>
              <div class="question-actions">
                <button class="btn-analysis" @click.stop="toggleAnalysis(question)">
                  <el-icon><View /></el-icon>
                  <span>{{ question.showAnalysis ? '收起解析' : '答案解析' }}</span>
                </button>
                <button class="btn-add" @click.stop>
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

    <!-- 快速组卷 -->
    <div v-else class="question-selection">
      <!-- 左侧筛选栏 -->
      <div class="left-filter-area">
        <!-- 教材版本筛选容器 -->
        <div class="textbook-filter-container">
          <div class="container-header">
            <span class="header-title">— 教材版本 —</span>
          </div>
          <div class="textbook-selector">
            <el-select 
              v-model="quickSelectedTextbook" 
              placeholder="请选择教材版本"
              style="width: 100%"
            >
              <el-option label="滚动迁移(2026)／中考版" value="gundong-2026-zhongkao" />
              <el-option label="人教版·七年级上" value="renjiao-7-1" />
              <el-option label="苏教版·八年级下" value="sujiao-8-2" />
            </el-select>
          </div>
        </div>

        <!-- 知识点筛选容器（多选） -->
        <div class="knowledge-filter-container">
          <div class="container-header">
            <span class="header-title">— 知识点筛选 —</span>
          </div>

          <div class="sidebar-content">
            <div class="knowledge-tree">
              <div 
                v-for="item in quickKnowledgeTree" 
                :key="item.id"
                class="catalog-item"
              >
                <div 
                  class="catalog-node level-1 checkbox-node"
                  :class="{ active: isParentSelected(item) }"
                >
                  <span class="expand-icon-wrapper arrow-wrapper" @click="toggleQuickNode(item)">
                    <el-icon v-if="item.children && item.children.length > 0" class="expand-icon" :class="{ expanded: item.expanded }">
                      <CaretRight />
                    </el-icon>
                  </span>
                  <span class="expand-icon-wrapper checkbox-wrapper">
                    <el-checkbox 
                      :model-value="isParentSelected(item)"
                      :indeterminate="isParentIndeterminate(item)"
                      @click.stop
                      @change="toggleParentSelection(item)"
                    />
                  </span>
                  <span class="node-label" @click="toggleQuickNode(item)">{{ item.label }}</span>
                </div>
                <div v-if="item.expanded && item.children" class="catalog-children">
                  <div 
                    v-for="child in item.children" 
                    :key="child.id"
                    class="catalog-node level-2 checkbox-node"
                    :class="{ active: selectedKnowledgeIds.includes(child.id) }"
                  >
                    <span class="expand-icon-wrapper arrow-placeholder"></span>
                    <span class="expand-icon-wrapper checkbox-wrapper">
                      <el-checkbox 
                        :model-value="selectedKnowledgeIds.includes(child.id)"
                        @click.stop
                        @change="toggleKnowledgeSelection(child.id)"
                      />
                    </span>
                    <span class="node-label" @click="toggleKnowledgeSelection(child.id)">{{ child.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <!-- 快速组卷配置 -->
        <div class="quick-paper-config">
          <!-- 试卷标题 -->
          <div class="config-section horizontal">
            <div class="section-title">试卷标题</div>
            <div class="section-content">
              <el-input 
                v-model="paperTitle" 
                placeholder="请输入试卷标题"
                maxlength="100"
                show-word-limit
                clearable
                class="title-input"
              />
            </div>
          </div>

          <!-- 参考范围 -->
          <div class="config-section horizontal">
            <div class="section-title">参考范围</div>
            <div class="section-content">
              <div class="reference-scope">
                <el-tag 
                  v-for="knowledgeId in selectedKnowledgeIds" 
                  :key="knowledgeId"
                  closable
                  type="info"
                  @close="removeKnowledge(knowledgeId)"
                  class="knowledge-tag"
                >
                  {{ getKnowledgeName(knowledgeId) }}
                </el-tag>
                <span v-if="selectedKnowledgeIds.length === 0" class="empty-hint">
                  请在左侧勾选知识点
                </span>
              </div>
            </div>
          </div>

          <!-- 难度占比 -->
          <div class="config-section horizontal">
            <div class="section-title">难度占比</div>
            <div class="section-content">
              <div class="difficulty-ratio">
                <div class="ratio-item">
                  <label class="ratio-label">容易题占比：</label>
                  <el-input-number 
                    v-model="difficultyRatio.easy"
                    :min="0"
                    :max="100"
                    :step="5"
                    @change="handleRatioChange"
                    class="ratio-input"
                  />
                  <span class="ratio-unit">%</span>
                </div>
                <div class="ratio-item">
                  <label class="ratio-label">中等题占比：</label>
                  <el-input-number 
                    v-model="difficultyRatio.medium"
                    :min="0"
                    :max="100"
                    :step="5"
                    @change="handleRatioChange"
                    class="ratio-input"
                  />
                  <span class="ratio-unit">%</span>
                </div>
                <div class="ratio-item">
                  <label class="ratio-label">拔高题占比：</label>
                  <el-input-number 
                    v-model="difficultyRatio.hard"
                    :min="0"
                    :max="100"
                    :step="5"
                    @change="handleRatioChange"
                    class="ratio-input"
                  />
                  <span class="ratio-unit">%</span>
                </div>
                <div class="ratio-total" :class="{ error: ratioTotal !== 100 }">
                  总计：{{ ratioTotal }}%
                  <span v-if="ratioTotal !== 100" class="ratio-error">（占比总和应为100%）</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 试题类型 -->
          <div class="config-section horizontal">
            <div class="section-title">试题类型</div>
            <div class="section-content">
              <div class="question-types">
                <el-checkbox 
                  v-for="type in questionTypes" 
                  :key="type.value"
                  v-model="type.checked"
                  @change="handleTypeChange(type)"
                  class="type-checkbox"
                >
                  {{ type.label }}
                </el-checkbox>
              </div>
            </div>
          </div>

          <!-- 试题配置表格 -->
          <div class="config-section">
            <el-table 
              :data="questionConfigs" 
              border
              class="config-table"
              :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: '600' }"
            >
              <el-table-column prop="type" label="试题题型" min-width="150" align="center" />
              <el-table-column label="试题数量" width="160" align="center">
                <template #default="{ row }">
                  <el-input-number 
                    v-model="row.count"
                    :min="0"
                    :max="50"
                    size="small"
                    @change="updateTotalScore(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="每题分数" width="160" align="center">
                <template #default="{ row }">
                  <el-input-number 
                    v-model="row.score"
                    :min="0"
                    :max="100"
                    :step="0.5"
                    size="small"
                    @change="updateTotalScore(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="totalScore" label="试题总分" width="140" align="center">
                <template #default="{ row }">
                  {{ row.totalScore }}
                </template>
              </el-table-column>
              <el-table-column label="试题顺序" width="120" align="center">
                <template #default="{ row, $index }">
                  <div class="order-controls">
                    <el-button 
                      :disabled="$index === 0"
                      @click="moveUp($index)"
                      size="small"
                      text
                    >
                      <el-icon><ArrowUp /></el-icon>
                    </el-button>
                    <el-button 
                      :disabled="$index === questionConfigs.length - 1"
                      @click="moveDown($index)"
                      size="small"
                      text
                    >
                      <el-icon><ArrowDown /></el-icon>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div class="table-summary">
              <span class="summary-item">总题数：<strong>{{ totalQuestionCount }}</strong> 题</span>
              <span class="summary-item">总分：<strong>{{ totalPaperScore }}</strong> 分</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="generatePaper" class="generate-btn">
              生成试卷
            </el-button>
            <el-button size="large" @click="resetConfig" class="reset-btn">
              重置配置
            </el-button>
          </div>
        </div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { CaretRight, Monitor, View, Plus, ArrowUp, ArrowDown, Search, Close, Check } from '@element-plus/icons-vue'
import ScreenPresentation from './ScreenPresentation.vue'
import { ElMessage } from 'element-plus'

defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['goto-paper-center'])

// 教材版本选择（选题组卷）
const selectedTextbook = ref('gundong-2026-zhongkao')

// 当前筛选Tab（knowledge/topic）
const currentFilterTab = ref('knowledge')

// 选中的知识点ID（选题组卷）
const selectedKnowledgeId = ref(null)

// 选中的专题ID（选题组卷）
const selectedTopicId = ref(null)

// 知识点树形数据（选题组卷）
const knowledgeTree = ref([
  {
    id: 1,
    label: '语言文字基础',
    expanded: false,
    children: [
      { id: 11, label: '汉字与书法', expanded: false, children: [] },
      { id: 12, label: '词语与熟语', expanded: false, children: [] },
      { id: 13, label: '句子与标点', expanded: false, children: [] },
      { id: 14, label: '修辞与表达', expanded: false, children: [] }
    ]
  },
  {
    id: 2,
    label: '文学常识与名著阅读',
    expanded: false,
    children: [
      { id: 21, label: '古代文学常识', expanded: false, children: [] },
      { id: 22, label: '现代文学常识', expanded: false, children: [] },
      { id: 23, label: '外国文学常识', expanded: false, children: [] },
      { id: 24, label: '名著阅读与鉴赏', expanded: false, children: [] }
    ]
  },
  {
    id: 3,
    label: '古诗文阅读',
    expanded: false,
    children: [
      { id: 31, label: '文言文阅读', expanded: false, children: [] },
      { id: 32, label: '古诗词鉴赏', expanded: false, children: [] }
    ]
  },
  {
    id: 4,
    label: '现代文阅读',
    expanded: false,
    children: [
      { id: 41, label: '记叙文阅读', expanded: false, children: [] },
      { id: 42, label: '议论文阅读', expanded: false, children: [] },
      { id: 43, label: '说明文阅读', expanded: false, children: [] }
    ]
  },
  {
    id: 5,
    label: '写作',
    expanded: false,
    children: []
  }
])

// 专题树形数据（选题组卷）
const topicTree = ref([
  {
    id: 1,
    label: '中考专题复习',
    expanded: true,
    children: [
      { id: 11, label: '专题一：积累与运用', expanded: false, children: [] },
      { id: 12, label: '专题二：古诗文阅读', expanded: false, children: [] },
      { id: 13, label: '专题三：现代文阅读', expanded: false, children: [] },
      { id: 14, label: '专题四：名著阅读', expanded: false, children: [] },
      { id: 15, label: '专题五：写作', expanded: false, children: [] }
    ]
  },
  {
    id: 2,
    label: '教材同步专题',
    expanded: false,
    children: [
      { id: 21, label: '七年级上册专题', expanded: false, children: [] },
      { id: 22, label: '七年级下册专题', expanded: false, children: [] },
      { id: 23, label: '八年级上册专题', expanded: false, children: [] },
      { id: 24, label: '八年级下册专题', expanded: false, children: [] },
      { id: 25, label: '九年级上册专题', expanded: false, children: [] },
      { id: 26, label: '九年级下册专题', expanded: false, children: [] }
    ]
  }
])

// 教材版本选择（快速组卷）
const quickSelectedTextbook = ref('gundong-2026-zhongkao')

// 选中的知识点ID数组（快速组卷，支持多选）
const selectedKnowledgeIds = ref([])

// 知识点树形数据（快速组卷）
const quickKnowledgeTree = ref([
  {
    id: 1,
    label: '语言文字基础',
    expanded: false,
    children: [
      { id: 11, label: '汉字与书法', expanded: false, children: [] },
      { id: 12, label: '词语与熟语', expanded: false, children: [] },
      { id: 13, label: '句子与标点', expanded: false, children: [] },
      { id: 14, label: '修辞与表达', expanded: false, children: [] }
    ]
  },
  {
    id: 2,
    label: '文学常识与名著阅读',
    expanded: false,
    children: [
      { id: 21, label: '古代文学常识', expanded: false, children: [] },
      { id: 22, label: '现代文学常识', expanded: false, children: [] },
      { id: 23, label: '外国文学常识', expanded: false, children: [] },
      { id: 24, label: '名著阅读与鉴赏', expanded: false, children: [] }
    ]
  },
  {
    id: 3,
    label: '古诗文阅读',
    expanded: false,
    children: [
      { id: 31, label: '文言文阅读', expanded: false, children: [] },
      { id: 32, label: '古诗词鉴赏', expanded: false, children: [] }
    ]
  },
  {
    id: 4,
    label: '现代文阅读',
    expanded: false,
    children: [
      { id: 41, label: '记叙文阅读', expanded: false, children: [] },
      { id: 42, label: '议论文阅读', expanded: false, children: [] },
      { id: 43, label: '说明文阅读', expanded: false, children: [] }
    ]
  },
  {
    id: 5,
    label: '写作',
    expanded: false,
    children: []
  }
])

// 切换节点展开/收起（选题组卷）
const toggleNode = (node) => {
  // 选中该节点
  selectedKnowledgeId.value = node.id
  // 如果有子节点，则展开/收起
  if (node.children) {
    node.expanded = !node.expanded
  }
}

// 选择知识点（选题组卷）
const selectKnowledge = (node) => {
  selectedKnowledgeId.value = node.id
  console.log('选择知识点:', node.label)
}

// 切换专题节点展开/收起
const toggleTopicNode = (node) => {
  selectedTopicId.value = node.id
  if (node.children) {
    node.expanded = !node.expanded
  }
}

// 选择专题
const selectTopic = (node) => {
  selectedTopicId.value = node.id
  console.log('选择专题:', node.label)
}

// 切换节点展开/收起（快速组卷）
const toggleQuickNode = (node) => {
  // 如果有子节点，则展开/收起
  if (node.children && node.children.length > 0) {
    node.expanded = !node.expanded
  }
}

// 切换知识点选中状态（快速组卷，支持多选）
const toggleKnowledgeSelection = (id) => {
  const index = selectedKnowledgeIds.value.indexOf(id)
  if (index > -1) {
    // 如果已选中，则取消选中
    selectedKnowledgeIds.value.splice(index, 1)
  } else {
    // 如果未选中，则添加到选中列表
    selectedKnowledgeIds.value.push(id)
  }
  console.log('当前选中的知识点:', selectedKnowledgeIds.value)
}

// 判断父节点是否全选
const isParentSelected = (parentNode) => {
  if (!parentNode.children || parentNode.children.length === 0) {
    return false
  }
  return parentNode.children.every(child => selectedKnowledgeIds.value.includes(child.id))
}

// 判断父节点是否半选（部分子节点选中）
const isParentIndeterminate = (parentNode) => {
  if (!parentNode.children || parentNode.children.length === 0) {
    return false
  }
  const selectedCount = parentNode.children.filter(child => 
    selectedKnowledgeIds.value.includes(child.id)
  ).length
  return selectedCount > 0 && selectedCount < parentNode.children.length
}

// 切换父节点的全选状态
const toggleParentSelection = (parentNode) => {
  if (!parentNode.children || parentNode.children.length === 0) {
    return
  }
  
  const allSelected = isParentSelected(parentNode)
  
  if (allSelected) {
    // 如果当前全选，则取消全选
    parentNode.children.forEach(child => {
      const index = selectedKnowledgeIds.value.indexOf(child.id)
      if (index > -1) {
        selectedKnowledgeIds.value.splice(index, 1)
      }
    })
  } else {
    // 如果未全选，则全选所有子节点
    parentNode.children.forEach(child => {
      if (!selectedKnowledgeIds.value.includes(child.id)) {
        selectedKnowledgeIds.value.push(child.id)
      }
    })
  }
  
  console.log('当前选中的知识点:', selectedKnowledgeIds.value)
}

// 筛选条件（选题组卷）
const filters = ref({
  source: 'platform',
  sourceType: 'all',
  features: 'all',
  textbook: 'all',
  type: 'all',
  subType: 'all',
  difficulty: 'all',
  examMethod: 'all',
  ability: 'all',
  year: 'all',
  region: 'shanxi'
})

// 题源类型多选开关
const isMultiSelectSourceType = ref(false)

// 切换题源类型多选模式
const handleSourceTypeModeChange = (val) => {
  isMultiSelectSourceType.value = val
  if (val) {
    // 切换到多选模式
    if (filters.value.sourceType === 'all') {
      filters.value.sourceType = ['all']
    } else {
      filters.value.sourceType = [filters.value.sourceType]
    }
  } else {
    // 切换到单选模式，直接回到"全部"选项
    filters.value.sourceType = 'all'
  }
}

// 处理题源类型多选变化
const handleSourceTypeChange = (val, value) => {
  if (value === 'all') {
    if (val) {
      filters.value.sourceType = ['all']
    } else {
      filters.value.sourceType = [] // 允许为空，或者可以强制为['all']
    }
  } else {
    // 如果选中具体项，移除'all'
    if (val) {
      const allIndex = filters.value.sourceType.indexOf('all')
      if (allIndex > -1) {
        filters.value.sourceType.splice(allIndex, 1)
      }
    }
    // 如果所有具体项都取消选中，自动选'all'
    if (filters.value.sourceType.length === 0) {
        filters.value.sourceType = ['all']
    }
  }
}

// 处理试题难度多选变化
const handleDifficultyChange = (val, value) => {
  if (value === 'all') {
    if (val) {
      filters.value.difficulty = ['all']
    } else {
      filters.value.difficulty = []
    }
  } else {
    // 如果选中具体项，移除'all'
    if (val) {
      const allIndex = filters.value.difficulty.indexOf('all')
      if (allIndex > -1) {
        filters.value.difficulty.splice(allIndex, 1)
      }
    }
    // 如果所有具体项都取消选中，自动选'all'
    if (filters.value.difficulty.length === 0) {
        filters.value.difficulty = ['all']
    }
  }
}

// 难度多选开关
const isMultiSelectDifficulty = ref(false)

// 切换难度多选模式
const handleDifficultyModeChange = (val) => {
  isMultiSelectDifficulty.value = val
  if (val) {
    // 切换到多选模式
    if (filters.value.difficulty === 'all') {
      filters.value.difficulty = ['all']
    } else {
      filters.value.difficulty = [filters.value.difficulty]
    }
  } else {
    // 切换到单选模式，直接回到"全部"选项
    filters.value.difficulty = 'all'
  }
}

// 排序方式
const currentSort = ref('latest')

// 搜索关键词
const searchKeyword = ref('')

// 重置筛选
const resetFilters = () => {
  filters.value = {
    source: 'platform',
    sourceType: 'all',
    features: 'all',
    textbook: 'all',
    type: 'all',
    subType: 'all',
    difficulty: 'all',
    examMethod: 'all',
    ability: 'all',
    year: 'all',
    region: 'shanxi'
  }
  // 重置多选开关
  isMultiSelectSourceType.value = false
  isMultiSelectDifficulty.value = false
}

// 筛选条件（快速组卷）
const quickFilters = ref({
  source: 'platform',
  type: 'all',
  difficulty: 'all',
  year: 'all'
})

// 子题型选项
// 子题型映射
const subTypeMap = {
  'accumulation': [
    { label: '全部', value: 'all' },
    { label: '选择', value: 'choice' },
    { label: '填空', value: 'fill' },
    { label: '书写', value: 'writing' },
    { label: '简答', value: 'short-answer' },
    { label: '综合', value: 'comprehensive' }
  ],
  'dictation': [
    { label: '全部', value: 'all' },
    { label: '句子默写', value: 'sentence' },
    { label: '情景默写', value: 'contextual' }
  ]
}

// 子题型选项（计算属性）
const subTypeOptions = computed(() => {
  return subTypeMap[filters.value.type] || []
})

// 箭头位置映射（根据试题类型调整）
const arrowPositionMap = {
  'accumulation': '215px',
  'dictation': '305px' // 估算值：215 + 90
}

const arrowLeft = computed(() => {
  return arrowPositionMap[filters.value.type] || '215px'
})

// 特色筛选选项
const featureOptions = [
  { label: '全部', value: 'all' },
  { label: '跨学科', value: 'interdisciplinary' },
  { label: '项目化', value: 'project-based' },
  { label: '新题型', value: 'new-type' },
  { label: '大单元', value: 'big-unit' },
  { label: '教材母题变式', value: 'textbook-variant' }
]

// 教材筛选选项
const textbookOptions = [
  { label: '全部', value: 'all' },
  { label: '人教版', value: 'renjiao' },
  { label: '华师版', value: 'huashi' },
  { label: '北师版', value: 'beishi' }
]

// 试题来源选项
const sourceOptions = [
  { label: '平台题库', value: 'platform' },
  { label: '本校上传', value: 'school' }
]

// 题源类型选项
const sourceTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '中考真题', value: 'entrance-exam' },
  { label: '中考模拟', value: 'zk-simulation' },
  { label: '备考练习', value: 'simulation-drill' },
  { label: '期中期末', value: 'midterm-final-exam' }
]

// 试题类型选项
const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '积累运用', value: 'accumulation' },
  { label: '默写', value: 'dictation' },
  { label: '综合性学习', value: 'comprehensive' },
  { label: '现代文阅读', value: 'modern-reading' },
  { label: '文言文阅读', value: 'classical-reading' },
  { label: '诗歌阅读', value: 'poetry-reading' },
  { label: '整本书阅读', value: 'whole-book-reading' },
  { label: '写作', value: 'writing' }
]

// 试题难度选项
const difficultyOptions = [
  { label: '全部', value: 'all' },
  { label: '容易', value: 'easy' },
  { label: '适中', value: 'medium' },
  { label: '困难', value: 'hard' }
]

// 素养选项
const examMethodOptions = [
  { label: '全部', value: 'all' },
  { label: '图片史料型', value: 'image-history' },
  { label: '数据表格型', value: 'data-table' },
  { label: '档案文献型', value: 'archive-doc' },
  { label: '知识示意图', value: 'knowledge-diagram' },
  { label: '考古、遗迹', value: 'archaeology' },
  { label: '研究性学习', value: 'research-study' },
  { label: '大事年表型', value: 'chronology' },
  { label: '史学研究型', value: 'historiography' },
  { label: '比较同异型', value: 'comparison' }
]

// 能力选项
const abilityOptions = [
  { label: '全部', value: 'all' },
  { label: '识记', value: 'memorization' },
  { label: '理解', value: 'understanding' },
  { label: '分析综合', value: 'analysis' },
  { label: '鉴赏评价', value: 'appreciation' },
  { label: '表达应用', value: 'application' },
  { label: '探究', value: 'inquiry' }
]

// 获取选项标签
const getLabel = (options, value, placeholder) => {
  if (value === 'all' || !value) return placeholder
  const option = options.find(o => o.value === value)
  return option ? option.label : placeholder
}

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

// 地区选项
const regionOptions = [
  { label: '全国', value: 'national' },
  { label: '山西', value: 'shanxi' }
]

// 知识点溢出检测
const kpRefs = ref({})
const overflowStates = ref({})

const setKpRef = (el, id) => {
  if (el) {
    kpRefs.value[id] = el
    // 初始化时检测一次
    checkSingleOverflow(id)
  }
}

const checkSingleOverflow = (id) => {
  const el = kpRefs.value[id]
  if (el) {
    // 使用 scrollWidth > clientWidth 判断是否溢出
    // 增加一个小的容差值(1px)以避免浮点数计算误差
    const isOverflow = el.scrollWidth > el.clientWidth + 1
    overflowStates.value[id] = isOverflow
  }
}

// 监听窗口大小变化重新检测
let resizeObserver = null
onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    Object.keys(kpRefs.value).forEach(id => {
      checkSingleOverflow(id)
    })
  })
  // 观察整个列表容器或者body，这里简单起见观察body，实际应用中可以更精细
  resizeObserver.observe(document.body)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 监听数据变化重新检测


// 模拟题目数据
const questionList = ref([
  {
    id: 1,
    content: '根据例句的形式另选一组意象仿写，表达对祖国的拳拳赤子之心，至少仿写两句。<br/><br/>例句：我是你河边上破旧的老水车，数百年来纺着疲惫的歌。',
    type: '积累运用',
    subType: '仿写',
    difficulty: '适中',
    source: '2025年山西百校联考试卷',
    tags: ['新题型', '跨学科'],
    knowledgePoints: ['修辞手法', '仿写句子', '现代文阅读理解', '古代诗歌鉴赏', '文言文阅读', '语言文字运用', '写作表达技巧', '文学常识积累', '名著导读与分析'],
    answer: '我是你天空中飞翔的小鸟，时时刻刻搏击着风雨。我是你衣服上小小的纽扣，永远倾听着你心脏跳动的声音。',
    analysis: '',
    showAnalysis: false,
    uploadTime: '2025-12-08',
    usageCount: 1250
  },
  {
    id: 2,
    content: '阅读下面的文字，完成下列小题。<br/><br/>在中国古代文学中，"山水"是一个重要的文学意象。古人常常借助山水来抒发情感，表达志向。请简要分析"山水"意象在古代文学中的作用。',
    type: '现代文阅读',
    difficulty: '困难',
    source: '2025年山西百校联考试卷',
    tags: ['教材母题'],
    knowledgePoints: ['意象分析', '情感表达', '文学常识', '中国古代文学史', '山水田园诗派', '唐宋八大家', '古文观止', '诗经楚辞', '汉赋魏晋南北朝诗歌'],
    answer: '山水意象在古代文学中主要有以下作用：1.寄托情感，表达作者的喜怒哀乐；2.象征品格，表现高洁的情操和志向；3.营造意境，增强作品的艺术感染力。',
    analysis: '山水是中国古代文学中最常见的意象之一，文人墨客常常通过描写山水来抒发内心情感，表达人生志向，同时也体现了中国传统文化中"天人合一"的思想。',
    showAnalysis: false,
    uploadTime: '2025-12-05',
    usageCount: 890
  },
  {
    id: 3,
    content: '请用"虽然...但是..."的句式造句，要求句子通顺，语意完整。',
    type: '积累运用',
    subType: '造句',
    difficulty: '容易',
    source: '2025年山西百校联考试卷',
    tags: ['大单元'],
    knowledgePoints: ['关联词运用', '造句'],
    answer: '虽然天气很冷，但是同学们仍然坚持早起锻炼身体。',
    analysis: '此题考查关联词的使用，"虽然...但是..."表示转折关系，前后分句意思相反或相对。',
    showAnalysis: false,
    uploadTime: '2025-11-28',
    usageCount: 2100
  },
  {
    id: 4,
    content: '下列句子中，标点符号使用正确的一项是（　　）<br/>A. 今天，我们学习了《背影》这篇课文。<br/>B. 你是去图书馆？还是去操场？<br/>C. 他问我："你吃饭了吗"？<br/>D. 这是一个美丽的、富饶的、历史悠久的城市。',
    type: '语言知识',
    difficulty: '适中',
    source: '2025年山西百校联考试卷',
    knowledgePoints: ['标点符号', '语感'],
    answer: 'A',
    analysis: 'A项标点符号使用正确。B项应为"你是去图书馆，还是去操场？"C项问号应在引号内。D项最后一个顿号应删除。',
    showAnalysis: false,
    uploadTime: '2025-11-25',
    usageCount: 1580
  },
  {
    id: 5,
    content: '阅读下面的诗歌，回答问题。<br/><br/>《春望》<br/>国破山河在，城春草木深。<br/>感时花溅泪，恨别鸟惊心。<br/>烽火连三月，家书抵万金。<br/>白头搔更短，浑欲不胜簪。<br/><br/>问：请赏析"白头搔更短，浑欲不胜簪"的表现手法。',
    type: '古诗词鉴赏',
    difficulty: '困难',
    source: '2025年山西百校联考试卷',
    knowledgePoints: ['表现手法', '细节描写', '爱国情怀'],
    answer: '运用了细节描写和夸张的手法，通过"搔"这一动作和"更短"的夸张描写，生动形象地表现了诗人因忧国忧民而愁白了头发的形象，深刻地表达了诗人内心的痛苦和焦虑。',
    analysis: '这两句诗是全诗的点睛之笔，诗人通过自己白发的细节描写，将个人的遭遇与国家的命运紧密联系在一起，表达了深沉的爱国情怀。',
    showAnalysis: false,
    uploadTime: '2025-11-22',
    usageCount: 1320
  },
  {
    id: 6,
    content: '下列词语中，加点字的注音完全正确的一项是（　　）<br/>A. 憎恶(zēng)　　酝酿(niàng)　　锲而不舍(qiè)<br/>B. 狭隘(ài)　　　　栖息(qī)　　　　鲜为人知(xiǎn)<br/>C. 贮蓄(zhù)　　　　绽放(zhàn)　　　　惟妙惟肖(xiào)<br/>D. 伫立(zhù)　　　　蓦然(mù)　　　　咄咄逼人(duō)',
    type: '积累运用',
    subType: '选择',
    difficulty: '容易',
    source: '2025年山西百校联考试卷',
    tags: ['新题型'],
    knowledgePoints: ['字音字形', '多音字'],
    answer: 'C',
    analysis: 'A项"憎恶"应读"zēng wù"；B项"鲜为人知"的"鲜"应读"xiǎn"；D项"蓦然"应读"mò rán"。只有C项注音完全正确。',
    showAnalysis: false,
    uploadTime: '2025-12-16',
    usageCount: 856
  },
  {
    id: 7,
    content: '请根据下面的情境，写一段不少于80字的对话。<br/><br/>情境：小明在图书馆遇到了同学小红，小红正在为即将到来的演讲比赛做准备，显得有些紧张。小明想要鼓励她。',
    type: '写作',
    difficulty: '适中',
    source: '2025年山西百校联考试卷',
    tags: ['跨学科'],
    knowledgePoints: ['情境对话', '口语交际'],
    answer: '小明：小红，你在准备演讲比赛啊？看起来有点紧张呢。<br/>小红：是啊，我担心自己表现不好。<br/>小明：别担心！你平时口才就很好，而且准备得这么充分，一定没问题的。记住，自信是成功的一半！<br/>小红：谢谢你的鼓励，我会加油的！',
    analysis: '此题考查情境对话写作能力，要求学生能够根据具体情境，运用恰当的语言进行交流，体现人物的情感和态度。',
    showAnalysis: false,
    uploadTime: '2025-10-15',
    usageCount: 2340
  },
  {
    id: 8,
    content: '下列句子中，没有语病的一项是（　　）<br/>A. 通过这次活动，使我们深刻认识到保护环境的重要性。<br/>B. 能否培养学生的创新能力，是衡量教育成功的重要标准。<br/>C. 我们要继承和发扬老一辈革命家的光荣传统。<br/>D. 在学习上，老师要求我们独立思考，不要盲目地依赖别人。',
    type: '语言知识',
    difficulty: '适中',
    source: '2025年山西百校联考试卷',
    knowledgePoints: ['病句辨析', '语法结构'],
    answer: 'D',
    analysis: 'A项缺少主语，应删除"通过"或"使"；B项"能否"与"是"不对应，应改为"培养学生的创新能力，是衡量教育成功的重要标准"；C项"继承"与"传统"搭配不当，应为"继承传统，发扬精神"。只有D项没有语病。',
    showAnalysis: false,
    uploadTime: '2025-11-05',
    usageCount: 1890
  },
  {
    id: 9,
    content: '阅读下面的文言文，回答问题。<br/><br/>陈太丘与友期行，期日中。过中不至，太丘舍去，去后乃至。元方时年七岁，门外戏。客问元方："尊君在不？"答曰："待君久不至，已去。"客人怒曰："非人哉！与人期行，相委而去。"元方曰："君与家君期日中。日中不至，则是无信；对子骂父，则是无礼。"客人惭，下车引之，元方入门不顾。<br/><br/>问：请用现代汉语翻译"日中不至，则是无信；对子骂父，则是无礼。"',
    type: '文言文阅读',
    difficulty: '困难',
    source: '2025年山西百校联考试卷',
    tags: ['教材母题'],
    knowledgePoints: ['文言翻译', '人物性格'],
    answer: '约定的时间是正午，您却没有到，这就是不讲信用；当着儿子的面骂他的父亲，这就是没有礼貌。',
    analysis: '此题考查文言文翻译能力。翻译时要注意"日中"（正午）、"则是"（就是）、"对子"（当着儿子的面）等关键词的准确翻译，同时要保持句子的通顺。',
    showAnalysis: false,
    uploadTime: '2025-10-28',
    usageCount: 1650
  }
])

// 排序后的题目列表（按更新时间倒序,最新的在前）
const sortedQuestionList = computed(() => {
  let list = [...questionList.value]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter(q => {
      // 移除HTML标签后搜索
      const plainContent = q.content.replace(/<[^>]*>/g, '')
      return plainContent.toLowerCase().includes(keyword)
    })
  }

  // 排序
  return list.sort((a, b) => {
    const dateA = new Date(a.uploadTime || '2000-01-01')
    const dateB = new Date(b.uploadTime || '2000-01-01')
    return dateB - dateA // 降序排列,最新的在前
  })
})

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

// 高亮搜索关键字
const highlightKeyword = (content) => {
  if (!searchKeyword.value.trim()) {
    return content
  }
  
  const keyword = searchKeyword.value.trim()
  
  // 转义正则特殊字符
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // 创建正则表达式，匹配不在HTML标签内的文本
  // 使用负向断言避免匹配标签内的属性值
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  
  // 替换匹配的文本
  return content.replace(regex, '<span class="highlight">$1</span>')
}

// 获取题目的"上新"标签
const getNewTag = (uploadTime) => {
  if (!uploadTime) return null
  
  const today = new Date('2025-12-19')
  const uploadDate = new Date(uploadTime)
  
  // 计算时间差（天数）
  const diffTime = today - uploadDate
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // 7天内为"7日上新"
  if (diffDays <= 7) {
    return '7日上新'
  }
  
  // 30天内为"30日上新"
  if (diffDays <= 30) {
    return '30日上新'
  }
  
  return null
}

// ==================== 快速组卷相关 ====================

// 试卷标题
const paperTitle = ref('')

// 难度占比
const difficultyRatio = ref({
  easy: 30,
  medium: 50,
  hard: 20
})

// 计算难度占比总和
const ratioTotal = computed(() => {
  return difficultyRatio.value.easy + difficultyRatio.value.medium + difficultyRatio.value.hard
})

// 处理占比变化
const handleRatioChange = () => {
  console.log('难度占比变化:', difficultyRatio.value)
  console.log('总计:', ratioTotal.value)
}

// 试题类型（语文学科）
const questionTypes = ref([
  { label: '字词书写', value: 'word-writing', checked: true },
  { label: '现代文阅读', value: 'modern-reading', checked: true },
  { label: '文言文阅读', value: 'classical-reading', checked: true },
  { label: '名句名篇默写', value: 'famous-sentences', checked: true },
  { label: '诗歌鉴赏', value: 'poetry', checked: true },
  { label: '语言表达', value: 'language-expression', checked: false },
  { label: '名著阅读', value: 'classics-reading', checked: false },
  { label: '综合性学习', value: 'comprehensive', checked: false },
  { label: '作文', value: 'composition', checked: true }
])

// 处理题型选择变化
const handleTypeChange = (type) => {
  console.log('题型选择变化:', type.label, type.checked)
  // 如果勾选了题型，添加到配置表格；如果取消勾选，从表格中移除
  if (type.checked) {
    const exists = questionConfigs.value.find(config => config.value === type.value)
    if (!exists) {
      questionConfigs.value.push({
        type: type.label,
        value: type.value,
        count: 1,
        score: 5,
        totalScore: 5
      })
    }
  } else {
    const index = questionConfigs.value.findIndex(config => config.value === type.value)
    if (index > -1) {
      questionConfigs.value.splice(index, 1)
    }
  }
}

// 试题配置表格数据
const questionConfigs = ref([
  { type: '字词书写', value: 'word-writing', count: 5, score: 2, totalScore: 10 },
  { type: '现代文阅读', value: 'modern-reading', count: 3, score: 10, totalScore: 30 },
  { type: '文言文阅读', value: 'classical-reading', count: 2, score: 10, totalScore: 20 },
  { type: '名句名篇默写', value: 'famous-sentences', count: 6, score: 1, totalScore: 6 },
  { type: '诗歌鉴赏', value: 'poetry', count: 2, score: 5, totalScore: 10 },
  { type: '作文', value: 'composition', count: 1, score: 50, totalScore: 50 }
])

// 更新试题总分
const updateTotalScore = (row) => {
  row.totalScore = row.count * row.score
}

// 上移
const moveUp = (index) => {
  if (index > 0) {
    const temp = questionConfigs.value[index]
    questionConfigs.value[index] = questionConfigs.value[index - 1]
    questionConfigs.value[index - 1] = temp
  }
}

// 下移
const moveDown = (index) => {
  if (index < questionConfigs.value.length - 1) {
    const temp = questionConfigs.value[index]
    questionConfigs.value[index] = questionConfigs.value[index + 1]
    questionConfigs.value[index + 1] = temp
  }
}

// 计算总题数
const totalQuestionCount = computed(() => {
  return questionConfigs.value.reduce((sum, config) => sum + config.count, 0)
})

// 计算总分
const totalPaperScore = computed(() => {
  return questionConfigs.value.reduce((sum, config) => sum + config.totalScore, 0)
})

// 获取知识点名称
const getKnowledgeName = (knowledgeId) => {
  // 遍历知识树查找知识点名称
  for (const parent of quickKnowledgeTree.value) {
    if (parent.id === knowledgeId) {
      return parent.label
    }
    if (parent.children) {
      for (const child of parent.children) {
        if (child.id === knowledgeId) {
          return child.label
        }
      }
    }
  }
  return '未知知识点'
}

// 移除知识点
const removeKnowledge = (knowledgeId) => {
  const index = selectedKnowledgeIds.value.indexOf(knowledgeId)
  if (index > -1) {
    selectedKnowledgeIds.value.splice(index, 1)
  }
}

// 生成试卷
const generatePaper = () => {
  // 验证
  // 1. 试卷标题校验
  if (!paperTitle.value) {
    ElMessage.warning('请输入试卷标题')
    return
  }
  if (paperTitle.value.trim().length < 2) {
    ElMessage.warning('试卷标题至少需要2个字符')
    return
  }
  
  // 2. 知识点选择校验
  if (selectedKnowledgeIds.value.length === 0) {
    ElMessage.warning('请至少选择一个知识点')
    return
  }
  
  // 3. 难度占比校验
  if (ratioTotal.value !== 100) {
    ElMessage.warning('难度占比总和必须为100%')
    return
  }
  
  // 4. 试题类型校验
  if (questionConfigs.value.length === 0) {
    ElMessage.warning('请至少选择一个试题类型')
    return
  }
  
  // 5. 单个题型的数量校验
  const invalidConfig = questionConfigs.value.find(config => config.count <= 0)
  if (invalidConfig) {
    ElMessage.warning(`${invalidConfig.type}的试题数量必须大于0`)
    return
  }
  
  // 6. 单个题型的分数校验
  const invalidScoreConfig = questionConfigs.value.find(config => config.score <= 0)
  if (invalidScoreConfig) {
    ElMessage.warning(`${invalidScoreConfig.type}的每题分数必须大于0`)
    return
  }
  
  // 7. 试题总数校验
  if (totalQuestionCount.value === 0) {
    ElMessage.warning('试题总数必须大于0')
    return
  }
  
  // 8. 试题总分校验
  if (totalPaperScore.value === 0) {
    ElMessage.warning('试卷总分必须大于0')
    return
  }
  
  const paperConfig = {
    title: paperTitle.value,
    knowledgeIds: selectedKnowledgeIds.value,
    difficultyRatio: difficultyRatio.value,
    questionConfigs: questionConfigs.value,
    totalCount: totalQuestionCount.value,
    totalScore: totalPaperScore.value
  }
  
  console.log('生成试卷配置:', paperConfig)
  
  // 通过 emit 通知父组件跳转到组卷中心
  emit('goto-paper-center', {
    catalogName: paperTitle.value,
    questions: [] // 这里可以根据配置生成模拟题目数据
  })
  
  ElMessage.success('试卷生成成功！正在进入组卷中心...')
}

// 重置配置
const resetConfig = () => {
  paperTitle.value = ''
  selectedKnowledgeIds.value = []
  difficultyRatio.value = {
    easy: 30,
    medium: 50,
    hard: 20
  }
  questionTypes.value.forEach(type => {
    type.checked = ['word-writing', 'modern-reading', 'classical-reading', 'famous-sentences', 'poetry', 'composition'].includes(type.value)
  })
  questionConfigs.value = [
    { type: '字词书写', value: 'word-writing', count: 5, score: 2, totalScore: 10 },
    { type: '现代文阅读', value: 'modern-reading', count: 3, score: 10, totalScore: 30 },
    { type: '文言文阅读', value: 'classical-reading', count: 2, score: 10, totalScore: 20 },
    { type: '名句名篇默写', value: 'famous-sentences', count: 6, score: 1, totalScore: 6 },
    { type: '诗歌鉴赏', value: 'poetry', count: 2, score: 5, totalScore: 10 },
    { type: '作文', value: 'composition', count: 1, score: 50, totalScore: 50 }
  ]
  ElMessage.success('配置已重置')
}
// 监听数据变化重新检测
watch(sortedQuestionList, () => {
  nextTick(() => {
    Object.keys(kpRefs.value).forEach(id => {
      checkSingleOverflow(id)
    })
  })
}, { deep: true })

</script>

<style scoped>
.smart-paper {
  padding: 20px 24px;
  min-height: 100%;
  background-color: transparent;
  border-radius: 5px 0 0 0;
}

/* 选题组卷样式 */
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
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: calc(100vh - 40px);
}

/* 教材版本筛选容器 */
.textbook-filter-container {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  padding: 16px;
}

.container-header {
  margin-bottom: 12px;
  text-align: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: block;
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
  padding: 0; /* 移除内边距，由子元素控制 */
  min-height: 0; /* 允许flex子项收缩 */
}

/* 筛选Tab */
/* 筛选Tab */
.filter-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  background: #ffffff;
  padding: 12px 0;
}

.filter-tab {
  flex: 1; /* 保持均分，或者改为 flex: none + padding */
  text-align: center;
  padding: 0;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 400;
  position: relative;
  background: none;
  border: none;
}

.filter-tab:hover {
  color: #2262FB;
  background: none;
}

.filter-tab.active {
  color: #2262FB;
  background: none;
  font-weight: 400;
  border-bottom: none;
}

/* 竖线分割 */
.filter-tab:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 16px;
  width: 1px;
  background-color: #E4E7ED;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

/* 教材版本选择器 */
.textbook-selector {
  margin-top: 0;
}

.textbook-selector :deep(.el-select .el-select__wrapper) {
  min-height: 36px;
  padding: 8px 12px;
  box-shadow: 0 0 0 1px #E4E7ED inset;
  border-radius: 4px;
  transition: all 0.3s;
}

.textbook-selector :deep(.el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #C0C4CC inset;
}

.textbook-selector :deep(.el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #2262FB inset;
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

.catalog-node.active {
  background: #ecf5ff;
  color: #2262FB;
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

/* 多选节点特殊样式 */
.checkbox-node {
  cursor: pointer;
}

.checkbox-node .checkbox-wrapper {
  width: 20px !important;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-node .checkbox-wrapper :deep(.el-checkbox) {
  height: 20px;
  display: flex;
  align-items: center;
}

.checkbox-node .checkbox-wrapper :deep(.el-checkbox__input) {
  line-height: 1;
  height: 16px;
}

.checkbox-node .checkbox-wrapper :deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
}

.checkbox-node.active {
  background: #ecf5ff;
  color: #2262FB;
}

.checkbox-node:hover {
  background: #f5f7fa;
}

.checkbox-node.active:hover {
  background: #e0efff;
}

/* 一级节点特殊布局 */
.level-1.checkbox-node {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  min-height: 32px;
}

.level-1.checkbox-node .node-label {
  flex: 1;
  cursor: pointer;
  user-select: none;
  line-height: 20px;
  font-size: 14px;
}

.level-1.checkbox-node .arrow-wrapper {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 6px;
}

.level-1.checkbox-node .checkbox-wrapper {
  margin-right: 6px;
}

/* 二级节点布局调整 */
.level-2.checkbox-node {
  display: flex;
  align-items: center;
  padding: 5px 12px;
  padding-left: 12px;
  min-height: 28px;
}

.level-2.checkbox-node .node-label {
  flex: 1;
  cursor: pointer;
  user-select: none;
  line-height: 20px;
  font-size: 14px;
}

.level-2.checkbox-node .arrow-placeholder {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 6px;
}

.level-2.checkbox-node .checkbox-wrapper {
  margin-right: 6px;
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

/* 中考特色重点强调区域 */
.featured-row {
  background: #F0F7FF;
  border: 1px dashed #A0CFFF;
  border-radius: 8px;
  padding: 16px 0;
  margin-bottom: 16px;
  position: relative;
}

.featured-row .filter-label {
  color: #2262FB;
  font-weight: 600;
}

.hot-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px 0 10px 0;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
  z-index: 1;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  flex-shrink: 0;
  width: 60px;
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
  align-items: center;
}

/* Element Plus Radio 自定义样式 */
.custom-radio {
  margin-right: 0;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.custom-checkbox {
  margin-right: 0;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.custom-checkbox :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
  padding-left: 8px;
  line-height: 1; /* 强制行高 */
  display: inline-block; /* 确保行高生效 */
}

.custom-checkbox :deep(.el-checkbox__input) {
  line-height: 1;
  vertical-align: middle;
}

.custom-checkbox :deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
}

.custom-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #2262FB;
  border-color: #2262FB;
}

.custom-checkbox :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #2262FB;
}

.filter-switch {
  margin-right: 16px;
  display: flex;
  align-items: center;
}

.multi-select-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  color: #606266;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.3s;
  user-select: none;
  background-color: #fff;
}

.multi-select-btn:hover {
  color: #2262FB;
  border-color: #2262FB;
  background-color: #ecf5ff;
}

.multi-select-btn.active {
  color: #fff;
  background-color: #2262FB;
  border-color: #2262FB;
}

.custom-radio :deep(.el-radio__label) {
  font-size: 14px;
  color: #606266;
  padding-left: 8px;
  line-height: 1; /* 强制行高 */
  display: inline-block; /* 确保行高生效 */
}

.custom-radio :deep(.el-radio__input) {
  line-height: 1;
  vertical-align: middle;
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

/* 中考特色标签样式 - 重点展示 */
.feature-radio {
  margin-right: 12px !important;
  height: 32px;
  padding: 0 16px !important;
  border-radius: 4px;
  transition: all 0.3s;
  background: #ffffff;
  border: 1px solid #dcdfe6;
}

/* 隐藏默认的原点 */
.feature-radio :deep(.el-radio__input) {
  display: none;
}

.feature-radio :deep(.el-radio__label) {
  padding-left: 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 选中状态 */
.feature-radio.is-checked {
  background: linear-gradient(135deg, #2262FB 0%, #409EFF 100%) !important;
  border-color: #2262FB !important;
  box-shadow: 0 2px 8px rgba(34, 98, 251, 0.2);
  transform: translateY(-1px);
}

.feature-radio.is-checked :deep(.el-radio__label) {
  color: #ffffff !important;
  font-weight: 600;
}

/* hover状态 */
.feature-radio:hover:not(.is-checked) {
  border-color: #2262FB;
  color: #2262FB;
  background-color: #ECF5FF;
}

.feature-radio:hover:not(.is-checked) :deep(.el-radio__label) {
  color: #2262FB;
}

/* 选中后的勾选图标 */
.check-icon {
  font-size: 12px;
  margin-left: 2px;
}

 .list-header {
   margin-bottom: 0;
   font-size: 14px;
   color: #606266;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 16px 20px;
   background-color: #f5f7fa;
   border-radius: 8px 8px 0 0;
 }

 .list-header strong {
   color: #2262FB;
   margin: 0 4px;
   font-size: 16px;
 }

 .sort-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 16px;
  }

 .sort-tabs .search-wrapper {
   flex: 1;
   display: flex;
   justify-content: center;
 }

 .sort-tabs .search-input {
   width: 400px;
 }

 .question-count {
   font-size: 14px;
   color: #606266;
   white-space: nowrap;
 }

 .question-count strong {
   color: #2262FB;
   margin: 0 4px;
   font-size: 16px;
 }

.sort-options {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-label {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

.sort-tab {
  position: relative;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.sort-tab:hover {
  color: #2262FB;
}

.sort-tab.active {
  color: #2262FB;
  font-weight: 600;
}

.sort-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #2262FB;
  border-radius: 3px;
}

.question-list-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
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
  padding: 15px 20px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  cursor: pointer;
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

.tags-row {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #EBEEF5;
  padding-right: 80px; /* 防止与右上角标签重叠 */
}

.meta-items {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #909399;
  flex: 1;
  min-width: 0; /* 关键：允许flex子项收缩 */
}

.meta-item {
  white-space: nowrap;
}

.kp-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
  height: 20px; /* 保持与行高一致，防止抖动 */
  line-height: 20px;
}

.kp-text-truncated {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #909399;
}

.kp-text-full {
  display: none;
  position: absolute;
  top: -8px;
  left: -8px;
  right: -20px; /* 向右延伸一点 */
  background: #ffffff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 8px 12px;
  border-radius: 4px;
  white-space: normal;
  color: #606266;
  line-height: 1.5;
  min-width: 100%;
  width: max-content;
  max-width: 500px; /* 限制最大宽度，防止溢出太多 */
}

.kp-wrapper.can-expand:hover .kp-text-full {
  display: block;
}

.kp-wrapper.can-expand:hover .kp-text-truncated {
  visibility: hidden;
}

.collapse-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  display: none; /* 暂时隐藏图标，因为是hover自动收起 */
}

.meta-divider {
  color: #DCDFE6;
  margin: 0 2px;
}

.feature-tag {
  display: inline-block;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 8px 0 8px 0; /* Asymmetric corners */
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  color: #2262FB;
  background-color: #ECF5FF;
  border: none;
}

.source-tag {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.question-text {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
}

.question-text :deep(.highlight) {
  color: #2262FB;
  font-weight: 600;
  background-color: #ecf5ff;
  padding: 0 2px;
  border-radius: 2px;
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

.filter-dropdown {
  margin-right: 10px;
}

.filter-dropdown:last-child {
  margin-right: 0;
}

.borderless-select {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
  background-color: #F5F7FA;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.3s;
  min-width: 90px;
  border: 1px solid #DCDFE6;
  outline: none;
}

.borderless-select:focus {
  outline: none;
  border: none;
}

.borderless-select:hover {
  background-color: #EBEEF5;
}

.clear-icon {
  cursor: pointer;
  transition: all 0.3s;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #C0C4CC;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.clear-icon:hover {
  background-color: #909399;
  transform: scale(1.1);
}

.borderless-select .el-icon {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.borderless-select .el-icon.clear-icon {
  color: #fff;
}

.reset-btn {
  margin-left: auto;
  font-size: 14px !important;
  color: #909399;
  font-weight: normal;
  padding: 0 12px !important;
  height: 32px !important;
  line-height: 32px !important;
  border: none !important;
  background-color: #F5F7FA !important;
  border-radius: 5px;
  width: auto !important;
  min-width: auto !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.reset-btn:hover {
  color: #606266;
  background-color: #EBEEF5 !important;
}

.reset-btn:active {
  color: #303133;
  background-color: #DCDFE6 !important;
  transition: none;
}

.reset-btn .el-icon {
  margin-right: 4px;
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
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f2f6fc;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.info-divider {
  color: #dcdfe6;
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

/* ==================== 快速组卷配置样式 ==================== */
.quick-paper-config {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-section {
  display: flex;
  flex-direction: column;
}

.config-section.horizontal {
  flex-direction: row;
  align-items: flex-start;
  gap: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
}

.config-section.horizontal .section-title {
  min-width: 120px;
  flex-shrink: 0;
  padding-bottom: 0;
  padding-right: 16px;
  line-height: 40px;
}

.section-content {
  flex: 1;
}

.title-input {
  width: 100%;
}

.title-input :deep(.el-input__wrapper) {
  min-height: 40px;
}

/* 参考范围 */
.reference-scope {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 40px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 100%;
}

.knowledge-tag {
  font-size: 14px;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  line-height: 24px;
}

/* 难度占比 */
.difficulty-ratio {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 100%;
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ratio-label {
  font-size: 14px;
  color: #606266;
  min-width: 120px;
}

.ratio-input {
  width: 120px;
}

.ratio-unit {
  font-size: 14px;
  color: #606266;
}

.ratio-total {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.ratio-total.error {
  color: #F56C6C;
}

.ratio-error {
  font-size: 14px;
  font-weight: 400;
  color: #F56C6C;
  margin-left: 8px;
}

/* 试题类型 */
.question-types {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 100%;
}

.type-checkbox {
  margin-right: 0;
}

.type-checkbox :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

.type-checkbox.is-checked :deep(.el-checkbox__label) {
  color: #2262FB;
  font-weight: 500;
}

/* 试题配置表格 */
.config-table {
  width: 100%;
  font-size: 14px;
}

.config-table :deep(.el-table__header-wrapper) {
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.config-table :deep(.el-table__cell) {
  padding: 12px 0;
}

.config-table :deep(.el-input-number) {
  width: 100%;
}

.order-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.order-controls .el-button {
  padding: 4px;
}

.table-summary {
  display: flex;
  justify-content: flex-end;
  gap: 32px;
  padding: 16px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
}

.summary-item {
  font-size: 14px;
  color: #606266;
}

.summary-item strong {
  font-size: 16px;
  font-weight: 600;
  color: #2262FB;
  margin-left: 4px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.generate-btn {
  width: 160px;
  font-size: 16px;
}

.reset-btn {
  width: 160px;
  font-size: 16px;
}
.sub-type-row {
  background-color: #f5f7fa; /* Light background to distinguish */
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 4px; /* Connect visually to the row above */
  margin-bottom: 15px;
  position: relative; /* For pseudo-element */
  align-items: center; /* Vertically align label and options */
}

.sub-type-row .filter-label {
  width: auto;
  white-space: nowrap;
}

/* Connector arrow */
.sub-type-row::after {
  content: '';
  position: absolute;
  top: -8px;
  left: var(--arrow-left, 215px); /* Use variable with fallback */
  border-width: 0 8px 8px;
  border-style: solid;
  border-color: transparent transparent #f5f7fa;
  transition: left 0.3s; /* Smooth transition */
}

.sub-type-tag {
  display: inline-block;
  padding: 0 12px;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  background-color: transparent;
  border: none;
  transition: all 0.3s;
  line-height: 24px;
}

.sub-type-tag:hover {
  color: #2262FB;
}

.sub-type-tag.active {
  color: #2262FB;
  font-weight: 600;
  background-color: transparent;
  border: none;
}

/* 去掉下拉菜单项的黑色边框 */
:deep(.el-dropdown-menu__item) {
  border: none !important;
  outline: none !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
  border: none !important;
  outline: none !important;
}

:deep(.el-dropdown-menu__item:focus) {
  background-color: #f5f7fa;
  border: none !important;
  outline: none !important;
}
</style>


