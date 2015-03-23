# duangPage.js
移动端单屏展示库，支持多种动画、页面路由等功能，参考了 [pageSwitch.js](https://github.com/qiqiboy/pageSwitch) 移除对桌面老浏览器的支持，增加了图片预加载和路由功能。


## 示例
```
var duang = new duangPage('pages', {
    duration: 800,
    start: 0,
    direction: 1,
    loop: false,
    ease: 'ease',
    hash: true,
    currentClass: 'cur',
    transition: 'slide',
    preload:'near' //预加载图片方式 | 当前页'current' | 当前页和前一页后一页 'near' | 所有 'all'  
});
//调用方法
duang.prev();                  //上一张
duang.next();                  //下一张
duang.slide(n);                //第n张
duang.setEase();               //重新设定过渡曲线
duang.freeze(true|false);      //冻结页面转换，冻结后不可响应用户操作（调用slide prev next方法还可以进行）
duang.play();                  //播放幻灯
duang.pause();                 //暂停幻灯
duang.destroy();               //销毁

/* 事件绑定
 * event可选值:
 * 
 * before 页面切换前
 * after 页面切换后
 * update 页面切换中
 * dragStart 开始拖拽
 * dragMove 拖拽中
 * dragEnd 结束拖拽
 * allImagesDone  所有图片加载完成（针对preload:near）
 * currentImagesDone  当前页面图片加载完成（针对preload:current|near）
 * nearImagesDone  所有图片加载完成（仅仅针对preload:all）
 */
duang.on(event,callback);
```




## 参考
- [pageSwitch.js](https://github.com/qiqiboy/pageSwitch)
- [zepto.fullpage](https://github.com/yanhaijing/zepto.fullpage)
- [parallax.js](https://github.com/hahnzhu/parallax.js)
- [fullPage.js](https://github.com/alvarotrigo/fullPage.js)
