# j-swiper
***
介绍：一款原生JS轮播组件

特点：原生、轻量、支持PC与Mobile、在非Vue/React项目优势显著、标签属性化写法（类似 Element-ui属性化配置）

# 基本用法
### 复制以下代码
#### 1. 下载 源码中的 js 与 css 并引入项目
```html
 <link rel="stylesheet" href="./css/j_swiper.css">
 <script src="./js/j_swiper.js"></script>
```
#### 2. 写一些简单的样式
```css
.my-swiper {
        background: #54BAB9;
    }
/*.j_swiper_item 是轮播组件实例化后 自动挂载的样式*/
.my-swiper .j_swiper_item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: #fff;
    }
```
#### 3.写一个最基本的轮播结构
```html
<div>
   <j-swiper class="my-swiper">
        <j-swiper-item>
              1
        </j-swiper-item>
        <j-swiper-item>
              2
        </j-swiper-item>
        <j-swiper-item>
              3
        </j-swiper-item>
    </j-swiper>
  </div>
```
> 恭喜 您已完成一个最基本的 轮播效果
# 属性配置
####与 element-ui/antd 一样 我们也支持 标签属性配置

|属性名      |说明      |可选值      |默认值      |
| ---- | ---- | ---- | ---- |
|autoplay      |是否自动轮播      |true/false      |true      |
|btnshow      |是否显示切换按钮      |true/false      |true      |
|dotshow      |是否显示切换点点      |true/false      |true      |
|mousewheel      |是否启用鼠标滚轮滑动      |true/false      |true      |
|handcreate      |是否启用手动实例化      |true/false      |false      |
|loop      |是否支持无限轮播      |true/false      |true      |
|currentindex      |初始显示的轮播组件下标      |—      |0      |
|interval      |轮播组件切换时间      |—      |1(秒)      |
|togglespeed      |轮播组件的切换时“过渡”时间      |—      |1(秒)      |
|dottrigger      |小点点的触发方式      |click/mouseover      |click      |
|direction      |组件的滑动方向      |X/Y      |X      |
|change      |切换后的回调函数      |—      |—      |
####示例
```html
<j-swiper
    class="my-swiper"
    direction="Y"
    btnShow="false"
    dotShow="false"
    autoPlay="false"
    handCreate="true"
    interval="3"
>
    <j-swiper-item>
        1
    </j-swiper-item>
    <j-swiper-item>
        2
    </j-swiper-item>
    <j-swiper-item>
        3
    </j-swiper-item>
</j-swiper>
```

# 如何获取切换后的index值
###方式一（非实例化方式）
```html
<body>
<div>
    <j-swiper  change="changeCallBack"></j-swiper>
</div>
<script>
    //类名.属性值
    j_Swiper.changeCallBack = function (index) {
        console.log(index);
    }
</script>
</body>
```
###方式二（实例化方式）
#### 提示：实例化前 推荐设置属性 handCreate="true" 启动手动实例化方式  
```javascript
    // 实例化 一个swiper组件
    const j_swiper = new j_Swiper(document.querySelector('.my-swiper'));
    // swiper 切换后的回调事件
    j_swiper.onchange = function (index) {
        console.log(index)
    }
    // 实例化后以下属性也可以使用
    // 设置 swiper 切换的下表值 
    j_swiper.swiperIndex = 0
    // 切换下一页
    j_swiper.nextPage()
    // 切换上一页
    j_swiper.lastPage()
```

"# j-swiper" 
