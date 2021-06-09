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
                <input type="file" accept="image/*" @change="selectedFile">
                <input type='text' name='placeName' placeholder='ユーザー名' autocomplete='off' v-model='userData.screenName'>
                <textarea name='description' rows=4 placeholder='自己紹介(最大100字)' maxlength='100' v-model='userData.description'></textarea>
                <p class='btn' @click='onFileUpload'>登録</p>
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
      },
      filename: null,
      uploadFile: null
    }
  },
  created: function () {
    const self = this
    self.userData.screenName = self.screenName
    self.userData.userID = self.userID
    self.userData.description = self.description
    self.userData.imageName = self.imageName
  },
  methods: {
    selectedFile: function(file) {
      const self = this
      // 選択された File の情報を保存しておく
      file.preventDefault();
      
      const files = file.target.files || file.dataTransfer.files;
      const fileType = self.getFileType(files[0].name)

      if (!fileType) {
        this['flash/setFlash']({
          message: 'ファイルタイプが不正です。',
          type: 'error'
        })
      }

      self.uploadFile = files[0];
      self.filename = `${self.userData.userID}${Date.parse(new Date())}.${fileType}`.replace(/([\s\:\-])/g, '')
      self.userData.imageName = URL.createObjectURL(self.uploadFile)
    },
    onFileUpload: async function () {
      const self = this
      const storageRef = storage.ref(`userImages/${self.filename}`)
      const uploadTask = storageRef.put(self.uploadFile)
      uploadTask.on('state_changed', 
          snapshot => {
            const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
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
              self.userData.imageName = downloadURL
              self.editUserInfo()
            })
          }
        )
    },
    getFileType: function (filename) {
      const self = this
      const pos = filename.lastIndexOf('.');
      if (pos === -1) return '';
      return filename.slice(pos + 1);
    },
    editUserInfo: async function () {
      const self = this

      if (!self.userData.screenName){
        self.userData.screenName = '名無し'
      }

      if (!self.userData.imageName){
        self.userData.imageName = 'https://firebasestorage.googleapis.com/v0/b/portfolio-310607.appspot.com/o/userImages%2Fdefault-icon.jpg?alt=media&token=7de5fff0-c63d-40a6-974a-7a55fd62aa6e'
      }

      const newUserRef = db.collection('users').doc(self.userData.userID);
      newUserRef.update({
        screenName: self.userData.screenName,
        imageName: self.userData.imageName,
        description: self.userData.description,
        updatedAt: new Date()
      })
      .then(function () {
        window.location.reload()
      })
      .catch((error) => {
        console.error(error);
      })
    }
  }
}
</script>
<style scoped>
.trim.small{
  width:50%;
}

.modal-container .form{
  margin: 21px auto;
}

</style>