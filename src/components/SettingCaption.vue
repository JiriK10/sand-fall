<script setup lang="ts">
defineProps<{
  text: string
  chip?: string
}>()
</script>

<template>
  <div class="text-caption flex items-center justify-center">
    {{ text }}
    <v-chip v-if="chip" label color="primary" size="small" class="ml-2">
      {{ chip }}
    </v-chip>
  </div>
</template>
