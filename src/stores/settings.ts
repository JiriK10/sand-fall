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
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    sandSpeed: 100,
    sandAcceleration: 10,
    sandSize: 2,
    sandColor: SandColor.Sand,
    sandColorChange: 0.11,
    sandDropTop: true,
    sandDropTopSpeed: 100,
  }),
})
