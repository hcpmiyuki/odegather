<template>
  <div>
    <div class='wrapper'>
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <h1>チャット一覧</h1>
      </div>
      <div class='list small'>
        <ul v-if='chats.length'>
          <li v-for='(chat, index) in chats' :key='index'>
            <div class='ff-list'>
              <div class="trim icon">
                <img :src='chat.imageName'>
              </div>
              <div>
                <p v-if="chat.name != null && chat.name.split('').length > 20"><router-link :to="{ name: 'ChatRoom', params: { chatID: chat.id}}">{{chat.name.split('').slice(0, 20).join('') + '…'}} さんとのチャット</router-link></p>
                <p v-else><router-link :to="{ name: 'ChatRoom', params: { chatID: chat.id}}">{{chat.name}} さんとのチャット</router-link></p>
              </div>
            </div>
          </li>
        </ul>
        <p v-else>まだチャットが作成されていません!</p>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import ShareModal from './ShareModal'

export default {
  name: 'ChatList',
  data () {
    return {
      currentUserUID: null,
      chats: [],
    }
  },
  created: function () {
    const self = this
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
				self.currentUserUID = user.uid
				self.getChats(self.currentUserUID)
      }
    })
  },
  methods: {
    getChats: async function (UID) {
      const self = this
      let chats = []
			const userChatDocs = await db.collection('users').doc(UID).collection('chatRefs').get()
			userChatDocs.forEach(async function (doc) {
				const chatInfo = await doc.data().chat.get()
				const personID = chatInfo.data().members.filter(i => i != self.currentUserUID)[0]
				const personData = await db.collection('users').doc(personID).get()
				chats.push({
          'name': personData.data().screenName,
          'imageName': personData.data().imageName,
					'id': chatInfo.id
				})
      })

      self.chats = chats
    }
  }
}
</script>

<style scoped>
.title-header h1{
  color: var(--main-color);
}
.title-header h1{
  font-weight:800;
  display: inline;
}

</style>
