import Vue from 'vue'
import Router from 'vue-router'
import SignIn from '@/components/SignIn'
import SignUp from '@/components/SignUp'
import UserInfo from '@/components/UserInfo'
import ListList from '@/components/ListList'
import PlaceList from '@/components/PlaceList'
import FollowList from '@/components/FollowList'
import AddingUserList from '@/components/AddingUserList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: SignIn
    },
    {
      path: '/signup',
      component: SignUp
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
