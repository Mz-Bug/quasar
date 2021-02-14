import { watch, nextTick, onMounted, getCurrentInstance } from 'vue'

import { vmHasRouter, vmHasListener } from '../../utils/private/vm.js'

export const useModelToggleProps = {
  modelValue: {
    type: Boolean,
    default: null
  }
}

export const useModelToggleEmits = [
  'update:modelValue', 'before-show', 'show', 'before-hide', 'hide'
]

// handleShow/handleHide -> removeTick(), self (& emit show), prepareTick()

export default function ({
  showing,
  canShow, // optional
  hideOnRouteChange, // optional
  handleShow, // optional
  handleHide, // optional
  processOnMount // optional
}) {
  const vm = getCurrentInstance()
  const { props, emit, proxy } = vm

  let payload

  function toggle (evt) {
    if (showing.value === true) {
      hide(evt)
    }
    else {
      show(evt)
    }
  }

  function show (evt) {
    if (props.disable === true || (canShow !== void 0 && canShow(evt) !== true)) {
      return
    }

    const listener = vmHasListener(vm, 'onUpdate:modelValue') === true

    if (listener === true && __QUASAR_SSR_SERVER__ !== true) {
      emit('update:modelValue', true)
      payload = evt
      nextTick(() => {
        if (payload === evt) {
          payload = void 0
        }
      })
    }

    if (props.modelValue === null || listener === false || __QUASAR_SSR_SERVER__) {
      processShow(evt)
    }
  }

  function processShow (evt) {
    if (showing.value === true) {
      return
    }

    showing.value = true

    emit('before-show', evt)

    if (handleShow !== void 0) {
      handleShow(evt)
    }
    else {
      emit('show', evt)
    }
  }

  function hide (evt) {
    if (__QUASAR_SSR_SERVER__ || props.disable === true) {
      return
    }

    const listener = vmHasListener(vm, 'onUpdate:modelValue') === true

    if (listener === true && __QUASAR_SSR_SERVER__ !== true) {
      emit('update:modelValue', false)
      payload = evt
      nextTick(() => {
        if (payload === evt) {
          payload = void 0
        }
      })
    }

    if (props.modelValue === null || listener === false || __QUASAR_SSR_SERVER__) {
      processHide(evt)
    }
  }

  function processHide (evt) {
    if (showing.value === false) {
      return
    }

    showing.value = false

    emit('before-hide', evt)

    if (handleHide !== void 0) {
      handleHide(evt)
    }
    else {
      emit('hide', evt)
    }
  }

  function processModelChange (val) {
    if (props.disable === true && val === true) {
      if (vmHasListener(vm, 'onUpdate:modelValue') === true) {
        emit('update:modelValue', false)
      }
    }
    else if ((val === true) !== showing.value) {
      const fn = val === true ? processShow : processHide
      fn(payload)
    }
  }

  watch(() => props.modelValue, processModelChange)

  if (hideOnRouteChange !== void 0 && vmHasRouter(vm) === true) {
    watch(() => proxy.$route, () => {
      if (hideOnRouteChange.value === true && showing.value === true) {
        hide()
      }
    })
  }

  processOnMount === true && onMounted(() => {
    processModelChange(props.modelValue)
  })

  // expose public methods
  const publicMethods = { show, hide, toggle }
  Object.assign(proxy, publicMethods)

  return publicMethods
}