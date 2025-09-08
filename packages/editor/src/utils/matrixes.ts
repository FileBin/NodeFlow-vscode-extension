import { array, NDArray } from 'vectorious'

export function matrix2d(arr: number[]) {
  return array(
    new NDArray(arr, {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function one() {
  return array(
    new NDArray([1, 0, 0, 0, 1, 0, 0, 0, 1], {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function scale2d(factor: number) {
  return array(
    new NDArray([factor, 0, 0, 0, factor, 0, 0, 0, 1], {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function scaleXY(factorX: number, factorY: number) {
  return array(
    new NDArray([factorX, 0, 0, 0, factorY, 0, 0, 0, 1], {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function translate2d(x: number, y: number) {
  return array(
    new NDArray([1, 0, 0, 0, 1, 0, x, y, 1], {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function rotate2d(angle: number) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return array(
    new NDArray([c, -s, 0, s, c, 0, 0, 0, 1], {
      shape: [3, 3],
      dtype: 'float64'
    })
  )
}

export function vector2D(x: number, y: number) {
  return new NDArray([x, y, 1], {
    shape: [1, 3],
    dtype: 'float64' 
  })
}

export function getMatrixScaleFactor2D(matrix: NDArray) {
  const vec = new NDArray([1, 0, 0], {
    shape: [1, 3],
    dtype: 'float64' 
  })
  const newVec = vec.multiply(matrix)
  
  var x = newVec.data[0]
  var y = newVec.data[1]

  return Math.sqrt(x * x + y * y)
}

export function toArray(nd: NDArray) {
  let array = []
  for (let index = 0; index < nd.data.length; index++) {
    array.push(nd.data[index]);
  }
  return array;
}
