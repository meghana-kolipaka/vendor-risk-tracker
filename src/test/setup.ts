import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { apiConfig, resetApi } from '../api/mockApi'

beforeEach(() => {
  apiConfig.delay = 0
  apiConfig.failNext = false
  resetApi()
  sessionStorage.clear()
})
afterEach(() => cleanup())
