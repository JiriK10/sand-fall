<script setup lang="ts">
//import { ref } from "vue"
import { SandColor } from "../models/sand-color"
import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"
import { useRuntimeStore } from "../stores/runtime"

//const count = ref(0)

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()
const runtimeStore = useRuntimeStore()

const switchAttrs = {
  "hide-details": true,
  color: "primary",
}
const sliderAttrs = {
  "thumb-label": true,
  "hide-details": true,
  color: "primary",
  class: "py-3",
}

function trimSandDropClick() {
  const limit = Math.pow(settingsStore.sandDropClickBox, 2)
  if (settingsStore.sandDropClick > limit) {
    settingsStore.sandDropClick = limit
  }
}
function trimSandDropCursor() {
  const limit = Math.pow(settingsStore.sandDropCursorBox, 2)
  if (settingsStore.sandDropCursor > limit) {
    settingsStore.sandDropCursor = limit
  }
}
</script>

<template>
  <v-navigation-drawer permanent width="400" location="right">
    <div class="p-4">
      <div class="text-h5 mb-3">Sand</div>
      <div class="text-caption">Speed - {{ settingsStore.sandSpeed }}ms</div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandSpeed"
        min="10"
        max="5000"
        step="10"
      />
      <div class="text-caption">
        Acceleration - {{ settingsStore.sandAcceleration }}ms
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandAcceleration"
        min="0"
        max="1000"
        step="10"
      />
      <div class="text-caption">Size - {{ settingsStore.sandSize }}</div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandSize"
        min="1"
        max="4"
        step="1"
      />
      <div class="text-caption">Coloration</div>
      <v-btn-toggle
        v-model="settingsStore.sandColor"
        mandatory
        color="primary"
        variant="flat"
        density="comfortable"
        class="my-2"
      >
        <v-btn :value="SandColor.Sand" :text="SandColor.Sand.toString()" />
        <v-btn :value="SandColor.Grey" :text="SandColor.Grey.toString()" />
        <v-btn :value="SandColor.Color" :text="SandColor.Color.toString()" />
      </v-btn-toggle>
      <div class="text-caption">
        Coloration change during time - {{ settingsStore.sandColorChange }}%
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandColorChange"
        min="0"
        max="2"
        step="0.01"
      />
      <div class="text-h5 my-3 flex flex-row">
        <span class="mr-8">Drop sand from top</span>
        <v-switch
          v-bind="switchAttrs"
          v-model="settingsStore.sandDropTop"
          density="compact"
        />
      </div>
      <div class="text-caption">
        Drop every {{ settingsStore.sandDropTopSpeed }}ms
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropTopSpeed"
        min="0"
        max="10000"
        step="25"
        :disabled="!settingsStore.sandDropTop"
      />
      <div class="text-h5 my-3">Drop sand on click</div>
      <div class="text-caption">Amount - {{ settingsStore.sandDropClick }}</div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropClick"
        min="0"
        :max="Math.pow(settingsStore.sandDropClickBox, 2)"
        step="1"
      />
      <div class="text-caption">
        Box - {{ settingsStore.sandDropClickBox }}x{{
          settingsStore.sandDropClickBox
        }}
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropClickBox"
        @update:modelValue="trimSandDropClick()"
        min="1"
        max="5"
        step="2"
      />
      <div class="text-h5 my-3">Drop sand under cursor</div>
      <div class="text-caption">
        Amount - {{ settingsStore.sandDropCursor }}
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropCursor"
        min="0"
        :max="Math.pow(settingsStore.sandDropCursorBox, 2)"
        step="1"
      />
      <div class="text-caption">
        Box - {{ settingsStore.sandDropCursorBox }}x{{
          settingsStore.sandDropCursorBox
        }}
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropCursorBox"
        @update:modelValue="trimSandDropCursor()"
        min="1"
        max="5"
        step="2"
      />
      <div class="text-caption">
        Speed - {{ settingsStore.sandDropCursorSpeed }}ms
      </div>
      <v-slider
        v-bind="sliderAttrs"
        v-model="settingsStore.sandDropCursorSpeed"
        min="0"
        max="10000"
        step="25"
      />
      <v-divider />
      <div class="mt-5 flex justify-between">
        <v-btn
          prepend-icon="mdi-timer-sand"
          color="green-darken-1"
          text="Start"
          :disabled="runtimeStore.isRunning"
          @click="runtimeStore.start"
        />
        <v-btn
          prepend-icon="mdi-stop"
          color="red-darken-4"
          text="Stop"
          :disabled="!runtimeStore.isRunning"
          @click="runtimeStore.stop"
        />
        <v-btn
          prepend-icon="mdi-eraser"
          color="primary"
          text="Clear"
          @click="desertStore.clear"
        />
      </div>
    </div>
  </v-navigation-drawer>
</template>
