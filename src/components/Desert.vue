<script setup lang="ts">
import { ref } from "vue"
import { watchOnce } from "@vueuse/core"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"
import { useDesertCursorStore } from "../stores/desert-cursor"

const area = ref<HTMLElement>()

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()
const desertCursorStore = useDesertCursorStore()

watchOnce(area, () => {
  desertStore.init(300, 300)
  desertCursorStore.init(area.value!)
})

desertStore.$onAction(({ name, store, after }) => {
  if (name == "init" || name == "clear") {
    after(() => {
      area.value!.innerHTML = ""
      area.value!.appendChild(store.canvas!.view)
    })
  }
})

function dropSand() {
  if (settingsStore.sandDropClick > 0) {
    desertStore.addSandToCursor(
      settingsStore.sandDropClick,
      settingsStore.sandDropClickBox,
    )
  }
}
</script>

<template>
  <div ref="area" @click="dropSand"></div>
</template>
