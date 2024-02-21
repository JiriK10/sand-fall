<script setup lang="ts">
//import { ref } from "vue"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"

//const count = ref(0)

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()

const sizeMap: { [key: number]: string } = {
  1: "h-1 w-1",
  2: "h-2 w-2",
  3: "h-3 w-3",
  4: "h-4 w-4",
}
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="(row, rowIndex) in desertStore.area"
      :key="`r-${rowIndex}`"
      class="flex flex-row"
    >
      <span
        v-for="(item, itemIndex) in row"
        :key="`i-${rowIndex}-${itemIndex}`"
        :style="{ backgroundColor: item?.color || '#9E9E9E' }"
        :class="sizeMap[settingsStore.sandSize]"
      ></span>
    </div>
  </div>
</template>
