/**
 * 
 * @cchen
 * @date    2017-06-05 
 * @version 2.0
 * @plugin Toast
 */
;
(function(root, factory) {
    root.autoLoadMore = factory();

})(window, function() {
    var autoLoadMore = function(options) {
        this.opt = {};
        this.raf = '';
        this.ajax_flag = 0;
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
        this.extend(options);
        this.$scrollerEle = $(this.opt.scrollerEle);
        this.init();
    };
    autoLoadMore.prototype = {
        extend: function(options) {
            var defaults = {
            	scrollerEle: '#scroller-wrapper',
            	listEle: '.thelist',
                tipsPadding: 10,
                tipsFontColor: '#777',
                tipsFontSize: 12,
                tipsBackground: 'transparent',
                start_page: 2,
                ajax_type: 'GET',
                ajax_url: '',
                ajax_data: {},
                finishTips: '已没有更多数据',
                requestSuccess: function(){}
            };
            var key;
            for (key in options) {
                var defaultVal = defaults[key];
                var optionVal = options[key];
                if (optionVal == defaultVal) {
                    continue;
                } else if (optionVal !== undefined) {
                    defaults[key] = optionVal;
                }

            }
            this.opt = defaults;

        },
        init: function() {
        	var addCssByStyle = function(cssString){  

			    var doc=document;  
			    var style=doc.createElement("style");  
			    style.setAttribute("type", "text/css");  
			  
			    if(style.styleSheet){// IE  
			        style.styleSheet.cssText = cssString;  
			    } else {// w3c  
			        var cssText = doc.createTextNode(cssString);  
			        style.appendChild(cssText);  
			    }  
			  
			    var heads = doc.getElementsByTagName("head");  
			    if(heads.length)  
			        heads[0].appendChild(style);  
			    else  
			        doc.documentElement.appendChild(style);  
			};
			var debounce = function(func, wait, immediate) {
				var timeout;
				return function() {
					var context = this, args = arguments;
					var later = function() {
						timeout = null;
						if (!immediate) func.apply(context, args);
					};
					var callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) func.apply(context, args);
				};
			};

            var _this = this;
            var eleH = _this.$scrollerEle.height();
            var loaderGif = '<div class="ball-clip-rotate"><div></div></div>'; 
            var addloadTpl = '<div class="add-loading" style="padding:'+_this.opt.tipsPadding+'px 0;background-color:'+_this.opt.tipsBackground+';text-align:center;color:'+_this.opt.tipsFontColor+';font-size:'+_this.opt.tipsFontSize+'">'+loaderGif+'加载中...</div>';
            addCssByStyle('.ball-clip-rotate{display:inline-block;margin-right:5px;vertical-align:middle;}.ball-clip-rotate>div{border-radius:100%;margin:2px;border:2px solid #ccc;border-bottom-color:transparent;height:16px;width:16px;background:0 0!important;display:inline-block;-webkit-animation:rotate .75s 0s linear infinite;animation:rotate .75s 0s linear infinite;}@keyframes rotate{0%{transform:rotate(0deg);}50%{transform:rotate(180deg);}100%{transform:rotate(360deg);}}@-webkit-keyframes rotate{0%{-webkit-transform:rotate(0deg);}50%{-webkit-transform:rotate(180deg);}100%{-webkit-transform:rotate(360deg);}}');

            var scrollHandler = debounce(function() {
                var $scroller = _this.$scrollerEle;
                var topPos = parseFloat($scroller.scrollTop().toFixed(2));
                var $thelist = _this.$scrollerEle.find('.thelist');
                var listH = parseInt($thelist.height());
                var dif = listH - eleH;
                var data = _this.opt.ajax_data;
                data.page = _this.opt.start_page;
                if (dif > 10 && topPos > dif - 150 && _this.ajax_flag == 0) {
                    _this.ajax_flag = 1;
                    if(!$('.add-loading').get(0)){
                        $scroller.append(addloadTpl);
                        var loaderH = $('.add-loading').innerHeight();
                        $scroller.animate({ 'scrollTop': (loaderH+topPos) + 'px' }, 300);
                    }
                    $.ajax({
                        type: _this.opt.ajax_type,
                        url: _this.opt.ajax_url,
                        data: data,
                        dataType: 'json',
                        success: function(res) {
                            if (res.error == 0) {
                        		_this.opt.requestSuccess(res);
                                if (res.data != null && res.data.length > 0) {
                                    _this.ajax_flag = 0;
                                }
                                else{
                                     $thelist.next().html(_this.opt.finishTips);
                                    _this.ajax_flag = 1;
                                }
                                _this.opt.start_page++;
                            } else {
                                $thelist.next().html(_this.opt.finishTips);
                                _this.ajax_flag = 1;
                            }
                        }
                    });
                }
            }, 200);
            _this.$scrollerEle.on('scroll', scrollHandler);
        },
        updateData: function(key,val){
            var _this = this;
            _this.opt.ajax_data[key] = val;
        },
        resetPage: function(){
            var _this = this;
            _this.opt.start_page = 2;
            _this.ajax_flag = 0;
        }
    };
    return autoLoadMore;
});