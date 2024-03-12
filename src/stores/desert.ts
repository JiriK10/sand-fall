import { defineStore } from "pinia"
import moment, { Moment } from "moment"
import * as PIXI from "pixi.js"

import { useSettingsStore } from "../stores/settings"
import { useDesertCursorStore } from "../stores/desert-cursor"

import { DesertRow } from "../models/desert-row"
import { DesertItem } from "../models/desert-item"
import { SandColor } from "../models/sand-color"

const SAND_MAX_STATIC = 500 // ms

export interface DesertState {
  canvas: PIXI.Application | null
  area: Array<DesertRow>
  moving: Array<{ x: number; y: number }>
  sandColorCoef: number
}

export const useDesertStore = defineStore("desert", {
  state: (): DesertState => ({
    canvas: null,
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
        [...Array(5).keys()].every((idx) =>
          state.area[idx].every((item) => item != null),
        )
      )
    },
  },
  actions: {
    init() {
      const settingsStore = useSettingsStore()
      let init = []
      for (let i = 0; i < settingsStore.desertHeight; i++) {
        const row: DesertRow = []
        init.push(row)
        for (let j = 0; j < settingsStore.desertWidth; j++) {
          row.push(null)
        }
      }
      this.area = init
      this.moving = []
      this.canvas = getNewCanvas(
        settingsStore.desertWidth,
        settingsStore.desertHeight,
      )
    },
    clear() {
      for (let i = 0; i < this.area.length; i++) {
        const row = this.area[i]
        for (let j = 0; j < row.length; j++) {
          const item = row[j]
          if (item?.type == "sand") {
            item.element.destroy()
            row[j] = null
          }
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
      const idx = this.moving.findIndex((m) => m.x == x && m.y == y)
      if (idx >= 0) {
        this.moving.splice(idx, 1)
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
            const newSand = getNewSand(randomX, randomY, this.sandColorCoef)
            this.area[randomY][randomX] = newSand
            this.canvas!.stage.addChild(newSand.element)
            this.addMoving(randomX, randomY)
            this.increaseSandColor()
          }
        }
      }
    },
    addSandRandomlyToRow(y: number) {
      const row = this.area[y]
      let colIdx = null
      // Find random spot
      for (let i = 0; i < row.length; i++) {
        const coordinate = getRandomRowCoordinate(row.length)
        if (row[coordinate] == null) {
          colIdx = coordinate
          break
        }
      }
      // Find first empty spot
      if (colIdx == null) {
        colIdx = row.findIndex((item) => item == null)
      }

      if (colIdx != null && colIdx >= 0) {
        const newSand = getNewSand(colIdx, y, this.sandColorCoef)
        row[colIdx] = newSand
        this.canvas!.stage.addChild(newSand.element)
        this.addMoving(colIdx, y)
        this.increaseSandColor()
      }
    },
    /*
     ********** OBSTACLES **********
     */
    addObstaclesBottom() {
      const settingsStore = useSettingsStore()
      if (settingsStore.obstaclesBottom > 0) {
        const rowMin =
          (1 - settingsStore.obstaclesBottomHeightMin / 100) *
          settingsStore.desertHeight
        const rowMax =
          (1 - settingsStore.obstaclesBottomHeightMax / 100) *
          settingsStore.desertHeight
        for (
          let obstacle = 0;
          obstacle < settingsStore.obstaclesBottom;
          obstacle++
        ) {
          const obstacleTop = Math.round(
            Math.random() * (rowMax - rowMin) + rowMin,
          )
          const colIdx = Math.round(
            ((obstacle + 1) * settingsStore.desertWidth) /
              (settingsStore.obstaclesBottom + 1),
          )
          for (
            let rowIdx = obstacleTop;
            rowIdx < settingsStore.desertHeight;
            rowIdx++
          ) {
            const newObstacle = getNewObstacle(colIdx, rowIdx)
            this.area[rowIdx][colIdx] = newObstacle
            this.canvas!.stage.addChild(newObstacle.element)
          }
        }
      }
    },
    /*
     ********** AREA DROP **********
     */
    drop(now: Moment) {
      const settingsStore = useSettingsStore()
      const sandAcceleration = settingsStore.sandAcceleration
      this.moving.forEach((movingItem) => {
        const rowIdx = movingItem.y
        const colIdx = movingItem.x
        const row = this.area[rowIdx] as DesertRow
        const item = row[colIdx]!
        let stop = rowIdx >= this.areaHeight - 1
        if (!stop && now.diff(item.lastDrop) >= item.speed) {
          let moved = false
          const nextRow = this.area[rowIdx + 1]
          // Move down
          if (nextRow[colIdx] == null) {
            row[colIdx] = null
            nextRow[colIdx] = item
            movingItem.y++
            moved = true
          }
          // Move down and L/R
          else {
            const randomSide = Math.sign(Math.random() - 0.5) || 1
            for (const side of [randomSide, -randomSide]) {
              const sideIdx = colIdx + side
              if (
                isCoordinateIn(sideIdx, row.length) &&
                row[sideIdx] == null &&
                nextRow[sideIdx] == null
              ) {
                row[colIdx] = null
                nextRow[sideIdx] = item
                movingItem.x = sideIdx
                movingItem.y++
                moved = true
                break
              }
            }
          }
          // Update item after move
          if (moved) {
            item.lastDrop = now
            item.speed = Math.max(10, item.speed - sandAcceleration)
            item.element.position.set(
              movingItem.x * settingsStore.sandSize,
              movingItem.y * settingsStore.sandSize,
            )
            if (item.static != null) {
              item.static = null
            }
          }
          // Mark as static
          else if (item.static == null) {
            item.static = now
          }
          // No move and static passed
          else if (now.diff(item.static) >= SAND_MAX_STATIC) {
            // Check temporary stucked item
            let stucked = false
            for (const direction of [-1, 1]) {
              let diagonal = direction
              while (!stucked) {
                const stuckRowIdx = rowIdx + Math.abs(diagonal)
                const stuckColIdx = colIdx + diagonal
                if (
                  !isCoordinateIn(stuckRowIdx, this.areaHeight) ||
                  !isCoordinateIn(stuckColIdx, this.areaWidth)
                ) {
                  break
                }
                const diagonalItem = this.area[stuckRowIdx][stuckColIdx]
                if (diagonalItem == null) {
                  stucked = true
                } else if (diagonalItem.speed === 0) {
                  break
                } else {
                  diagonal += direction
                }
              }
            }
            if (stucked) {
              // Reset static
              item.static = now
            } else {
              stop = true
            }
          }
        }
        if (stop) {
          // Stop item
          item.speed = 0
          item.static = null
          this.removeMoving(colIdx, rowIdx)
          if (settingsStore.sandStaticRed) {
            changeSandColor(item, "#FF0000")
          }
        }
      })
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

function getNewCanvas(width: number, height: number) {
  const settingsStore = useSettingsStore()
  return new PIXI.Application({
    backgroundColor: "#9E9E9E",
    width: width * settingsStore.sandSize,
    height: height * settingsStore.sandSize,
    premultipliedAlpha: false,
    antialias: false,
  })
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

function getNewSand(x: number, y: number, sandColorCoef: number): DesertItem {
  const settingsStore = useSettingsStore()

  const color = getSandColor(settingsStore.sandColor, sandColorCoef)
  const element = new PIXI.Graphics()
  element.beginFill(color)
  element.drawRect(0, 0, settingsStore.sandSize, settingsStore.sandSize)
  element.endFill()
  element.position.set(x * settingsStore.sandSize, y * settingsStore.sandSize)

  return {
    type: "sand",
    lastDrop: moment(),
    static: null,
    speed: settingsStore.sandSpeed,
    color,
    element,
  }
}

function changeSandColor(item: DesertItem, color: string) {
  const settingsStore = useSettingsStore()

  item.element.clear()
  item.element.beginFill(color)
  item.element.drawRect(0, 0, settingsStore.sandSize, settingsStore.sandSize)
  item.element.endFill()
}

function getNewObstacle(x: number, y: number): DesertItem {
  const settingsStore = useSettingsStore()

  const color = "#FFC107"
  const element = new PIXI.Graphics()
  element.beginFill(color)
  element.drawRect(0, 0, settingsStore.sandSize, settingsStore.sandSize)
  element.endFill()
  element.position.set(x * settingsStore.sandSize, y * settingsStore.sandSize)

  return {
    type: "obstacle",
    lastDrop: null,
    static: null,
    speed: 0,
    color,
    element,
  }
}
