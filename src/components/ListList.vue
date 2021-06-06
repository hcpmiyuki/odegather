<template>
  <div>
    <div class='wrapper'>
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <h1>
          <router-link :to="{ name: 'UserInfo', params: { uid: pageUID }}">
            {{ pageUserName }}
          </router-link>
          のリスト
        </h1>

        <a v-on:click='showShareModal=true, shareListName=null' v-show='currentUserUID==pageUID'><i class="fas fa-share-alt"></i></a>
      </div>
      <div class='list'>
        <ul v-if='lists.length'>
          <li v-for='(list, index) in lists' :key='index'>
          <p class='name'><router-link :to="{ name: 'PlaceList', params: { listID: list.id, uid: pageUID}}">{{ list.name }}</router-link></p>
          <p class='description'>{{ list.description }}</p>
          <div class='btn_area' v-show='currentUserUID==pageUID'>
            <a v-on:click='deleteList(list.id)'><i class="fas fa-trash-alt"></i></a>
            <!-- <a v-on:click='showShareModal=true, shareListName=list.name'><i class="fas fa-share-alt"></i></a> -->
          </div>
          </li>
        </ul>
        <p v-else>まだリストが作成されていません!</p>
      </div>
      <div class='form' v-show='currentUserUID == pageUID'>
        <input type='text' name='placeName' placeholder='リスト名(必須)' autocompconste='off' v-model='listName'>
        <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='listDescription'></textarea>
        <p v-on:click='addNewList' class='btn'>登録</p>
      </div>
      <ShareModal
        v-if="showShareModal"
        :userName='pageUserName'
        :listName='shareListName'
        @close="showShareModal = false">
      </ShareModal>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import ShareModal from './ShareModal'

export default {
  name: 'ListList',
  data () {
    return {
      pageUID: null,
      pageUserName: null,
      currentUserUID: null,
      shareListName: null,
      lists: [],
      listName: null,
      listDescription: null,
      showShareModal: false
    }
  },
  components: {
    ShareModal
  },
  created: function () {
    const self = this
    self.pageUID = self.$route.params.uid
    self.getLists(self.pageUID)

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      }
    })
  },
  methods: {
    getLists: async function (UID) {
      const self = this
      let lists = []
      const userDoc = await db.collection('users').doc(UID).get()
      if (userDoc.data().screenName) {
        self.pageUserName = userDoc.data().screenName
      }else{
        self.pageUserName = '名無しさん'
      }
      const listDocs = await userDoc.ref.collection('lists').orderBy('createdAt', 'desc').get()
      listDocs.forEach((doc) => {
        lists.push({'name': doc.data().name, 'description': doc.data().description, 'id': doc.id})
      })
      self.lists = lists
    },
    addNewList: function () {
      const self = this
      if (self.listName) {
        const newListRef = db.collection('users').doc(self.currentUserUID).collection('lists').doc();
        newListRef.set({
          documentID: newListRef.id,
          name: self.listName,
          description: self.listDescription,
          createdAt: new Date()
        })
        .then(function () {
          self.$router.push({ path: `/places/${self.pageUID}/${newListRef.id}` })
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
  },
  beforeRouteUpdate: async function (to, from, next) {
    const self = this
    self.lists = []
    self.showShareModal = false
    console.log('hoge')
    next()
    self.pageUID = self.$route.params.uid
    self.getLists(self.pageUID)
  }
}
</script>

<style scoped>
.title-header h1, .title-header h1 a{
  color: var(--main-color);
}
.title-header h1 a {
  font-weight:800;
}

.list .description{
  font-size: 12px
}

.title-header h1{
  display: inline;
  font-weight:400;
}

.title-header a{
  font-size: 32px;
  padding-left: 15px;
  color: var(--accent-color);
}
</style>
