import { matrix2d, one, scale2d } from '@/utils/matrixes'
import { defineStore } from 'pinia'
import { NDArray, toArray } from 'vectorious'
import { computed, ref } from 'vue'



export const useConfigStore = defineStore('config', () => {
  const editor = ref({
    navigation: {
      translateMouseButton: 2,
    }
  })

  return { editor }
})