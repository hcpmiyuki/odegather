<template>
  <div>
    <div class='title-header'>
      <h1>{{ listData.name }}</h1>
    </div>
    <div class='places'>
      <ul>
        <li v-for='(place, index) in places' :key='index'>
        {{ place.name }}
        </li>
      </ul>
    </div>
    <div class='form'>
      <input type='text' name='placeName' placeholder='いきたい場所(必須)' autocomplete='off' v-model='placeName'>
      <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='placeDescription'></textarea>
      <input type="text" name="url" placeholder="Google MapやホームページのURL(任意)" id="url" v-model='placeURL'>
      <p>登録</p>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'

export default {
  name: 'PlaceList',
  data () {
    return {
      listID: null,
      currentUserUID: null,
      placeName: null,
      placeDescription: null,
      placeURL: null,
      places: [],
      listData: {}
    }
  },
  created: function () {
    const self = this
    self.listID = self.$route.params.listID
    self.getLists()

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        self.currentUserUID = user.uid
      } else {
        // No user is signed in.
        console.log('ログインしていない')
      }
    })
  },
  methods: {
    getLists: async function (UID, listID) {
      const self = this
      var listDocs = await db.collectionGroup('lists').where('document_id', '==', self.listID)
        .orderBy('created_at', 'desc')
        .get()

      listDocs.forEach(async function (doc) {
        var placesDocs = await doc.ref.collection('places').orderBy('created_at', 'desc').get()
        self.listData['listName'] = doc.data().name
        self.listData['createdAt'] = doc.data().created_at

        placesDocs.forEach(function (doc) {
          self.places.push({
            'placeID': doc.id,
            'createdAt': doc.data().created_at,
            'name': doc.data().name,
            'photoUrl': doc.data().photo_url,
            'types': doc.data().types,
            'url': doc.data().url
          })
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
