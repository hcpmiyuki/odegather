<template>
  <div>
    <div class="wrapper">
      <div class='title-header'>
        <!-- <h1>{{ listData.name }}</h1> -->
        <div id="tabs">
            <input type="radio" value="1" id="tab1" v-model="followShowFlag"></input>
            <label for="tab1">フォロー中</label>
    
            <input type="radio" value="0" id="tab2" v-model="followShowFlag"></input>
            <label for="tab2">フォロワー</label>
        </div>
        <!-- <a v-on:click='showFollows'>フォロー中</a>
        <a v-on:click='showFollowers'>フォロワー</a> -->
      </div>
      <div v-if='followShowFlag == "1"' class='list small'>
        <ul v-if="follows.length">
          <li v-for='(follow, index) in follows' :key='index'>
            <div class='ff-list'>
              <div class="trim icon">
                <img :src='follow.imageName'>
              </div>
              <p><router-link :to="{ name: 'UserInfo', params: { uid: follow.userID }}">
                {{ follow.screenName }}
              </router-link></p>
            </div>
          </li>
        </ul>
        <p v-else>フォローしている人がいません</p>
      </div>
      <div v-else-if='followShowFlag == "0"' class='list small'>
        <ul v-if="followers.length">
          <li v-for='(follower, index) in followers' :key='index'>
            <div class='ff-list'>
              <div class="trim icon">
                <img :src='follower.imageName'>
              </div>
              <p><router-link :to="{ name: 'UserInfo', params: { uid: follower.userID }}">
                {{ follower.screenName }}
              </router-link></p>
            </div>
          </li>
        </ul>
        <p v-else>フォロワーがいません</p>
      </div>
    </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID'></HeaderMenu>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import HeaderMenu from './HeaderMenu'

export default {
  name: 'FollowList',
  data () {
    return {
      pageUID: null,
      currentUserUID: null,
      follows: [],
      followers: [],
      followShowFlag: true
    }
  },
  components: {
    HeaderMenu
  },
  created: async function () {
    const self = this
    self.pageUID = self.$route.params.uid
    self.followShowFlag = self.$route.params.follow_flag

    await firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
    })

    self.follows = await self.getFollows(self.pageUID)
    self.followers = await self.getFollowers(self.pageUID)
    
  },methods: {
    getFollows: async function (UID) {
      const self = this
      var userDocRef = db.collection('users').doc(UID)
      var followDocs = await userDocRef.collection('follows').get()
      let follows = []
      followDocs.forEach(async function (doc) {
        let userDoc = await db.collection('users').doc(doc.id).get()
        follows.push({
          'userID': userDoc.id,
          'imageName': userDoc.data().imageName,
          'screenName': userDoc.data().screenName
        })
      })
      return follows
    },
    getFollowers: async function (UID) {
      const self = this
      var userDocRef = db.collection('users').doc(UID)
      var followerDocs = await userDocRef.collection('followers').get()
      let followers = []
      followerDocs.forEach(async function (doc) {
        let userDoc = await db.collection('users').doc(doc.id).get()
        followers.push({
          'userID': userDoc.id,
          'imageName': userDoc.data().imageName,
          'screenName': userDoc.data().screenName
        })
      })
      return followers
    },
    showFollows: function () {
      const self = this
      self.followShowFlag = true
    },
    showFollowers: function () {
      const self = this
      self.followShowFlag = false
    }
  }
}
</script>

<style scoped>
#tabs {
    overflow: hidden;
    width: 100%;
}
 
#tabs input {
  display: none;
}
 
#tabs label {
    display: inline-block;
    line-height: 40px;
    width: 49%;
    text-align: center;
    cursor: pointer;
    background: #eee;
    transition: 0.3s;
    border-radius: 10px 10px 0 0;
}
 
#tabs input:checked + label,
#tabs label:hover {
    background: var(--accent-color);
    color: #fff;
}

.ff-list{
  display: grid;
  grid-template-columns: 20% 80%;
}

.list.small li{
  padding: 10px 10px 10px 10px;
}
</style>
