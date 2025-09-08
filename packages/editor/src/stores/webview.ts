import { matrix2d, one, scale2d } from '@/utils/matrixes'
import { defineStore } from 'pinia'
import { NDArray, toArray } from 'vectorious'
import { computed, ref } from 'vue'

interface WebViewState {
  worldMatrix: number[],
}

const initialState: WebViewState = {
  worldMatrix: toArray(one()),
}

function getInitialState(): WebViewState {
  // @ts-ignore
  const savedState = vscode.getState() as WebViewState;
  
  // eslint-disable-next-line eqeqeq
  if (savedState != null) { return savedState; }
  return initialState;
}

function setVscodeState(state: WebViewState) {
  // @ts-ignore
  vscode.setState(state);
}

export const useWebviewStore = defineStore('webview', () => {
  const $innerState = ref(getInitialState());
  const worldMatrix = computed(() => matrix2d($innerState.value.worldMatrix));
  function transform(matrix: NDArray) {
    $innerState.value.worldMatrix = toArray(matrix2d($innerState.value.worldMatrix).multiply(matrix))
    setVscodeState($innerState.value)
  }

  return { $innerState, worldMatrix, transform }
})