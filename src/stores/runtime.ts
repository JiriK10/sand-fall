import { defineStore } from "pinia"
import moment, { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"
import { useDesertStore } from "../stores/desert"

export interface RuntimeState {
  timer: number | null
  lastSandDropTop: Moment | null
  lastSandDropCursor: Moment | null
}

export const useRuntimeStore = defineStore("runtime", {
  state: (): RuntimeState => ({
    timer: null,
    lastSandDropTop: null,
    lastSandDropCursor: null,
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

      desertStore.init(settingsStore.desertWidth, settingsStore.desertHeight)

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
          desertStore.addSandRandomlyToRow(0)
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
          desertStore.addSandToCursor(
            settingsStore.sandDropCursor,
            settingsStore.sandDropCursorBox,
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
