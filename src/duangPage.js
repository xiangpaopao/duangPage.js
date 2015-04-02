/*
 * duangPage.js 1.0.0
 * @author xiangpaopao
 * @github https://github.com/xiangpaopao/duangPage.js
 * 参考了 https://github.com/qiqiboy/pageSwitch
 */
;(function(w, struct, undefined){
    "use strict";
    var lastTime=0,
        nextFrame=w.requestAnimationFrame            ||
                w.webkitRequestAnimationFrame        ||
                w.mozRequestAnimationFrame           ||
                w.msRequestAnimationFrame,
        cancelFrame=w.cancelAnimationFrame           ||
                w.webkitCancelAnimationFrame         ||
                w.webkitCancelRequestAnimationFrame  ||
                w.mozCancelRequestAnimationFrame     ||
                w.msCancelRequestAnimationFrame,
        isTouch=("createTouch" in document) || ('ontouchstart' in window),
        EVENT='PointerEvent' in w ?
            "pointerdown pointermove pointerup pointercancel" :
            isTouch ? "touchstart touchmove touchend touchcancel" :
            "mousedown mousemove mouseup",
        STARTEVENT=EVENT.split(" ")[0],
        MOVEEVENT=EVENT.split(" ").slice(1).join(" "),
        divstyle=document.documentElement.style,
        camelCase=function(str){
            return (str+'').replace(/^-ms-/, 'ms-').replace(/-([a-z]|[0-9])/ig, function(all, letter){
                return (letter+'').toUpperCase();
            });
        },
        cssVendor=function(){
            var tests="-webkit- -moz- -ms-".split(" "),
                prop;
            while(prop=tests.shift()){
                if(camelCase(prop+'transform') in divstyle){
                    return prop;
                }
            }
            return '';
        }(),
        cssTest=function(name){
            var prop=camelCase(name),
                _prop=camelCase(cssVendor+prop);
            return (prop in divstyle) && prop || (_prop in divstyle) && _prop || '';
        },
        opacity=cssTest('opacity'),
        transform=cssTest('transform'),
        perspective=cssTest('perspective'),
        backfaceVisibility=cssTest('backface-visibility'),
        toString=Object.prototype.toString,
        class2type={},
        EASE={
            linear:function(t,b,c,d){ return c*t/d + b; },
            ease:function(t,b,c,d){ return -c * ((t=t/d-1)*t*t*t - 1) + b; }
        },
        TRANSITION={
            /* 更改切换效果
             * @param Float percent 过度百分比
             * @param int tpageIndex 上一个页面次序。注意，该值可能非法，所以需要测试是否存在该页面
             */
            fade:function(percent,tpageIndex){
                var cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex];
                if(opacity){
                    cpage.style.opacity=1-Math.abs(percent);
                    if(tpage){
                        tpage.style.opacity=Math.abs(percent);
                    }
                }else{
                    cpage.style.filter='alpha(opacity='+(1-Math.abs(percent))*100+')';
                    if(tpage){
                        tpage.style.filter='alpha(opacity='+Math.abs(percent)*100+')';
                    }
                }
            }
        }

    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(index, name){
        class2type["[object "+name+"]"]=name.toLowerCase();
    });

    $.each("X Y ".split(" "),function(index, name){
        var XY={X:'left',Y:'top'};

        TRANSITION['scroll'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                prop=name||['X','Y'][dir];
            if(transform){
                cpage.style[transform]='translate'+prop+'('+percent*100+'%)'+fire3D;
                if(tpage){
                    tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)'+fire3D;
                }
            }else{
                prop=XY[prop];
                cpage.style[prop]=percent*100+'%';
                if(tpage){
                    tpage.style[prop]=tpage.percent*100+'%';
                }
            }
        }

        TRANSITION['slide'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                prop=name||['X','Y'][dir];
            if(transform){
                if(percent<0){
                    cpage.style[transform]='translate'+prop+'('+percent*100+'%)'+fire3D;
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[transform]='scale('+((1-tpage.percent)*.2+.8)+')'+fire3D;
                        tpage.style.zIndex=0;
                    }
                }else{
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)'+fire3D;
                        tpage.style.zIndex=1;
                    }
                    cpage.style[transform]='scale('+((1-percent)*.2+.8)+')'+fire3D;
                    cpage.style.zIndex=0;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['rotate'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                fix=percent>0?dir?-1:1:dir?1:-1,
                prop=name||['X','Y'][1-dir];
            if(perspective){
                cpage.style[backfaceVisibility]='hidden';
                cpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(percent)*180*fix+'deg)'+fire3D;
                if(tpage){
                    tpage.style[backfaceVisibility]='hidden';
                    tpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(tpage.percent)*180*-fix+'deg)'+fire3D;
                }
            }else TRANSITION['slide'+name].apply(this,arguments);
        }

        TRANSITION['scale'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                fire3D=perspective?' translateZ(0)':'',
                prop=name;
            if(transform){
                cpage.style[transform]='scale'+prop+'('+(1-Math.abs(percent))+')';+fire3D
                cpage.style.zIndex=percent<0?1:0;
                if(tpage){
                    tpage.style[transform]='scale'+prop+'('+Math.abs(percent)+')'+fire3D;
                    tpage.style.zIndex=percent<0?0:1;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

    });

    function filterEvent(oldEvent){
        var ev={};

        $.each("clientX clientY type".split(" "),function(index,prop){
            ev[prop]=oldEvent[prop];
        });

        ev.oldEvent=oldEvent;

        ev.target=oldEvent.target||oldEvent.srcElement||document.documentElement;
        if(ev.target.nodeType===3){
            ev.target=ev.target.parentNode;
        }

        ev.preventDefault=function(){
            oldEvent.preventDefault && oldEvent.preventDefault();
            ev.returnValue=oldEvent.returnValue=false;
        }

        if(oldEvent.touches && oldEvent.touches.length){
            ev.clientX=oldEvent.touches.item(0).clientX;
            ev.clientY=oldEvent.touches.item(0).clientY;
        }

        ev.touchNum=oldEvent.touches&&oldEvent.touches.length||0;

        return ev;
    }


    struct.prototype={
        constructor:struct,
        latestTime:0,
        init:function(config){
            var self=this,
                handler=function(ev){
                    !self.frozen && self.handleEvent(ev);
                }
            this.events={};
            this.duration=isNaN(parseInt(config.duration))?600:parseInt(config.duration);
            this.direction=parseInt(config.direction)==0?0:1;
            this.loop=!!config.loop;
            this.interval=parseInt(config.interval)||5000;
            this.playing=!!config.autoplay;
            this.pages=$(this.container).children();
            this.length=this.pages.length;
            this.currentClass=config.currentClass || 'current';
            this.hash = config.hash;
            this.prevHash = config.prevHash || '#!/page-';
            this.preload = config.preload || 'near';
            this.current = 0;
            this.prevIndex;

            var pathIndex = parseInt(w.location.hash.replace(this.prevHash, ''));
            if(this.hash)this.current= (pathIndex > this.length ? this.length : pathIndex)  || parseInt(config.start);

            $(this.container).on(STARTEVENT+" click",handler)
            $(document).on(MOVEEVENT,handler)

            this.setEase(config.ease);
            this.setTransition(config.transition);

            $.each(this.pages,function(index,page){
                var style=page.style;
                $.each("position:absolute;top:0;left:0;width:100%;height:100%;display:none".split(";"),function(index,css){
                    var ret=css.split(":");
                    style[ret[0]]=ret[1];
                });
                page.percent=0;
            });

            this.pages[this.current].style.display='block';
            this.fire('after');
            if(this.hash)this.bindHashChange();
            //预加载图片的方式
            if(this.preload)this.loadImages(this.preload);
        },
        setEase:function(ease){
            this.ease=$.isFunction(ease)?ease:EASE[ease]||EASE.ease;
            return this;
        },
        addEase:function(name,func){
            $.isFunction(func) && (EASE[name]=func);
            return this;
        },
        setTransition:function(transition){
            this.transite=$.isFunction(transition)?transition:TRANSITION[transition]||TRANSITION.slide;
            return this;
        },
        addTransition:function(name,func){
            $.isFunction(func) && (TRANSITION[name]=func);
            return this;
        },
        on:function(ev,callback){
            var self=this;
            if($.type(ev)=='object'){
                each(ev,function(ev,callback){
                    self.on(ev,callback);
                });
            }else{
                if(!this.events[ev]){
                    this.events[ev]=[];
                }
                this.events[ev].push(callback);
            }
            return this;
        },
        /*
        * 为什么此处after后percnet会变成当前索引
        * */
        fire:function(ev,percent,tpageIndex){

            var self=this,
                args=[].slice.call(arguments,1);
            if(ev=='update'){
                this.pages[this.current].percent=percent;
                if(this.pages[tpageIndex]){
                    this.pages[tpageIndex].percent=percent>0?percent-1:1+percent;
                }
                this.transite.apply(this,args);
            }

            if(ev=='after'){
                this.pages[this.current].className = this.pages[this.current].className +' ' +this.currentClass;
            }

            $.each(this.events[ev]||[],function(index,func){
                if($.isFunction(func)){
                    func.apply(self,args);
                }
            });
            return this;
        },
        freeze:function(able){
            this.frozen=$.type(able)=='undefined'?true:!!able;
            return this;
        },
        slide:function(index){
            var self=this,
                dir=this.direction,
                duration=this.duration,
                stime=+new Date,
                ease=this.ease,
                current=this.current,
                fixIndex=Math.min(this.length-1,Math.max(0,this.fixIndex(index))),
                cpage,tpage,tpageIndex,percent;

            cpage=this.pages[fixIndex];
            tpage=this.pages[tpageIndex=this.fixIndex(fixIndex==current?fixIndex+(cpage.percent>0?-1:1):current)];

            $.each(this.pages,function(index,page){
                if(index!=fixIndex&&index!=tpageIndex){
                    page.style.display='none';
                }
            });

            if(cpage.style.display=='none'){
                cpage.style.display='block';
                percent=index>current?1:-1;
            }else{
                percent=cpage.percent;
            }
            duration*=Math.abs(percent);
            this.fire('before',current,fixIndex);
            this.current=fixIndex;
            cancelFrame(this.timer);
            this.latestTime=stime;
            ani();

            function ani(){
                var offset=Math.min(duration,+new Date-stime),
                    s=duration?ease(offset,0,1,duration):1,
                    cp=percent*(1-s);
                    self.fire('update',cp,tpageIndex);
                if(offset==duration){
                    if(tpage){
                        tpage.style.display='none';
                    }
                    self.fire('after',fixIndex,current);
                    delete self.timer;
                }else{
                    self.timer=nextFrame(ani);
                }
            }
            return this;
        },
        prev:function(){
            return this.slide(this.current-1);
        },
        next:function(){
            return this.slide(this.current+1);
        },
        play:function(){
            this.playing=true;
            return this.slide(this.current);
        },
        pause:function(){
            this.playing=false;
            clearTimeout(this.playTimer);
            return this;
        },
        fixIndex:function(index){
            return this.length>1&&this.loop?(this.length+index)%this.length:index;
        },
        bindHashChange: function() {
            var self = this;
            w.addEventListener('hashchange', function() {
                var page = w.location.hash.replace(self.prevHash, '');
                //处理用户可能再次自定义hash的情况
                if (parseInt(page).toString()==page){
                    self.slide(page);
                }
            });

        },
        getHash: function() {
            return w.location.hash;
        },
        setHash: function(hash, title) {
            w.location.hash = hash;
            if (title) {
                document.title = title;
            }
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent);

            switch(ev.type.toLowerCase()){
                case 'mousemove':
                case 'touchmove':
                case 'pointermove':
                    if(this.rect&&ev.touchNum<2){
                        var rect=[ev.clientX,ev.clientY],
                            dir=this.direction,
                            offset=rect[dir]-this.rect[dir],
                            cpage=this.pages[this.current],
                            total=cpage['offset'+['Width','Height'][dir]],
                            tpage,tpageIndex,_tpage,percent;
                        if(this.drag==null && this.rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>=Math.abs(rect[1-dir]-this.rect[1-dir]);
                            this.drag && this.fire('dragStart');
                        }
                        if(this.drag){
                            percent=this.percent+(total&&offset/total);
                            tpage=this.pages[tpageIndex=this.fixIndex(this.current+(percent>0?-1:1))];
                            _tpage=this.pages[this.fixIndex(this.current+(percent>0?1:-1))];
                            if(tpage){
                                tpage.style.display='block';
                            }else{
                                percent/=3;
                            }
                            if(_tpage&&_tpage!=tpage){
                                _tpage.style.display='none';
                            }
                            this.fire('update',percent,tpageIndex);
                            this._offset=offset;
                            ev.preventDefault();
                        }
                        this.prevIndex = this.current;
                    }
                    break;

                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                case 'mouseup':
                case 'touchend':
                case 'touchcancel':
                case 'pointerup':
                case 'pointercancel':
                    var self=this,
                        cpage=this.pages[this.current],
                        index=this.current,
                        recover=this._offset||this.timer,
                        nn;
                    if(!this.time||ev.touchNum){
                        nn=ev.target.nodeName.toLowerCase();
                        cancelFrame(this.timer);
                        this.rect=[ev.clientX,ev.clientY];
                        this.percent=this.pages[this.current].percent;
                        this.time=+new Date;
                        if(!isTouch && (nn=='a' || nn=='img')){
                            ev.preventDefault();
                        }
                    }else{
                        if(this.drag==true){
                            if(+new Date-this.time<500 && Math.abs(this._offset)>30){
                                index+=this._offset>0?-1:1;
                            }else if(Math.abs(cpage.percent)>.5){
                                index+=cpage.percent>0?-1:1;
                            }
                            this.fire('dragEnd');
                            ev.preventDefault();
                        }
                        if(this.time){
                            $.each("rect drag time timer percnet _offset".split(" "),function(index,prop){
                                delete self[prop];
                            });
                            if(recover){
                                //避免出现setHash后 两次触发after事件
                                if(!this.hash){
                                    this.slide(index);
                                }else if ((this.prevIndex == index) || (index<0) || (index > this.length - 1)) {
                                    this.slide(index);
                                }else{
                                    var _Max = (this.current > index) ? -1 : 1;
                                    this.setHash(this.prevHash + index, this.pages[this.current + _Max].dataset.title);
                                }
                            }
                        }
                        break;
                    }

                case 'click':
                    if(this.timer){
                        ev.preventDefault();
                    }
                    break;
            }
        },
        loadImages: function (type) {
            //type =  'current' || 'near' || 'all'
            //TODO:预加载这块目前的实现方式感觉有点挫 有待改进
            var self = this;
            function load($elems,fireEvent){
                var i = 0;
                if ($elems.length==0){
                    self.fire(fireEvent)
                    return;
                }
                $.each($elems,function(index,item){
                    var me = this,
                        img = new Image();
                    img.src =this.getAttribute('data-src');
                    function resolve(){
                        i++;
                        if (i>=$elems.length)self.fire(fireEvent)
                        img = null;
                    }
                    img.onload = function() {
                        (me.tagName == 'IMG') ? (me.src = img.src) : (me.style.backgroundImage = 'url('+img.src+')');
                        me.removeAttribute('data-src');
                        resolve();
                    };
                    img.onerror = function() {
                        if(me.tagName == 'IMG') me.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                        me.removeAttribute('data-src');
                        resolve();
                    }

                })

            }

            function afterFuc(){
                var $page = $(self.pages[self.current]);
                var $elems = $page.find('*[data-src]');
                if ($page.data('src')) $elems = $.extend($elems,$page);
                load($elems,'currentImagesDone');
            }

            function nearFuc(){
                afterFuc();
                var $prev = $(self.pages[self.current-1]),
                    $next = $(self.pages[self.current+1]),
                    $elems = $prev.find('*[data-src]').concat($next.find('*[data-src]'));
                if ($prev.data('src')) $elems = $elems.concat($prev);
                if ($next.data('src')) $elems = $elems.concat($next);
                load($elems,'nearImagesDone');
            }

            switch(type){
                case 'current':
                    self.on('after',afterFuc);
                    afterFuc();
                    break;
                case 'near':
                    self.on('after',nearFuc);
                    nearFuc();
                    break;
                case 'all':
                    load($(this.container).find('*[data-src]'),'allImagesDone')
                    break;
            }

        }
        
    }
    
    $.each("Ease Transition".split(" "),function(index,name){
        struct['add'+name]=struct.prototype['add'+name];
    });

    w.duangPage=struct;
})(window, function(wrap,config){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(wrap,config);
    }
    
    this.container=typeof wrap=='string'?document.getElementById(wrap):wrap;
    this.init(config||{});
});
