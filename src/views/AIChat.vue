<template>
  <div class="chat-container">
    <!-- Header with Model Selector -->
    <div class="chat-header">
      <div class="header-content">
        <h2>AI Assistant</h2>
        <div class="model-selector">
          <label>Model:</label>
          <select v-model="selectedModel" class="model-dropdown">
            <option value="gpt-4">LifeMetrics GPT-4</option>
            <option value="gemini-pro">Gemini Pro</option>
            <option value="claude-3">Claude 3 Opus</option>
            <option value="mistral">Mistral Large</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Chat History -->
    <div class="chat-history" ref="chatContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="welcome-box">
          <div class="bot-icon-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m16.2 16.2 3.5 3.5"/><path d="m21.9 8.3-3.1 1.7"/><path d="m20.2 13-3.5 1"/><path d="m8 21.9-1-3.5"/><path d="m13 20.2 1-3.5"/><path d="m2 12h4"/><path d="m5.2 7 1.9 3.1"/><path d="m15.1 4.3.4 3.7"/><path d="m18.8 8.1-.4 2.8"/></svg>
          </div>
          <h3>How can I help you analyze your data today?</h3>
          <p>Ask about your health trends, sleep quality, or workout recovery.</p>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" :class="['message-row', msg.role]">
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-meta">
            <span v-if="msg.role === 'assistant'" class="model-badge">{{ msg.model }}</span>
            <span class="time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="message-row assistant">
        <div class="message-bubble loading">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea 
          v-model="inputMessage" 
          @keydown.enter.prevent="sendMessage"
          placeholder="Ask anything..."
          rows="1"
          ref="textarea"
        ></textarea>
        <button @click="sendMessage" :disabled="!inputMessage.trim() || isLoading" class="send-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const selectedModel = ref('gpt-4')
const inputMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)

const messages = ref([
  // Initial greeting or empty
])

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userText = inputMessage.value.trim()
  inputMessage.value = ''

  // Add User Message
  messages.value.push({
    role: 'user',
    content: userText,
    timestamp: new Date()
  })
  scrollToBottom()

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: userText, 
        model: selectedModel.value 
      })
    })

    const data = await response.json()

    // Add AI Message
    messages.value.push({
      role: 'assistant',
      content: data.response,
      model: selectedModel.value === 'gpt-4' ? 'GPT-4' : 
             selectedModel.value === 'gemini-pro' ? 'Gemini' : 
             selectedModel.value === 'claude-3' ? 'Claude' : 'Mistral',
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({
      role: 'assistant',
      content: "Sorry, I'm having trouble connecting to the AI service right now. Please try again.",
      model: 'System',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height)); /* Subtract header height */
  background-color: var(--c-bg);
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.chat-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--c-border);
  background-color: var(--c-bg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--c-text-light);
}

.model-dropdown {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background-color: var(--c-bg-light);
  color: var(--c-text);
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--c-text-lighter);
  text-align: center;
}

.welcome-box {
  max-width: 400px;
}

.bot-icon-large {
  margin-bottom: 1.5rem;
  color: var(--c-brand);
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  position: relative;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-row.user .message-bubble {
  background-color: var(--c-brand);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-row.assistant .message-bubble {
  background-color: var(--c-bg-light);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  border-bottom-left-radius: 4px;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.model-badge {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.7rem;
  background: rgba(0,0,0,0.1);
  padding: 1px 4px;
  border-radius: 4px;
}

.input-area {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--c-border);
  background: var(--c-bg);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  background: var(--c-bg-light);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  padding: 0.5rem;
  color: var(--c-text);
  font-family: inherit;
  font-size: 1rem;
  max-height: 150px;
  outline: none;
}

.send-btn {
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Dots */
.loading .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--c-text-lighter);
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.loading .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
