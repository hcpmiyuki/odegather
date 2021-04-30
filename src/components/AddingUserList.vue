<template>
  <div>
    <div class="wrapper">
      <div class='title-header'>
        <h1>{{ placeName }}を追加したユーザー</h1>
      </div>
      <UserList v-bind:users='users' msg='リストに追加している人がいません'></UserList>
    </div>
  </div>
</template>

<script>
import {db} from '../plugins/firebase'
import {storage} from '../plugins/firebase'
import UserList from './UserList'

export default {
  name: "AddingUserList",
  data () {
    return {
      placeID: null,
      placeName: null,
      users: []
    }
  },
  components: {
    UserList
  },
  created: async function () {
    const self = this
    self.placeID = self.$route.params.placeID
    self.users = await self.getUsers()
    console.log(self.users)
  },
  methods: {
    getUsers: async function () {
      const self = this
      var placeDocs = await db.collectionGroup('places').where('placeID', '==', self.placeID).get()
      var users = []

      placeDocs.forEach( async function (doc) {
        self.placeName = doc.data().name
        var userID = doc.ref.parent.parent.parent.parent.id
        var userDoc = await db.collection('users').doc(userID).get()
        users.push({
          'userID': userDoc.id,
          'description': userDoc.data().description,
          'imageName': userDoc.data().imageName,
          'screenName': userDoc.data().screenName
        })
      })

      return users
    }
  }
}
</script>
<style>

</style>