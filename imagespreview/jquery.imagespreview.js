/**
 * jQuery ImagesPreview v1.0
 * author: zhouz
 * email: 523612913@qq.com
 * date: 2013-09-08
 * github: https://github.com/zhouz1986/imagespreview
 */
;(function($){
    var oper = function(documents, options){
        var _this = this;
        /* 是否清理屏幕无关物件的标识符小于1则进行清理 */
        var _clearMark = 5;
        var _hideOthersIntervalId = null;
		/* 定时检测是否空闲状态 */
        var _hideOthersInterval = function(){
            _hideOthersIntervalId = setInterval(function(){
                _clearMark--;
                if (_clearMark < 1) {
                    _this.hidePageButton();
                    _this.hideButton.animate({ opacity:"hide" }, _this.settings.speed, "swing");
                    window.clearInterval(_hideOthersIntervalId);
                }
            }, 1000);            
        };
        
        /* 当前待预览图片列表的 jQuery 对象 */
        this.list = documents;
        /* 当前预览的容器的唯一ID */
        this.id = "images-preview-fullscreen-"+(Math.random().toString().replace(".", "").substr(0,12));
        /* 当前配置参数 */
        this.settings = $.extend(true, {}, $.fn.imagespreview.defaults, options);
        /* 预览模板 */
        this.tpl = '<div id="'+ this.id +'" class="images-preview-fullscreen-ct"><div class="cover-bg"></div><div class="show-ct"><div class="loader"></div><a class="hide-bt" href="javascript:void(0);"></a><a class="prev-bt preview-page-bt" href="javascript:void(0);"><span class="str"></span></a><a class="next-bt preview-page-bt" href="javascript:void(0);"><span class="str"></span></a><img class="curr-pic" src="" /></div><div class="previews-list"></div></div>';
        /* 当前预览所对应的列表中的对象 */
        this.curr = null;
        /* 当前预览容器的 jQuery 对象 */
        this.container = null;
        /* 全屏预览遮盖层的 jQuery 对象 */
        this.cover = null;
        /* 上一页按钮的 jQuery 对象 */
        this.prevButton = null;
        /* 下一页按钮的 jQuery 对象 */
        this.nextButton = null;
        /* 隐藏全屏预览的 jQuery 对象 */
        this.hideButton = null;
        /* 图片加载进度层的 jQuery 对象 */
        this.loader = null;
        /* 执行浏览器全屏 */
        this.requestFullscreen = function(element){
            if (element.requestFullScreen) {
                element.requestFullScreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            }
        };  
        /* 取消浏览器全屏 */
        this.cancelFullscreen = function(){ 
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        };
        /* 显示预览大图 */
        this.loadPreview = function(it){
            var pic = this.container.find(".curr-pic");
            /* 保存上一张图片的尺寸 */
            var ow = pic.width(), oh = pic.height();
            /* 根据配置情况获取当前要显示的图片链接 */
            var src = this.settings.src == "" ? it.attr("src") : it.data(this.settings.src);
            /* 新建预加载图片的 jQuery 对象 */
            var img = $("<img />");
            /* 显示加载进度 */
            this.loader.show();
            /* 预加载图片并执行动画显示全屏预览图片 */
            img.load(function(){
                /* 图片加载完成后的回调操作，若返回 false 则将中断后续默认操作 */
                if ($.isFunction(_this.settings.loadCallback)) {
                    if (false === _this.settings.loadCallback(this)) return false;
                }
                /* 隐藏加载进度 */
                _this.loader.hide();
                /* 获取当前图片尺寸 */
                var iw = $(this)[0].width, ih = $(this)[0].height;
                /* 屏幕尺寸 */
                var sw = window.screen.width , sh = window.screen.height;
                /* 最终显示的尺寸以及 可支持的显示区域最大高度 */
                var lw = iw, lh = ih, mh = _this.container.find(".show-ct").height();
                /* 如果高度过大则按比例缩放宽度 */
                if (ih > mh) { 
                    lh = mh; lw = (iw/ih)*lh;
                }
                /* 动画全屏显示当前预览图片 */
                pic.css({ width:ow, height:oh }).fadeTo(0,0)
                    .animate({ width:lw, height:lh, marginTop:lh/2*-1, marginLeft:lw/2*-1, opacity:1 }, _this.settings.speed, "swing")
                    .attr("src", src);
            })
            .attr("src", src);
        };
        /* 初始化当前对象的全屏插件配置 */
        this.init = function(){
            /* 将模板转化为 jQuery 对象 */
            this.container = $(this.tpl);
            this.cover = this.container.find(".cover-bg");
            this.loader = this.container.find(".loader");
            this.prevButton = this.container.find(".prev-bt");
            this.nextButton = this.container.find(".next-bt");
            this.hideButton = this.container.find(".hide-bt");
            /* 将模板输出到浏览器 */
            this.container.appendTo("body");
            /* 仅有一张图则不绑定上下页 */
            if (this.list.size() > 1) {
                /* 上一页翻页事件绑定 */
                this.prevButton.on("click", function(){
                    var i = _this.list.index(_this.curr);
                    if (i-1 < 0) {
                        /* 第一页时往上翻页执行回调操作, 若返回 false 则终止默认操作 */
                        if ($.isFunction(_this.settings.firstCallback)) {
                            if (false === _this.settings.firstCallback(_this)) return false;
                        }
                        _this.curr = _this.list.last();
                    }
                    else  {
                        _this.curr = _this.list.eq(i-1);
                    }
                    _this.loadPreview(_this.curr);
                });
                /* 下一页翻页事件绑定 */
                this.nextButton.on("click", function(){
                    var i = _this.list.index(_this.curr);
                    if (i >= _this.list.size()-1) {
                        /* 最后一页执行回调操作, 若返回 false 则终止默认操作 */
                        if ($.isFunction(_this.settings.lastCallback)) {
                            if (false === _this.settings.lastCallback(_this)) return false;
                        }
                        _this.curr = _this.list.first();
                    }
                    else {
                        _this.curr = _this.list.eq(i+1);
                    }
                    _this.loadPreview(_this.curr);
                });
                /* 键盘左右切换事件 */
                $(document).on("keydown.imagespreviewevent", function(e){
                    var e = event || window.event; 
                    var k = e.keyCode || e.which;
                    if (k == 37) _this.prevButton.trigger("click");
                    if (k == 39) _this.nextButton.trigger("click");
                });
            }
            /* 绑定隐藏预览按钮事件 */
            this.hideButton.on("click", function(){
                /* 隐藏预览内容前的回调操作, 若返回 false 则终止默认操作 */
                if ($.isFunction(_this.settings.hideCallback)) {
                    if (false === _this.settings.hideCallback(_this)) return false;
                }
                // 执行隐藏预览窗口的动画
                _this.hidePreview();
                if (_this.settings.hideType == "close") {
                    _this.close();
                }
            });
            /* 开始倒计时判断用户操作是否暂停 */
            _hideOthersInterval();
            /* 当存在任何键盘、鼠标操作事件时显示按钮等 */
            $(document).on("mousemove.imagespreviewevent mouseclick.imagespreviewevent keydown.imagespreviewevent", function(){
                if (_clearMark < 1) {
                    _this.showPageButton();
                    _this.hideButton.animate({ opacity:"show" }, _this.settings.speed, "swing");
                    /* 重新倒计时 */
                    _hideOthersInterval();
                }
                _clearMark = _this.settings.hideTimeout;
            });
            /* 初始化完成后进行回调操作 */
            if ($.isFunction(this.settings.initCallback)) this.settings.initCallback(this);
            return this;
        };
        /* 指定索引 或者 在事件触发列表单元后通过指定当前单元下的图片jQuery对象来自动重置该单元下的图片为当前显示的预览 */
        this.setCurr = function(it){
            var i = 0;
            if ($.isNumeric(it)) {
                it = Math.floor(it);
                i = (it > this.list.size() || it < 0) ? 0 : it;
            }
            else if (! $.isEmptyObject(it)) {
                i = this.list.index(it);
            }
            this.curr = this.list.eq(i < 0 ? 0 : i);
            return this;
        };
        /* 隐藏预览窗口动画 */
        this.hidePreview = function(callback){
            /* 恢复滚动条 */
            $("html,body").css({ overflow:"auto" });
            /* 取消浏览器全屏 */
            if (_this.settings.showType == "fullScreen") _this.cancelFullscreen();
            setTimeout(function(){
                _this.hidePageButton();
                _this.container.find(".curr-pic").animate({ width:0, height:0, marginTop:0, marginLeft:0, opacity:"hide" }, _this.settings.speed, "swing");
                _this.cover.animate({ opacity:0 }, _this.settings.speed, "swing", function(){
                    _this.container.css({ display:"none" });
                    if ($.isFunction(callback)) callback(_this);
                });
            }, 200);
        };
        /* 显示翻页按钮 */
        this.showPageButton = function(){
            _this.prevButton.find(".str").css({ left:_this.prevButton.find(".str").width()*-1 }).animate({ left:0, opacity:"show" }, this.settings.speed, "swing");
            _this.nextButton.find(".str").css({ right:_this.nextButton.find(".str").width()*-1 }).animate({ right:0, opacity:"show" }, this.settings.speed, "swing");
        };
        /* 隐藏翻页按钮 */
        this.hidePageButton = function(){
            _this.prevButton.find(".str").animate({ left:(_this.prevButton.find(".str").width()*-1), opacity:"hide" }, this.settings.speed, "swing");
            _this.nextButton.find(".str").animate({ right:(_this.nextButton.find(".str").width()*-1), opacity:"hide" }, this.settings.speed, "swing");
        };
        /* 显示全屏预览窗口 */
        this.show = function(){
            /* 浏览器进入全屏模式 */
            if (this.settings.showType == "fullScreen") this.requestFullscreen(document.documentElement);
            // 显示全屏遮盖
            this.cover.animate({ opacity: this.settings.opacity }, this.settings.speed, "swing", function(){
                /* 如果列表少于2个则不显示翻页按钮 */
                if (_this.list.size() < 2) {
                    _this.hidePageButton();
                }
                else {
                    _this.showPageButton();
                }
            });
            /* 去除窗口滚动条 */
            $("html,body").css({ overflow:"hidden" });
            // 显示预览区域
            this.container.css({ display:"block" });
            /* 若当前是第一次预览则获取预览列表中第一个预览对象 */
            if (! this.curr) this.curr = this.list.first();
            /* 初始加载第一个预览 */
            this.loadPreview(this.curr);

            return this;
        };
        /* 隐藏不显示全屏预览窗口 */
        this.hide = function(callback){
            /* 隐藏预览内容前的回调操作, 若返回 false 则终止默认操作 */
            if ($.isFunction(_this.settings.hideCallback)) {
                if (false === _this.settings.hideCallback(_this)) return false;
            }
            /* 隐藏当前预览窗口 */
            this.hidePreview();
            return this;
        };
        /* 关闭预览显示后完全注销当前预览对象 */
        this.close = function(){
            // 执行隐藏预览窗口的动画并执行关闭操作
            this.hidePreview(function(){
                /* 隐藏预览内容后, 关闭前的回调操作, 若返回 false 则终止默认操作 */
                if ($.isFunction(_this.settings.closeCallback)) {
                    if (false === _this.settings.closeCallback(_this)) return false;
                }
                $(document).off(".imagespreviewevent");
                window.clearInterval(_hideOthersIntervalId);
                _this.container.remove();
                _this = null;
            });
        };
    };
    /* 全屏预览插件 */
    $.fn.imagespreview = function(options){
        return new oper(this, options);
    };
    /* 全屏预览插件全局配置参数 */
    $.fn.imagespreview.defaults = {
        /* 显示模式, fullScreen: 浏览器全屏预览, normal:普通全屏遮盖预览 */
        showType : "fullScreen", 
        /* 点击右上方关闭按钮时的操作方式，默认 close:为关闭并销毁当前预览, hide:仅隐藏当前预览，下次还可以打开继续浏览必须在外部保存当前预览对象进行操作 */
        hideType : "close",
        /* 指定保存预览图片的 data 存储节点名称, 如: data-src 则此项设置为 src , 
           通过配置此项以兼容延迟加载插件 或 动态添加的大图链接参数等情况:
           由于因延迟加载图片的 src 参数可能为空, 因此指定该项才能正常获取预览图片链接
           默认为空, 将获取 img 的 src 属性值 */
        src : "",
        /* 动画的速度 slow,fast,normal 或者指定时间, 单位:毫秒 */
        speed : "slow",
        /* 设定时间内无鼠标操作事件则自动清理屏幕无关物件隐藏关闭按钮，翻页按钮列表等. 单位:秒 */
        hideTimeout : 5,
        /* 背景色透明度 */
        opacity : .9,
        /* 当前预览加载完成后动画展示图片之前的回调操作, 若回调函数返回 false 将终止默认操作 callback(this), 可在此时更新当前图片的附加信息 */
        loadCallback : $.noop,
        /* 预览整体初始化完成后第一次显示前的回调操作 callback(this) 可在此时新增预览的附加信息或布局等 */
        initCallback : $.noop,
        /* 预览隐藏前的回调操作, 默认仅隐藏当前预览内容, 若回调函数返回 false 将终止默认操作 callback(this) */
        hideCallback : $.noop,
        /* 预览隐藏后, 关闭前的回调操作, 默认隐藏后直接完全注销掉当前预览对象, 若回调函数返回 false 将终止默认操作 callback(this) */
        closeCallback : $.noop,
        /* 第一页继续向上翻页时的回调操作, 默认切换至最后一个, 若回调函数返回 false 将终止默认操作 callback(this) */
        firstCallback : $.noop,
        /* 最后一页的回调操作, 默认切换至第一个, 若回调函数返回 false 将终止默认操作 callback(this) */
        lastCallback : $.noop
    };
})(jQuery);
