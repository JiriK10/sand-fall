import { defineStore } from "pinia"

import { SandColor } from "../models/sand-color"

interface SettingsState {
  desertWidth: number
  desertHeight: number
  desertItemSize: number
  sandSpeed: number
  sandAcceleration: number
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
  obstaclesTop: number
  obstaclesTopPlacement: [number, number]
  obstaclesBottom: number
  obstaclesBottomHeight: [number, number]
}

export const useSettingsStore = defineStore("settings", {
  persist: true,
  state: (): SettingsState => ({
    desertWidth: 200,
    desertHeight: 100,
    desertItemSize: 4,
    sandSpeed: 200,
    sandAcceleration: 0,
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
    obstaclesTop: 0,
    obstaclesTopPlacement: [20, 50],
    obstaclesBottom: 0,
    obstaclesBottomHeight: [10, 30],
  }),
  getters: {
    obstaclesTopPlacementMin: (state) => state.obstaclesTopPlacement[0],
    obstaclesTopPlacementMax: (state) => state.obstaclesTopPlacement[1],
    obstaclesBottomHeightMin: (state) => state.obstaclesBottomHeight[0],
    obstaclesBottomHeightMax: (state) => state.obstaclesBottomHeight[1],
  },
})
