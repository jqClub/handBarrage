Component({
  properties: {
    changeName: String, // 点击的事件
    currentIndex: Number, // 当前的index值
    img: String, // icon图片
    title: String // 文字
  },
  methods: {
    _onChangeEvent(e) {
      const { changeName } = e.currentTarget.dataset
      this.triggerEvent('onChangeEvent', changeName)
    }
  }
})