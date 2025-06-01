<template>
  <div class="home-container">
    <h1>Markdown标题外链转二维码</h1>
    <p class="description">将Markdown中带超链接的标题提取出来，放在标题下方，并在左侧生成对应的二维码图片</p>
    
    <div class="actions">
      <button @click="loadSample">加载示例</button>
      <button @click="clearContent">清空内容</button>
      <button @click="copyTransformed">复制转换后内容</button>
    </div>
    
    <div class="editor-wrapper">
      <MarkdownEditor 
        :initial-content="markdownContent" 
        @update:content="markdownContent = $event" 
        ref="editor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import { getTransformedContentForCopy } from '../utils/markdownParser';

// 从localStorage读取缓存的内容，如果没有则使用空字符串
const savedContent = localStorage.getItem('markdownContent') || '';
const markdownContent = ref(savedContent);
const editor = ref(null);

const sampleMarkdown = `# [Vue.js官网](https://vuejs.org/)

Vue.js是一个流行的JavaScript前端框架。

## [Vite官方文档](https://vitejs.dev/)

Vite是一个现代前端构建工具，提供了极速的开发体验。

### [Markdown语法指南](https://www.markdownguide.org/)

Markdown是一种轻量级标记语言，创建格式化文本的语法简洁明了。`;

// 如果没有缓存内容，则默认加载示例内容
if (!savedContent) {
  markdownContent.value = sampleMarkdown;
}

// 监听内容变化，保存到localStorage
watch(markdownContent, (newContent) => {
  localStorage.setItem('markdownContent', newContent);
});

const loadSample = () => {
  markdownContent.value = sampleMarkdown;
};

const clearContent = () => {
  markdownContent.value = '';
  localStorage.removeItem('markdownContent');
};

const copyTransformed = async () => {
  try {
    const transformedContent = await getTransformedContentForCopy(markdownContent.value);
    await navigator.clipboard.writeText(transformedContent);
    alert('转换后的内容已复制到剪贴板！');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制。');
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.description {
  color: #666;
  margin-bottom: 20px;
  font-size: 1rem;
}

.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.actions button:hover {
  background-color: #45a049;
}

.editor-wrapper {
  width: 100%;
  height: 75vh;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .description {
    font-size: 0.9rem;
  }
  
  .actions button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .editor-wrapper {
    height: 85vh;
  }
}
</style>