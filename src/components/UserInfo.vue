<template>
    <div>
        <a>ユーザのページ</a>
        <div>
          <router-link :to="{ name: 'UserInfo', params: { uid: pageUID }}">userinfo</router-link>
          <router-link :to="{ name: 'ListList', params: { uid: pageUID }}">listlist</router-link>
        </div>
        {{ currentUserUID }}
    </div>
</template>

<script>
import {db} from '../plugins/firebase'
import firebase from 'firebase'

export default {
  name: 'UserInfo',
  data () {
    return {
      pageUID: null,
      currentUserUID: null
    }
  },
  created: function () {
    const self = this
    self.pageUID = this.$route.params.uid

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
  // mounted: function () {
  //   this.firebaseTest()
  // },
  methods: {
    firebaseTest: async function () {
      var userDocs = await db.collection('users').doc(this.UID).get()
      var listDocs = await userDocs.ref.collection('lists').get()
      // console.log(listDocs.map(x => x.data()))
      listDocs.forEach((doc) => {
        console.log(doc.data())
      })
    }
  }
}
</script>
