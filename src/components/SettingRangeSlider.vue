<script setup lang="ts">
import SettingCaption from "./SettingCaption.vue"

defineProps<{
  text: string
  chip: string
  min?: number | string
  max?: number | string
  step?: number | string
  disabled?: boolean
}>()
const modelValue = defineModel<[number, number]>()
</script>

<template>
  <SettingCaption :text="text" :chip="chip" />
  <v-range-slider
    v-model="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    thumb-label
    hide-details
    color="primary"
    class="pb-1"
  />
</template>
