<template>
  <div class='list small'>
    <ul v-if="users.length">
      <li v-for='(user, index) in users' :key='index'>
        <div class='ff-list'>
          <div class="trim icon">
            <img :src='user.imageName'>
          </div>
          <div>
            <p>
							<router-link :to="{ name: 'UserInfo', params: { uid: user.userID }}">
                {{ user.screenName }}
              </router-link></p>
            <p>{{ user.description }}</p>
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
  props: ['msg', 'users']
}
</script>

<style scoped>

.ff-list{
  display: grid;
  grid-template-columns: 20% 80%;
}

.list.small li{
  padding: 10px 10px 10px 10px;
}
</style>
