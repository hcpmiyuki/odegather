<template>
  <div>
    <div class='wrapper'>
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header' v-show="usersData">
        <a id='username'>
          <router-link :to="{ name: 'UserInfo', params: { uid: personID }}">
            {{ usersData[personID].screenName }}
          </router-link>との
        </a><br>
				<h1>チャットルーム</h1>
      </div>
      <div class="chat-list content">
        <ul v-if='messages.length'>
          <li v-for='(message, index) in messages' :key='index' class="item">
            <div class="item-image">
              <router-link :to="{ name: 'UserInfo', params: { uid: message.userID }}">
              <img :src="usersData[message.userID].imageName" width="40" height="40">
              </router-link>
            </div>
            <div class="item-detail">
              <div class="item-name">{{ usersData[message.userID].screenName}}</div>
              <div class="item-message">
                  {{message.message}}
              </div>
            </div>
          </li>
        </ul>
        <p v-else>まだメッセージがありません!</p>
      </div>

    </div>
    <div class="chat-form">
      <div class="chat-form-content">
        <textarea
        v-model="input"
        @keydown.enter.exact.prevent="doSend"></textarea>
        <p v-on:click='doSend' class='send-button btn'>送信</p>
      </div>
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
      usersData: null,
			chatID: null,
			personID: null,
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
			self.personID = chatData.members.filter(i => i !== self.currentUserUID)[0]
      const personDoc = await db.collection('users').doc(self.personID).get()
      const currentUserDoc = await db.collection('users').doc(self.currentUserUID).get()
      let usersData = {}
      usersData[self.currentUserUID] = currentUserDoc.data()
      usersData[self.personID] = personDoc.data()
      self.usersData = usersData
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
      }
    }
	}
}
</script>

<style scoped>
.list .description{
  font-size: 12px
}

.content {
  margin: 0 auto;
  padding: 0 10px;
  max-width: 600px;
}

.chat-list {
  margin-bottom: 120px;
}

.item-image img {
  border-radius: 20px;
  vertical-align: top;
}
.item-detail {
  margin: 0 0 0 1.4em;
}
.item-name {
  font-size: 75%;
}
.item-message {
  position: relative;
  display: inline-block;
  padding: 0.8em;
  background: #deefe8;
  border-radius: 4px;
  line-height: 1.2em;
}
.item-message::before {
  position: absolute;
  content: " ";
  display: block;
  left: -16px;
  bottom: 12px;
  border: 4px solid transparent;
  border-right: 12px solid #deefe8;
}

.item {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.8em;
  width: 100%;
}

.chat-form {
  position: fixed;
  /* display: flex; */
  align-items: center;
  bottom: 40px;
  height: 70px;
  width: 100%;
}

.chat-form-content{
  display: flex;
  padding: 0 5%;
  align-items: center;
}
.chat-form textarea {
  border: 1px solid #ccc;
  border-radius: 2px;
  height: 40px;
  width: calc(100% - 6em);
  resize: none;
  width: 90%;
}

.send-button {
  /* height: 35px; */
  width: 10%;
  font-size: 12px;
}

@media (min-width: 768px) {
.wrapper{
    width: 30%;
    margin: 0 auto;
}

.header-menu{
    width: 30%;
    margin: 0 auto;
}

.header-menu #menu{
    width: 30%;
}

.chat-form-content{
    width: 30%;
    margin: 0 auto;
}
}
</style>
