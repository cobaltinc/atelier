<h1 align='center'>
  Atelier
</h1>

<p align="center"><strong>Caple Design System is an open-source design system built by <a href="https://cobalt.run">Cobalt, Inc.</a></strong></p>

<p align='center'>
  <a href="https://cobalt.run">
    <img src="https://badgen.net/badge/icon/Made%20by%20Cobalt?icon=https://caple-static.s3.ap-northeast-2.amazonaws.com/cobalt-badge.svg&label&color=5B69C3&labelColor=414C9A" />
  </a>
  <a href='https://www.npmjs.com/package/@cobaltinc/atelier'>
    <img src='https://img.shields.io/npm/v/@cobaltinc/atelier.svg' alt='Latest npm version'>
  </a>
  <a href="https://github.com/cobaltinc/atelier/blob/master/.github/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
  </a>
</p>

## :rocket: Getting started

```bash
npm install @cobaltinc/atelier # or yarn add @cobaltinc/atelier
```

```jsx
import React from 'react'
import { Atelier } from '@cobaltinc/atelier'

<Atelier />
```

Demo page: [`https://cobaltinc.github.io/atelier`](https://cobaltinc.github.io/atelier)

### Props

Prop | Description | Default
---- | ----------- | -------
`command` |  | `pen`
`color` |  | `#000000`
`lineWidth` |  | `2`
`width` |  | `800`
`height` |  | `600`
`enableDraw` |  | `true`
`enablePressure` |  | `false`
`plugins` |  | `[PenPlugin]`
`style` | 
`className` | 

### 🖋️ Default Plugins
* PenPlugin
* EraserPlugin
* BrushPlugin
* HighlighterPlugin
* LaserPlugin

## 🖌️ Custom Plugin
WIP

## :page_facing_up: License

Atelier is made available under the [MIT License](./LICENSE).
