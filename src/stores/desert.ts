import { defineStore } from "pinia"
import moment, { Moment } from "moment"

import { useSettingsStore } from "../stores/settings"
import { useDesertCursorStore } from "../stores/desert-cursor"

import { DesertRow } from "../models/desert-row"
import { DesertItem } from "../models/desert-item"
import { SandColor } from "../models/sand-color"

export interface DesertState {
  area: Array<DesertRow>
  moving: Array<{ x: number; y: number }>
  sandColorCoef: number
}

export const useDesertStore = defineStore("desert", {
  state: (): DesertState => ({
    area: [],
    moving: [],
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
        state.moving.length == 0 &&
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
      this.moving = []
    },
    clear() {
      for (let i = 0; i < this.area.length; i++) {
        const row = this.area[i]
        for (let j = 0; j < row.length; j++) {
          row[j] = null
        }
      }
      this.moving = []
    },
    /*
     ********** MOVING ITEMS **********
     */
    addMoving(x: number, y: number) {
      this.moving.push({ x, y })
    },
    removeMoving(x: number, y: number) {
      const index = this.moving.findIndex((m) => m.x == x && m.y == y)
      if (index >= 0) {
        this.moving.splice(index, 1)
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
    addSandToCursor(amount: number, box: number) {
      const desertCursorStore = useDesertCursorStore()
      if (!desertCursorStore.isOutside) {
        for (let i = 0; i < amount; i++) {
          const randomX = getRandomPointCoordinate(
            desertCursorStore.cursorX,
            box,
          )
          const randomY = getRandomPointCoordinate(
            desertCursorStore.cursorY,
            box,
          )
          if (
            isCoordinateIn(randomX, this.areaWidth) &&
            isCoordinateIn(randomY, this.areaHeight) &&
            this.area[randomY][randomX] == null
          ) {
            this.area[randomY][randomX] = getNewSand(this.sandColorCoef)
            this.addMoving(randomX, randomY)
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
        this.addMoving(colIndex, y)
        this.increaseSandColor()
      }
    },
    /*
     ********** AREA DROP **********
     */
    drop(now: Moment) {
      try {
        const settingsStore = useSettingsStore()
        const sandAcceleration = settingsStore.sandAcceleration
        this.moving.forEach((movingItem) => {
          const rowIndex = movingItem.y
          const colIndex = movingItem.x
          const row = this.area[rowIndex]
          const item = row[colIndex]!
          if (now.diff(item.lastDrop) >= item.speed) {
            const isLastRow = rowIndex >= this.areaHeight - 1
            let moved = false
            if (!isLastRow) {
              const nextRow = this.area[rowIndex + 1]
              // Move down
              if (nextRow[colIndex] == null) {
                row[colIndex] = null
                nextRow[colIndex] = item
                movingItem.y++
                moved = true
              }
              // Move down and L/R
              else {
                const randomSide = Math.sign(Math.random() - 0.5) || 1
                for (const side of [randomSide, -randomSide]) {
                  const sideIndex = colIndex + side
                  if (
                    isCoordinateIn(sideIndex, row.length) &&
                    row[sideIndex] == null &&
                    nextRow[sideIndex] == null
                  ) {
                    row[colIndex] = null
                    nextRow[sideIndex] = item
                    movingItem.x = sideIndex
                    movingItem.y++
                    moved = true
                    break
                  }
                }
              }
            }
            // Update item after move
            if (moved) {
              item.lastDrop = now
              item.speed = Math.max(10, item.speed - sandAcceleration)
            }
            // No move -> stop item
            else if (
              isLastRow ||
              [...Array(this.areaHeight).keys()].every(
                (ri) => ri <= rowIndex || this.area[ri][colIndex] != null,
              )
            ) {
              item.speed = 0
              this.removeMoving(colIndex, rowIndex)
            }
          }
        })
      } catch (err) {
        console.log(err)
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

function isCoordinateIn(coordinate: number, limit: number) {
  return coordinate >= 0 && coordinate < limit
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
