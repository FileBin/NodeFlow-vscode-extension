import { matrix2d, one, scale2d } from '@/utils/matrixes'
import { defineStore } from 'pinia'
import { NodeDocument } from 'shared/models/nodeDocument'
import { NDArray, toArray } from 'vectorious'
import { computed, ref } from 'vue'

interface WebViewState {
  worldMatrix: number[],
  document: NodeDocument | null,
}

const initialState: WebViewState = {
  worldMatrix: toArray(one()),
  document: null,
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
  const nodeDocument = computed(() => $innerState.value.document);

  function transform(matrix: NDArray) {
    $innerState.value.worldMatrix = toArray(matrix2d($innerState.value.worldMatrix).multiply(matrix))
    setVscodeState($innerState.value)
  }

  function updateDocument(document: NodeDocument) {
    $innerState.value.document = document
    setVscodeState($innerState.value)
  }

  return { $innerState, worldMatrix, nodeDocument, transform, updateDocument }
})