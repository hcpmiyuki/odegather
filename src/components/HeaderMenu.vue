<template>
    <div>
        <ul id='menu'>
        <li><i class="fas fa-home"></i></li>
        <li><i class="fas fa-comment-dots"></i></li>
        <li><router-link :to="{ name: 'ListList', params: { uid: currentUserUID }}"><i class="fas fa-list"></i></router-link></li>
        <li><router-link :to="{ name: 'UserInfo', params: { uid: currentUserUID }}"><i class="fas fa-user"></i></router-link></li>
        </ul>
    </div>
</template>

<script>
export default {
  name: 'HeaderMenu',
  props: ['currentUserUID'],
}
</script>