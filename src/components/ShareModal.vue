<template>
  <div>
      <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <ul id='share-menu'>
                <li>
                  <i class="fas fa-copy"></i>
                  <a>コピー</a>
                </li>
                <li>
                  <i class="fab fa-twitter"></i>
                  <a :href="twUrl" target="_brank">Twitter</a>
                </li>
                <li>
                  <i class="fab fa-line"></i>
                  <a>LINE</a>
                </li>
              </ul>

              <div class="modal-footer">
                <slot name="footer">
                  <button class="modal-default-button" @click="$emit('close')">
                    キャンセル
                  </button>
                </slot>
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
  name: "ShareModal",
  props: ['userName', 'listName'],
  data: function() {
    return {
      'twUrl': ''
    }
  },
  created: function () {
    // 現在のurlをエンコード
    var url = encodeURIComponent(location.href)
    // ページ文言(タイトルとかdescription) ここではdescriptionを使用
    var txt = encodeURIComponent(`${this.userName}さんの${this.listName}リスト`)
    var hashtags = 'odegather,おでぎゃざ'
    // Twitter用のurl作成 ハッシュタグもtxtを使用
    this.twUrl = 'https://twitter.com/intent/tweet?text=' + txt + '&hashtags=' + hashtags + '&url=' + url
  }
}
</script>
<style>
.trim.small{
  width:50%;
}

#share-menu{
  display: grid;
  grid-template-columns: 33% 33% 33%;
}

#share-menu li{
  display: block;
  list-style: none;
  text-align: center;
}

#share-menu li a{
  display: block;
}

#share-menu li i{
  font-size: 50px;
}

#share-menu li .fa-line{
  color: #00B900;
}

#share-menu li .fa-twitter{
  color: #1DA1F2;
}

#share-menu li .fa-copy{
  color: gray;
}

</style>