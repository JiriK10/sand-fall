import { defineStore } from "pinia"
import { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"

import { DesertRow } from "../models/desert-row"
import { DesertItem } from "../models/desert-item"

export interface DesertState {
  area: Array<DesertRow>
}

export const useDesertStore = defineStore("desert", {
  state: (): DesertState => ({
    area: [],
  }),
  getters: {
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
    setItem(item: DesertItem, x: number, y: number) {
      this.area[y - 1][x - 1] = item
    },
    addRandomlyToRow(item: DesertItem, y: number) {
      const row = this.area[y - 1]
      let colIndex = null
      // Find random spot
      for (let i = 0; i < row.length; i++) {
        const coordinate = getRandomCoordinate(row.length)
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
        row[colIndex] = item
      }
    },
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

function getRandomCoordinate(limit: number) {
  return Math.round(Math.random() * (limit - 1))
}
