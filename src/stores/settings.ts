import { defineStore } from "pinia"

import { SandColor } from "../models/sand-color"

interface SettingsState {
  sandSpeed: number
  sandAcceleration: number
  sandSize: number
  sandColor: SandColor
  sandColorChange: number
  sandDropTop: boolean
  sandDropTopSpeed: number
  sandDropClick: number
  sandDropClickBox: number
  sandDropCursor: number
  sandDropCursorBox: number
  sandDropCursorSpeed: number
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    sandSpeed: 100,
    sandAcceleration: 100,
    sandSize: 4,
    sandColor: SandColor.Sand,
    sandColorChange: 0.11,
    sandDropTop: true,
    sandDropTopSpeed: 100,
    sandDropClick: 1,
    sandDropClickBox: 1,
    sandDropCursor: 0,
    sandDropCursorBox: 1,
    sandDropCursorSpeed: 100,
  }),
})
