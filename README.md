# duangPage.js
移动端单屏展示库，支持多种动画、页面路由等功能，依赖 Zepto/jQuery 站在 [pageSwitch.js](https://github.com/qiqiboy/pageSwitch) 的肩膀上， 移除对桌面老浏览器的支持，增加了图片预加载和路由功能。

## 简单的调用
#### HTML
```
<body>
<div id="pages">
    <div class="page">
    	<h1>标题</h1>
    	<img data-src="img.jpg" alt="">
    </div>
    <div class="page" data-title="苹果表"></div>
    <div class="page" data-src="img.jpg"></div>
    ...
</div>
</body>
```
#### CSS
```
html,body{height: 100%;marigin:0}
#pages, .page{width:100%;height:100%;}
```
#### JS
```
var duang = new duangPage('pages');
```

## 说明

#### 配置
```
var duang = new duangPage('pages', {
	//播放速度，默认600
    duration: 800, 
    //起始位置，默认0
    start: 0, 
    //滚动方向，默认1， 0水平 || 1垂直
    direction: 1, 
    //循环滚动 默认false
    loop: false,
    //缓动 默认'ease'  可选 'linear' || 'ease'
    ease: 'ease',
    //启用hash 默认true 
    hash: true,
    //修改hash字符串，默认'#!/page-'，必须要有 # 符号，程序会自动在hash后面加上当前页的索引
    prevHash: '#!/page-',
    //给当前页加上的class 默认'current'
    currentClass: 'cur',
    //翻页方式 默认'slide',可选 'fade' || 'scroll' || 'slide' || 'rotate' || 'scale'
    transition: 'slide',
    //预加载图片方式 默认'near' 可选 false || 'current' || 'near' || 'all'  
    preload:'near' 
});
```
#### 方法
```
duang.prev();                  //上一张
duang.next();                  //下一张
duang.slide(n);                //第n张
duang.setEase();               //重新设定过渡曲线
duang.freeze(true|false);      //冻结页面转换，冻结后不可响应用户操作（调用slide prev next方法还可以进行）
duang.play();                  //播放幻灯
duang.pause();                 //暂停幻灯
duang.destroy();               //销毁
duang.on(event,callback);
/* 事件绑定
 * event可选值:
 * before 页面切换前
 * after 页面切换后
 * update 页面切换中
 * dragStart 开始拖拽
 * dragMove 拖拽中
 * dragEnd 结束拖拽
 * allImagesDone  所有图片加载完成（针对preload:all）
 * currentImagesDone  当前页面图片加载完成（针对preload:current|near）
 * nearImagesDone  前后页图片加载完成（仅仅针对preload:near）
 */

```

#### 预加载图片
在dom元素上绑定```data-src```属性可以对图片进行预加载，图片加载成功后```<img>```标签会通过```src```属性渲染，非```<img>```标签通过```background-image```渲染（需要在css中限制背景图显示方式）。

配置项里的preload参数可以修改预加载图片方式。'current'预加载当前页的图片，加载完触发'currentImagesDone'事件；'near'预加载当前页和前一页后一页的图片，当前页加载完触发'currentImagesDone'事件，前后页加载完触发'nearImagesDone'事件；'all'预加载所有图片，加载完触发 'allImagesDone'事件。

#### 路由
默认开启路由选项，页面滑动后会改变hash，也可以手动修改hash来跳转页面。
另：在dom元素上加上```data-title```可以在hash改变后更新页面title


## 相关
- [pageSwitch.js](https://github.com/qiqiboy/pageSwitch)
- [zepto.fullpage](https://github.com/yanhaijing/zepto.fullpage)
- [parallax.js](https://github.com/hahnzhu/parallax.js)
- [fullPage.js](https://github.com/alvarotrigo/fullPage.js)
