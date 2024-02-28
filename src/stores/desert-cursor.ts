import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { useMouseInElement } from "@vueuse/core"

import { useDesertStore } from "../stores/desert"

export const useDesertCursorStore = defineStore("desert-cursor", () => {
  const desertStore = useDesertStore()

  const area = ref<HTMLElement>()
  const { elementX, elementY, elementHeight, elementWidth, isOutside } =
    useMouseInElement(area)

  const cursorX = computed(() =>
    Math.floor((elementX.value / elementWidth.value) * desertStore.areaWidth),
  )
  const cursorY = computed(() =>
    Math.floor((elementY.value / elementHeight.value) * desertStore.areaHeight),
  )

  function init(elem: HTMLElement) {
    area.value = elem
  }

  return {
    cursorX,
    cursorY,
    isOutside,

    init,
  }
})
