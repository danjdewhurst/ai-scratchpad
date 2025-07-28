<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { openRouterService } from './services/openrouter';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Register syntax module with Quill
const QUILL_TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline'],
  ['blockquote', 'code-block'],
  [{ 'header': [1, 2, false] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['clean']
];


// Check if we're running in Tauri context
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

const noteContent = ref("");
const NOTE_FILE = 'note.html';
const quillEditor = ref<InstanceType<typeof QuillEditor> | null>(null);
const selectedText = ref("");
const showAIMenu = ref(false);
const aiMenuPosition = ref({ x: 0, y: 0 });
const isProcessing = ref(false);
const showApiKeyDialog = ref(false);
const apiKey = ref("");
const baseURL = ref("https://openrouter.ai/api/v1");
const showSettingsPanel = ref(false);
const isDarkMode = ref(false);
const isReplaceMode = ref(false);
const showClearConfirmDialog = ref(false);

// Toast notifications
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

const toasts = ref<Toast[]>([]);

const showToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
  const id = Date.now().toString();
  const toast: Toast = { id, message, type, duration };
  toasts.value.push(toast);
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Theme management
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDarkMode.value = false;
    document.documentElement.classList.remove('dark');
  }
};

// Load note on app startup
onMounted(async () => {
  initTheme();
  if (!isTauri) {
    // Browser mode - load from localStorage
    const saved = localStorage.getItem('ai-scratchpad-content');
    if (saved) {
      noteContent.value = saved;
    } else {
      noteContent.value = "<p>Welcome to your AI-powered scratchpad! Try typing some text here.</p>";
    }
    // Highlight code blocks after content is loaded
    nextTick(() => {
      highlightCodeBlocks();
    });
    return;
  }

  try {
    // Tauri mode - load from file system
    const { appDataDir } = await import('@tauri-apps/api/path');
    const { readTextFile, exists } = await import('@tauri-apps/plugin-fs');
    
    const appDataPath = await appDataDir();
    const notePath = `${appDataPath}${NOTE_FILE}`;
    
    if (await exists(notePath)) {
      const content = await readTextFile(notePath);
      noteContent.value = content;
    } else {
      noteContent.value = "<p>Welcome to your AI-powered scratchpad! Try typing some text here.</p>";
    }
    
    // Highlight code blocks after content is loaded
    nextTick(() => {
      highlightCodeBlocks();
    });
  } catch (error) {
    console.error('Failed to load note:', error);
    noteContent.value = "<p>Welcome to your AI-powered scratchpad! Try typing some text here.</p>";
  }
});

// Debounced auto-save functionality
let saveTimeout: number | null = null;
const debouncedSave = async (newContent: string) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    if (!isTauri) {
      // Browser mode - save to localStorage
      try {
        localStorage.setItem('ai-scratchpad-content', newContent);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        showToast('Failed to save note to local storage', 'error');
      }
      return;
    }

    try {
      // Tauri mode - save to file system
      const { appDataDir } = await import('@tauri-apps/api/path');
      const { writeTextFile, exists, mkdir } = await import('@tauri-apps/plugin-fs');
      
      const appDataPath = await appDataDir();
      
      // Ensure directory exists
      if (!await exists(appDataPath)) {
        await mkdir(appDataPath, { recursive: true });
      }
      
      const notePath = `${appDataPath}${NOTE_FILE}`;
      await writeTextFile(notePath, newContent);
    } catch (error) {
      console.error('Failed to save note:', error);
      showToast('Failed to save note to file system', 'error');
    }
  }, 1000); // 1 second debounce
};

// Auto-save functionality
watch(noteContent, debouncedSave, { immediate: false });

// Syntax highlighting watcher
watch(noteContent, () => {
  nextTick(() => {
    highlightCodeBlocks();
  });
}, { immediate: false });

// Function to highlight code blocks
const highlightCodeBlocks = () => {
  if (!quillEditor.value?.getQuill) return;
  
  const quill = quillEditor.value.getQuill();
  const container = quill.container;
  
  // Find all code blocks and apply syntax highlighting
  const codeBlocks = container.querySelectorAll('pre.ql-syntax');
  codeBlocks.forEach((block: Element) => {
    const codeElement = block as HTMLElement;
    if (codeElement.dataset.highlighted !== 'yes') {
      const originalText = codeElement.textContent || '';
      const result = hljs.highlightAuto(originalText);
      codeElement.innerHTML = result.value;
      codeElement.dataset.highlighted = 'yes';
      codeElement.classList.add('hljs');
    }
  });
};

// Handle text selection with debouncing
let selectionTimeout: number | null = null;
const handleSelectionChange = () => {
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  selectionTimeout = setTimeout(() => {
    nextTick(() => {
      if (!quillEditor.value?.getQuill) return;
      
      const quill = quillEditor.value.getQuill();
      const selection = quill.getSelection();
      
      if (selection && selection.length > 0) {
        const text = quill.getText(selection.index, selection.length).trim();
        if (text) {
          selectedText.value = text;
          showAIMenu.value = true;
          
          // Position menu near cursor - below selection to avoid covering text
          const bounds = quill.getBounds(selection.index, selection.length);
          const editorRect = quill.container.getBoundingClientRect();
          
          // Calculate initial position below the selection
          let menuX = editorRect.left + bounds.left;
          let menuY = editorRect.top + bounds.top + bounds.height + 10;
          
          // Ensure menu doesn't go off-screen
          const menuWidth = 300; // Approximate menu width
          const menuHeight = 120; // Approximate menu height
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Adjust horizontal position if menu would go off right edge
          if (menuX + menuWidth > viewportWidth) {
            menuX = viewportWidth - menuWidth - 20;
          }
          
          // Adjust horizontal position if menu would go off left edge
          if (menuX < 20) {
            menuX = 20;
          }
          
          // If menu would go off bottom, position it above the selection instead
          if (menuY + menuHeight > viewportHeight) {
            menuY = editorRect.top + bounds.top - menuHeight - 10;
          }
          
          // If still off-screen at top, position it within viewport
          if (menuY < 20) {
            menuY = 20;
          }
          
          aiMenuPosition.value = {
            x: menuX,
            y: menuY
          };
        }
      } else {
        showAIMenu.value = false;
        selectedText.value = "";
      }
    });
  }, 150); // 150ms debounce for selection
};

// AI Actions
const summarizeText = async () => {
  if (!selectedText.value || isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    const summary = await openRouterService.summarize(selectedText.value);
    if (isReplaceMode.value) {
      replaceSelectedText(summary);
    } else {
      insertAIResponse(summary);
    }
    showToast('Text summarized successfully', 'success', 2000);
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key not configured')) {
      showApiKeyDialog.value = true;
      showToast('API key required for AI features', 'info');
    } else {
      showToast(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  } finally {
    isProcessing.value = false;
    showAIMenu.value = false;
  }
};

const createBulletPoints = async () => {
  if (!selectedText.value || isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    const bulletPoints = await openRouterService.bulletPoints(selectedText.value);
    if (isReplaceMode.value) {
      replaceSelectedText(bulletPoints);
    } else {
      insertAIResponse(bulletPoints);
    }
    showToast('Bullet points created successfully', 'success', 2000);
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key not configured')) {
      showApiKeyDialog.value = true;
      showToast('API key required for AI features', 'info');
    } else {
      showToast(`Bullet points creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  } finally {
    isProcessing.value = false;
    showAIMenu.value = false;
  }
};

const tidyText = async () => {
  if (!selectedText.value || isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    const tidiedText = await openRouterService.tidy(selectedText.value);
    if (isReplaceMode.value) {
      replaceSelectedText(tidiedText);
    } else {
      insertAIResponse(tidiedText);
    }
    showToast('Text tidied successfully', 'success', 2000);
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key not configured')) {
      showApiKeyDialog.value = true;
      showToast('API key required for AI features', 'info');
    } else {
      showToast(`Text tidying failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  } finally {
    isProcessing.value = false;
    showAIMenu.value = false;
  }
};

const insertAIResponse = (response: string) => {
  if (!quillEditor.value?.getQuill) return;
  
  const quill = quillEditor.value.getQuill();
  const selection = quill.getSelection();
  
  if (selection) {
    // Insert AI response after selected text
    const insertIndex = selection.index + selection.length;
    
    // Check if response is HTML (contains < and > tags)
    if (response.includes('<') && response.includes('>')) {
      // Insert HTML content using clipboard API
      quill.insertText(insertIndex, '\n\n');
      quill.setSelection(insertIndex + 2);
      quill.clipboard.dangerouslyPasteHTML(insertIndex + 2, response);
      quill.insertText(insertIndex + 2 + response.length, '\n\n');
    } else {
      // Insert as plain text
      quill.insertText(insertIndex, '\n\n' + response + '\n\n');
      quill.setSelection(insertIndex + response.length + 4);
    }
  }
};

const replaceSelectedText = (response: string) => {
  if (!quillEditor.value?.getQuill) return;
  
  const quill = quillEditor.value.getQuill();
  const selection = quill.getSelection();
  
  if (selection) {
    // Replace selected text with AI response
    quill.deleteText(selection.index, selection.length);
    
    // Check if response is HTML (contains < and > tags)
    if (response.includes('<') && response.includes('>')) {
      // Insert HTML content using clipboard API
      quill.clipboard.dangerouslyPasteHTML(selection.index, response);
    } else {
      // Insert as plain text
      quill.insertText(selection.index, response);
      quill.setSelection(selection.index + response.length);
    }
  }
};

// Clear functionality
const showClearConfirm = () => {
  showClearConfirmDialog.value = true;
};

const clearContent = async () => {
  // Clear the Quill editor directly
  if (quillEditor.value?.getQuill) {
    const quill = quillEditor.value.getQuill();
    
    // Clear content and set cursor at the beginning with proper formatting
    quill.setContents([{ insert: '\n' }]);
    quill.setSelection(0, 0);
    
    // Ensure the editor maintains focus and proper state
    quill.focus();
  }
  
  // Also update the reactive content
  noteContent.value = "";
  
  showClearConfirmDialog.value = false;
  showToast('Content cleared', 'success', 2000);
};

const cancelClear = () => {
  showClearConfirmDialog.value = false;
};

// Copy as markdown functionality
const copyAsMarkdown = async () => {
  if (!quillEditor.value?.getQuill) return;
  
  try {
    const quill = quillEditor.value.getQuill();
    const delta = quill.getContents();
    
    // Convert Quill Delta to markdown
    let markdown = '';
    
    delta.ops?.forEach((op) => {
      if (typeof op.insert === 'string') {
        let text = op.insert;
        
        // Handle formatting
        if (op.attributes) {
          if (op.attributes.bold) {
            text = `**${text}**`;
          }
          if (op.attributes.italic) {
            text = `*${text}*`;
          }
          if (op.attributes.underline) {
            text = `<u>${text}</u>`;
          }
          if (op.attributes.code) {
            text = `\`${text}\``;
          }
          if (op.attributes['code-block']) {
            text = `\`\`\`\n${text}\n\`\`\``;
          }
          if (op.attributes.blockquote) {
            text = `> ${text}`;
          }
          if (op.attributes.header) {
            const level = op.attributes.header;
            text = `${'#'.repeat(level)} ${text}`;
          }
          if (op.attributes.list === 'ordered') {
            text = `1. ${text}`;
          }
          if (op.attributes.list === 'bullet') {
            text = `- ${text}`;
          }
        }
        
        markdown += text;
      } else if (op.insert && typeof op.insert === 'object') {
        // Handle embeds (images, etc.)
        if (op.insert.image) {
          markdown += `![Image](${op.insert.image})`;
        }
      }
    });
    
    // Clean up markdown - remove extra whitespace and fix line breaks
    markdown = markdown
      .replace(/\n\n+/g, '\n\n')
      .trim();
    
    // Copy to clipboard
    await navigator.clipboard.writeText(markdown);
    showToast('Content copied as markdown', 'success', 2000);
  } catch (error) {
    console.error('Failed to copy as markdown:', error);
    showToast('Failed to copy content', 'error');
  }
};

// API Key Management
const saveApiKey = async () => {
  if (!apiKey.value.trim()) return;
  
  try {
    await openRouterService.setApiKey(apiKey.value.trim());
    await openRouterService.setBaseURL(baseURL.value.trim());
    showApiKeyDialog.value = false;
    apiKey.value = "";
    baseURL.value = "https://openrouter.ai/api/v1";
    showToast('API configuration saved successfully!', 'success');
  } catch (error) {
    showToast(`Error saving API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
};

const checkApiKey = async () => {
  try {
    const existingKey = await openRouterService.getApiKey();
    const existingBaseURL = await openRouterService.getBaseURL();
    
    if (!existingKey) {
      // Load existing base URL into the form if available
      baseURL.value = existingBaseURL;
      showApiKeyDialog.value = true;
    }
  } catch (error) {
    console.error('Failed to check API key:', error);
    showApiKeyDialog.value = true;
  }
};

const openApiConfig = async () => {
  try {
    const existingBaseURL = await openRouterService.getBaseURL();
    baseURL.value = existingBaseURL;
    showApiKeyDialog.value = true; 
    showSettingsPanel.value = false;
  } catch (error) {
    console.error('Failed to load API config:', error);
    showApiKeyDialog.value = true;
    showSettingsPanel.value = false;
  }
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
  
  // Handle tab key for bullet point indentation
  if (event.key === 'Tab' && quillEditor.value?.getQuill) {
    const quill = quillEditor.value.getQuill();
    const selection = quill.getSelection();
    
    if (selection) {
      const format = quill.getFormat(selection.index);
      
      // Check if we're in a list
      if (format.list) {
        event.preventDefault();
        
        if (event.shiftKey) {
          // Shift+Tab: Decrease indent (outdent)
          quill.format('indent', '-1');
        } else {
          // Tab: Increase indent
          quill.format('indent', '+1');
        }
        return;
      }
    }
  }
  
  // Handle down arrow key to escape code blocks and blockquotes
  if (event.key === 'ArrowDown' && quillEditor.value?.getQuill) {
    const quill = quillEditor.value.getQuill();
    const selection = quill.getSelection();
    
    if (selection) {
      const format = quill.getFormat(selection.index);
      const length = quill.getLength();
      
      // Check if we're at the end of the document and in a code block or blockquote
      if (selection.index === length - 1 && (format['code-block'] || format.blockquote)) {
        event.preventDefault();
        
        // Insert a new line after the current block
        quill.insertText(length, '\n');
        // Set cursor to the new line and remove formatting
        quill.setSelection(length + 1);
        quill.removeFormat(length + 1, 1);
        return;
      }
      
      // Check if we're at the end of a code block or blockquote line but not at document end
      const currentLine = quill.getLine(selection.index);
      if (currentLine && currentLine[0]) {
        const lineEnd = selection.index + (currentLine[0].length() - (selection.index - currentLine[1]));
        
        // If we're at the end of the current line and it's a code block or blockquote
        if (selection.index >= lineEnd - 1 && (format['code-block'] || format.blockquote)) {
          // Check if the next line has the same format
          const nextFormat = quill.getFormat(lineEnd + 1);
          
          // If next line doesn't have the same block format, let natural behavior occur
          // If next line has the same format or we're at document end, create new normal paragraph
          if (lineEnd >= length - 1 || (format['code-block'] && nextFormat['code-block']) || (format.blockquote && nextFormat.blockquote)) {
            event.preventDefault();
            
            // Insert new line and remove block formatting
            quill.insertText(lineEnd, '\n');
            quill.setSelection(lineEnd + 1);
            quill.removeFormat(lineEnd + 1, 1);
            return;
          }
        }
      }
    }
  }
  
  // Settings shortcut (Cmd/Ctrl + ,)
  if (ctrlKey && event.key === ',') {
    event.preventDefault();
    showSettingsPanel.value = true;
    return;
  }
  
  // Escape key to close modals
  if (event.key === 'Escape') {
    if (showAIMenu.value) {
      showAIMenu.value = false;
      event.preventDefault();
    } else if (showSettingsPanel.value) {
      showSettingsPanel.value = false;
      event.preventDefault();
    } else if (showApiKeyDialog.value) {
      showApiKeyDialog.value = false;
      apiKey.value = "";
      baseURL.value = "https://openrouter.ai/api/v1";
      event.preventDefault();
    } else if (showClearConfirmDialog.value) {
      showClearConfirmDialog.value = false;
      event.preventDefault();
    }
    return;
  }
  
  // AI shortcuts when text is selected
  if (selectedText.value && showAIMenu.value) {
    if (ctrlKey && event.key === '1') {
      event.preventDefault();
      summarizeText();
    } else if (ctrlKey && event.key === '2') {
      event.preventDefault();
      createBulletPoints();
    } else if (ctrlKey && event.key === '3') {
      event.preventDefault();
      tidyText();
    }
  }
};

onMounted(() => {
  checkApiKey();
  document.addEventListener('keydown', handleKeydown);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (saveTimeout) clearTimeout(saveTimeout);
  if (selectionTimeout) clearTimeout(selectionTimeout);
});
</script>

<template>
  <main class="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 relative flex flex-col">
    <!-- Header -->
    <header class="flex-shrink-0 px-6 py-5 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          AI Scratchpad
        </h1>
        <div class="flex items-center gap-2">
          <button
            @click="toggleTheme"
            class="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm"
            title="Toggle theme"
          >
            <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          <button
            @click="showSettingsPanel = true"
            class="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm"
            title="Settings"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Editor Container -->
    <div class="flex-1 flex overflow-hidden">
      <div class="flex-1 flex flex-col">
        <!-- Editor -->
        <div class="flex-1 bg-white dark:bg-gray-900 mx-6 my-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
          <QuillEditor
            ref="quillEditor"
            v-model:content="noteContent"
            contentType="html"
            theme="snow"
            placeholder="Start writing your notes..."
            class="h-full"
            :options="{
              modules: {
                toolbar: QUILL_TOOLBAR_OPTIONS,
                history: {
                  delay: 1000,
                  maxStack: 100,
                  userOnly: true
                }
              },
              theme: 'snow',
              formats: ['bold', 'italic', 'underline', 'header', 'list', 'blockquote', 'code-block', 'indent'],
              readOnly: false
            }"
            @selection-change="handleSelectionChange"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <footer class="flex-shrink-0 px-6 py-3 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 backdrop-blur-xl">
      <div class="flex items-center justify-end gap-4">
        <button
          @click="copyAsMarkdown"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Copy as markdown"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <span>copy</span>
        </button>
        <button
          @click="showClearConfirm"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Clear all content"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span>clear</span>
        </button>
      </div>
    </footer>

    <!-- AI Menu -->
    <div
      v-if="showAIMenu"
      class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-sm p-4"
      :style="{ left: aiMenuPosition.x + 'px', top: aiMenuPosition.y + 'px' }"
    >
      <!-- Processing State -->
      <div v-if="isProcessing" class="flex items-center justify-center py-8 px-4">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-700 dark:text-gray-300 font-medium">Processing...</span>
        </div>
      </div>
      
      <!-- Menu Content -->
      <div v-else class="space-y-3">
        <!-- Mode Toggle -->
        <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400" :class="{ 'font-semibold text-gray-700 dark:text-gray-300': !isReplaceMode }">Insert</span>
            <button
              @click="isReplaceMode = !isReplaceMode"
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="isReplaceMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'"
            >
              <span
                class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                :class="isReplaceMode ? 'translate-x-5' : 'translate-x-0.5'"
              ></span>
            </button>
            <span class="text-xs text-gray-500 dark:text-gray-400" :class="{ 'font-semibold text-gray-700 dark:text-gray-300': isReplaceMode }">Replace</span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            @click="summarizeText"
            class="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            ✦ Summarize
          </button>
          <button
            @click="createBulletPoints"
            class="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            • Bullet Points
          </button>
          <button
            @click="tidyText"
            class="px-4 py-2 text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            ✨ Tidy
          </button>
          <button
            @click="showAIMenu = false"
            class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- API Key Configuration Dialog -->
    <div
      v-if="showApiKeyDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Configure AI API Settings
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure your AI API settings. For OpenRouter, get your API key from
          <a href="https://openrouter.ai" target="_blank" class="text-blue-500 hover:underline">openrouter.ai</a>.
        </p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <input
              v-model="apiKey"
              type="password"
              placeholder="Enter your API key"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="saveApiKey"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base URL
            </label>
            <input
              v-model="baseURL"
              type="url"
              placeholder="https://openrouter.ai/api/v1"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="saveApiKey"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              OpenAI-compatible API endpoint (defaults to OpenRouter if empty)
            </p>
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button
            @click="saveApiKey"
            :disabled="!apiKey.trim()"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            @click="showApiKeyDialog = false; apiKey = ''; baseURL = 'https://openrouter.ai/api/v1'"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div
      v-if="showSettingsPanel"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
            <button
              @click="showSettingsPanel = false"
              class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- API Key Section -->
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">AI API Settings</h3>
            <div class="space-y-2">
              <button
                @click="openApiConfig"
                class="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Update API Configuration
              </button>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Manage your API key and base URL for AI features
              </p>
            </div>
          </div>

          <!-- Editor Preferences -->
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Editor</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">Font Size</span>
                <select class="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                  <option>14px</option>
                  <option selected>16px</option>
                  <option>18px</option>
                  <option>20px</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts -->
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Keyboard Shortcuts</h3>
            <div class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div class="flex justify-between">
                <span>Settings</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + ,</span>
              </div>
              <div class="flex justify-between">
                <span>Close Dialog</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Esc</span>
              </div>
              <div class="flex justify-between">
                <span>Summarize (when text selected)</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + 1</span>
              </div>
              <div class="flex justify-between">
                <span>Bullet Points (when text selected)</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + 2</span>
              </div>
              <div class="flex justify-between">
                <span>Tidy Text (when text selected)</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + 3</span>
              </div>
              <div class="flex justify-between">
                <span>Bold</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + B</span>
              </div>
              <div class="flex justify-between">
                <span>Italic</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">⌘/Ctrl + I</span>
              </div>
              <div class="flex justify-between">
                <span>Indent List</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Tab</span>
              </div>
              <div class="flex justify-between">
                <span>Outdent List</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Shift + Tab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Confirmation Dialog -->
    <div
      v-if="showClearConfirmDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Clear Content</h2>
        </div>
        
        <div class="p-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to clear all content? This action cannot be undone.
          </p>
          
          <div class="flex gap-3 justify-end">
            <button
              @click="cancelClear"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="clearContent"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 transform"
        :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-blue-500 text-white': toast.type === 'info'
        }"
      >
        <div class="flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </main>
</template>

<style>
/* Quill editor dark mode styles */
.dark {
  .ql-toolbar {
    @apply bg-gray-800 border-gray-700;
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%) !important;
  }
  
  .ql-toolbar .ql-stroke {
    stroke: #d1d5db !important;
  }
  
  .ql-toolbar .ql-fill {
    fill: #d1d5db !important;
  }
  
  .ql-toolbar .ql-picker-label {
    color: #d1d5db !important;
  }
  
  .ql-toolbar .ql-picker-label:hover {
    color: #f3f4f6 !important;
  }
  
  .ql-toolbar button:hover .ql-stroke {
    stroke: #f3f4f6 !important;
  }
  
  .ql-toolbar button:hover .ql-fill {
    fill: #f3f4f6 !important;
  }
  
  .ql-toolbar button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px;
  }
  
  .ql-toolbar button.ql-active .ql-stroke {
    stroke: #3b82f6 !important;
  }
  
  .ql-toolbar button.ql-active .ql-fill {
    fill: #3b82f6 !important;
  }
  
  .ql-toolbar button.ql-active {
    background: rgba(59, 130, 246, 0.1) !important;
    border-radius: 6px;
  }
  
  .ql-toolbar .ql-picker-options {
    @apply bg-gray-800 border-gray-600;
  }
  
  .ql-toolbar .ql-picker-item {
    color: #d1d5db !important;
  }
  
  .ql-toolbar .ql-picker-item:hover {
    @apply bg-gray-700;
    color: #f3f4f6 !important;
  }
  
  .ql-container {
    @apply bg-gray-900 border-gray-700;
    background: linear-gradient(180deg, #111827 0%, #1f2937 100%) !important;
  }
  
  .ql-editor {
    @apply text-gray-100;
    background: transparent !important;
  }
  
  .ql-editor.ql-blank::before {
    @apply text-gray-500;
    font-style: italic;
    left: 32px;
    top: 32px;
    opacity: 0.7;
    font-weight: 300;
  }
  
  .ql-editor strong {
    color: #f3f4f6 !important;
  }
  
  .ql-editor em {
    color: #e5e7eb !important;
  }
  
  .ql-editor blockquote {
    @apply border-l-gray-600 bg-gray-800 text-gray-200;
    padding: 12px 16px;
    margin: 16px 0;
  }
  
  .ql-editor code {
    @apply bg-gray-800 text-blue-300;
    padding: 2px 4px;
    border-radius: 4px;
  }
  
  .ql-editor pre {
    @apply bg-gray-800 text-gray-200 border-gray-600;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
  }
  
  .ql-editor h1 {
    color: #f9fafb !important;
    font-weight: 700;
  }
  
  .ql-editor h2 {
    color: #f3f4f6 !important;
    font-weight: 600;
  }
  
  .ql-editor ul li,
  .ql-editor ol li {
    color: #e5e7eb !important;
  }
  
  .ql-editor ul li::before {
    color: #9ca3af !important;
  }
}

.ql-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  padding: 32px;
  min-height: 200px;
}

.ql-editor.ql-blank::before {
  left: 32px;
  top: 32px;
  font-style: italic;
  opacity: 0.6;
  font-weight: 300;
  color: #94a3b8;
}

.ql-toolbar {
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  backdrop-filter: blur(10px);
}

.ql-container {
  border-radius: 0 0 12px 12px;
  font-size: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.dark .ql-container {
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%) !important;
}

.dark .ql-editor {
  background: transparent !important;
  color: #f3f4f6 !important;
}

.ql-editor blockquote {
  border-left: 4px solid #3b82f6;
  background-color: #f8fafc;
  padding: 12px 16px;
  margin: 16px 0;
  font-style: italic;
}

.ql-editor code {
  background-color: #f1f5f9;
  color: #1e40af;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 14px;
}

.ql-editor pre {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

/* Syntax highlighting styles for code blocks */
.ql-editor pre.ql-syntax {
  background-color: #f6f8fa;
  color: #24292f;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
  font-size: 14px;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid #d0d7de;
}

.dark .ql-editor pre.ql-syntax {
  background-color: #0d1117;
  color: #f0f6fc;
  border: 1px solid #30363d;
}

/* Highlight.js theme adjustments for light mode */
.ql-editor pre.ql-syntax .hljs-keyword,
.ql-editor pre.ql-syntax .hljs-selector-tag,
.ql-editor pre.ql-syntax .hljs-subst {
  color: #cf222e;
  font-weight: 600;
}

.ql-editor pre.ql-syntax .hljs-string,
.ql-editor pre.ql-syntax .hljs-doctag {
  color: #0a3069;
}

.ql-editor pre.ql-syntax .hljs-title,
.ql-editor pre.ql-syntax .hljs-section,
.ql-editor pre.ql-syntax .hljs-selector-id {
  color: #8250df;
  font-weight: 600;  
}

.ql-editor pre.ql-syntax .hljs-comment {
  color: #6a737d;
  font-style: italic;
}

.ql-editor pre.ql-syntax .hljs-number,
.ql-editor pre.ql-syntax .hljs-literal {
  color: #0550ae;
}

.ql-editor pre.ql-syntax .hljs-variable,
.ql-editor pre.ql-syntax .hljs-template-variable,
.ql-editor pre.ql-syntax .hljs-tag .hljs-attr {
  color: #953800;
}

.ql-editor pre.ql-syntax .hljs-built_in,
.ql-editor pre.ql-syntax .hljs-builtin-name {
  color: #0550ae;
}

/* Dark mode syntax highlighting */
.dark .ql-editor pre.ql-syntax .hljs-keyword,
.dark .ql-editor pre.ql-syntax .hljs-selector-tag,
.dark .ql-editor pre.ql-syntax .hljs-subst {
  color: #ff7b72;
}

.dark .ql-editor pre.ql-syntax .hljs-string,
.dark .ql-editor pre.ql-syntax .hljs-doctag {
  color: #a5d6ff;
}

.dark .ql-editor pre.ql-syntax .hljs-title,
.dark .ql-editor pre.ql-syntax .hljs-section,
.dark .ql-editor pre.ql-syntax .hljs-selector-id {
  color: #d2a8ff;
}

.dark .ql-editor pre.ql-syntax .hljs-comment {
  color: #8b949e;
}

.dark .ql-editor pre.ql-syntax .hljs-number,
.dark .ql-editor pre.ql-syntax .hljs-literal {
  color: #79c0ff;
}

.dark .ql-editor pre.ql-syntax .hljs-variable,
.dark .ql-editor pre.ql-syntax .hljs-template-variable,
.dark .ql-editor pre.ql-syntax .hljs-tag .hljs-attr {
  color: #ffa657;
}

.dark .ql-editor pre.ql-syntax .hljs-built_in,
.dark .ql-editor pre.ql-syntax .hljs-builtin-name {
  color: #79c0ff;
}
</style>