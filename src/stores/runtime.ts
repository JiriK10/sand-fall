import { defineStore } from "pinia"
import moment, { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"

import { SandColor } from "../models/sand-color"

export interface RuntimeState {
  timer: number | null
  lastSandDropTop: Moment | null
  sandColor: number
}

export const useRuntimeStore = defineStore("runtime", {
  state: (): RuntimeState => ({
    timer: null,
    lastSandDropTop: null,
    sandColor: 0,
  }),
  getters: {
    isRunning(state) {
      return state.timer != null
    },
  },
  actions: {
    start() {
      const settingsStore = useSettingsStore()
      const desertStore = useDesertStore()

      this.timer = setInterval(() => {
        const now = moment()
        // Drop whole desert area
        desertStore.drop(now)
        // Drop new sand from top
        if (
          settingsStore.sandDropTop &&
          hasPassed(now, this.lastSandDropTop, settingsStore.sandDropTopSpeed)
        ) {
          this.lastSandDropTop = now
          desertStore.addRandomlyToRow(
            {
              lastDrop: now,
              speed: settingsStore.sandSpeed,
              color: getSandColor(settingsStore.sandColor, this.sandColor),
            },
            1,
          )
          // Change sand color
          if (settingsStore.sandColorChange > 0) {
            const newColor = Math.min(
              1,
              this.sandColor + settingsStore.sandColorChange / 100,
            )
            this.sandColor = this.sandColor == 1 && newColor == 1 ? 0 : newColor
          }
        }
        // Stop when desert is full
        if (desertStore.isFull) {
          this.stop()
        }
      }, 10)
    },
    stop() {
      if (this.timer) {
        clearInterval(this.timer)
        this.$reset()
      }
    },
  },
})

function hasPassed(now: Moment, lastTime: Moment | null, setting: number) {
  return lastTime == null || now.diff(lastTime) >= setting
}

function getSandColor(sandColor: SandColor, coef: number) {
  switch (sandColor) {
    case SandColor.Sand:
      return `hsl(34, ${50 + Math.round(coef * 35)}%, ${70 + Math.round(coef * 15)}%)`
    case SandColor.Grey:
      return `hsl(0, 0%, ${100 - Math.round(coef * 80)}%)`
    default:
      return `hsl(${Math.round(coef * 360)}, 100%, 50%)`
  }
}
