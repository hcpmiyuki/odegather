<template>
  <div>
    <div class="wrapper">
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <h1>{{ placeName }}を追加したユーザー</h1>
      </div>
      <UserList v-bind:users='users' msg='リストに追加している人がいません'></UserList>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import {storage} from '../plugins/firebase'
import UserList from './UserList'

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
    UserList
  },
  created: async function () {
    const self = this
    self.placeID = self.$route.params.placeID
    self.users = await self.getUsers()
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      }
    })
  },
  methods: {
    getUsers: async function () {
      const self = this
      const placeDocs = await db.collectionGroup('places').where('placeID', '==', self.placeID).get()
      let users = []
      let memo = []

      placeDocs.forEach( async function (doc) {
        self.placeName = doc.data().name
        const userID = doc.ref.parent.parent.parent.parent.id
        const userDoc = await db.collection('users').doc(userID).get()
        
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