class j_Tool {
  $(selector) {
    //this 指向 parent 元素
    return this.querySelector(selector);
  }

  $All(selector) {
    return this.querySelectorAll(selector);
  }

  subInsertBefore(sub, ele) {
    sub.parentNode.insertBefore(ele, sub);
  }

  subInsertAfter(sub, ele) {
    const parent = sub.parentNode;
    if (parent.lastChild === sub) {
      parent.append(ele);
    } else {
      this.subInsertBefore(sub.nextSibling, ele);
    }
  }

  empty() {
    this.innerHTML = '';
  }

  tagParse(configJson) {
    //this 指向dom元素
    // console.log(this);
    let htmlFragment = this.innerHTML;
    for (const configJsonKey in configJson) htmlFragment = htmlFragment.split(configJson[configJsonKey].name).join('div');
    // console.log(htmlFragment);
    return htmlFragment;
  }

  emptyOriginHtml() {
    this.remove();
  }

  insertClassName(configJson) {
    // console.log(this);
    //this 指向 实例化 swiper 外面的 父级元素
    for (const [k, v] of Object.entries(configJson))
      this.querySelectorAll(v.name).forEach((e) => {
        v.className.forEach((className) => {
          e.classList.add(className);
        });
      });
  }

  insertDoc(fragment) {
    this.innerHTML = fragment;
  }

  createElement(tagName, className, parent = null, child = null, style = {}, callback) {
    let tag = document.createElement(tagName);
    tag.className = className;
    parent && parent.append(tag);
    child && tag.append(child);
    for (const styleKey in style) tag.style[styleKey] = style[styleKey];
    callback && callback(tag);
    return tag;
  }

  throttle(fun, wait) {
    let time = null;
    return function (...args) {
      if (!time) {
        fun.apply(this, args);
        time = setTimeout(() => {
          time = null;
        }, wait);
      }
    };
  }

  asyncFun(fun, wait) {
    //todo 注意this
    setTimeout(function () {
      fun();
    }, wait);
  }

  static getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  cloneAttributes(origin, target) {
    const len = origin.attributes.length;
    for (let i = 0; i < len; i++) {
      let it = origin.attributes[i];
      target.setAttribute(it.localName, it.value);
    }
  }
}

class j_Swiper extends j_Tool {
  static Instance = {};

  static configAttr = {
    currentindex: 0,
    change: (index)=>{},
    dotshow: 'true',
    btnshow: 'true',
    autoplay: 'true',
    interval: 3,
    refs: null,
    direction: 'X',
    togglespeed: '0.3s',
    toggleEffect: 'ease-in-out',
    dotcommonclass: '',
    btncommonclass: '',
    dotactiveclass: 'j_dot_active',
    dottrigger: 'click',
    btneffect: 'hover',
    mousewheel: 'true',
    loop: 'true',
    handcreate: 'false',
  };

  static configJson = [
    {
      name: 'j-swiper-item',
      className: ['j_swiper_item'],
    },
    {
      name: 'j-swiper',
      className: ['j_swiper'],
    },
  ];

  static createBeforeHook(callback) {
    callback && callback();
  }

  constructor(el) {
    super();
    this.$swiper = el;
    this.$swiperItems = null;
    this.$touchParent = null;
    this.$outerParent = this.$swiper.parentNode; //在外面的div元素 就是你要手动添加的
    this.itemInfo = null;
    this.itemCount = null;
    this.swiperAttr = null;
    this.isMove = false;
    this.btnLast = null;
    this.btnNext = null;
    this.startPosition = 0;
    this.currentOffset = 0;
    this.direction = {};
    this.id = j_Tool.getRandomInteger(0, 100000);
    this.dots = null;
    this.onchange = (index)=>{};
    this.currentIndex = 0;
    this.init();
  }

  set swiperIndex(i) {
    if (i < 0 || i > this.itemCount - 3) throw new Error('切换 索引 越界');
    const absCount = Math.abs(this.currentIndex - i);
    this.swiperItemToggle(this.currentIndex - i, (this.swiperAttr.togglespeed * absCount) / 2);
  }

  initAttribute() {
    const len = this.$swiper.attributes.length;
    const tempObj = {};
    for (let i = 0; i < len; i++) {
      let it = this.$swiper.attributes[i];
      tempObj[it.localName] = it.value;
    }
    this.swiperAttr = {
      ...j_Swiper.configAttr,
      ...tempObj,
    };
    // * 是否自动轮播 默认 true
    this.swiperAttr.autoplay = this.swiperAttr.autoplay === 'true';
    // * 是否显示切换按钮 默认 true
    this.swiperAttr.btnshow = this.swiperAttr.btnshow === 'true';
    // * 是否显示切换点点 默认 true
    this.swiperAttr.dotshow = this.swiperAttr.dotshow === 'true';
    // * 是否启用鼠标滚轮滑动 默认 true
    this.swiperAttr.mousewheel = this.swiperAttr.mousewheel === 'true';
    // * 是否启用手动实例化 默认 false
    this.swiperAttr.handcreate = this.swiperAttr.handcreate === 'true';
    // * 是否支持无限轮播 默认 true
    this.swiperAttr.loop = this.swiperAttr.loop === 'true';
    // * 初始显示的轮播组件下标 默认 0
    this.swiperAttr.currentindex = this.swiperAttr.currentindex - 0;
    // * 轮播组件的写切换时间 默认 1s
    this.swiperAttr.interval = parseFloat(this.swiperAttr.interval);
    // * 轮播组件的切换滑动时间 默认 1s
    this.swiperAttr.togglespeed = parseFloat(this.swiperAttr.togglespeed);
    // * 小点点的触发方式 默认click 可选click,mouseover
    this.swiperAttr.dottrigger = this.swiperAttr.dottrigger === 'click' ? 'click' : 'mouseover';
    // * 轮播组件的的方向 默认 X 可选X,Y
    this.direction =
      this.swiperAttr.direction === 'X'
        ? {
            clientXY: 'clientX',
            WH: 'width',
            LT: 'left',
            XY: 'X',
          }
        : {
            clientXY: 'clientY',
            WH: 'height',
            LT: 'top',
            XY: 'Y',
          };

    this.$swiperItems = this.$swiper.children;
  }

  elementUpDate() {
    this.$swiperItems = Array.from(this.$touchParent.children);
    //
    //
    this.itemInfo = {
      height: this.$swiperItems[0].clientHeight,
      width: this.$swiperItems[0].clientWidth,
    };
    this.itemCount = this.$swiperItems.length;
  }

  initDot() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.itemCount - 2; i++) fragment.append(this.createElement('li', 'j_dot_common ' + this.swiperAttr.dotcommonclass));
    this.createElement('ul', `j_dot_wrap j_dot_wrap_${this.direction.XY}`, this.$.call(this.$outerParent, '.j_swiper'), fragment, {});
    this.dots = this.$.call(this.$outerParent, '.j_dot_wrap').children;
    this.dotToggleActive();
  }

  initBtn() {
    let LT = document.createElement('p');
    LT.textContent = '<';
    LT.className = 'j_btn_text';
    let NT = document.createElement('p');
    NT.textContent = '>';
    NT.className = 'j_btn_text';

    if (this.direction.XY === 'X') {
      this.btnLast = this.createElement('div', `j_btn_common j_btn_common_${this.direction.XY} j_btn_common_l j_btn_${this.swiperAttr.btneffect}`, this.$.call(this.$outerParent, '.j_swiper'), LT);
      this.btnNext = this.createElement('div', `j_btn_common j_btn_common_${this.direction.XY} j_btn_common_r j_btn_${this.swiperAttr.btneffect}`, this.$.call(this.$outerParent, '.j_swiper'), NT);
    } else {
      this.btnLast = this.createElement('div', `j_btn_common j_btn_common_${this.direction.XY} j_btn_common_t j_btn_${this.swiperAttr.btneffect}`, this.$.call(this.$outerParent, '.j_swiper'), LT);
      this.btnNext = this.createElement('div', `j_btn_common j_btn_common_${this.direction.XY} j_btn_common_b j_btn_${this.swiperAttr.btneffect}`, this.$.call(this.$outerParent, '.j_swiper'), NT);
    }
  }

  dotToggleActive() {
    for (let i = 0; i < this.itemCount - 2; i++) this.dots[i].classList.remove(this.swiperAttr.dotactiveclass);
    this.dots[this.currentIndex].classList.add(this.swiperAttr.dotactiveclass);
  }

  initSliderItem() {
    this.$swiperItems.forEach((e, i) => {
      e.setAttribute('index', i);
    });

    const $init = this.$swiperItems[0];
    const $end = this.$swiperItems[this.$swiperItems.length - 1];
    const $newInit = $init.cloneNode(true);
    const $newEnd = $end.cloneNode(true);
    this.subInsertBefore($init, $newEnd);
    this.subInsertAfter($end, $newInit);
  }

  cloneItem() {
    const $init = this.$swiperItems[1];
    const $end = this.$swiperItems[this.itemCount - 2];
    const parentTempInit = this.$swiperItems[0];
    const parentTempEnd = this.$swiperItems[this.itemCount - 1];
    // parentTempInit.innerHTML=$end.innerHTML;
    // parentTempEnd.innerHTML=$init.innerHTML;

    this.empty.call(parentTempInit);
    this.empty.call(parentTempEnd);
    if (!this.swiperAttr.loop) return;
    const fragment = document.createDocumentFragment();
    $init.childNodes.forEach((e) => {
      fragment.append(e.cloneNode(true));
    });
    parentTempEnd.append(fragment);
    $end.childNodes.forEach((e) => {
      fragment.append(e.cloneNode(true));
    });
    parentTempInit.append(fragment);
  }

  sliderOffset() {
    this.$swiperItems.forEach((e, i) => {
      e.style[this.direction.LT] = i * this.itemInfo[this.direction.WH] + 'px';
    });

    this.currentOffset = -(this.swiperAttr.currentindex + 1) * this.itemInfo[this.direction.WH];
    this.$touchParent.style[this.direction.LT] = this.currentOffset + 'px';
    this.swiperItemToggle(0);
  }

  swiperItemReset() {
    this.$touchParent.style.transition = '.1s linear';
    this.$touchParent.style[this.direction.LT] = this.currentOffset + 'px';
    this.asyncFun(() => {
      this.$touchParent.style.transition = '0s linear';
    }, 100);
  }

  lastPage() {
    if (!this.swiperAttr.loop && this.currentIndex === 0) return;
    this.swiperItemToggle(1, this.swiperAttr.togglespeed, this.swiperAttr.toggleEffect);
  }

  nextPage() {
    if (!this.swiperAttr.loop && this.currentIndex === this.itemCount - 3) return;
    this.swiperItemToggle(-1, this.swiperAttr.togglespeed, this.swiperAttr.toggleEffect);
  }

  swiperItemToggle(offsetCount, time = 0.1, effect = 'linear') {
    // console.log(offsetCount)
    this.currentOffset += offsetCount * this.itemInfo[this.direction.WH];
    this.$touchParent.style.transition = `${time}s ${effect} ${this.direction.LT}`;
    this.$touchParent.style[this.direction.LT] = this.currentOffset + 'px';

    this.asyncFun(() => {
      this.$touchParent.style.transition = '0s linear';
      if (this.currentOffset / this.itemInfo[this.direction.WH] === -1 || this.currentOffset / this.itemInfo[this.direction.WH] === -this.itemCount + 2) {
        this.cloneItem();
        // return
      }
      //todo 当前left=         如果是第一个item       跳转到 itemCount+1                           如果是最后一个 item                                                    跳转到 itemCount-1                 否则 啥也不干
      if (this.swiperAttr.loop)
        this.currentOffset =
          this.currentOffset >= 0
            ? -this.itemInfo[this.direction.WH] * (this.itemCount - 2)
            : this.currentOffset <= -this.itemInfo[this.direction.WH] * (this.itemCount - 1)
            ? -this.itemInfo[this.direction.WH]
            : this.currentOffset;
      else
        this.currentOffset =
          this.currentOffset >= -this.itemInfo[this.direction.WH]
            ? -this.itemInfo[this.direction.WH]
            : this.currentOffset <= -this.itemInfo[this.direction.WH] * (this.itemCount - 2)
            ? -this.itemInfo[this.direction.WH] * (this.itemCount - 2)
            : this.currentOffset;

      this.$touchParent.style[this.direction.LT] = this.currentOffset + 'px';

      this.currentIndex = Math.abs(this.currentOffset / this.itemInfo[this.direction.WH]) - 1;
      this.swiperAttr.dotshow && this.dotToggleActive();

      this.swiperAttr.change && j_Swiper[this.swiperAttr.change](this.currentIndex);
      this.onchange(this.currentIndex)

      // console.log((time-0+10) * 1000);
      // console.log( time)
    }, (time - 0 + 0.05) * 1000);
  }

  bindEvent() {
    // let startPosition=0;
    // pc
    this.$touchParent.addEventListener('mousedown', (e) => {
      this.isMove = true;
      this.startPosition = e[this.direction.clientXY];
    });
    document.addEventListener('mousemove', (e) => {
      if (this.isMove) this.$touchParent.style[this.direction.LT] = this.currentOffset + e[this.direction.clientXY] - this.startPosition + 'px';
    });
    document.addEventListener('mouseup', (e) => {
      if (this.isMove) {
        let offset = e[this.direction.clientXY] - this.startPosition;
        this.swiperItemToggle(Math.round(offset / this.itemInfo[this.direction.WH]));
        this.isMove = false;
      }
    });

    //mobile
    this.$touchParent.addEventListener('touchstart', (e) => {
      this.isMove = true;
      clearInterval(timeID);
      // document.body.style.overflow = 'hidden';
      this.startPosition = e.touches[0][this.direction.clientXY];
    });
    document.addEventListener('touchmove', (e) => {
      if (this.isMove) this.$touchParent.style[this.direction.LT] = this.currentOffset + e.touches[0][this.direction.clientXY] - this.startPosition + 'px';
    });
    document.addEventListener('touchend', (e) => {
      if (this.isMove) {
        if (this.swiperAttr.autoplay) autoPlay();
        // document.body.style.overflow = '';
        let offset = e.changedTouches[0][this.direction.clientXY] - this.startPosition;
        this.swiperItemToggle(Math.round(offset / this.itemInfo[this.direction.WH]));
        this.isMove = false;
      }
    });

    let timeID = null;

    if (this.swiperAttr.dotshow) {
      //todo 小点点 触发
      Array.from(this.dots).forEach((e, i) => {
        e.addEventListener(this.swiperAttr.dottrigger, (e) => {
          // clearInterval(timeID);
          const absCount = Math.abs(this.currentIndex - i);
          this.swiperItemToggle(this.currentIndex - i, (this.swiperAttr.togglespeed * absCount) / 2);
        });
      });
    }

    //todo 左右按钮
    if (this.swiperAttr.btnshow) {
      this.btnLast.addEventListener('click', this.throttle(this.lastPage, this.swiperAttr.togglespeed * 1000).bind(this));
      this.btnNext.addEventListener('click', this.throttle(this.nextPage, this.swiperAttr.togglespeed * 1000).bind(this));
      this.btnLast.addEventListener('mouseover', (e) => {
        clearInterval(timeID);
      });
      this.btnNext.addEventListener('mouseover', (e) => {
        clearInterval(timeID);
      });
    }

    //todo 自动轮播

    let autoPlay = () => {
      timeID = setInterval(() => {
        this.nextPage();
      }, this.swiperAttr.interval * 1000);
    };
    this.$swiper.addEventListener('mouseover', (e) => {
      clearInterval(timeID);
      if (this.swiperAttr.mousewheel) document.body.style.overflow = 'hidden';

      if (this.swiperAttr.btneffect === 'hover' && this.swiperAttr.btnshow) {
        if (this.direction.XY === 'X') {
          this.btnLast.style.left = '0';
          this.btnNext.style.right = '0';
        } else {
          this.btnLast.style.top = '0';
          this.btnNext.style.bottom = '0';
        }
      }
    });
    this.$swiper.addEventListener('mouseout', (e) => {
      if (this.swiperAttr.mousewheel) document.body.style.overflow = '';
      if (this.swiperAttr.autoplay) autoPlay();
      if (this.swiperAttr.btneffect === 'hover' && this.swiperAttr.btnshow) {
        if (this.direction.XY === 'X') {
          this.btnLast.style.left = '-6em';
          this.btnNext.style.right = '-6em';
        } else {
          this.btnLast.style.top = '-6em';
          this.btnNext.style.bottom = '-6em';
        }
      }
    });
    if (this.swiperAttr.autoplay) {
      autoPlay();
    }

    //todo mousewheel
    if (this.swiperAttr.mousewheel) {
      this.$swiper.addEventListener(
        'mousewheel',
        this.throttle((e) => {
          window.scrollTo(0, window.scrollY);
          e.deltaY < 0 ? this.lastPage() : this.nextPage();
        }, this.swiperAttr.togglespeed * 1000),
      );
    }
  }

  calcEmSize() {
    if (this.swiperAttr.direction === 'X') this.$outerParent.style.fontSize = this.$swiper.clientWidth / 50 + 'px';
    else this.$outerParent.style.fontSize = this.$swiper.clientHeight / 20 + 'px';
  }

  swiperTagParse() {
    const parent = document.createElement('div');
    this.cloneAttributes(this.$swiper, parent);

    //创建 滑动layer
    this.$touchParent = this.createElement('div', 'j_swiper_touchLayer', parent, null);

    Array.from(this.$swiperItems).forEach((item) => {
      const divItem = document.createElement('div');
      this.cloneAttributes(item, divItem);

      // console.log(item.childNodes)
      item.childNodes.forEach((child) => {
        divItem.append(child.cloneNode(true));
      });
      parent.children[0].append(divItem);
    });

    this.$outerParent.removeChild(this.$swiper);

    this.$outerParent.insertBefore(parent, this.$outerParent.children[0]);
    this.$swiper = parent;
    this.$swiperItems = Array.from(parent.children[0].children);

    // console.log(parent)

    // this.$outerParent.append(parent);
  }

  insertSwiperClassName() {
    j_Swiper.configJson[1].className.forEach((e) => {
      this.$swiper.classList.add(e);
    });

    Array.from(this.$swiperItems).forEach((item) => {
      j_Swiper.configJson[0].className.forEach((e) => {
        item.classList.add(e);
      });
    });
  }

  init() {
    this.$outerParent.id = 'j-swiper-parent-' + this.id;
    //获取标签节点上的属性
    this.initAttribute();
    if (!this.$swiperItems.length) {
      console.error('j-swiper-item 不能为空~');
      return;
    }
    //添加 classname
    this.insertSwiperClassName();
    //语法转换 与 添加
    this.swiperTagParse();
    //初始化 item
    this.initSliderItem();
    //更新元素
    this.elementUpDate();
    //计算 em 大小
    this.calcEmSize();
    //swiper item 偏移
    this.sliderOffset();
    //建立小点点
    this.swiperAttr.dotshow && this.initDot();
    //建立btn
    this.swiperAttr.btnshow && this.initBtn();
    //绑定事件

    this.bindEvent();
    // console.log(this);
  }
}

window.onload = function () {
  (function (window) {
    const $swipers = document.querySelectorAll('j-swiper');
    //实例化
    $swipers.forEach((e) => {
      if (!e.hasAttribute('handCreate')) new j_Swiper(e);
    });
    // window.Swiper = Swiper
  })(window);
};
