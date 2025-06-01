<template>
  <div class="editor-container">
    <!-- 移动端预览切换按钮 -->
    <div class="mobile-tabs">
      <button 
        @click="activeTab = 'edit'" 
        :class="{ active: activeTab === 'edit' }"
      >编辑</button>
      <button 
        @click="activeTab = 'original'" 
        :class="{ active: activeTab === 'original' }"
      >原始预览</button>
      <button 
        @click="activeTab = 'transformed'" 
        :class="{ active: activeTab === 'transformed' }"
      >转换预览</button>
    </div>
    
    <div class="editor-content">
      <!-- 编辑面板 -->
      <div class="editor-panel" :class="{ 'mobile-hidden': isMobile && activeTab !== 'edit' }">
        <div class="panel-header">编辑</div>
        <textarea
          v-model="markdownContent"
          class="markdown-input"
          placeholder="请输入Markdown内容..."
          @input="updateContent"
        ></textarea>
      </div>
      
      <!-- 原始预览面板 -->
      <div class="preview-panel" :class="{ 'mobile-hidden': isMobile && activeTab !== 'original' }">
        <div class="panel-header">原始预览</div>
        <div class="preview-container">
          <div v-html="originalHtml"></div>
        </div>
      </div>
      
      <!-- 转换预览面板 -->
      <div class="preview-panel" :class="{ 'mobile-hidden': isMobile && activeTab !== 'transformed' }">
        <div class="panel-header">转换预览</div>
        <div class="preview-container transformed">
          <div ref="transformedContent" v-html="transformedHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, h, render } from 'vue';
import { parseMarkdown, renderTransformedMarkdown, getTransformedContentForCopy } from '../utils/markdownParser';
import QRCodeGenerator from './QRCodeGenerator.vue';

export default {
  name: 'MarkdownEditor',
  components: {
    QRCodeGenerator
  },
  props: {
    initialContent: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const markdownContent = ref(props.initialContent);
    const originalHtml = ref('');
    const transformedHtml = ref('');
    const transformedContent = ref(null);
    const isMobile = ref(false);
    const activeTab = ref('edit'); // 默认显示编辑面板
    
    // 检测是否为移动设备
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
      // 如果是移动设备，默认显示编辑面板
      if (isMobile.value) {
        activeTab.value = 'edit';
      }
    };
    
    const updateContent = async () => {
      originalHtml.value = parseMarkdown(markdownContent.value);
      transformedHtml.value = await renderTransformedMarkdown(markdownContent.value);
      emit('update:content', markdownContent.value);
    };
    
    const insertQRCodes = () => {
      if (!transformedContent.value) return;
      
      const qrcodePlaceholders = transformedContent.value.querySelectorAll('.qrcode-placeholder');
      
      qrcodePlaceholders.forEach(placeholder => {
        const url = placeholder.getAttribute('data-url');
        if (!url) return;
        
        // 创建QRCode组件实例
        const QRCodeComponent = h(QRCodeGenerator, { url, size: 100 });
        const container = document.createElement('div');
        placeholder.parentNode.insertBefore(container, placeholder);
        
        // 渲染组件到容器
        render(QRCodeComponent, container);
        placeholder.remove();
      });
    };
    
    // 监听transformedHtml变化，确保二维码正确显示
    watch(transformedHtml, () => {
      nextTick(() => {
        insertQRCodes();
      });
    });
    
    watch(() => props.initialContent, async (newVal) => {
      markdownContent.value = newVal;
      await updateContent();
    });
    
    // 监听窗口大小变化
    const handleResize = () => {
      checkMobile();
    };
    
    onMounted(async () => {
      await updateContent();
      checkMobile(); // 初始检测设备类型
      window.addEventListener('resize', handleResize);
    });
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      markdownContent,
      originalHtml,
      transformedHtml,
      transformedContent,
      updateContent,
      isMobile,
      activeTab
    };
  }
};
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 1px;
  background-color: #ddd;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow: hidden;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow: hidden;
  min-width: 0; /* 确保内容不会溢出 */
  width: 0; /* 强制两个预览区域宽度相同 */
}

.panel-header {
  padding: 8px 16px;
  background-color: #f0f0f0;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 1rem;
}

.markdown-input {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow: auto;
}

.preview-container {
  flex: 1;
  padding: 16px;
  overflow: auto;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  font-size: 14px;
}

.preview-container img,
.preview-container pre,
.preview-container code,
.preview-container table {
  max-width: 100%;
  white-space: pre-wrap;
  height: auto;
}

.preview-container pre {
  overflow-x: auto;
}

.preview-container pre code {
  white-space: pre-wrap;
}

.preview-container * {
  max-width: 100%;
}

.transformed :deep(.link-container) {
  display: flex;
  align-items: flex-start;
  margin: 10px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  text-align: left;
  flex-wrap: nowrap;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 确保图片和链接在同一行显示 */
.transformed img {
  display: inline-block;
  vertical-align: top;
  max-width: 100px;
  height: auto;
  flex-shrink: 0;
  margin-right: 15px;
}

.transformed :deep(a) {
  display: inline-block;
  vertical-align: middle;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;
  padding: 5px 0;
}

.transformed .qrcode-container {
  flex-shrink: 0;
  margin-right: 15px;
  width: 100px;
}

/* 移动端切换按钮 */
.mobile-tabs {
  display: none;
  background-color: #f0f0f0;
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.mobile-tabs button {
  padding: 6px 12px;
  margin: 0 4px;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.mobile-tabs button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.mobile-hidden {
  display: none !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-tabs {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .editor-content {
    flex-direction: column;
  }
  
  .editor-panel,
  .preview-panel {
    flex: none;
    width: 100%;
    height: auto;
  }
  
  .editor-panel,
  .preview-panel {
    height: calc(100vh - 180px);
  }
  
  .panel-header {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  
  .markdown-input,
  .preview-container {
    padding: 10px;
    font-size: 12px;
  }
  
  .transformed :deep(.link-container) {
    padding: 8px;
    margin: 8px 0;
  }
  
  .transformed img,
  .transformed .qrcode-container {
    max-width: 80px;
    width: 80px;
    margin-right: 10px;
  }
}
</style>