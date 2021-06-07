<template>
  <div>
    <div class='wrapper'>
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='list'>
        <ul v-if='chats.length'>
          <li v-for='(chat, index) in chats' :key='index'>
						<p class='name'><router-link :to="{ name: 'ChatRoom', params: { chatID: chat.id}}">{{chat.name}} さんとのチャット</router-link></p>
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
					'id': chatInfo.id
				})
      })

      self.chats = chats
    }
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
