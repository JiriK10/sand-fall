import { Moment } from "moment"
import * as PIXI from "pixi.js"

export enum DesertItemType {
  Sand,
  Obstacle,
  Bomb,
}

export type DesertItem = {
  type: DesertItemType
  lastDrop: Moment | null
  static: Moment | null
  speed: number
  color: string | null
  element: PIXI.Graphics | PIXI.Sprite
}
