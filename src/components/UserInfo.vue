<template>
    <div>
      <div class='wrapper'>
        <div id='user-container'>
          <div id='user-header'>
            <div id='mypage-menu'>
              <!-- <div v-show = 'currentUserUID != pageUID'>
                <a v-on:click = "back" class='back-btn'><<</a>
              </div> -->
              <ul v-if='currentUserUID == pageUID' id='mypage-menu-list'>
                <!-- <li><i class="fas fa-bell"></i></li> -->
                <li @click="showUserInfoEditModal = true"><i class="fas fa-pen"></i></li>
                <li @click='logout'><i class="fas fa-sign-out-alt"></i></li>
              </ul>
              <router-link :to="{ name: 'SignIn'}" v-if="!currentUserUID" id='mypage-menu-signin'>サインイン</router-link>
            </div>
            <div id='user-header-image'>
              <div class="trim">
                <img :src="pageUserData.imageName">
              </div>
            </div>
            <div id='user-header-info'>
              <p class='username'>{{pageUserData.screenName}}</p>
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
              <!-- <div id='btn-area'>
                <p v-if="followBtnShow && currentUserUID" class='btn follow' v-on:click='followUser'>フォローする</p>
                <p v-if="unFollowBtnShow && currentUserUID" class='btn follow' v-on:click='unFollowUser'>フォロー解除</p>
                <p class='btn list'>
                  <router-link :to="{ name: 'ListList', params: { uid: pageUserData.userID}}">
                  リストを見る
                  </router-link>
                </p>
                <p v-show="ffFlag">
                  <i class="fas fa-envelope"></i>
                </p>
              </div>     -->
            </div>
          </div>
        <div id='btn-area'>
            <p v-if="followBtnShow && currentUserUID" class='btn follow' v-on:click='followUser'>フォローする</p>
            <p v-if="unFollowBtnShow && currentUserUID" class='btn follow' v-on:click='unFollowUser'>フォロー解除</p>
            <p class='btn list'>
              <router-link :to="{ name: 'ListList', params: { uid: pageUserData.userID}}">
                リストを見る
              </router-link>
            </p>
            <p v-show="ffFlag" class='btn list' v-on:click='createChat'>
              メッセージ<i class="fas fa-envelope"></i>
            </p>
        </div> 
        <div id='user-description' v-show="pageUserData.description">
          <p class="description">{{pageUserData.description}}</p>
        </div>
        
        <div id="user-recommend" v-show="showRecommendedUsersData">
          <p>{{ userReccomendMsg }}</p>
          <div class='recommended_users'>
            <div v-for="user in showRecommendedUsersData" :key="user.userID" class="recommended_user">
              <div class="trim">
                <img :src="user.imageName">
              </div>
              <router-link :to="{ name: 'UserInfo', params: { uid: user.userID }}">
              {{ user.screenName }}
              </router-link>
            </div>
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
    </div>
  </div>
</template>



<script>
import {db} from '../plugins/firebase'
import firebase from 'firebase'
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
      showRecommendedUsersData: null,
      userReccomendMsg: null,
      ffFlag: false
    }
  },
  components: {
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
      }
    })

    if (self.currentUserUID) {
      self.currentUserData = await self.getUserData(self.currentUserUID)
    }

    if (self.pageUID && self.currentUserUID　&& !self.currentUserData.follows.includes(self.pageUID) && self.pageUID !== self.currentUserUID) {
      
      self.followBtnShow = true
      console.log(self.currentUserData.follows)
    } else if (self.pageUID !== self.currentUserUID){
      self.unFollowBtnShow = true
      if (self.currentUserData.followers.includes(self.pageUID)) {
        self.ffFlag = true
      }
    }

    if (self.pageUID && self.currentUserUID && self.pageUID === self.currentUserUID) {
      const recommendedUsers = await self.getRecommendedUsers(self.currentUserUID)
      self.getRecommendedUsersData(recommendedUsers)
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
      const userDocRef = db.collection('users').doc(UID)
      const followDocs = await userDocRef.collection('follows').get()
      let follows = []
      followDocs.forEach(function (doc) {
        follows.push(doc.id)
      })
      return follows
    },
    getFollowers: async function (UID) {
      const self = this
      const userDocRef = db.collection('users').doc(UID)
      const followerDocs = await userDocRef.collection('followers').get()
      let followers = []
      followerDocs.forEach(function (doc) {
        followers.push(doc.id)
      })
      return followers
    },
    getRecommendedUsers: async function (UID) {
      const self = this
      const recommend_user_count = self.currentUserData.followsCount < 2 ? 5 : self.currentUserData.followsCount*2+1
      let recommendedUsers = []
      await self.axios.get(self.apiUrl, {params: {'user_id': UID, 'recommend_user_count': recommend_user_count}})
      .then(res => {
        if ( res.status == 200){
          // すでにフォローしている人と自分は表示しない
          const filterUsers = self.currentUserData.follows + [UID]
          recommendedUsers = res.data.results.filter(i => filterUsers.indexOf(i) == -1)
          self.userReccomendMsg = 'あなたにおすすめのユーザー'
        }
      })
      .catch(error => {
        self.userReccomendMsg = 'だれかをフォローしましょう!'
        // console.error(error)
      })

      return recommendedUsers
    },
    getRecommendedUsersData: async function (recommendedUsers) {
      const self = this
      const showRecommendedUsers = recommendedUsers.slice(0, 3)

      self.showRecommendedUsersData = []
      if (showRecommendedUsers.length != 0) {
        const userDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', showRecommendedUsers).get()
        userDocs.forEach(async function (doc) {
          self.showRecommendedUsersData.unshift({
            'userID': doc.id,
            'screenName': doc.data().screenName,
            'imageName': doc.data().imageName,
          })
        })
      } else {
        const userDocs = await db.collection('users').get()
        const allUsers = userDocs.docs.map(doc => {
          return doc.id
        });
        const filterUsers = self.currentUserData.follows + [self.currentUserUID]
        const candidateUsers = allUsers.filter(i => filterUsers.indexOf(i) == -1)
        await self.getRecommendedUsersData(candidateUsers)
      }
    },
    logout: function () {
      const self = this
      firebase.auth().signOut().then(() => {
        self.$router.push('/')
      }).catch((error) => {
        console.error('ログアウトに失敗')
      })
    },
    createChat: async function (){
      const self = this
      
      const newChatRef = db.collection('chats').doc();
      newChatRef.set({
          members: [self.pageUID, self.currentUserUID],
          createdAt: new Date()
      })
      .then(async function () {
        const currentUserChatsRef = db.collection('users').doc(self.currentUserUID).collection('chatRefs').doc(newChatRef.id)
        const pageUserChatsRef = db.collection('users').doc(self.pageUID).collection('chatRefs').doc(newChatRef.id)

        try {
          const batch = db.batch()

          await batch.set(currentUserChatsRef, {'chat': newChatRef})

          await batch.set(pageUserChatsRef, {'chat': newChatRef})

          await batch.commit()
        } catch (error) {
          console.error(error);
        }
        self.$router.push({ path: `/chat/${newChatRef.id}` })
      })
      .catch((error) => {
        console.error(error);
      })
    },
    randomSelect: function (array, num) {
      const self = this
      let newArray = [];
      
      while(newArray.length < num && array.length > 0)
      {
        // 配列からランダムな要素を選ぶ
        const rand = Math.floor(Math.random() * array.length);
        // 選んだ要素を別の配列に登録する
        newArray.push(array[rand]);
        // もとの配列からは削除する
        array.splice(rand, 1);
      }
      
      return newArray;
    }
  },
  beforeRouteUpdate: async function (to, from, next) {
    const self = this
    self.followBtnShow = false
    self.unFollowBtnShow = false
    self.showUserInfoEditModal = false
    self.showRecommendedUsersData = null
    self.userReccomendMsg = null
    self.pageUserData = {
      'userID': null,
      'description': null,
      'imageName': null,
      'follows': [],
      'followsCount':null,
      'followersCount':null,
      'followers': [],
      'screenName': null
    }
    next()
    
    self.pageUID = self.$route.params.uid
    self.pageUserData = await self.getUserData(self.pageUID)

    if (self.pageUID && self.currentUserUID　&& !self.currentUserData.follows.includes(self.pageUID) && self.pageUID !== self.currentUserUID) {
      self.followBtnShow = true
    } else if (self.pageUID !== self.currentUserUID){
      self.unFollowBtnShow = true
      if (self.currentUserData.followers.includes(self.pageUID)) {
        self.ffFlag = true
      }
    }

    if (self.pageUID && self.currentUserUID && self.pageUID === self.currentUserUID) {
      const recommendedUsers = await self.getRecommendedUsers(self.currentUserUID)
      self.getRecommendedUsersData(recommendedUsers)
    }
  }
}
</script>

<style>
#user-container{
  color: var(--main-color);
}
#user-header{
  display: grid;
  grid-template-rows: 30px 120px;
  grid-template-columns: 34% 33% 33%;
}

/* #mypage-menu{
  grid-row: 1;
  grid-column: 1 / 4;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  color: var(--sub-color);
} */

#user-header-image{
  grid-row: 2;
  grid-column: 1/2;
  height: 150px;
  width: 100%;
}

#user-header-info{
  grid-row: 2;
  grid-column: 2/4;
  padding-left: 20px;
}

#user-header-info .username{
  font-size: 21px;
}

.btn{
  font-size: smaller;
  margin: 5px auto;
}

#btn-area{
  display: flex;
}

#btn-area p {
  width: 30%;
}

.btn.follow{
  background-color: var(--main-color);
  color: var(--sub-color);
}

#user-description{
  padding: 10px 0;
}

#user-recommend{
  padding: 20px 0;
}

#user-recommend p{
  padding-left: 10px;
  font-size: 21px;
}

.recommended_users{
  display: grid;
  grid-template-columns: 34% 33% 33%;
}


.recommended_users .recommended_user{
  background-color: var(--main-color);
  padding: 9px 5px;
  border-radius: 10px;
  margin: 0 4%;
  text-align: center;
}

.recommended_users .recommended_user:nth-child(1){
  margin-right: 8%;
  margin-left: 0;

}

.recommended_users .recommended_user:nth-child(3){
  margin-right: 0;
  margin-left: 8%;
}

.recommended_users .trim{
  margin: 0 auto;
  width: 75%;
}

.recommended_users .recommended_user a{
  font-size: small;
}

/* アイコン */
.trim {
  position:relative;
  overflow: hidden;
  width:80%;
  margin: 0 auto;
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


</style>
