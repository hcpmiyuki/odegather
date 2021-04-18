<template>
  <div class='wrapper'>
      <div class='form'>
          <label>メールアドレス</label>
          <input type='email' name='email' v-model='email'>
          <label>パスワード</label>
          <input type='password' name='password' v-model='password'>
          <p v-on:click='signIn'>サインイン</p>
          <router-link to="/signup">サインアップ</router-link>
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
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then(res => {
          this.$router.push({ path: `/userinfo/${res.user.uid}` })
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
