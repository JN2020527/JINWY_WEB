# AGENTS.md - Guidelines for AI Coding Agents

This file provides coding guidelines for agentic development in this Vue 3 educational platform repository.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server (auto-opens http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note**: No linting or test commands are configured in package.json. Always verify code manually via `lsp_diagnostics` before committing.

## Technology Stack

- **Vue 3.3+** with Composition API (exclusive)
- **Vite 4.5+** build tooling
- **Element Plus 2.4+** UI library (zh-cn locale)
- **@element-plus/icons-vue** - All icons globally registered

## Code Style Guidelines

### Component Structure

All components use `<script setup>` syntax with this structure:
```vue
<template>
  <!-- Template content -->
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { IconName } from '@element-plus/icons-vue'

// Props definition with type validation
const props = defineProps({
  propName: {
    type: String,
    default: 'default-value'
  }
})

// Emits definition (array syntax)
const emit = defineEmits(['eventName'])

// Reactive state (ref only, no reactive())
const stateVar = ref('value')

// Computed properties
const computedValue = computed(() => ...)

// Functions
const handleEvent = () => {
  emit('eventName', data)
}
</script>

<style scoped>
/* Scoped component styles */
</style>
```

### Import Order

```javascript
// 1. Vue imports
import { ref, computed, onMounted } from 'vue'

// 2. Element Plus components
import { ElMessage, ElMessageBox } from 'element-plus'

// 3. Element Plus icons (multi-line alphabetical)
import {
  Search,
  ArrowDown,
  User
} from '@element-plus/icons-vue'

// 4. Component imports (PascalCase, relative paths)
import Header from './components/Header.vue'
import DigitalLibrary from './components/DigitalLibrary.vue'

// 5. Store/composable imports (last)
import { useStore } from './store'
```

**Never** include file extensions in import statements.

### Naming Conventions

- **Components**: PascalCase (e.g., `Header.vue`, `DigitalLibrary.vue`)
- **Variables/Functions**: camelCase (e.g., `currentLeftMenu`, `handleMenuClick`)
- **Constants**: camelCase (e.g., `menuMap`, `categoryTabs`)
- **CSS Classes**: kebab-case with BEM modifiers (e.g., `nav-item`, `nav-item active`)
- **Template Refs**: camelCase with `Ref` suffix (e.g., `digitalLibraryRef`)

### Props & Emits

```javascript
// Props: Object syntax with types and defaults
const props = defineProps({
  showTabs: {
    type: Boolean,
    default: true
  },
  currentTab: {
    type: Number,
    default: 0,
    required: false
  }
})

// Emits: Array of event names
const emit = defineEmits(['tabChange', 'menuChange'])
```

### State Management

Use `ref()` for all reactive state (no `reactive()`):

```javascript
// Primitives
const isOpen = ref(false)
const currentIndex = ref(0)

// Arrays and Objects
const items = ref([])
const filters = ref({
  type: 'all',
  status: 'active'
})

// Computed for derived state
const filteredItems = computed(() => {
  return items.value.filter(item => item.status === filters.value.status)
})

// Always access ref values with .value in JavaScript
```

### Event Handling

```javascript
// Template: Standard @event binding
<component @click="handleClick" @custom-event="handleCustomEvent($event)" />

// Function: Emit to parent
const handleClick = () => {
  emit('eventName', data)
}

// Event modifiers when needed
<div @click.stop="handleClick" />
```

### Styling Guidelines

**Component Styles:**
- All components use `<style scoped>` for isolation
- 2-space indentation
- Use `:deep()` for Element Plus component overrides

```vue
<style scoped>
.container {
  padding: 20px;
}

/* Override Element Plus styles within scoped component */
:deep(.el-input__wrapper) {
  border-radius: 8px;
}
</style>
```

**Global Utilities** (from `src/styles/global.css`):
- `.d_f` - display: flex
- `.a_c` - align-items: center
- `.fl` - float: left
- `.fr` - float: right
- `.clearfix::after` - clear floats

**Colors:**
- Primary: `#409eff` (Element Plus blue)
- Custom gradients: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Spacing: Multiples of 4px (8px, 16px, 20px, 24px)

**Responsive Design:**
- Mobile-first approach
- Primary breakpoint: `@media (max-width: 768px)`
- Secondary breakpoint: `@media (max-width: 992px)`

### Comments & Documentation

```javascript
// Chinese comments for internal explanations
// 当前选中的左侧菜单，默认选中"首页"

// Section headers
// 组件引用
// 组卷中心相关状态

// Template comments
<!-- 组卷中心 - 独立页面，不属于任何菜单 -->
```

**All user-facing strings MUST be in Chinese.**

### Error Handling

Use Element Plus messaging system:

```javascript
import { ElMessage } from 'element-plus'

// Success messages
ElMessage.success('操作成功')

// Warning messages
ElMessage.warning('请先选择内容')

// Error messages
ElMessage.error('操作失败')

// Async operations with try-catch
try {
  await fetchData()
} catch (error) {
  console.error('Error:', error)
  ElMessage.error('加载数据失败')
}
```

### Template Patterns

**Conditional Rendering:**
```html
<div v-if="condition">Content</div>
<div v-else-if="otherCondition">Other content</div>
<div v-else>Fallback content</div>
```

**List Rendering:**
```html
<li v-for="(item, index) in items" :key="item.id">
  {{ item.name }}
</li>
```

**Dynamic Classes:**
```html
<div :class="{ active: isActive }" />
<div :class="['base-class', { modifier: condition }]" />
```

**Component Communication:**
```html
<ParentComponent
  :prop-name="value"
  @event-name="handleEvent"
/>
```

**Dynamic Components:**
```html
<component :is="componentName" />
<component :is="iconComponent" />
```

### Icon Usage

All Element Plus icons are globally registered. Use them directly:

```html
<!-- Direct icon use -->
<el-icon><Search /></el-icon>
<el-icon><ArrowDown /></el-icon>

<!-- Dynamic icon -->
<el-icon><component :is="iconName" /></el-icon>

<!-- Import for TypeScript reference (optional) -->
import { Search, ArrowDown } from '@element-plus/icons-vue'
```

### Component Communication

**State Reset Pattern** (expose `resetState()` via template refs):

```javascript
// In child component
const resetState = () => {
  // Reset all state to initial values
  currentTab.value = 0
  searchKeyword.value = ''
}

defineExpose({ resetState })

// In parent component
const childRef = ref(null)
const handleClick = () => {
  if (childRef.value) {
    childRef.value.resetState()
  }
}
```

### Navigation Architecture

This app uses **conditional rendering** (not Vue Router). Navigation state managed in `App.vue`:
- `currentLeftMenu`: Controls which page component renders
- `currentTab`: Controls active tab within pages that support tabs
- `showPaperCenter`: Special overlay mode for test paper creation

When adding new pages:
1. Import component in `App.vue`
2. Add menu item with unique key
3. Add conditional render in template
4. Add entry to `menuMap` object

### File Organization

```
src/
├── components/          # All Vue components (PascalCase.vue)
│   ├── Header.vue
│   ├── LeftNav.vue
│   └── PaperCenter/    # Sub-components for complex features
│       └── SubComponent.vue
├── mock/
│   └── data.js         # Mock data exports
├── styles/
│   └── global.css      # Global styles and utilities
├── App.vue             # Root component (orchestrates navigation)
└── main.js             # App initialization (icon registration)
```

### Special Considerations

1. **No Backend**: All data comes from `src/mock/data.js`
2. **No Routing**: Navigation via conditional rendering in `App.vue`
3. **Chinese Locale**: Element Plus configured with `zh-cn`
4. **Path Alias**: Use `@/` for `src/` directory imports
5. **No Tests**: No test framework configured

### Prohibited Patterns

- ❌ `as any`, `@ts-ignore`, `@ts-expect-error` for type suppression
- ❌ Empty catch blocks: `catch(e) {}`
- ❌ Deleting failing tests to "pass"
- ❌ Mixing Vue 2 and Vue 3 patterns
- ❌ Using `reactive()` (use `ref()` only)
- ❌ Non-scoped styles (always use `<style scoped>`)
- ❌ Tailwind or other CSS frameworks (use native CSS + Element Plus)

### Verification Checklist

Before marking a task complete:
- [ ] Run `lsp_diagnostics` on changed files (must be clean)
- [ ] Run `npm run build` (must exit with code 0)
- [ ] Verify UI text is in Chinese
- [ ] Check `<style scoped>` is used
- [ ] Ensure imports follow order convention
- [ ] Confirm camelCase variable/function naming
- [ ] Validate component communication (props down, events up)

---

**Remember**: This is a Vue 3 Composition API project with Chinese localization. Maintain consistency with existing patterns and always use Element Plus for UI components.
