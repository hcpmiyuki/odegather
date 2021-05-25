<template>
  <div>
    <div class="wrapper">
      <div id='mypage-menu'>
        <a v-on:click = "back" class='back-btn'><<</a>
        <router-link :to="{ name: 'SignIn'}" v-show='!currentUserUID' id='mypage-menu-signin'>サインイン</router-link>
      </div>
      <div class='title-header'>
        <a id='username'>
          <router-link :to="{ name: 'UserInfo', params: { uid: pageUID }}">
            {{ pageUserName }}
          </router-link>の
        </a><br>
        <h1>{{ listData.name }}</h1>
        <a v-on:click='showShareModal=true' v-show='currentUserUID==pageUID'><i class="fas fa-share-alt"></i></a>
      </div>
      <div class='list place'>
        <ul v-if='places.length'>
          <li v-for='(place, index) in places' :key='index'>
            <p id='palce-list-title' class='name'>{{ place.name }}</p>
            <a><router-link :to="{ name: 'AddingUserList', params: { placeID: place.placeID }}">
                  {{ place.listedCount }}人</router-link>がこの場所をリストに登録しています</a>
            <div id='place-list-info'>
              <div id='place-list-image'>
                <img :src='place.photoUrl'>
              </div>
              <div id='place-list-content'>
                <ul>
                  <li v-if="place.types.length != 0">{{ place.types.join() }}</li>
                  <li v-else>カテゴリ不明</li>
                  <li class="description">{{ place.description }}</li>
                </ul>
              </div>
            </div>
            <div class='btn_area'>
              <a :href='place.url' target="_brank"><i class="fas fa-map-marked-alt"></i></a>
              <a v-on:click='deletePlace(place.placeID)' v-show='currentUserUID==pageUID'><i class="fas fa-trash-alt"></i></a>
            </div>
          </li>
        </ul>
        <p v-else>まだリストが作成されていません!</p>
      </div>
      <div class='form' v-show='currentUserUID == pageUID'>
        <input type='text' name='placeName' placeholder='いきたい場所(必須)' autocomplete='off' v-model='placeData.name' ref="search" id='map'>
        <textarea name='description' rows=4 placeholder='説明(任意 最大100字)' maxlength='100' v-model='placeData.description'></textarea>
        <input type="text" name="url" placeholder="Google MapやホームページのURL(任意)" id="url" v-model='placeData.url'>
        <p v-on:click='addNewPlace' class='btn'>登録</p>
      </div>
      <ShareModal
        v-if="showShareModal"
        :userName='pageUserName'
        :listName='listData.name'
        @close="showShareModal = false">
      </ShareModal>
    </div>
    <HeaderMenu v-bind:currentUserUID='currentUserUID' v-show='currentUserUID'></HeaderMenu>
  </div>
</template>

<script>
import firebase from 'firebase'
import {db} from '../plugins/firebase'
import HeaderMenu from './HeaderMenu'
import ShareModal from './ShareModal'

export default {
  name: 'PlaceList',
  data () {
    return {
      pageUID: null,
      listDocPath: null,
      listID: null,
      pageUserName: null,
      currentUserUID: null,
      defaultPhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/portfolio-310607.appspot.com/o/userImages%2Fdefault-icon.jpg?alt=media&token=7de5fff0-c63d-40a6-974a-7a55fd62aa6e',
      placeData: {
        'placeID': null,
        'description': null,
        'createdAt': null,
        'name': null,
        'types': [],
        'url': null
      },
      places: [],
      listData: {
        'documentID': null,
        'name': null,
        'createdAt': null
      },
      showShareModal: false,
    }
  },
  components: {
    HeaderMenu,
    ShareModal
  },
  mounted: function () {
    const self = this
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBcqg8IvzQPSelMZU-C15rJwUIE6o481R4&libraries=places&callback=initMap';
    script.async = true;
    document.head.appendChild(script);
    window.initMap = () => {
      const options = {
        componentRestrictions: { country: "jp" },
        fields: ["name", "place_id", "url", "type", 'reviews'],
        types: ["establishment"],
        language: 'ja'
      }

      const autocomplete = new window.google.maps.places.Autocomplete(self.$refs.search, options);
      autocomplete.addListener("place_changed", function() {
        const place = autocomplete.getPlace()
        self.placeData.name = place.name
        self.placeData.placeID = place.place_id
        self.placeData.url = place.url

        if (place.types) {
          self.placeData.types = place.types.filter(n => !["point_of_interest", "establishment"].includes(n));
        } else {
          self.placeData.types = []
        }

        if (place.reviews) {
          self.placeData.reviews = place.reviews.map(function (item) { return item.text })
        } else {
          self.placeData.reviews = []
        }
        
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
      }
    })
  },
  methods: {
    getPlaces: async function () {
      const self = this

      const userRef = db.collection('users')
      .doc(self.pageUID)
      const userDoc = await userRef.get()
      self.pageUserName = userDoc.data().screenName

      const listDoc = await userRef.collection('lists')
      .doc(self.listID)
      .get()
      
      self.listDocPath = listDoc.ref.path
      self.listData['documentID'] = listDoc.data().documentID
      self.listData['name'] = listDoc.data().name
      self.listData['createdAt'] = listDoc.data().createdAt
    
      const placesDocs = await listDoc.ref.collection('places').orderBy('createdAt', 'desc').get()
      let places = []
      placesDocs.forEach(async function (doc) {
        const placeDocs = await db.collectionGroup('places').where('placeID', '==', doc.id).get()
        const listedUsers = placeDocs.docs.map(doc => {
          return doc.ref.path.split('/')[1]
        });
        const listedUsersDuplicatesDropped = listedUsers.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        })

        // places apiで画像のURLを取得する
        const map = document.getElementById('map')
        const service = new google.maps.places.PlacesService(map)
        service.getDetails({
            placeId: doc.data().placeID,
            fields: ['photos']
        }, function(place, status) {
            let photoUrl = ''
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                photoUrl = place.photos[0].getUrl()
            } else {
                photoUrl = self.defaultPhotoUrl
            }

            places.push({
              'placeID': doc.data().placeID,
              'description': doc.data().description,
              'createdAt': doc.data().createdAt,
              'name': doc.data().name,
              'photoUrl': photoUrl,
              'types': doc.data().types,
              'url': doc.data().url,
              'listedCount': listedUsersDuplicatesDropped.length
          })
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
        const placeDoRef = db.doc(self.listDocPath).collection('places').doc(self.placeData.placeID)
        const allPlaceDoc = await db.collection('all_places').doc(self.placeData.placeID).get()

        try {
          const batch = db.batch()

          await batch.set( placeDoRef, self.placeData)
          
          if (!allPlaceDoc.exists) {
            const allPlaceDocRef = db.collection('all_places').doc(self.placeData.placeID)
            const placeData = {
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
    //   const placeDocs = await db.collectionGroup('places').where('placeID', '==', placeID).get()
    //   placeDocs.forEach( function (doc) {
    //     const userID = doc.ref.parent.parent.parent.parent.id
    //   })
    // }
  }
}
</script>

<style scoped>

.list.place #place-list-info{
  display: grid;
  grid-template-columns: 33% 1fr;
  margin-top: 10px;
}

#place-list-image{
  width: 100%;
}

img{
  width: 90%;
  height: 80px;
}

.list.place .name{
    font-size: 18px;
}

#place-list-content a,#place-list-content li{
  font-size: 12px;
  word-break: break-all;
}

#place-list-content li{
  background-color: inherit;
  margin-top: inherit;
  margin-bottom: inherit;
  border-radius: inherit;
  padding: inherit;
  box-shadow: inherit;
  position: inherit;
}

.title-header h1{
  display: inline;
}

.title-header a{
  font-size: 32px;
  padding-left: 15px;
  color: var(--accent-color);
}

.title-header #username a,.title-header #username{
  font-size: 15px;
  color: var(--main-color);
  padding-left: 3px;
}

.title-header #username a{
  font-weight: bolder;
}
</style>
