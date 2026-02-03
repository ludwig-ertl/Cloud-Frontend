<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  modelValue: string | number | boolean
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  icon?: any
  isPassword?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.isPassword) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type || 'text'
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.type === 'checkbox' ? target.checked : target.value)
}
</script>

<template>
  <div class="app-input-wrapper" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <label v-if="label" class="label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>

    <div class="input-container">
      <component v-if="icon" :is="icon" class="input-icon" :size="20" />
      
      <input
          :type="inputType"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          class="app-input"
          :class="{
            'with-icon': icon,
            'is-password': isPassword,
            'password-hidden': isPassword && !showPassword
          }"
          @input="updateValue"
      />

      <button
          v-if="isPassword"
          type="button"
          class="toggle-password"
          @click="togglePassword"
          tabindex="-1"
      >
        <EyeOff v-if="showPassword" :size="18" />
        <Eye v-else :size="18" />
      </button>
    </div>

    <Transition name="fade">
      <span v-if="error" class="error-message">{{ error }}</span>
    </Transition>
  </div>
</template>

<style scoped>
.app-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-left: 4px;
}

.required {
  color: var(--error);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.app-input {
  width: 100%;
  height: 48px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-m);
  padding: 0 16px;
  font-size: 15px;
  font-family: inherit;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.app-input.is-password {
  padding-right: 40px;
}


.app-input.password-hidden {
  font-family: 'Verdana', sans-serif;

  letter-spacing: 2px;
  font-size: 13px;

}

.app-input.password-hidden::placeholder {
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: normal;
  font-size: 15px;
}

.app-input.with-icon {
  padding-left: 44px;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.app-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: none;
}

.app-input:disabled {
  background: var(--background);
  color: var(--text-muted);
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
  color: var(--primary);
}

.has-error .app-input {
  border-color: var(--error);
}

.has-error .app-input:focus {
  box-shadow: none;
  border-color: var(--error);
}

.error-message {
  font-size: 13px;
  color: var(--error);
  margin-left: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>