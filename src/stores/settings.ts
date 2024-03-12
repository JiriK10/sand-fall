import { defineStore } from "pinia"

import { SandColor } from "../models/sand-color"

interface SettingsState {
  desertWidth: number
  desertHeight: number
  sandSpeed: number
  sandAcceleration: number
  sandSize: number
  sandColor: SandColor
  sandColorChange: number
  sandStaticRed: boolean
  sandDropTop: boolean
  sandDropTopSpeed: number
  sandDropClick: number
  sandDropClickBox: number
  sandDropCursor: number
  sandDropCursorBox: number
  sandDropCursorSpeed: number
  obstaclesBottom: number
  obstaclesBottomHeight: [number, number]
}

export const useSettingsStore = defineStore("settings", {
  persist: true,
  state: (): SettingsState => ({
    desertWidth: 200,
    desertHeight: 100,
    sandSpeed: 200,
    sandAcceleration: 0,
    sandSize: 4,
    sandColor: SandColor.Sand,
    sandColorChange: 0.11,
    sandStaticRed: false,
    sandDropTop: true,
    sandDropTopSpeed: 200,
    sandDropClick: 1,
    sandDropClickBox: 1,
    sandDropCursor: 0,
    sandDropCursorBox: 1,
    sandDropCursorSpeed: 100,
    obstaclesBottom: 0,
    obstaclesBottomHeight: [10, 30],
  }),
  getters: {
    obstaclesBottomHeightMin: (state) => state.obstaclesBottomHeight[0],
    obstaclesBottomHeightMax: (state) => state.obstaclesBottomHeight[1],
  },
})
