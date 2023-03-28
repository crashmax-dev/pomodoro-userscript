import { LocalStorage } from '@zero-dependency/storage'

export interface Time {
  minutes: number
  seconds: number
}

export interface Position {
  x: number
  y: number
}

export interface StorageData {
  position: Position
  time: Time
  onTickTime: Time
  isRunning: boolean
}

class Storage {
  private readonly initialData: StorageData = {
    time: {
      minutes: 0,
      seconds: 0
    },
    onTickTime: {
      minutes: 0,
      seconds: 0
    },
    isRunning: false,
    position: {
      x: 0,
      y: 0
    }
  }

  private readonly storage = new LocalStorage<StorageData>(
    'pomodoro-storage',
    this.initialData
  )

  get data() {
    return this.storage.values
  }

  getByKey<T extends keyof StorageData>(key: T): StorageData[T] {
    return this.data[key]
  }

  write(callback: (prevValue: StorageData) => StorageData) {
    this.storage.write(callback)
  }

  reset() {
    this.storage.reset()
  }
}

export const store = new Storage()
