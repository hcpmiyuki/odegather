<template>
  <div>
    <div class="wrapper">
      <div>
        <a v-on:click = "back" class='back-btn'><<</a>
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <h1>{{ listData.name }}</h1>
      </div>
      <div class='list place'>
        <ul v-if='places.length'>
          <li v-for='(place, index) in places' :key='index'>
            <div id='palce-list-title'>
              <a>{{ place.name }}</a>
            </div>
            <div id='place-list-image'>
              <img :src='place.photoUrl'>
            </div>
            <div id='place-list-content'>
              <p>{{ place.types }}</p>
              <p>{{ place.description }}</p>
              <a :href='place.url' target="_brank">googlemapでみる</a>
              <p><router-link :to="{ name: 'AddingUserList', params: { placeID: place.placeID }}">
                {{ place.listedCount }}人</router-link>がこの場所をリストに登録しています</p>
              <a v-on:click='deletePlace(place.placeID)'>削除</a>
            </div>
          </li>
        </ul>
        <p v-else>まだ場所が登録されていません!登録してください!</p>
      </div>
      <div class='form' v-show='currentUserUID == pageUID'>
        <input type='text' name='placeName' placeholder='いきたい場所(必須)' autocomplete='off' v-model='placeData.name' ref="search">
        <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='placeData.description'></textarea>
        <input type="text" name="url" placeholder="Google MapやホームページのURL(任意)" id="url" v-model='placeData.url'>
        <p v-on:click='addNewPlace' class='btn'>登録</p>
      </div>
    </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID' v-show='currentUserUID'></HeaderMenu>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import HeaderMenu from './HeaderMenu'

export default {
  name: 'PlaceList',
  data () {
    return {
      pageUID: null,
      listDocPath: null,
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
      propsPlaceData: null,
      listData: {
        'documentID': null,
        'name': null,
        'createdAt': null
      },
      showModalFlag: false
    }
  },
  components: {
    HeaderMenu
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
        fields: ["name", "place_id", "url", "photo", "type", 'reviews'],
        types: ["establishment"],
        language: 'ja'
      }

      let autocomplete = new window.google.maps.places.Autocomplete(this.$refs.search, options);
      autocomplete.addListener("place_changed", function() {
        var place = autocomplete.getPlace()
        self.placeData.name = place.name
        self.placeData.photoUrl = place.photos[0].getUrl()
        self.placeData.types = place.types.filter(n => !["point_of_interest", "establishment"].includes(n));
        self.placeData.url = place.url
        self.placeData.placeID = place.place_id
        self.placeData.reviews = place.reviews.map(function (item) { return item.text })

        console.log(self.placeData.reviews)
      })

      
    }
  },
  created: function () {
    const self = this
    self.listID = self.$route.params.listID
    self.pageUID = self.$route.params.uid
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
    getPlaces: async function () {
      const self = this
      var listDoc = await db.collection('users')
      .doc(self.pageUID)
      .collection('lists')
      .doc(self.listID)
      .get()

      self.listDocPath = listDoc.ref.path
      self.listData['documentID'] = listDoc.data().documentID
      self.listData['name'] = listDoc.data().name
      self.listData['createdAt'] = listDoc.data().createdAt
    
      var placesDocs = await listDoc.ref.collection('places').orderBy('createdAt', 'desc').get()
      var places = []
      placesDocs.forEach(async function (doc) {
        var placeDocRefs = await db.collectionGroup('places').where('placeID', '==', doc.id).get()

        places.push({
            'placeID': doc.data().placeID,
            'description': doc.data().description,
            'createdAt': doc.data().createdAt,
            'name': doc.data().name,
            'photoUrl': doc.data().photoUrl,
            'types': doc.data().types,
            'url': doc.data().url,
            'listedCount': placeDocRefs.size
        })
      })
      self.places = places

    },
    addNewPlace: async function () {
      const self = this
      self.placeData.createdAt = new Date()

      // db.doc(self.listDocPath).collection('places').doc(self.placeData.placeID)
      //   .set(self.placeData)
      //   .then(function() {

      //   })
      //   .catch(function(error) {
      //     console.error(error);
      //   })
        let placeDoRef = db.doc(self.listDocPath).collection('places').doc(self.placeData.placeID)
        let allPlaceDoc = await db.collection('all_places').doc(self.placeData.placeID).get()

        try {
          const batch = db.batch()

          await batch.set( placeDoRef, self.placeData)
          
          if (!allPlaceDoc.exists) {
            let allPlaceDocRef = db.collection('all_places').doc(self.placeData.placeID)
            let placeData = {
              'placeID': self.placeData.placeID,
              'reviews': self.placeData.reviews,
              'types': self.placeData.types,
              'createdAt': self.placeData.createdAt,
              'name': self.placeData.name
            }
            await batch.set(allPlaceDocRef, placeData)
          }

          await batch.commit()

          self.getPlaces()

          // フォームを初期化する
          let placeDataTemp = {}
          for (let key in self.placeData) {
            placeDataTemp[key] = null
          }
          self.placeData = placeDataTemp
        } catch (error) {
          console.error(error);
        }
    },
    deletePlace: function (placeID) {
      const self = this
      db.doc(self.listDocPath).collection('places').doc(placeID).delete()
        .then(function() {
          self.getPlaces()
        })
        .catch(function(error) {
          console.error(error);
      });
    }
    // showUserList: async function (placeID) {
    //   var placeDocs = await db.collectionGroup('places').where('placeID', '==', placeID).get()
    //   placeDocs.forEach( function (doc) {
    //     var userID = doc.ref.parent.parent.parent.parent.id
    //   })
    // }
  }
}
</script>

<style scoped>

.list.place li{
  display: grid;
  grid-template-rows: 30px 1fr;
  grid-template-columns: 33% 1fr;
}

#palce-list-title{
  grid-row: 1;
  grid-column: 1 / 3;
}

#place-list-image{
  width: 100%;
}

img{
  width: 90%;
}

</style>
