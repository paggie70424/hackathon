<template>
  <button
    type="button"
    class="sign-in-with-apple"
    :class="[theme, { 'loading': loading }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="apple-logo" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    </span>
    <span class="button-text">{{ buttonText }}</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** Apple Services ID (client_id). Set in .env as VITE_APPLE_CLIENT_ID or pass here. */
  clientId: {
    type: String,
    default: () => import.meta.env.VITE_APPLE_CLIENT_ID || ''
  },
  /** Backend callback URL. Must match redirect URI in Apple Developer. Set in .env as VITE_APPLE_REDIRECT_URI or pass here. */
  redirectUri: {
    type: String,
    default: () => import.meta.env.VITE_APPLE_REDIRECT_URI || ''
  },
  /** Button style: black (default) or white */
  theme: {
    type: String,
    default: 'black',
    validator: (v) => ['black', 'white'].includes(v)
  },
  /** Label: signin, signup, or continue */
  type: {
    type: String,
    default: 'signin',
    validator: (v) => ['signin', 'signup', 'continue'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'error'])

const loading = ref(false)

const buttonText = computed(() => {
  const labels = { signin: 'Sign in with Apple', signup: 'Sign up with Apple', continue: 'Continue with Apple' }
  return labels[props.type]
})

const APPLE_AUTH_BASE = 'https://appleid.apple.com/auth/authorize'

function generateState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

function handleClick() {
  const clientId = props.clientId || import.meta.env.VITE_APPLE_CLIENT_ID
  const redirectUri = props.redirectUri || import.meta.env.VITE_APPLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    emit('error', new Error('Sign in with Apple is not configured. Set VITE_APPLE_CLIENT_ID and VITE_APPLE_REDIRECT_URI.'))
    return
  }

  emit('click')
  loading.value = true

  const state = generateState()
  sessionStorage.setItem('apple_signin_state', state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state
  })

  window.location.href = `${APPLE_AUTH_BASE}?${params.toString()}`
}
</script>

<style scoped>
.sign-in-with-apple {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.sign-in-with-apple:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.sign-in-with-apple.loading {
  pointer-events: none;
  opacity: 0.8;
}

/* Black theme (Apple default) */
.sign-in-with-apple.black {
  background-color: #000;
  color: #fff;
}

.sign-in-with-apple.black:hover:not(:disabled):not(.loading) {
  background-color: #1a1a1a;
}

.sign-in-with-apple.black .apple-logo {
  color: #fff;
}

/* White theme (for dark backgrounds) */
.sign-in-with-apple.white {
  background-color: #fff;
  color: #000;
  border: 1px solid #888;
}

.sign-in-with-apple.white:hover:not(:disabled):not(.loading) {
  background-color: #f5f5f5;
}

.sign-in-with-apple.white .apple-logo {
  color: #000;
}

.apple-logo {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.button-text {
  white-space: nowrap;
}
</style>
