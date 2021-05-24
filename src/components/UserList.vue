<template>
  <div class='list small'>
    <ul v-if="users.length">
      <li v-for='(user, index) in users' :key='index'>
        <div class='ff-list'>
          <div class="trim icon">
            <img :src='user.imageName'>
          </div>
          <div>
            <p v-if = 'currentUserUID == user.userID'>{{ user.screenName }}</p>
            <p v-else>
							<router-link :to="{ name: 'UserInfo', params: { uid: user.userID }}">
                {{ user.screenName }}
              </router-link>
						</p>
            <p class='description' v-if="user.description != null">{{user.description.split('').slice(0, 20).join('') + '…'}}</p>
          </div>
        </div>
      </li>
    </ul>
		<p v-else>{{ msg }}</p>
	</div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'

export default {
  name: 'UserList',
	props: ['msg', 'users'],
	data () {
		return {
			currentUserUID: null
		}
	},
	created: function () {
    const self = this
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
		})
	}
}
</script>

<style scoped>

.ff-list{
  display: grid;
  grid-template-columns: 20% 80%;
}

.list.small li{
  padding: 10px 10px 10px 10px;
  height: 50px;
}

.list.small{
  margin-bottom: 50px;
}

.list.small li .description{
  font-size: 12px;
}
</style>
