import { isObject } from '@antfu/utils'
import { effectScope, nextTick, watchEffect } from 'vue-demi'

export function setObject(inst: any, key: string, prevValue: any, nextValue: any) {
  const scope = effectScope()
  function update() {
    if (prevValue && nextValue !== prevValue) {
      inst[`__${key}_scope`]?.stop()
      delete inst[`__${key}_scope`]
    }
    for (const [setKey, value] of Object.entries(nextValue))
      inst[key][setKey] = value
  }
  scope.run(() => {
    watchEffect(update)
    nextTick(update)
  })
  inst.on('destroyed', () => scope.stop())
  inst[`__${key}_scope`] = scope
  return true
}

export function setPoint(inst: any, name: string, key: string, prevValue: any, nextValue: any) {
  switch (key) {
    case name:
      if (isObject(nextValue))
        return setObject(inst, name, prevValue, nextValue)
      else
        return callPoint(inst, name, nextValue)
    case `${name}X`:
      return setValue(inst[name], 'x', () => inst[name].x = nextValue)
    case `${name}Y`:
      return setValue(inst[name], 'y', () => inst[name].y = nextValue)
  }

  return false
}

export function setValue(inst: any, key: string, setter: () => void) {
  const initKey = `__${key}_init`
  function update() {
    setter()
  }
  if (!inst[initKey]) {
    Reflect.set(inst, initKey, true)
    nextTick(update)
  }
  else {
    update()
  }
  return true
}

export function callPoint(inst: any, key: string, value: any | any[]) {
  const [v1, v2] = Array.isArray(value) ? value : [value, value]
  const initKey = `__${key}_init`
  function update() {
    return inst[key].set(v1, v2)
  }
  if (!inst[initKey]) {
    Reflect.set(inst, initKey, true)
    nextTick(update)
  }
  else {
    update()
  }
  return true
}
