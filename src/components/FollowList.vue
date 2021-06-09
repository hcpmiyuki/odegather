<template>
  <div>
    <div class="wrapper">
      <div id='mypage-menu'>
        <!-- <a v-on:click = "back" class='back-btn'><<</a> -->
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <div id="tabs">
            <label v-bind:class="{isActive: classColorSet}">
              <router-link :to="{ name: 'FollowList', params: { uid: pageUID, follow_flag: 'follow'}}">
                フォロー中
              </router-link>
            </label>
            <label v-bind:class="{isActive: !classColorSet}">
              <router-link :to="{ name: 'FollowList', params: { uid: pageUID, follow_flag: 'follower'}}">
                フォロワー
              </router-link>
            </label>
        </div>
      </div>
      <UserList v-bind:users='follows' msg='フォローしている人がいません' v-if="switchTab == 'follow'"></UserList>
      <UserList v-bind:users='followers' msg='フォロワーがいません' v-else></UserList>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import UserList from './UserList'

export default {
  name: 'FollowList',
  data () {
    return {
      pageUID: null,
      currentUserUID: null,
      follows: [],
      followers: [],
      followShowFlag: null,
      isActive: true
    }
  },
  components: {
    UserList
  },
  created: async function () {
    const self = this
    self.pageUID = self.$route.params.uid

    await firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      }
    })

    self.follows = await self.getUsers(self.pageUID, 'follows')
    self.followers = await self.getUsers(self.pageUID, 'followers')
    
  },methods: {
    getUsers: async function (UID, collectionName='follows') {
      const self = this
      const userDocRef = db.collection('users').doc(UID)
      const userDocs = await userDocRef.collection(collectionName).get()
      let users = []
      userDocs.forEach(async function (doc) {
        const userDoc = await db.collection('users').doc(doc.id).get()
        users.push({
          'userID': userDoc.id,
          'imageName': userDoc.data().imageName,
          'screenName': userDoc.data().screenName,
          'description': userDoc.data().description
        })
      })
      return users
    }
  },
  computed: {
    switchTab: function () {
      const self = this
      return self.followShowFlag = self.$route.params.follow_flag
    },
    classColorSet: function(){
      const self = this
      if (self.$route.params.follow_flag == 'follow') {
        return true
      } else if (self.$route.params.follow_flag == 'follower') {
        return false
      }
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

#tabs a,#tabs a:visited {
    color: var(--sub-color)
}

#tabs .isActive a,#tabs .isActive a:visited{
    color: #fff;
}
 
#tabs .isActive{
    background: var(--accent-color);
}

.ff-list{
  display: grid;
  grid-template-columns: 20% 80%;
}

.list.small li{
  padding: 10px 10px 10px 10px;
}

.title-header a{
  font-size: inherit;
}
</style>
