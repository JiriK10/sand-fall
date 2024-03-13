<script setup lang="ts">
import { SandColor } from "../models/sand-color"
import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"
import { useRuntimeStore } from "../stores/runtime"

import SettingCaption from "./SettingCaption.vue"
import SettingSlider from "./SettingSlider.vue"
import SettingRangeSlider from "./SettingRangeSlider.vue"

const settingsStore = useSettingsStore()
const desertStore = useDesertStore()
const runtimeStore = useRuntimeStore()

const headerClass = "text-h5 mt-1"
const switchAttrs = {
  "hide-details": true,
  color: "primary",
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

/*
 ********** PRESETS **********
 */
function presetDunes() {
  settingsStore.$patch({
    sandSpeed: 200,
    sandAcceleration: 0,
    sandColor: SandColor.Sand,
    sandColorChange: 0.11,
    sandDropTop: true,
    sandDropTopSpeed: 200,
  })
}
function presetRelax() {
  settingsStore.$patch({
    sandSpeed: 1000,
    sandAcceleration: 0,
    sandColor: SandColor.Sand,
    sandColorChange: 0.01,
    sandDropTop: true,
    sandDropTopSpeed: 5000,
  })
}
function presetSandStorm() {
  settingsStore.$patch({
    sandSpeed: 25,
    sandAcceleration: 100,
    sandColor: SandColor.Sand,
    sandColorChange: 2,
    sandDropTop: true,
    sandDropTopSpeed: 0,
  })
}

function presetSnowing() {
  settingsStore.$patch({
    sandSpeed: 500,
    sandAcceleration: 0,
    sandColor: SandColor.Grey,
    sandColorChange: 0.11,
    sandDropTop: true,
    sandDropTopSpeed: 200,
  })
}
function presetSnowStorm() {
  settingsStore.$patch({
    sandSpeed: 25,
    sandAcceleration: 100,
    sandColor: SandColor.Grey,
    sandColorChange: 2,
    sandDropTop: true,
    sandDropTopSpeed: 0,
  })
}

function presetColorful() {
  settingsStore.$patch({
    sandSpeed: 125,
    sandAcceleration: 0,
    sandColor: SandColor.Color,
    sandColorChange: 0.11,
    sandDropTop: true,
    sandDropTopSpeed: 125,
  })
}
function presetColorStorm() {
  settingsStore.$patch({
    sandSpeed: 25,
    sandAcceleration: 100,
    sandColor: SandColor.Color,
    sandColorChange: 2,
    sandDropTop: true,
    sandDropTopSpeed: 0,
  })
}
</script>

<template>
  <v-navigation-drawer permanent width="400" location="right">
    <div class="p-4 text-center">
      <div class="mb-3 flex justify-between">
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
          :disabled="!runtimeStore.isRunning"
          @click="desertStore.clear"
        />
      </div>
      <div :class="headerClass">Desert</div>
      <SettingSlider
        text="Width"
        :chip="`${settingsStore.desertWidth} items`"
        v-model="settingsStore.desertWidth"
        min="50"
        max="4000"
        step="50"
        :disabled="runtimeStore.isRunning"
      />
      <SettingSlider
        text="Height"
        :chip="`${settingsStore.desertHeight} items`"
        v-model="settingsStore.desertHeight"
        min="50"
        max="2000"
        step="50"
        :disabled="runtimeStore.isRunning"
      />
      <SettingSlider
        text="Item size"
        :chip="`${settingsStore.desertItemSize} px`"
        v-model="settingsStore.desertItemSize"
        min="1"
        max="12"
        step="1"
        :disabled="runtimeStore.isRunning"
      />
      <div :class="headerClass">
        Sand ({{
          (runtimeStore.isRunning && desertStore.moving.length) || "_"
        }})
      </div>
      <SettingSlider
        text="Speed"
        :chip="`${settingsStore.sandSpeed} ms`"
        v-model="settingsStore.sandSpeed"
        min="25"
        max="5000"
        step="25"
      />
      <SettingSlider
        text="Acceleration"
        :chip="`${settingsStore.sandAcceleration} ms`"
        v-model="settingsStore.sandAcceleration"
        min="0"
        max="1000"
        step="25"
      />
      <SettingCaption text="Coloration" />
      <v-btn-toggle
        v-model="settingsStore.sandColor"
        mandatory
        color="primary"
        variant="flat"
        density="compact"
        class="mb-1"
      >
        <v-btn :value="SandColor.Sand" :text="SandColor.Sand.toString()" />
        <v-btn :value="SandColor.Grey" :text="SandColor.Grey.toString()" />
        <v-btn :value="SandColor.Color" :text="SandColor.Color.toString()" />
      </v-btn-toggle>
      <v-btn-toggle
        v-model="settingsStore.sandStaticRed"
        color="red"
        variant="flat"
        density="compact"
        class="mb-1 ml-2"
      >
        <v-btn :value="true" text="Static" />
      </v-btn-toggle>
      <SettingSlider
        text="Coloration change during time"
        :chip="`${settingsStore.sandColorChange} %`"
        v-model="settingsStore.sandColorChange"
        min="0"
        max="2"
        step="0.01"
      />
      <div class="flex flex-row justify-center" :class="headerClass">
        <span class="mr-6">Drop sand from top</span>
        <v-switch
          v-bind="switchAttrs"
          v-model="settingsStore.sandDropTop"
          density="compact"
        />
      </div>
      <SettingSlider
        text="Drop every"
        :chip="`${settingsStore.sandDropTopSpeed} ms`"
        v-model="settingsStore.sandDropTopSpeed"
        min="0"
        max="10000"
        step="25"
        :disabled="!settingsStore.sandDropTop"
      />
      <div :class="headerClass">Drop sand on click</div>
      <div class="flex">
        <div class="w-20">
          <SettingSlider
            text="Box"
            :chip="`${settingsStore.sandDropClickBox}x${settingsStore.sandDropClickBox}`"
            v-model="settingsStore.sandDropClickBox"
            @update:modelValue="trimSandDropClick()"
            min="1"
            max="5"
            step="2"
          />
        </div>
        <div class="flex-grow">
          <SettingSlider
            text="Amount"
            :chip="`${settingsStore.sandDropClick}`"
            v-model="settingsStore.sandDropClick"
            min="0"
            :max="Math.pow(settingsStore.sandDropClickBox, 2)"
            step="1"
          />
        </div>
      </div>
      <div :class="headerClass">Drop sand under cursor</div>
      <div class="flex">
        <div class="w-20">
          <SettingSlider
            text="Box"
            :chip="`${settingsStore.sandDropCursorBox}x${settingsStore.sandDropCursorBox}`"
            v-model="settingsStore.sandDropCursorBox"
            @update:modelValue="trimSandDropCursor()"
            min="1"
            max="5"
            step="2"
          />
        </div>
        <div class="flex-grow">
          <SettingSlider
            text="Amount"
            :chip="`${settingsStore.sandDropCursor}`"
            v-model="settingsStore.sandDropCursor"
            min="0"
            :max="Math.pow(settingsStore.sandDropCursorBox, 2)"
            step="1"
          />
        </div>
      </div>
      <SettingSlider
        text="Speed"
        :chip="`${settingsStore.sandDropCursorSpeed} ms`"
        v-model="settingsStore.sandDropCursorSpeed"
        min="0"
        max="10000"
        step="25"
      />
      <div :class="headerClass">Obstacles - Top</div>
      <SettingSlider
        text="Amount"
        :chip="`${settingsStore.obstaclesTop}`"
        v-model="settingsStore.obstaclesTop"
        min="0"
        max="100"
        step="1"
        :disabled="runtimeStore.isRunning"
      />
      <SettingRangeSlider
        text="Placement in top"
        :chip="`${settingsStore.obstaclesTopPlacementMin}-${settingsStore.obstaclesTopPlacementMax} %`"
        v-model="settingsStore.obstaclesTopPlacement"
        min="0"
        max="80"
        step="1"
        :disabled="runtimeStore.isRunning"
      />
      <div :class="headerClass">Obstacles - Bottom</div>
      <SettingSlider
        text="Amount"
        :chip="`${settingsStore.obstaclesBottom}`"
        v-model="settingsStore.obstaclesBottom"
        min="0"
        max="50"
        step="1"
        :disabled="runtimeStore.isRunning"
      />
      <SettingRangeSlider
        text="Height"
        :chip="`${settingsStore.obstaclesBottomHeightMin}-${settingsStore.obstaclesBottomHeightMax} %`"
        v-model="settingsStore.obstaclesBottomHeight"
        min="1"
        max="50"
        step="1"
        :disabled="runtimeStore.isRunning"
      />
      <div :class="headerClass">Presets</div>
      <div class="mt-1 flex flex-wrap justify-between gap-2">
        <v-btn color="primary" text="Dunes" @click="presetDunes" />
        <v-btn color="amber-lighten-3" text="Relax" @click="presetRelax" />
        <v-btn
          color="amber-darken-3"
          text="Sand storm"
          @click="presetSandStorm"
        />
        <v-btn color="grey-lighten-5" text="Snowing" @click="presetSnowing" />
        <v-btn
          color="grey-lighten-1"
          text="Snow storm"
          @click="presetSnowStorm"
        />
        <v-btn
          color="deep-orange-darken-2"
          text="Colorful"
          @click="presetColorful"
        />
        <v-btn color="purple" text="Color storm" @click="presetColorStorm" />
      </div>
    </div>
  </v-navigation-drawer>
</template>
