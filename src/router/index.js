import Vue from 'vue'
import Router from 'vue-router'
import SignIn from '@/components/SignIn'
import SignUp from '@/components/SignUp'
import UserInfo from '@/components/UserInfo'
import ListList from '@/components/ListList'
import PlaceList from '@/components/PlaceList'
import FollowList from '@/components/FollowList'
import AddingUserList from '@/components/AddingUserList'
import ChatList from '@/components/ChatList'
import ChatRoom from '@/components/ChatRoom'
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
    },
    {
      path: '/chats/:uid',
      name: 'ChatList',
      component: ChatList,
      meta: {
        authNecessary: true
      }
    },
    {
      path: '/chat/:chatID',
      name: 'ChatRoom',
      component: ChatRoom,
      meta: {
        authNecessary: true
      }
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authed = to.matched.some(record => record.meta.authed)
  const authNecessary = to.matched.some(record => record.meta.authNecessary)

  if (authed) {
    // 認証状態を取得
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        next()
      } else {
        next({ name: 'UserInfo', params: { uid: user.uid}})
      }
    })
  } else {
    next()
  }

  if (authNecessary) {
    // 認証状態を取得
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        next({ name: 'SignIn'})
        
      } else {
        next()
      }
    })
  } else {
    next()
  }
})

export default router