import { Moment } from "moment"
import * as PIXI from "pixi.js"

export type DesertItem = {
  lastDrop: Moment
  static: Moment | null
  speed: number
  color: string
  element: PIXI.Graphics
}
