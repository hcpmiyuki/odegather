<template>
  <div>
    <div class='wrapper'>
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header' v-show="personData">
				{{personData.screenName}} さんとのチャットルーム
      </div>
      <div class='list'>
        <ul v-if='messages.length'>
          <li v-for='(message, index) in messages' :key='index'>
            {{ message.message }}
          </li>
        </ul>
        <p v-else>まだメッセージがありません!</p>
      </div>
      <form action="" class="form" @submit.prevent="doSend">
        <textarea
        v-model="input"
        @keydown.enter.exact.prevent="doSend"></textarea>
        <button type="submit" class="send-button">Send</button>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import ShareModal from './ShareModal'

export default {
  name: 'ChatRoom',
  data () {
    return {
      currentUserUID: null,
      currentUserData: null,
			chatID: null,
			personData: null,
      messages: [],
      input: ''
    }
  },
  created: async function () {
    const self = this
		self.chatID = self.$route.params.chatID
    
    firebase.auth().onAuthStateChanged(async function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
        await self.getChatInfo()
        await self.getMsg()
      }
    })
  },
  mounted: function () {
    const self = this
    db.collection('chats').doc(self.chatID).collection('messages')
      .onSnapshot(() => {
        self.getMsg()
      })
  },
  methods: {
    getChatInfo: async function () {
      const self = this
      let chatData = null
      const chatDoc = await db.collection('chats').doc(self.chatID).get()
			chatData = chatDoc.data()
			const personID = chatData.members.filter(i => i !== self.currentUserUID)[0]
      const personDoc = await db.collection('users').doc(personID).get()
      self.personData = personDoc.data()
      const currentUserDoc = await db.collection('users').doc(self.currentUserUID).get()
      self.currentUserData = currentUserDoc.data()
    },
    getMsg: async function () {
      const self = this
      const msgDocs = await db.collection('chats').doc(self.chatID).collection('messages').orderBy('createdAt').get()
      let messages = []
      msgDocs.forEach(function (doc) {
        messages.push(doc.data())
      })
      self.messages = messages
    },
    doSend: async function () {
      const self = this
      if (self.currentUserUID && self.input.length) {
        const msgRef = await db.collection('chats').doc(self.chatID).collection('messages').doc()
        msgRef.set({
          userID: self.currentUserUID,
          message: self.input,
          createdAt: new Date()
        })
        .then(async function () {
          self.input = ''
        })
        .catch((error) => {
          console.error(error);
        })
        // firebase にメッセージを追加
        // firebase.database().ref('message').push({
        //   message: this.input,
        //   name: this.user.displayName,
        //   image: this.user.photoURL
        // }, () => {
        //   this.input = '' // フォームを空にする
        // })
      }
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
