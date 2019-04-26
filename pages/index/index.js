const { windowWidth, windowHeight } = wx.getSystemInfoSync()
const FONTSIZE_TO_FONTHEIGHT = {
  chinese: 1.05,
  noChinese: 0.7
}
const DEFAULT_TEXT = '请输入你要的弹幕'
const FONT_COLOR_LIST = ['#FFFFFF', '#FF0000', '#FF1177', '#FF00FF', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#65318E', '#1E50A2', '#006E54']
const BACKGROUND_LIST = ['#000000', '#65318E', '#1E50A2', '#C9171E', '#FFFFFF', '#006E54', '#E6B422', '#96514D', '#6E7955', '#EB6EA5']
const FONT_SIZE_LIST = [240, 300, 380, 500, 780]
const SPEED_LIST = [2, 1.4, 1, 0.6]

Page({
  $$scrollTimer: null,
  $$inputValue: '',
  $$displayText: DEFAULT_TEXT,
  data: {
    isIpx: getApp().globalData.isIpx,
    showMenu: true,
    showInput: false,
    pageHeight: 0,
    inputTextArray: [],
    displayCss: { transitionDuration: 0, practicalHeight: 0 },
    fontColorIndex: 0,
    fontColorList: FONT_COLOR_LIST,
    backgroundIndex: 0,
    backgroundList: BACKGROUND_LIST,
    fontSizeIndex: 0,
    fontSizeList: FONT_SIZE_LIST,
    speedIndex: 0,
    speedList: SPEED_LIST,
    defaultInputValue: ''
  },

  onLoad(options) {
    this.setData({
      pageHeight: Math.floor(750 * windowHeight / windowWidth) // px转rpx
    })
    // 设置分享进入时的默认参数
    this.setDefaultParameter(options)
    // 开始执行动画
    this.runScroll()
  },

  onUnload() {
    this.stopScroll()
  },

  setDefaultParameter({
    displayText,
    fontSizeIndex = 0,
    fontColorIndex = 0,
    backgroundIndex = 0,
    speedIndex = 0
  }) {
    this.setData({
      fontSizeIndex: Number(fontSizeIndex),
      fontColorIndex: Number(fontColorIndex),
      backgroundIndex: Number(backgroundIndex),
      speedIndex: Number(speedIndex)
    })
    this.$$displayText = displayText || DEFAULT_TEXT
  },

  runScroll() {
    this.setInputTextArray()

    // 计算实际高度和动画执行时间
    let totalHeight = this.data.pageHeight + 800
    this.data.inputTextArray.forEach(item => totalHeight += item.fontHeight)
    const transitionDuration = Math.ceil(totalHeight * this.data.speedList[this.data.speedIndex])
    const practicalHeight = Math.ceil(totalHeight * windowWidth / 750) // 转成实际高度（rpx转px）
    // 执行动画
    this.scroll(transitionDuration, practicalHeight)
    // 设置定时器执行动画
    this.$$scrollTimer = setInterval(() => {
      this.scroll(transitionDuration, practicalHeight)
    }, transitionDuration)
  },

  scroll(transitionDuration, practicalHeight) {
    this.setData({
      displayCss: { transitionDuration: 0, practicalHeight: 0 }
    })
    // 处理循环的过程中，没有执行动画的效果。所以加上一个定时器去设置样式
    setTimeout(() => {
      this.setData({
        displayCss: { transitionDuration, practicalHeight }
      })
    }, 300)
  },

  stopScroll() {
    // 清除定时器
    if (this.$$scrollTimer) {
      clearInterval(this.$$scrollTimer)
      this.$$scrollTimer = null
    }
    // 清空动画执行时间和效果
    this.setData({ displayCss: { transitionDuration: 0, practicalHeight: 0 }, inputTextArray: [] })
  },
  // 设置输入框数组
  setInputTextArray() {
    this.setData({
      inputTextArray: this.$$displayText.split('').map(item => ({
        text: item,
        fontHeight: this.setFontHeight(this.judgeText(item))
      }))
    })
  },
  // 设置单个字的高度和文字高度
  setFontHeight(isNotChinese) {
    const { fontSizeIndex, fontSizeList } = this.data
    const { noChinese, chinese } = FONTSIZE_TO_FONTHEIGHT
    return Math.floor((isNotChinese ? noChinese : chinese) * fontSizeList[fontSizeIndex])
  },
  // 重置动画效果
  onChangeScroll() {
    this.stopScroll()
    this.runScroll()
  },

  onSetFontSize() {
    this.updateBarrage('fontSize')

    this.onChangeScroll()
  },

  onSetFontColor() {
    this.updateBarrage('fontColor')
  },

  onSetBackgroundColor() {
    this.updateBarrage('background')
  },

  onSetSpeed() {
    this.updateBarrage('speed')

    this.onChangeScroll()
  },

  onSendText() {
    this.setData({
      defaultInputValue: this.$$inputValue || '',
      showInput: false
    })
    this.$$displayText = this.$$inputValue || DEFAULT_TEXT

    this.onChangeScroll()
  },

  onKeyInput(e) {
    this.$$inputValue = e.detail.value
  },

  onShowInput() {
    this.setData({ showInput: true })
  },

  updateBarrage(changeName) {
    const indexName = `${changeName}Index`
    this.setData({ [indexName]: this.foreachFileIndex(this.data[indexName], this.data[`${changeName}List`]) })
  },

  onShowMenu() {
    // 输入框显示的时候，点击空白，只用返回到上一个界面，不用关闭导航栏
    if (this.data.showInput) {
      this.setData({
        showInput: false
      })
      return
    }

    this.setData({
      showMenu: !this.data.showMenu
    })
  },

  onShareAppMessage() {
    const options = {
      displayText: this.$$displayText || DEFAULT_TEXT,
      fontSizeIndex: this.data.fontSizeIndex || 0,
      fontColorIndex: this.data.fontColorIndex || 0,
      backgroundIndex: this.data.backgroundIndex || 0,
      speedIndex: this.data.speedIndex || 0
    }
    // 设置文字长度100，防止超出。不能使用MD5加密（非可逆的）来减少长度
    // 加密并不是用来减少长度的,主要还是要看链接的长度
    return {
      title: '分享的标题',
      path: `/page/index/index?${this.urlObjToParameters(options)}`
    }
  },

  urlObjToParameters(options) {
    return Object.keys(options).map(key => `${key}=${options[key]}`).join('&')
  },

  foreachFileIndex(index = 0, arr = []) {
    if (index === arr.length - 1) {
      return 0
    }
    return index + 1
  },
  // 判断字符串是数字或字母
  judgeText(text) {
    return (/^[A-Za-z0-9]*$/).test(text)
  },

  onChangeEvent(e) {
    const clickChild = e.detail
    this[clickChild]()
  }
})