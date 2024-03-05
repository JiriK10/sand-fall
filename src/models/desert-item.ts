import { Moment } from "moment"
import * as PIXI from "pixi.js"

export type DesertItem = {
  lastDrop: Moment
  speed: number
  color: string
  element: PIXI.Graphics
}
