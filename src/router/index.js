import Vue from 'vue'
import Router from 'vue-router'
import SignIn from '@/components/SignIn'
import SignUp from '@/components/SignUp'
import UserInfo from '@/components/UserInfo'
import ListList from '@/components/ListList'
import PlaceList from '@/components/PlaceList'
import FollowList from '@/components/FollowList'
import AddingUserList from '@/components/AddingUserList'
import firebase from 'firebase'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      component: SignIn,
      name: 'SignIn',
      meta: {
        authed: true
      }
    },
    {
      path: '/signup',
      component: SignUp,
      meta: {
        authed: true
      }
    },
    {
      path: '/userinfo/:uid',
      name: 'UserInfo',
      component: UserInfo
    },
    {
      path: '/lists/:uid',
      name: 'ListList',
      component: ListList
    },
    {
      path: '/places/:uid/:listID',
      name: 'PlaceList',
      component: PlaceList
    },
    {
      path: '/follows/:uid/:follow_flag',
      name: 'FollowList',
      component: FollowList
    },
    {
      path: '/place/:placeID/users',
      name: 'AddingUserList',
      component: AddingUserList
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authed = to.matched.some(record => record.meta.authed)
  if (authed) {
    // 認証状態を取得
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        next()
      } else {
        // 認証されていない場合、認証画面へ
        next({ name: 'UserInfo', params: { uid: user.uid}})
      }
    })
  } else {
    next()
  }
})

export default router