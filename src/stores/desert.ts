import { defineStore } from "pinia"
import moment, { Moment } from "moment"
import * as PIXI from "pixi.js"

import { useSettingsStore } from "../stores/settings"
import { useDesertCursorStore } from "../stores/desert-cursor"

import { DesertRow } from "../models/desert-row"
import { DesertItem, DesertItemType } from "../models/desert-item"
import { SandColor } from "../models/sand-color"

const ITEM_MAX_STATIC = 500 // ms

const TEXTURE_BOMB = PIXI.Texture.from("./src/assets/bomb.png")

export interface DesertState {
  canvas: PIXI.Application | null
  area: Array<DesertRow>
  moving: Array<{ row: number; col: number }>
  movingSand: number
  movingBombs: number
  sandColorCoef: number
}

export const useDesertStore = defineStore("desert", {
  state: (): DesertState => ({
    canvas: null,
    area: [],
    moving: [],
    movingSand: 0,
    movingBombs: 0,
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
      this.movingSand = 0
      this.movingBombs = 0
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
          if (item != null && item.type != DesertItemType.Obstacle) {
            item.element.destroy()
            row[j] = null
          }
        }
      }
      this.moving = []
      this.movingSand = 0
      this.movingBombs = 0
    },
    /*
     ********** MOVING ITEMS **********
     */
    addMoving(rowIdx: number, colIdx: number, type: DesertItemType) {
      this.moving.push({ row: rowIdx, col: colIdx })
      switch (type) {
        case DesertItemType.Sand:
          this.movingSand++
          break
        case DesertItemType.Bomb:
          this.movingBombs++
          break
      }
    },
    removeMoving(rowIdx: number, colIdx: number, type: DesertItemType) {
      const idx = this.moving.findIndex(
        (m) => m.row == rowIdx && m.col == colIdx,
      )
      if (idx >= 0) {
        this.moving.splice(idx, 1)
        switch (type) {
          case DesertItemType.Sand:
            this.movingSand--
            break
          case DesertItemType.Bomb:
            this.movingBombs--
            break
        }
      }
    },
    /*
     ********** SAND / BOMBS **********
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
    addItemToCursor(amount: number, box: number, type: DesertItemType) {
      const desertCursorStore = useDesertCursorStore()
      if (!desertCursorStore.isOutside) {
        for (let i = 0; i < amount; i++) {
          const rowIdx = getRandomCoordinateInBox(
            desertCursorStore.cursorY,
            box,
          )
          const colIdx = getRandomCoordinateInBox(
            desertCursorStore.cursorX,
            box,
          )
          if (
            isCoordinateIn(rowIdx, this.areaHeight) &&
            isCoordinateIn(colIdx, this.areaWidth) &&
            this.area[rowIdx][colIdx] == null
          ) {
            const newItem =
              type == DesertItemType.Bomb
                ? getNewBomb(rowIdx, colIdx)
                : getNewSand(rowIdx, colIdx, this.sandColorCoef)
            this.area[rowIdx][colIdx] = newItem
            this.canvas!.stage.addChild(newItem.element)
            this.addMoving(rowIdx, colIdx, type)
            if (type == DesertItemType.Sand) {
              this.increaseSandColor()
            }
          }
        }
      }
    },
    addItemRandomlyToRow(rowIdx: number, type: DesertItemType) {
      const row = this.area[rowIdx]
      let colIdx = null
      // Find random spot
      for (let i = 0; i < row.length; i++) {
        const coordinate = getRandomCoordinate(row.length - 1)
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
        const newItem =
          type == DesertItemType.Bomb
            ? getNewBomb(rowIdx, colIdx)
            : getNewSand(rowIdx, colIdx, this.sandColorCoef)
        row[colIdx] = newItem
        this.canvas!.stage.addChild(newItem.element)
        this.addMoving(rowIdx, colIdx, type)
        if (type == DesertItemType.Sand) {
          this.increaseSandColor()
        }
      }
    },
    /*
     ********** OBSTACLES **********
     */
    addObstacles() {
      this.addObstaclesBottom()
      this.addObstaclesTop()
    },
    addObstaclesTop() {
      const settingsStore = useSettingsStore()
      if (settingsStore.obstaclesTop > 0) {
        const diffRowMin = 0.01 * this.areaHeight
        const diffRowMax = 0.2 * this.areaHeight
        const diffColMin = 0.01 * this.areaWidth
        const diffColMax = 0.2 * this.areaWidth
        const rowMin =
          (settingsStore.obstaclesTopPlacementMin / 100) * this.areaHeight
        const rowMax =
          (settingsStore.obstaclesTopPlacementMax / 100) * this.areaHeight
        for (let o = 0; o < settingsStore.obstaclesTop; o++) {
          const startRowIdx = getRandomCoordinate(rowMax, rowMin)
          const startColIdx = getRandomCoordinate(this.areaWidth - 1)
          const endRowIdx =
            startRowIdx + getRandomCoordinate(diffRowMax, diffRowMin)
          const endColIdx = trimCoordinate(
            startColIdx +
              getRandomSign() * getRandomCoordinate(diffColMax, diffColMin),
            this.areaWidth,
          )

          const line = getBresenhamsLine(
            startRowIdx,
            startColIdx,
            endRowIdx,
            endColIdx,
          )
          line.forEach((point) => {
            if (this.area[point.row][point.col] == null) {
              const newObstacle = getNewObstacle(point.row, point.col)
              this.area[point.row][point.col] = newObstacle
              this.canvas!.stage.addChild(newObstacle.element)
            }
          })
        }
      }
    },
    addObstaclesBottom() {
      const settingsStore = useSettingsStore()
      if (settingsStore.obstaclesBottom > 0) {
        const rowMin =
          (1 - settingsStore.obstaclesBottomHeightMin / 100) * this.areaHeight
        const rowMax =
          (1 - settingsStore.obstaclesBottomHeightMax / 100) * this.areaHeight
        for (
          let obstacle = 0;
          obstacle < settingsStore.obstaclesBottom;
          obstacle++
        ) {
          const obstacleTop = getRandomCoordinate(rowMax, rowMin)
          const colIdx = Math.round(
            ((obstacle + 1) * this.areaWidth) /
              (settingsStore.obstaclesBottom + 1),
          )
          for (let rowIdx = obstacleTop; rowIdx < this.areaHeight; rowIdx++) {
            const newObstacle = getNewObstacle(rowIdx, colIdx)
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
      this.moving.forEach((movingItem) => {
        const rowIdx = movingItem.row
        const colIdx = movingItem.col
        const row = this.area[rowIdx] as DesertRow
        const item = row[colIdx]!
        const isBomb = item.type == DesertItemType.Bomb
        let stop = rowIdx >= this.areaHeight - 1
        if (!stop && now.diff(item.lastDrop) >= item.speed) {
          let moved = false
          const nextRow = this.area[rowIdx + 1]
          // Move down
          if (nextRow[colIdx] == null) {
            row[colIdx] = null
            nextRow[colIdx] = item
            movingItem.row++
            moved = true
          }
          // Move down and L/R
          else if (!isBomb) {
            const randomSide = getRandomSign()
            for (const side of [randomSide, -randomSide]) {
              const sideIdx = colIdx + side
              if (
                isCoordinateIn(sideIdx, row.length) &&
                row[sideIdx] == null &&
                nextRow[sideIdx] == null
              ) {
                row[colIdx] = null
                nextRow[sideIdx] = item
                movingItem.row++
                movingItem.col = sideIdx
                moved = true
                break
              }
            }
          }
          // Update item after move
          if (moved) {
            const acceleration =
              item.type == DesertItemType.Bomb
                ? settingsStore.bombAcceleration
                : settingsStore.sandAcceleration

            item.lastDrop = now
            item.speed = Math.max(10, item.speed - acceleration)
            item.element.position.set(
              movingItem.col * settingsStore.desertItemSize,
              movingItem.row * settingsStore.desertItemSize,
            )
            if (item.static != null) {
              item.static = null
            }
          }
          // Stop bomb
          else if (isBomb) {
            stop = true
          }
          // Mark sand as static
          else if (item.static == null) {
            item.static = now
          }
          // No sand move and static passed
          else if (now.diff(item.static) >= ITEM_MAX_STATIC) {
            // Check temporary stucked item
            let stucked = false
            for (const direction of [-1, 1]) {
              const diagonalRowIdx = rowIdx + Math.abs(direction)
              const diagonalColIdx = colIdx + direction
              if (
                isCoordinateIn(diagonalRowIdx, this.areaHeight) &&
                isCoordinateIn(diagonalColIdx, this.areaWidth)
              ) {
                // Item is blocked by static item next to it
                if (this.area[rowIdx][diagonalColIdx]?.speed === 0) {
                  continue
                }
                const diagonalItem = this.area[diagonalRowIdx][diagonalColIdx]
                // Is stucked
                if (diagonalItem == null || diagonalItem.speed > 0) {
                  stucked = true
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
          this.removeMoving(rowIdx, colIdx, item.type)
          // Destroy what bomb hit
          if (isBomb) {
            this.area[rowIdx][colIdx] = null
            item.element.destroy()
            if (isCoordinateIn(rowIdx + 1, this.areaHeight)) {
              const hitItem = this.area[rowIdx + 1][colIdx]
              if (hitItem != null && hitItem.type != DesertItemType.Obstacle) {
                this.area[rowIdx + 1][colIdx] = null
                hitItem.element.destroy()
                if (hitItem.speed > 0) {
                  this.removeMoving(rowIdx + 1, colIdx, hitItem.type)
                }
              }
            }
          }
          // Stop item
          else {
            item.speed = 0
            item.static = null
            if (settingsStore.sandStaticRed) {
              changeSandColor(item, "#FF0000")
            }
          }
        }
      })
    },
  },
})

function getRandomSign() {
  return Math.sign(Math.random() - 0.5) || 1
}

function getRandomCoordinate(max: number, min: number = 0) {
  return Math.round(Math.random() * (max - min) + min)
}

function getRandomCoordinateInBox(center: number, width: number) {
  return (
    center - Math.floor(width / 2) + Math.round(Math.random() * (width - 1))
  )
}

function trimCoordinate(coordinate: number, max: number, min: number = 0) {
  if (coordinate < min) return min
  if (coordinate > max) return max
  return coordinate
}

function isCoordinateIn(coordinate: number, limit: number) {
  return coordinate >= 0 && coordinate < limit
}

function getNewCanvas(width: number, height: number) {
  const settingsStore = useSettingsStore()
  return new PIXI.Application({
    backgroundColor: "#9E9E9E",
    width: width * settingsStore.desertItemSize,
    height: height * settingsStore.desertItemSize,
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

function getNewSand(
  rowIdx: number,
  colIdx: number,
  sandColorCoef: number,
): DesertItem {
  const settingsStore = useSettingsStore()

  const color = getSandColor(settingsStore.sandColor, sandColorCoef)
  const element = new PIXI.Graphics()
  element.beginFill(color)
  element.drawRect(
    0,
    0,
    settingsStore.desertItemSize,
    settingsStore.desertItemSize,
  )
  element.endFill()
  element.position.set(
    colIdx * settingsStore.desertItemSize,
    rowIdx * settingsStore.desertItemSize,
  )

  return {
    type: DesertItemType.Sand,
    lastDrop: moment(),
    static: null,
    speed: settingsStore.sandSpeed,
    color,
    element,
  }
}

function changeSandColor(item: DesertItem, color: string) {
  const settingsStore = useSettingsStore()

  const graphics = item.element as PIXI.Graphics
  graphics.clear()
  graphics.beginFill(color)
  graphics.drawRect(
    0,
    0,
    settingsStore.desertItemSize,
    settingsStore.desertItemSize,
  )
  graphics.endFill()
}

function getNewBomb(rowIdx: number, colIdx: number): DesertItem {
  const settingsStore = useSettingsStore()

  const element = new PIXI.Sprite(TEXTURE_BOMB)
  element.width = settingsStore.desertItemSize
  element.height = settingsStore.desertItemSize
  element.position.set(
    colIdx * settingsStore.desertItemSize,
    rowIdx * settingsStore.desertItemSize,
  )

  return {
    type: DesertItemType.Bomb,
    lastDrop: moment(),
    static: null,
    speed: settingsStore.bombSpeed,
    color: null,
    element,
  }
}

function getNewObstacle(rowIdx: number, colIdx: number): DesertItem {
  const settingsStore = useSettingsStore()

  const color = "#FFC107"
  const element = new PIXI.Graphics()
  element.beginFill(color)
  element.drawRect(
    0,
    0,
    settingsStore.desertItemSize,
    settingsStore.desertItemSize,
  )
  element.endFill()
  element.position.set(
    colIdx * settingsStore.desertItemSize,
    rowIdx * settingsStore.desertItemSize,
  )

  return {
    type: DesertItemType.Obstacle,
    lastDrop: null,
    static: null,
    speed: 0,
    color,
    element,
  }
}

function getBresenhamsLine(
  startRowIdx: number,
  startColIdx: number,
  endRowIdx: number,
  endColIdx: number,
) {
  const deltaRow = -Math.abs(endRowIdx - startRowIdx)
  const deltaCol = Math.abs(endColIdx - startColIdx)
  const stepRow = startRowIdx < endRowIdx ? 1 : -1
  const stepCol = startColIdx < endColIdx ? 1 : -1

  const points = []
  let pointRow = startRowIdx
  let pointCol = startColIdx
  let error = deltaRow + deltaCol
  let doubleError
  while (true) {
    points.push({ row: pointRow, col: pointCol })

    if (pointRow == endRowIdx && pointCol == endColIdx) {
      break
    }

    doubleError = 2 * error
    if (doubleError >= deltaRow) {
      error += deltaRow
      pointCol += stepCol
    }
    if (doubleError <= deltaCol) {
      error += deltaCol
      pointRow += stepRow
    }
  }
  return points
}
