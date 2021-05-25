<template>
  <div class='wrapper'>
      <div class='form'>
          <label>メールアドレス</label>
          <input type='email' name='email' v-model='email'>
          <label>パスワード</label>
          <input type='password' name='password' v-model='password'>
          <p v-on:click='signIn' class='btn'>サインイン</p>
          <p>アカウントをお持ちでない方は<router-link to="/signup">こちら</router-link></p>
      </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'SignIn',
  data () {
    return {
      email: null,
      password: null
    }
  },
  methods: {
    signIn: function () {
      const self = this
      firebase.auth().signInWithEmailAndPassword(self.email, self.password)
        .then(res => {
          self.$router.push({ path: `/userinfo/${res.user.uid}` })
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
