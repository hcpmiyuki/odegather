<template>
  <div>
    <div class='title-header'>
      <h1>いきたいリスト</h1>
    </div>
    <div class='lists'>
      <ul>
        <li v-for='(list, index) in lists' :key='index'>
        <p><router-link :to="{ name: 'PlaceList', params: { listID: list.id }}">{{ list.name }}</router-link></p>
        <p>{{ list.description }}</p>
        <p v-on:click='deleteList(list.id)'>削除</p>
        </li>
      </ul>
    </div>
    <div class='form'>
      <input type='text' name='placeName' placeholder='リスト名(必須)' autocomplete='off' v-model='listName'>
      <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='listDescription'></textarea>
      <p v-on:click='addNewList'>登録</p>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'

export default {
  name: 'ListList',
  data () {
    return {
      pageUID: null,
      currentUserUID: null,
      lists: [],
      listName: null,
      listDescription: null
    }
  },
  created: function () {
    const self = this
    self.pageUID = self.$route.params.uid
    self.getLists(self.pageUID)

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
    getLists: async function (UID) {
      var lists = []
      var userDocs = await db.collection('users').doc(UID).get()
      var listDocs = await userDocs.ref.collection('lists').orderBy('createdAt', 'desc').get()
      listDocs.forEach((doc) => {
        lists.push({'name': doc.data().name, 'description': doc.data().description, 'id': doc.id})
      })
      this.lists = lists
    },
    addNewList: function () {
      const self = this
      if (self.listName && self.listDescription) {
        var newListRef = db.collection('users').doc(self.currentUserUID).collection('lists').doc();
        newListRef.set({
          documentID: newListRef.id,
          name: self.listName,
          description: self.listDescription,
          createdAt: new Date()
        })
        .then(function () {
          self.getLists(self.pageUID)
        })
        .catch((error) => {
          console.error(error);
        })
      }else{
        console.log('パラメータ空')
      }
    },
    deleteList: function (listID) {
      const self = this
      db.collection('users').doc(self.currentUserUID).collection('lists').doc(listID).delete()
        .then(function() {
          self.getLists(self.pageUID)
        })
        .catch(function(error) {
          console.error(error);
      });
    }
  }
}
</script>

<style scoped>
</style>
