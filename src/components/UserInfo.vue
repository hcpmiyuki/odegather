<template>
    <div>
      <div class='wrapper'>
        <div id='user-container'>
          <div id='mypage-menu'></div>
          <div id='user-header-image'>
            <div class="trim">
              <img src="../assets/default-icon.jpg">
            </div>
          </div>
          <div id='user-header-info'>
            <p>{{userData.screenName}}</p>
            <a>{{userData.followsCount}}フォロー</a>　<a>{{userData.followersCount}}フォロワー</a>
            <p v-if="pageUID!==currentUserUID" class='btn follow' v-on:click='followUser'>フォローする</p>            
          </div>
          <div id='user-description'></div>
          <div id='user-content'>
            <p>{{userData.screenName}}さんの<router-link :to="{ name: 'ListList', params: { uid: pageUID }}">リスト</router-link>を見る</p>
          </div>
        </div>
      </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID' v-show="currentUserUID" ></HeaderMenu>
    </div>
</template>



<script>
import {db} from '../plugins/firebase'
import firebase from 'firebase'
import HeaderMenu from './HeaderMenu'

export default {
  name: 'UserInfo',
  data () {
    return {
      pageUID: null,
      userData: {
        'description': null,
        'imageName': null,
        'screenName': null,
        'followsCount': null,
        'followersCount': null
      },
      currentUserUID: null
    }
  },
  components: {
    HeaderMenu
  },
  created: function () {
    const self = this
    self.pageUID = this.$route.params.uid

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
        self.userData.description = user.description
        self.userData.imageName = user.imageName
        self.userData.followsCount = 1
        self.userData.followersCount = 1

        if (user.screenName) {
          self.userData.screenName = user.screenName
        } else {
          self.userData.screenName = '名無し'
        }
        
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
    })
  },
  methods: {
    firebaseTest: async function () {
      var userDocs = await db.collection('users').doc(this.UID).get()
      var listDocs = await userDocs.ref.collection('lists').get()
      // console.log(listDocs.map(x => x.data()))
      listDocs.forEach((doc) => {
        console.log(doc.data())
      })
    },
    followUser: function () {
      console.log('フォロー')
    }
  }
}
</script>

<style>
#user-container{
  display: grid;
  grid-template-rows: 30px 150px 150px 1fr;
  grid-template-columns: 34% 33% 33%;
}

#mypage-menu{
  grid-row: 1;
  grid-column: 1 / 4;
  background-color: blue;
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

</style>
