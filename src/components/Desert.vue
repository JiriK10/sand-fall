<script setup lang="ts">
import { ref } from "vue"
import { watchOnce } from "@vueuse/core"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"
import { useDesertCursorStore } from "../stores/desert-cursor"
import { useRuntimeStore } from "../stores/runtime"

const area = ref<HTMLElement>()

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()
const desertCursorStore = useDesertCursorStore()
const runtimeStore = useRuntimeStore()

watchOnce(area, () => {
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
  <div v-show="runtimeStore.isRunning" ref="area" @click="dropSand"></div>
  <div v-show="!runtimeStore.isRunning" class="text-9xl">🏜️</div>
</template>
