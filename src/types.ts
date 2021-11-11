import type { Plugin } from './plugins'

export type DrawEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

export type PluginMap = { [key: string]: Plugin }