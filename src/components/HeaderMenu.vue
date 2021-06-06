<template>
    <div class='header-menu' v-show="currentUserUID">
        <ul id='menu'>
        <!-- <li><i class="fas fa-home"></i></li> -->
        <!-- <li><i class="fas fa-comment-dots"></i></li> -->
        <li><router-link :to="{ name: 'ListList', params: { uid: currentUserUID }}"><i class="fas fa-list"></i></router-link></li>
        <li><router-link :to="{ name: 'UserInfo', params: { uid: currentUserUID }}"><i class="fas fa-user"></i></router-link></li>
        </ul>
    </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'HeaderMenu',
  data () {
    return {
      currentUserUID: null
    }
  },
  created: function () {
    const self = this
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      }
    })
  },
}
</script>