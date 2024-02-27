import { defineStore } from "pinia"
import moment, { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"

import { DesertRow } from "../models/desert-row"
import { DesertItem } from "../models/desert-item"
import { SandColor } from "../models/sand-color"

export interface DesertState {
  area: Array<DesertRow>
  sandColorCoef: number
}

export const useDesertStore = defineStore("desert", {
  state: (): DesertState => ({
    area: [],
    sandColorCoef: 0,
  }),
  getters: {
    areaWidth(state) {
      return state.area.length > 0 ? state.area[0].length : 0
    },
    areaHeight(state) {
      return state.area.length
    },
    isFull(state) {
      return (
        state.area.length > 0 &&
        [...Array(5).keys()].every((index) =>
          state.area[index].every((item) => item != null),
        )
      )
    },
  },
  actions: {
    init(width: number, height: number) {
      let init = []
      for (let i = 0; i < height; i++) {
        const row: DesertRow = []
        init.push(row)
        for (let j = 0; j < width; j++) {
          row.push(null)
        }
      }
      this.area = init
    },
    clear() {
      for (let i = 0; i < this.area.length; i++) {
        const row = this.area[i]
        for (let j = 0; j < row.length; j++) {
          row[j] = null
        }
      }
    },
    /*
     ********** SAND **********
     */
    increaseSandColor() {
      const settingsStore = useSettingsStore()
      if (settingsStore.sandColorChange > 0) {
        const newColor = Math.min(
          1,
          this.sandColorCoef + settingsStore.sandColorChange / 100,
        )
        this.sandColorCoef =
          this.sandColorCoef == 1 && newColor == 1 ? 0 : newColor
      }
    },
    addSand(x: number, y: number) {
      const settingsStore = useSettingsStore()
      if (settingsStore.sandDropClick > 0) {
        for (let i = 0; i < settingsStore.sandDropClick; i++) {
          const randomX = getRandomPointCoordinate(
            x,
            settingsStore.sandDropClickBox,
          )
          const randomY = getRandomPointCoordinate(
            y,
            settingsStore.sandDropClickBox,
          )
          if (this.area[randomY][randomX] == null) {
            this.area[randomY][randomX] = getNewSand(this.sandColorCoef)
            this.increaseSandColor()
          }
        }
      }
    },
    addSandRandomlyToRow(y: number) {
      const row = this.area[y]
      let colIndex = null
      // Find random spot
      for (let i = 0; i < row.length; i++) {
        const coordinate = getRandomRowCoordinate(row.length)
        if (row[coordinate] == null) {
          colIndex = coordinate
          break
        }
      }
      // Find first empty spot
      if (colIndex == null) {
        colIndex = row.findIndex((item) => item == null)
      }

      if (colIndex != null && colIndex >= 0) {
        row[colIndex] = getNewSand(this.sandColorCoef)
        this.increaseSandColor()
      }
    },
    /*
     ********** AREA DROP **********
     */
    drop(now: Moment) {
      const settingsStore = useSettingsStore()
      for (let rowIndex = this.area.length - 2; rowIndex >= 0; rowIndex--) {
        const row = this.area[rowIndex]
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const item = row[colIndex]
          if (
            item != null &&
            item.speed > 0 &&
            now.diff(item.lastDrop) >= item.speed
          ) {
            const nextRow = this.area[rowIndex + 1]
            let moved = false
            // Move down
            if (nextRow[colIndex] == null) {
              row[colIndex] = null
              nextRow[colIndex] = item
              moved = true
            }
            // Move down and L/R
            else {
              const randomSide = Math.sign(Math.random() - 0.5) || 1
              for (const side of [randomSide, -randomSide]) {
                const sideIndex = colIndex + side
                if (
                  sideIndex >= 0 &&
                  sideIndex < row.length &&
                  row[sideIndex] == null &&
                  nextRow[sideIndex] == null
                ) {
                  row[colIndex] = null
                  nextRow[sideIndex] = item
                  moved = true
                  break
                }
              }
            }
            // Update item after move
            if (moved) {
              item.lastDrop = now
              item.speed = Math.max(
                10,
                item.speed - settingsStore.sandAcceleration,
              )
            }
            // No move -> stop item
            else if (
              [...Array(this.areaHeight).keys()].every(
                (ri) => ri <= rowIndex || this.area[ri][colIndex] != null,
              )
            ) {
              item.speed = 0
            }
          }
        }
      }
    },
  },
})

function getRandomRowCoordinate(limit: number) {
  return Math.round(Math.random() * (limit - 1))
}

function getRandomPointCoordinate(center: number, width: number) {
  return (
    center - Math.floor(width / 2) + Math.round(Math.random() * (width - 1))
  )
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

function getNewSand(sandColorCoef: number): DesertItem {
  const settingsStore = useSettingsStore()
  return {
    lastDrop: moment(),
    speed: settingsStore.sandSpeed,
    color: getSandColor(settingsStore.sandColor, sandColorCoef),
  }
}
