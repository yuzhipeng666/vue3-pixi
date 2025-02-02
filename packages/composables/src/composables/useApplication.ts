import type { Ref } from 'vue-demi'
import { computed, getCurrentInstance, inject, provide, ref, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/core'
import type { Application } from 'pixi.js'
import { appInjectKey } from '../internal'

export function useApplication(stageRef?: MaybeRef<any>): Ref<Application | undefined> {
  const inst = getCurrentInstance() as any

  if (inst.pixiAppRef)
    return inst.pixiAppRef

  if (stageRef)
    return computed(() => unref(stageRef).app)

  const app = ref(inject(appInjectKey, ref())) as Ref<Application | undefined>

  // not found, search down
  if (!app.value) {
    provide(appInjectKey, app)
    inst.pixiAppRef = app
  }

  return app
}

