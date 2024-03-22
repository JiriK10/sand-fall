import { defineStore } from "pinia"
import moment, { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"

import { DesertItemType } from "../models/desert-item"

export interface RuntimeState {
  timer: number | null
  lastSandDropTop: Moment | null
  lastSandDropCursor: Moment | null
  lastBombDropTop: Moment | null
}

export const useRuntimeStore = defineStore("runtime", {
  state: (): RuntimeState => ({
    timer: null,
    lastSandDropTop: null,
    lastSandDropCursor: null,
    lastBombDropTop: null,
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

      desertStore.init()
      desertStore.addObstacles()

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
          desertStore.addItemRandomlyToRow(0, DesertItemType.Sand)
        }
        // Drop new bomb from top
        if (
          settingsStore.bombDropTop &&
          hasPassed(now, this.lastBombDropTop, settingsStore.bombDropTopSpeed)
        ) {
          this.lastBombDropTop = now
          desertStore.addItemRandomlyToRow(0, DesertItemType.Bomb)
        }
        // Drop new sand under cursor
        if (
          settingsStore.sandDropCursor > 0 &&
          hasPassed(
            now,
            this.lastSandDropCursor,
            settingsStore.sandDropCursorSpeed,
          )
        ) {
          this.lastSandDropCursor = now
          desertStore.addItemToCursor(
            settingsStore.sandDropCursor,
            settingsStore.sandDropCursorBox,
            DesertItemType.Sand,
          )
        }
        // Stop when desert is full
        if (desertStore.isFull) {
          this.stop()
        }
      }, 25)
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
