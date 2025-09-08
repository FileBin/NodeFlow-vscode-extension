<template>
  <div class="container" ref="container" @mousemove="handleMouseMoveEvent" @wheel="handleMouseScrollEvent"
    @touchmove="handleTouchEvent" @touchend="handleTouchEndEvent" @mouseup="handleTouchEndEvent"
    @pointerdown="doubleTap" @pointerup="e => myLatestTapPos = array([e.clientX, e.clientY])"
    @touchcancel="tapsNumber = 1">
    <div class="background canvas-component" ref="bg_canvas"
      v-bind:style="{ opacity: bg_opacity, width: bg_scale, height: bg_scale, transform: bg_style }"></div>
    <div class="stretch canvas-component" ref="content" v-bind:style="{ transform: style }">
      <div class="shifted-square-container"></div>
    </div>
  </div>
</template>

<style>
  .shifted-square-container {
      width: 100px;
      height: 100px;
      background-color: #2294e0ff;
      position: relative;
      top: 30px;
      left: 50px;
  }

  .canvas-component {
    transform-origin: top left;
  }

  .stretch {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .container {

    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  .background {
    transform-origin: top left;
    position: fixed;
    background-image: v-bind('grid_res_url');
    background-repeat: repeat;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }
</style>

<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { useWebviewStore } from '@/stores/webview';
import { translate2d, scale2d, getMatrixScaleFactor2D, vector2D, scaleXY } from '@/utils/matrixes';
import { resourceUrl } from '@/utils/vscode';
import { array, NDArray } from 'vectorious';
import { ref, useTemplateRef } from 'vue';

const grid_res_url = `url(${resourceUrl('./assets/grid_tile.svg')})`;

const content = useTemplateRef('content')
const bg_canvas = useTemplateRef('bg_canvas')
const container = useTemplateRef('container')

const webviewStore = useWebviewStore();
const configStore = useConfigStore();

const style = ref('')
const bg_style = ref('')
const bg_scale = ref('')
const bg_opacity = ref(1.0)

updateState();

function updateState() {
  updateStyle();
}

function updateStyle() {
  const t = webviewStore.worldMatrix;

  const scaleFactor = getMatrixScaleFactor2D(t);

  const gridSize = 50 * scaleFactor
  let x = t.data[6];
  let y = t.data[7];

  style.value = `matrix(${t.data[0]}, ${t.data[1]}, ${t.data[3]}, ${t.data[4]}, ${x}, ${y})`
  
  x %= gridSize
  y %= gridSize

  x -= gridSize
  y -= gridSize

  let bg_scale_factor = 200/scaleFactor;
  bg_scale_factor = Math.round(bg_scale_factor);
  bg_scale_factor = Math.max(50, bg_scale_factor);

  bg_style.value = `matrix(${t.data[0]}, ${t.data[1]}, ${t.data[3]}, ${t.data[4]}, ${x}, ${y})`
  bg_scale.value = `${bg_scale_factor}%`
  bg_opacity.value = scaleFactor
}

function handleMouseMoveEvent(e: MouseEvent) {
  const client_rect = container.value?.getBoundingClientRect()
  const mouseButton = configStore.editor.navigation.translateMouseButton;

  if (client_rect) {
    let button = (e.buttons | e.button)
    if (button == mouseButton) {
      webviewStore.transform(translate2d(e.movementX, e.movementY))
      updateState();
    }
  }
}

function handleMouseScrollEvent(e: WheelEvent) {
  let delta = 0;
  
  if (e.ctrlKey) {
    delta = e.deltaY / -1000;
  }

  if (e.deltaMode == 0) {
    // increase delta for touchpad pinch gesture
    delta *= 10;
  }

  const client_rect = container.value?.getBoundingClientRect();
  if (client_rect) {
    const x = e.clientX - client_rect.left; //x position within the element.
    const y = e.clientY - client_rect.top;  //y position within the element.
    const factor = Math.pow(2, delta);
    let offset = translate2d(x, y);
    const inv = translate2d(-x, -y);

    if(!e.ctrlKey) {
      offset = offset.multiply(translate2d(-e.deltaX, -e.deltaY));
    }

    webviewStore.transform(inv.multiply(scale2d(factor)).multiply(offset))
  }

  updateState();
}

function handleTouchEvent(e: TouchEvent) {
  const client_rect = container.value?.getBoundingClientRect();
  if (client_rect) {
    if (e.touches.length == 1) {
      const touch = array([e.touches[0].clientX, e.touches[0].clientY]);
      if (tapsNumber == 2) {
        handleOnePoint(touch, client_rect)
      }
    } else if (e.touches.length == 2) {
      const touches = [
        array([e.touches[0].clientX, e.touches[0].clientY]),
        array([e.touches[1].clientX, e.touches[1].clientY]),
      ]

      handleTwoPoints(touches, client_rect, { rotate: false, });
    }
  }
}

let previousTouches: NDArray[] = []
let anchor: NDArray | null = null

function handleOnePoint(point: NDArray, client_rect: DOMRect) {
  point = point.subtract(array([client_rect.left, client_rect.top]))
  if (previousTouches.length === 1) {
    const prev = previousTouches[0];
    const move = point.copy().subtract(prev)
    webviewStore.transform(translate2d(move.data[0], move.data[1]))
    updateState();
  }
  previousTouches = [point];
}

function handleTwoPoints(points: NDArray[], client_rect: DOMRect, {scale = true, rotate = true, translate = true}) {
  const touches = points.map(p => p.subtract(array([client_rect.left, client_rect.top])))
  if (previousTouches.length > 1) {
    const center = touches[0].copy()
      .add(touches[1])
      .scale(0.5)
      .subtract(array([client_rect.width * 0.5, client_rect.height * 0.5]))

    const mat = translate2d(center.data[0], center.data[1]);
    const inv = translate2d(-center.data[0], -center.data[1]);

    let vectors = [touches, previousTouches]
      .map(t => t[0].copy().subtract(t[1]).copy());

    const sizes = vectors
      .map(t => Math.sqrt(t.dot(t)))

    vectors = vectors
      .map(v => v.normalize())
      .map(v => array([v.data[0], v.data[1], 0]));


    if (scale) {
      if (sizes[0] > 0 && sizes[1] > 0) {
        const scale = sizes[0] / sizes[1];

        webviewStore.transform(inv.multiply(scale2d(scale)).multiply(mat));
      }
    }

    if (translate) {
      const all_touches = touches.map((t, i) => [t, previousTouches[i]])
      const moves = all_touches.map(t => t[0].copy().subtract(t[1]))
      const movement = moves[0].add(moves[1]).scale(0.5);

      webviewStore.transform(translate2d(movement.data[0], movement.data[1]))
    }
    updateState();
  }
  previousTouches = [...touches]
}

let tapsNumber = 1

function handleTouchEndEvent() {
  previousTouches = []
  anchor = null;
}

let myLatestTap = new Date().getTime();
let myLatestTapPos = array([0, 0])

function doubleTap(e: PointerEvent) {

  const now = new Date().getTime()
  const timesince = now - myLatestTap

  const pos = array([e.clientX, e.clientY])

  if (timesince < 600 && pos.copy().subtract(myLatestTapPos).norm() < 50) {
    tapsNumber += 1
  } else {
    tapsNumber = 1;
  }

  console.log(tapsNumber)

  myLatestTap = new Date().getTime();
  myLatestTapPos = pos
}
</script>