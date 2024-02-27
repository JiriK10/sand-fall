<script setup lang="ts">
import { ref } from "vue"
import { useElementSize } from "@vueuse/core"
import { UseMouseInElement } from "@vueuse/components"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"

const area = ref(null)
const { width: areaWidth, height: areaHeight } = useElementSize(area)

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()

const sizeMap: { [key: number]: string } = {
  1: "h-1 w-1",
  2: "h-2 w-2",
  3: "h-3 w-3",
  4: "h-4 w-4",
}

function areaClick(areaX: number, areaY: number, isOutside: boolean) {
  if (!isOutside) {
    const x = Math.floor((areaX / areaWidth.value) * desertStore.areaWidth)
    const y = Math.floor((areaY / areaHeight.value) * desertStore.areaHeight)
    desertStore.addSand(x, y)
  }
}
</script>

<template>
  <UseMouseInElement v-slot="{ elementX, elementY, isOutside }">
    <div
      ref="area"
      class="flex flex-col"
      @click="areaClick(elementX, elementY, isOutside)"
    >
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
  </UseMouseInElement>
</template>
