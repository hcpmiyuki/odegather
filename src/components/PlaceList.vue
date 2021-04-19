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
      <input type='text' name='placeName' placeholder='いきたい場所(必須)' autocomplete='off' v-model='placeData.name' ref="search">
      <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='placeData.description'></textarea>
      <input type="text" name="url" placeholder="Google MapやホームページのURL(任意)" id="url" v-model='placeData.url'>
      <p>登録</p>
      {{ placeData }}
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
      placeData: {
        'placeID': null,
        'description': null,
        'createdAt': null,
        'name': null,
        'photoUrl': null,
        'types': [],
        'url': null
      },
      places: [],
      listData: {
        'documentID': null,
        'name': null,
        'createdAt': null
      }
    }
  },
  mounted: function () {
    const self = this
    let script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBcqg8IvzQPSelMZU-C15rJwUIE6o481R4&libraries=places&callback=initMap';
    script.async = true;
    document.head.appendChild(script);
    window.initMap = () => {
      var options = {
        componentRestrictions: { country: "jp" },
        fields: ["name", "place_id", "url", "photo", "type"],
        types: ["establishment"],
      }

      let autocomplete = new window.google.maps.places.Autocomplete(this.$refs.search, options);
      autocomplete.addListener("place_changed", function() {
        var place = autocomplete.getPlace()
        console.log(place)
        console.log(place.place_id)
        self.placeData.name = place.name
        self.placeData.photoUrl = place.photos[0].getUrl()
        self.placeData.types = place.types.filter(n => !["point_of_interest", "establishment"].includes(n));
        self.placeData.url = place.url
        self.placeData.placeID = place.place_id
      })
    }
  },
  created: function () {
    const self = this
    self.listID = self.$route.params.listID
    self.getPlaces()
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
    getPlaces: async function (UID, listID) {
      const self = this
      var listDocs = await db.collectionGroup('lists').where('documentID', '==', self.listID)
        .orderBy('createdAt', 'desc')
        .get()

      listDocs.forEach(async function (doc) {
        var placesDocs = await doc.ref.collection('places').orderBy('createdAt', 'desc').get()
        self.$set(self.listData, 'documentID', doc.data().documentID);
        // self.listData['documentID'] = doc.data().documentID
        self.listData['name'] = doc.data().name
        self.listData['createdAt'] = doc.data().createdAt

        placesDocs.forEach(function (doc) {
          self.places.push({
            'placeID': doc.data().placeID,
            'description': doc.data().description,
            'createdAt': doc.data().createdAt,
            'name': doc.data().name,
            'photoUrl': doc.data().photoUrl,
            'types': doc.data().types,
            'url': doc.data().url
          })
        })
      })
    },

  }
}
</script>

<style scoped>
</style>
