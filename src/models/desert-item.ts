import { Moment } from "moment"
import * as PIXI from "pixi.js"

export type DesertItem = {
  type: "sand" | "obstacle"
  lastDrop: Moment | null
  static: Moment | null
  speed: number
  color: string
  element: PIXI.Graphics
}
