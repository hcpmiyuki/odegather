<template>
  <div class='wrapper'>
      <div class='form'>
          <label>ニックネーム</label>
          <input name='name' v-model='name'>
          <label>メールアドレス</label>
          <input type='email' name='email' v-model='email'>
          <label>パスワード</label>
          <input type='password' name='password' v-model='password'>
          <p v-on:click='signUp' class='btn'>サインアップ</p>
          <p>アカウントをお持ちの方は<router-link to="/">こちら</router-link></p>
          <p style="color: white; margin-top: 30px;">{{ errorMsg }}</p>
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
      password: null,
      name: null,
      errorMsg: ''
    }
  },
  methods: {
    signUp: function () {
      const self = this
      if (self.name && self.email && self.password) {
        firebase.auth().createUserWithEmailAndPassword(self.email, self.password)
          .then((res) => {
            db.collection('users').doc(res.user.uid).set({
              screenName: self.name,
              imageName: 'https://firebasestorage.googleapis.com/v0/b/portfolio-310607.appspot.com/o/userImages%2Fdefault-icon.jpg?alt=media&token=7de5fff0-c63d-40a6-974a-7a55fd62aa6e',
              description: null,
              createdAt: new Date()
            })
              .then(
                self.$router.push({ path: `/userinfo/${res.user.uid}` })
              )
              .catch((error) => {
                // エラー時の処理
                self.errorMsg = error
              })
          })
          .catch((error) => {
            // エラー時の処理
            self.errorMsg = error
          })
      }else{
        self.errorMsg = 'ニックネーム, メールアドレス、パスワードを入力してください'
      }
    }
  }
}
</script>

<style scoped>
</style>
