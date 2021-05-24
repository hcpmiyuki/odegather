<template>
  <div>
    <div class="wrapper">
      <div>
        <a v-on:click = "back" class='back-btn'><<</a>
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <h1>{{ placeName }}を追加したユーザー</h1>
      </div>
      <UserList v-bind:users='users' msg='リストに追加している人がいません'></UserList>
    </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID' v-show='currentUserUID'></HeaderMenu>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import {storage} from '../plugins/firebase'
import UserList from './UserList'
import HeaderMenu from './HeaderMenu'

export default {
  name: "AddingUserList",
  data () {
    return {
      placeID: null,
      placeName: null,
      users: [],
      currentUserUID: null
    }
  },
  components: {
    UserList,
    HeaderMenu
  },
  created: async function () {
    const self = this
    self.placeID = self.$route.params.placeID
    self.users = await self.getUsers()
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
    })
  },
  methods: {
    getUsers: async function () {
      const self = this
      var placeDocs = await db.collectionGroup('places').where('placeID', '==', self.placeID).get()
      var users = []
      let memo = []

      placeDocs.forEach( async function (doc) {
        self.placeName = doc.data().name
        var userID = doc.ref.parent.parent.parent.parent.id
        var userDoc = await db.collection('users').doc(userID).get()
        
        if (!!memo.indexOf(userDoc.id)) {
          users.push({
            'userID': userDoc.id,
            'description': userDoc.data().description,
            'imageName': userDoc.data().imageName,
            'screenName': userDoc.data().screenName
          })
          memo.push(userDoc.id)
        }
        
      })

      return users
    }
  }
}
</script>
<style>

</style>