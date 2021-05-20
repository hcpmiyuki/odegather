<template>
    <div>
      <div class='wrapper'>
        <div id='user-container'>
          <div id='mypage-menu'>
            <div v-show = 'currentUserUID != pageUID'>
              <a v-on:click = "back" class='back-btn'><<</a>
            </div>
            <ul v-if='currentUserUID == pageUID' id='mypage-menu-list'>
              <!-- <li><i class="fas fa-bell"></i></li> -->
              <li @click="showUserInfoEditModal = true"><i class="fas fa-pen"></i></li>
              <li @click='logout'><i class="fas fa-cog"></i></li>
            </ul>
            <router-link :to="{ name: 'SignIn'}" v-else id='mypage-menu-signin'>サインイン</router-link>
          </div>
          <div id='user-header-image'>
            <div class="trim">
              <img :src="pageUserData.imageName">
            </div>
          </div>
          <div id='user-header-info'>
            <p>{{pageUserData.screenName}}</p>
            <a>
              <router-link :to="{ name: 'FollowList', params: { uid: pageUserData.userID, follow_flag: 'follow'}}">
                {{pageUserData.followsCount}}
              </router-link>
              フォロー
            </a>
            <a>
              <router-link :to="{ name: 'FollowList', params: { uid: pageUserData.userID, follow_flag: 'follower'}}">
                {{pageUserData.followersCount}}
              </router-link>
              フォロワー
            </a>
            <p v-if="followBtnShow" class='btn follow' v-on:click='followUser'>フォローする</p>
            <p v-if="unFollowBtnShow" class='btn follow' v-on:click='unFollowUser'>フォローをやめる</p>            
          </div>
          <div id='user-description'>
            <p>{{pageUserData.description}}</p>
          </div>
          <div id='user-content'>
            <p>{{pageUserData.screenName}}さんの<router-link :to="{ name: 'ListList', params: { uid: pageUserData.userID }}">リスト</router-link>を見る</p>
          </div>
        </div>
        <UserInfoEdit
        v-if="showUserInfoEditModal"
        @close="showUserInfoEditModal = false"
        :userID="currentUserData.userID"
        :screenName="currentUserData.screenName"
        :imageName="currentUserData.imageName"
        :description="currentUserData.description">
        </UserInfoEdit>
      </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID' v-show="currentUserUID" ></HeaderMenu>
    </div>
</template>



<script>
import {db} from '../plugins/firebase'
import firebase from 'firebase'
import HeaderMenu from './HeaderMenu'
import UserInfoEdit from './UserInfoEdit'
import axios from 'axios'

export default {
  name: 'UserInfo',
  data () {
    return {
      pageUID: null,
      currentUserUID: null,
      pageUserData: {
        'userID': null,
        'description': null,
        'imageName': null,
        'follows': [],
        'followsCount':null,
        'followersCount':null,
        'followers': [],
        'screenName': null
      },
      currentUserData: {
        'userID': null,
        'description': null,
        'imageName': null,
        'follows': [],
        'followsCount':null,
        'followersCount':null,
        'followers': [],
        'screenName': null
      },
      followBtnShow: false,
      unFollowBtnShow: false,
      showUserInfoEditModal: false,
      apiUrl:'https://portfolio-310607.uc.r.appspot.com/reccomend-users',
      recommendedUsers: null
    }
  },
  components: {
    HeaderMenu,
    UserInfoEdit
  },
  created: async function () {
    const self = this
    self.pageUID = self.$route.params.uid
    self.pageUserData = await self.getUserData(self.pageUID)

    await firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
    })

    self.currentUserData = await self.getUserData(self.currentUserUID)

    if (self.pageUID && self.currentUserUID　&& !self.currentUserData.follows.includes(self.pageUID) && self.pageUID !== self.currentUserUID) {
      self.followBtnShow = true
    } else if (self.pageUID !== self.currentUserUID){
      self.unFollowBtnShow = true
    }

    if (self.pageUID && self.currentUserUID && self.pageUID === self.currentUserUID) {

      self.recommendedUsers = await this.getRecommendedUsers(this.currentUserUID)
    }
  },
  methods: {
    followUser: async function () {
      const self = this
      let currentUserDocRef = await db.collection('users').doc(self.currentUserUID)
      let followDocRef = await currentUserDocRef.collection('follows').doc(self.pageUID)
      let followUserData = {
        'userID': self.pageUserData['userID'],
        'imageName': self.pageUserData['imageName'],
        'screenName': self.pageUserData['screenName'],
        'createdAt': new Date()
      }

      let pageUserDocRef = await db.collection('users').doc(self.pageUID)
      let followerDocRef = await pageUserDocRef.collection('followers').doc(self.currentUserUID)
      let followerUserData = {
        'userID': self.currentUserData['userID'],
        'imageName': self.currentUserData['imageName'],
        'screenName': self.currentUserData['screenName'],
        'createdAt': new Date()
      }

      try {
        const batch = db.batch()

        await batch.set(followDocRef, followUserData)

        await batch.set(followerDocRef, followerUserData)
        
        self.followBtnShow = false
        self.unFollowBtnShow = true
        self.pageUserData = await self.getUserData(self.pageUID)
        self.pageUserData['followersCount'] += 1
        await batch.commit()
      } catch (error) {
        console.error(error);
      }
    },
    unFollowUser: async function () {
      const self = this
      let currentUserDocRef = await db.collection('users').doc(self.currentUserUID)
      let followDocRef = await currentUserDocRef.collection('follows').doc(self.pageUID)

      let pageUserDocRef = await db.collection('users').doc(self.pageUID)
      let followerDocRef = await pageUserDocRef.collection('followers').doc(self.currentUserUID)

      try {
        const batch = db.batch()

        await batch.delete(followDocRef)

        await batch.delete(followerDocRef)
        
        self.followBtnShow = true
        self.unFollowBtnShow = false
        self.pageUserData['followersCount'] -= 1
        await batch.commit()
      } catch (error) {
        console.error(error);
      }
    },
    getUserData: async function (UID) {
      const self = this
      let userDoc = await db.collection('users').doc(UID).get()
      let follows = await self.getFollows(UID)
      let followers = await self.getFollowers(UID)
      let userData = {
        'userID': userDoc.id,
        'description': userDoc.data().description,
        'imageName': userDoc.data().imageName,
        'follows': follows,
        'followsCount': follows.length,
        'followers': followers,
        'followersCount': followers.length,
      }

      if (userDoc.data().screenName) {
        userData['screenName'] = userDoc.data().screenName
      } else {
        userData['screenName'] = '名無し'
      }

      return userData
    },
    getFollows: async function (UID) {
      const self = this
      var userDocRef = db.collection('users').doc(UID)
      var followDocs = await userDocRef.collection('follows').get()
      let follows = []
      followDocs.forEach(function (doc) {
        follows.push(doc.id)
      })
      return follows
    },
    getFollowers: async function (UID) {
      const self = this
      var userDocRef = db.collection('users').doc(UID)
      var followerDocs = await userDocRef.collection('followers').get()
      let followers = []
      followerDocs.forEach(function (doc) {
        followers.push(doc.id)
      })
      return followers
    },
    getRecommendedUsers: async function (UID) {
      const recommend_user_count = this.currentUserData.followsCount*2+1
      this.axios.get(this.apiUrl, {params: {'user_id': UID, 'recommend_user_count': recommend_user_count}})
      .then(res => {
        console.log(res.data.results)
      })
    },
    logout: function () {
      firebase.auth().signOut().then(() => {
        this.$router.push('/')
      }).catch((error) => {
        console.error('ログアウトに失敗')
      })
    }
  }
}
</script>

<style>
#user-container{
  display: grid;
  grid-template-rows: 30px 150px 100px 1fr;
  grid-template-columns: 34% 33% 33%;
}

#mypage-menu{
  grid-row: 1;
  grid-column: 1 / 4;
  background-color: blue;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
}

#user-header-image{
  grid-row: 2;
  grid-column: 1/2;
  background-color: red;
  height: 150px;
  width: 100%;
}

#user-header-info{
  grid-row: 2;
  grid-column: 2/4;
  background-color: green;
  height: 150px;
  width: 100%;
}

#user-description{
  grid-row: 3;
  grid-column: 1 / 4;
  background-color: yellow;
  height: 150px;
  width: 100%;
}

#user-content{
  grid-row: 4;
  grid-column: 1 / 4;
  background-color: blue;
  height: 150px;
  width: 100%;
}

/* アイコン */
.trim {
  position:relative;
  overflow: hidden;
  width:90%;
  margin: 15px auto;
  border-radius:50%;
}

.trim:before {
  content: "";
  display: block;
  padding-top: 100%;
}
.trim img{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  height:100%;
}

/* マイページのヘッダーメニュー */
#mypage-menu-list{
    grid-column: 4 / 5;
    display: grid;
    grid-template-columns: 50% 50%;
}

#mypage-menu-list li{
    text-align: center;
    display: block;
    font-size: 21px;
}

#mypage-menu-signin{
  grid-column: 4 / 5;
}
</style>
