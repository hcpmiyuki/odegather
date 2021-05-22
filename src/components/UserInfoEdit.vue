<template>
  <div>
      <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <i class="far fa-times-circle modal-default-button" @click="$emit('close')"></i>
              <div class='form'>
                <div class="trim small">
                  <img :src="userData.imageName">
                </div>
                <input type="file" accept="image/*" @change="onFileUpload">
                <input type='text' name='placeName' placeholder='ユーザー名' autocomplete='off' v-model='userData.screenName'>
                <textarea name='description' rows=4 placeholder='自己紹介(最大100字)' maxlength='100' v-model='userData.description'></textarea>
                <p class='btn' @click='editUserInfo'>登録</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
  </div>
</template>

<script>
import {db} from '../plugins/firebase'
import {storage} from '../plugins/firebase'

export default {
  name: "UserInfoEdit",
  props: ['userID', 'screenName', 'description', 'imageName'],
  data: function() {
    return {
      userData: {
        'userID': null,
        'screenName': null,
        'imageName': null,
        'description': null,
      }
    }
  },
  created: function () {
    this.userData.screenName = this.screenName
    this.userData.userID = this.userID
    this.userData.description = this.description
    this.userData.imageName = this.imageName
  },
  methods: {
    onFileUpload: function (file) {
      const files = file.target.files || file.dataTransfer.files;
      const fileType = this.getFileType(files[0].name)

      if (!fileType) {
        this['flash/setFlash']({
          message: 'ファイルタイプが不正です。',
          type: 'error'
        })
      }

      let filename = `${this.userData.userID}${Date.parse(new Date())}.${fileType}`.replace(/([\s\:\-])/g, '')
      const storageRef = storage.ref(`userImages/${filename}`)
      const uploadTask = storageRef.put(files[0])
      uploadTask.on('state_changed', 
          snapshot => {
            const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            this.fileLoading = percentage
          },
          err => {
            console.log(err)
            this['flash/setFlash']({
              message: 'ファイルのアップロードに失敗しました。',
              type: 'error'
            })
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.fileLoading = 0
              this.userData.imageName = downloadURL
            })
          }
        )
    },
    getFileType: function (filename) {
      var pos = filename.lastIndexOf('.');
      if (pos === -1) return '';
      return filename.slice(pos + 1);
    },
    editUserInfo: function () {
      const self = this

      if (!self.userData.screenName){
        self.userData.screenName = '名無し'
      }

      if (!self.userData.imageName){
        self.userData.imageName = 'https://firebasestorage.googleapis.com/v0/b/portfolio-310607.appspot.com/o/userImages%2Fdefault-icon.jpg?alt=media&token=7de5fff0-c63d-40a6-974a-7a55fd62aa6e'
      }

      var newUserRef = db.collection('users').doc(self.userData.userID);
        newUserRef.update({
          screenName: self.userData.screenName,
          imageName: self.userData.imageName,
          description: self.userData.description,
          updatedAt: new Date()
        })
        .then(function () {
          self.$router.go({path: self.$router.currentRoute.path, force: true})
        })
        .catch((error) => {
          console.error(error);
      })
    }
  }
};
</script>
<style>
.trim.small{
  width:50%;
}

.modal-default-button{
  color: var(--accent-color);
  font-size: 27px;
}

</style>