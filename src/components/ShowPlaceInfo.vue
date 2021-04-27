<template>
  <div>
      <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
                <div>
                   <a>{{ placeID }}</a> 
                   <a>{{ name }}</a>
                   <a>{{ description }}</a>
                   <a>{{ photoUrl }}</a>
                   <a>{{ types }}</a>
                   <a>{{ url }}</a>
                </div>
              <div class="modal-footer">
                <slot name="footer">
                  <button class="modal-default-button" @click="$emit('close')">
                    キャンセル
                  </button>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
  </div>
</template>

<script>
import {db} from '../plugins/firebase'
import {storage} from '../plugins/firebase'

export default {
  name: "ShowPlaceInfo",
  props: ['placeID', 'name', 'description', 'photoUrl', 'types', 'url', 'createdAt'],
}
</script>
<style>

</style>