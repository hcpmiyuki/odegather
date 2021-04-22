<template>
  <div class='wrapper'>
      <div class='form'>
          <label>メールアドレス</label>
          <input type='email' name='email' v-model='email'>
          <label>パスワード</label>
          <input type='password' name='password' v-model='password'>
          <p v-on:click='signUp' class='btn'>サインアップ</p>
          <p>アカウントをお持ちの方は<router-link to="/">こちら</router-link></p>
      </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'

export default {
  name: 'SignUp',
  data () {
    return {
      email: null,
      password: null
    }
  },
  methods: {
    signUp: function () {
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then((res) => {
          db.collection('users').doc(res.user.uid).set({
            screenName: null,
            imageName: null,
            description: null,
            createdAt: new Date()
          })
            .then(
              this.$router.push({ path: `/userinfo/${res.user.uid}` })
            )
            .catch((error) => {
              // エラー時の処理
              console.error(error)
            })
        })
        .catch((error) => {
          // エラー時の処理
          console.error(error)
        })
    }
  }
}
</script>

<style scoped>
</style>
