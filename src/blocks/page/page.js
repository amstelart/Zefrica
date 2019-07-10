(function () {
    var callbacks = {
        onInit: function () {
        },
        onStart: function () {
        },
        onStop: function () {
        },
        onEnd: function () {
        },
        onChangeStart: function () {
        },
        onChangeEnd: function () {
        }
    };

    var base = {
        stopped: true,
        timezone: 0,
        diff: null,
        isEnd: false
    };

    var PsgTimer = function (selector, options) {
        var timer = this;
        if (selector.nodeType === Node.ELEMENT_NODE) {
            timer.container = $(selector);
        } else if (typeof selector === 'string') {
            timer.selector = selector;
            timer.container = $(timer.selector);
        } else if (typeof selector === 'object') {
            options = selector;
            timer.selector = options.selector;
            timer.container = $(timer.selector);
        }

        timer.options = $.extend({}, {
            selector: '#psgTimer',
            animation: false,
            multipleBlocks: false,
            endDateTime: undefined,
            // currentDateTime: window.serverTime['U'] * 1000 || Date.now(),
            currentDateTime: Date.now(),
            labels: {
                days:     timer.container.attr('data-label-days')    ? timer.container.attr('data-label-days') : false,
                hours:    timer.container.attr('data-label-hours')   ? timer.container.attr('data-label-hours') : false,
                minutes:  timer.container.attr('data-label-minutes') ? timer.container.attr('data-label-minutes') : false,
                seconds:  timer.container.attr('data-label-seconds') ? timer.container.attr('data-label-seconds') : false
            }
        }, options);

        timer.callbacks = timer.options.callbacks = $.extend({}, callbacks, timer.options.callbacks);
        timer.base = $.extend({}, base);

        if (typeof timer.options.endDateTime === 'string') {
            timer.options.endDateTime = setTimerEndFromString(timer, timer.options.endDateTime);
        }

        timer.container.length ? timer.init() : console.log('No timer element on this page');
    };

    PsgTimer.prototype.init = function () {
        var timer = this,
            options = this.options;

        var timerEnd = timer.container.attr('data-timer-end');

        if (timerEnd !== undefined) {
            options.endDateTime = setTimerEndFromString(timer, timerEnd);
        }

        // options.endDateTime = options.endDateTime + (timer.base.timezone * 1000 * 60 * 60);

        timer.countdown = transformCountToArray(getCurrentCountDown(timer), options.multilpeBlocks);

        timer.container.addClass('psgTimer').append(createMarkup(timer));
        if (options.animation) {
            timer.container.addClass('psgTimer_' + options.animation);
        }

        timer.query = setQueries(timer);
        timer.callbacks.onInit();

        if (!timer.base.isEnd) {
            timer.start();
        }
    };

    PsgTimer.prototype.start = function () {
        var timer = this;

        if (timer.base.stopped) {
            timer.base.stopped = false;

            timer.intervalId = setInterval(function () {
                updateCounter(timer);
            }, 1000);

            timer.callbacks.onStart();
        }
    };

    PsgTimer.prototype.restart = function () {
        var timer = this;
        timer.options.currentDateTime = Date.now();
        timer.start();
    };

    PsgTimer.prototype.stop = function () {
        var timer = this;
        timer.base.stopped = true;
        clearTimeout(timer.intervalId);

        timer.callbacks.onStop();
    };


    var getCurrentCountDown = function (timer) {
        var options = timer.options;
        var base = timer.base;

        options.currentDateTime = options.currentDateTime + 1001;
        base.diff = options.endDateTime - options.currentDateTime;

        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var days = 0;

        if (base.diff > 0) {
            var total = parseFloat(((((base.diff / 1000.0) / 60.0) / 60.0) / 24.0));
            days = parseInt(total);
            total -= days;
            total *= 24.0;
            hours = parseInt(total);
            total -= hours;
            total *= 60.0;
            minutes = parseInt(total);
            total -= minutes;
            total *= 60;
            seconds = parseInt(total);
        } else {
            timer.callbacks.onEnd();
            timer.stop();
            timer.base.isEnd = true;
        }

        return {
            days: {
                amount: days,
                max: Infinity,
                className: 'days'
            },
            hours: {
                amount: hours,
                max: 24,
                className: 'hours'
            },
            minutes: {
                amount: minutes,
                max: 60,
                className: 'minutes'
            },
            seconds: {
                amount: seconds,
                max: 60,
                className: 'seconds'
            }
        }
    };

    var transformCountToArray = function (count, multilpeBlocks) {
        if (typeof count === 'object') {
            for (var unit in count) {
                if (count.hasOwnProperty(unit)) {
                    count[unit].amount = count[unit].amount.toString();

                    if (count[unit].amount.length < 2) {
                        count[unit].amount = '0' + count[unit].amount;
                    }

                    if (multilpeBlocks) {
                        count[unit].amount = count[unit].amount.split('');
                    } else {
                        count[unit].amount = [count[unit].amount];
                    }
                }
            }
        }

        return count;
    };

    var getTimeZone = function (string) {
        var hours, minutes;
        var number = string.replace(/\D/g, '');
        var digit = string.replace(/[^+-]/g, '');
        var multiplier = digit === '-' ? (-1) : 1;

        if (number.length >= 3) {
            hours = Number(number.substr(0, number.length - 2));
            minutes = Number(number.substr(number.length - 2, 2));
        } else {
            hours = Number(number);
            minutes = 0;
        }

        return (hours + minutes/60) * multiplier;
    };

    var setTimerEndFromString = function (timer, endTimeString) {
        var timerDate = {};
        var timerEnd = endTimeString.split(' ');
        var endTime;

        var timeExp = /^([0-1]\d|2[0-3])(:[0-5]\d){1,2}$/;
        var dateExp = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
        var zoneExp = /(UTC|GMT)[+-](\d{1,2}([:,.]?\d{2})?)/;

        for (var i = 0; i < timerEnd.length; i++) {
            if (timerEnd[i].match(timeExp)) {
                timerDate.time = timerEnd[i].split(':');
            } else if (timerEnd[i].match(dateExp)) {
                timerDate.date = timerEnd[i].split('.');
            } else if (timerEnd[i].match(zoneExp)) {
                timer.base.timezone = getTimeZone(timerEnd[i]);
            } else {
                console.log('Wrong end time.');
            }
        }

        timerDate.year = parseInt(timerDate.date[2]) || 0;
        timerDate.month = parseInt(timerDate.date[1]) - 1 || 0;
        timerDate.day = parseInt(timerDate.date[0]) || 0;
        timerDate.hours = parseInt(timerDate.time[0]) || 0;
        timerDate.minutes = parseInt(timerDate.time[1]) || 0;
        timerDate.seconds = parseInt(timerDate.time[2]) || 0;
        timerDate.miliseconds = parseInt(timerDate.time[3]) || 0;

        endTime = Date.UTC(timerDate.year, timerDate.month, timerDate.day, timerDate.hours, timerDate.minutes, timerDate.seconds, timerDate.miliseconds);

        return endTime;
    };

    var createMarkup = function (timer) {
        var countdown = timer.countdown;
        var markup = {};

        for (var unit in countdown) {
            if (countdown.hasOwnProperty(unit)) {
                var numberBlocks = '';
                countdown[unit].amount.forEach(function (num) {
                    numberBlocks += numberContainer(timer, num);
                });

                markup.unit += '<div class="' + countdown[unit].className + ' psgTimer_unit">' + numberBlocks + '</div>';
            }
        }

        markup.numbers = '<div class="psgTimer_numbers">' + markup.unit + '</div>';
        markup.full = markup.numbers;

        if (
            timer.options.labels &&
            timer.options.labels.days &&
            timer.options.labels.hours &&
            timer.options.labels.minutes &&
            timer.options.labels.seconds
        ) {
            var labels = timer.options.labels;
            markup.labels = '<div class="psgTimer_labels">' +
                '<div class="days">' + labels.days + '</div>' +
                '<div class="hours">' + labels.hours + '</div>' +
                '<div class="minutes">' + labels.minutes + '</div>' +
                '<div class="seconds">' + labels.seconds + '</div>' +
                '</div>';
            markup.full = markup.numbers + markup.labels;
        } else {

            markup.full = markup.numbers;
        }

        return markup.full;
    };

    var numberContainer = function (timer, num) {
        var markup = '',
            data = 'data-number="' + num + '"';

        var numberBlock = '<div class="number" ' + data + '>' + num + '</div>';

        if (timer.options.animation === 'fade') {
            markup = '<div>' + numberBlock + '</div>';
        } else {
            markup = numberBlock;
        }

        return markup;
    };

    var setQueries = function (timer) {
        var countdown = timer.countdown,
            query = {};

        for (var unit in countdown) {
            if (countdown.hasOwnProperty(unit)) {
                query[unit] = timer.container.find(numberSelector(timer, countdown[unit].className));
            }
        }

        return query;
    };

    var numberSelector = function (timer, className) {
        var selector = '';

        if (timer.options.animation === 'fade') {
            selector = '.' + className + ' .number';
        } else {
            selector = '.' + className + ' .number';
        }

        return selector;
    };

    var updateCounter = function (timer) {
        timer.callbacks.onChangeStart();

        timer.countdown = transformCountToArray(getCurrentCountDown(timer), timer.options.multilpeBlocks);

        for (var unit in timer.countdown) {
            if (timer.countdown.hasOwnProperty(unit)) {
                timer.countdown[unit].amount.forEach(function (number, index) {
                    if (timer.query[unit][index].getAttribute('data-number') !== number) {
                        aminate(timer.query[unit][index], number, timer.options.animation);
                    }
                });
            }
        }

        timer.callbacks.onChangeEnd();
    };

    var aminate = function (el, value, animationType) {
        var $el = $(el);
        $el.attr('data-number', value);

        if (animationType === 'fade') {
            animation.fade($el, value);
        } else {
            $el.html(value);
        }
    };

    var animation = {
        fade: function ($el, value) {
            var animDuration = 350;

            $el.css({
               'transition': 'opacity ' + animDuration + 'ms',
                'opacity': '0'
            });

            setTimeout(function () {
                $el.html(value).css('opacity', 1);
            }, animDuration + 10);
        }
    };

    window.PsgTimer = PsgTimer;
})();


/**
 * Parallax Background version 1.3
 * https://github.com/erensuleymanoglu/parallax-background
 *
 * by Eren Suleymanoglu
 */
!function(a){"use strict";function e(){return!(!/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)&&!/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))}!function(){for(var a=0,e=["ms","moz","webkit","o"],t=0;t<e.length&&!window.requestAnimationFrame;++t)window.requestAnimationFrame=window[e[t]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[e[t]+"CancelAnimationFrame"]||window[e[t]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(e){var t=(new Date).getTime(),i=Math.max(0,16-(t-a)),r=window.setTimeout(function(){e(t+i)},i);return a=t+i,r}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}(),a.fn.isOnScreen=function(){var e=a(window),t={top:e.scrollTop(),left:e.scrollLeft()};t.right=t.left+e.width(),t.bottom=t.top+e.height();var i=this.offset();return i.right=i.left+this.outerWidth(),i.bottom=i.top+this.outerHeight(),!(t.right<i.left||t.left>i.right||t.bottom<i.top||t.top>i.bottom)},a.fn.parallaxBackground=function(t){return this.each(function(){function i(a){return x=a.outerWidth(),s=a.outerHeight(),v=A.height(),D=A.width(),e()&&(j=2),"left"!==R.parallaxDirection&&"right"!==R.parallaxDirection||(x+=j*Math.ceil(D*parseFloat(R.parallaxSpeed))),"up"!==R.parallaxDirection&&"down"!==R.parallaxDirection||(s+=j*Math.ceil(v*parseFloat(R.parallaxSpeed))),[x,s]}function r(a,e){switch(w=parseInt(a.css("padding-left").replace("px","")),f=parseInt(a.css("padding-right").replace("px","")),u=parseInt(a.css("padding-top").replace("px","")),h=parseInt(a.css("padding-bottom").replace("px","")),b=(e[1]-a.outerHeight())/2,k=(e[0]-a.outerWidth())/2,R.parallaxDirection){case"up":case"down":S=-w,q=-(b+u),B=0;break;case"left":case"right":S=-(k+w),q=-u,B=0}return[S,q,B]}function n(a){switch(z=a.offset(),R.parallaxDirection){case"up":z=z.top;break;case"down":z=z.top+a.outerHeight();break;case"left":z=z.left+a.outerWidth();break;case"right":z=z.left}return parseFloat(z)}function o(a){return A.scrollTop()-a}var l,p,c,s,d,m,g,x,u,h,w,f,b,k,v,D,z,y,F=a(this),A=a(window),S=0,q=0,B=0,T=0,j=1,I={parallaxBgImage:"",parallaxBgPosition:"center center",parallaxBgRepeat:"no-repeat",parallaxBgSize:"cover",parallaxSpeed:.5,parallaxDirection:"up"},H=F.data(),R=a.extend({},I,t,H);R.parallaxSpeed>1?R.parallaxSpeed=1:R.parallaxSpeed<0&&(R.parallaxSpeed=0),F.find(".parallax-inner").length<1&&F.prepend('<div class="parallax-inner"></div>'),l=F.find(".parallax-inner"),p=i(F),c=r(F,p),F.css({position:"relative",background:"transparent",overflow:"hidden","z-index":"1"}),l.css({position:"absolute","background-image":"url("+R.parallaxBgImage+")","background-position":R.parallaxBgPosition,"background-repeat":R.parallaxBgRepeat,"background-size":R.parallaxBgSize,width:p[0],height:p[1],transform:"translate3d("+c[0]+"px, "+c[1]+"px, "+c[2]+"px)",transition:"transform 100ms","z-index":"-1"}),A.on("resize",function(){p=i(F),c=r(F,p),l.css({width:p[0],height:p[1],transform:"translate3d("+c[0]+"px, "+c[1]+"px, "+c[2]+"px)"})}),"left"!==R.parallaxDirection&&"right"!==R.parallaxDirection||(d=0,m=c[0]),"up"!==R.parallaxDirection&&"down"!==R.parallaxDirection||(d=0,m=c[1]),y=A.scrollTop(),A.on("scroll",function(){y>0&&(T=o(y)),y=A.scrollTop(),F.isOnScreen()?(d=T*(parseFloat(R.parallaxSpeed)/4),"up"===R.parallaxDirection&&n(F)>n(l)+50&&(m+=-d,g="translate3d("+c[0]+"px, "+m+"px, "+c[2]+"px)"),"down"===R.parallaxDirection&&n(F)+50<n(l)&&(m+=d,g="translate3d("+c[0]+"px, "+m+"px, "+c[2]+"px)"),"left"===R.parallaxDirection&&n(F)+50<n(l)&&(g="translate3d("+(m+=d)+"px, "+c[1]+"px, "+c[2]+"px)"),"right"===R.parallaxDirection&&n(F)>n(l)+50&&(g="translate3d("+(m+=-d)+"px, "+c[1]+"px, "+c[2]+"px)"),l.css({width:p[0],height:p[1],transform:g})):("up"!==R.parallaxDirection&&"down"!==R.parallaxDirection||(m=c[1]),"left"!==R.parallaxDirection&&"right"!==R.parallaxDirection||(m=c[0]),l.css({width:p[0],height:p[1],transform:"translate3d("+c[0]+"px, "+c[1]+"px, "+c[2]+"px)"}))})})}}(jQuery);

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b,c=navigator.userAgent,d=/iphone/i.test(c),e=/chrome/i.test(c),f=/android/i.test(c);a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},a.fn.extend({caret:function(a,b){var c;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof a?(b="number"==typeof b?b:a,this.each(function(){this.setSelectionRange?this.setSelectionRange(a,b):this.createTextRange&&(c=this.createTextRange(),c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select())})):(this[0].setSelectionRange?(a=this[0].selectionStart,b=this[0].selectionEnd):document.selection&&document.selection.createRange&&(c=document.selection.createRange(),a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length),{begin:a,end:b})},unmask:function(){return this.trigger("unmask")},mask:function(c,g){var h,i,j,k,l,m,n,o;if(!c&&this.length>0){h=a(this[0]);var p=h.data(a.mask.dataName);return p?p():void 0}return g=a.extend({autoclear:a.mask.autoclear,placeholder:a.mask.placeholder,completed:null},g),i=a.mask.definitions,j=[],k=n=c.length,l=null,a.each(c.split(""),function(a,b){"?"==b?(n--,k=a):i[b]?(j.push(new RegExp(i[b])),null===l&&(l=j.length-1),k>a&&(m=j.length-1)):j.push(null)}),this.trigger("unmask").each(function(){function h(){if(g.completed){for(var a=l;m>=a;a++)if(j[a]&&C[a]===p(a))return;g.completed.call(B)}}function p(a){return g.placeholder.charAt(a<g.placeholder.length?a:0)}function q(a){for(;++a<n&&!j[a];);return a}function r(a){for(;--a>=0&&!j[a];);return a}function s(a,b){var c,d;if(!(0>a)){for(c=a,d=q(b);n>c;c++)if(j[c]){if(!(n>d&&j[c].test(C[d])))break;C[c]=C[d],C[d]=p(d),d=q(d)}z(),B.caret(Math.max(l,a))}}function t(a){var b,c,d,e;for(b=a,c=p(a);n>b;b++)if(j[b]){if(d=q(b),e=C[b],C[b]=c,!(n>d&&j[d].test(e)))break;c=e}}function u(){var a=B.val(),b=B.caret();if(o&&o.length&&o.length>a.length){for(A(!0);b.begin>0&&!j[b.begin-1];)b.begin--;if(0===b.begin)for(;b.begin<l&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}else{for(A(!0);b.begin<n&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}h()}function v(){A(),B.val()!=E&&B.change()}function w(a){if(!B.prop("readonly")){var b,c,e,f=a.which||a.keyCode;o=B.val(),8===f||46===f||d&&127===f?(b=B.caret(),c=b.begin,e=b.end,e-c===0&&(c=46!==f?r(c):e=q(c-1),e=46===f?q(e):e),y(c,e),s(c,e-1),a.preventDefault()):13===f?v.call(this,a):27===f&&(B.val(E),B.caret(0,A()),a.preventDefault())}}function x(b){if(!B.prop("readonly")){var c,d,e,g=b.which||b.keyCode,i=B.caret();if(!(b.ctrlKey||b.altKey||b.metaKey||32>g)&&g&&13!==g){if(i.end-i.begin!==0&&(y(i.begin,i.end),s(i.begin,i.end-1)),c=q(i.begin-1),n>c&&(d=String.fromCharCode(g),j[c].test(d))){if(t(c),C[c]=d,z(),e=q(c),f){var k=function(){a.proxy(a.fn.caret,B,e)()};setTimeout(k,0)}else B.caret(e);i.begin<=m&&h()}b.preventDefault()}}}function y(a,b){var c;for(c=a;b>c&&n>c;c++)j[c]&&(C[c]=p(c))}function z(){B.val(C.join(""))}function A(a){var b,c,d,e=B.val(),f=-1;for(b=0,d=0;n>b;b++)if(j[b]){for(C[b]=p(b);d++<e.length;)if(c=e.charAt(d-1),j[b].test(c)){C[b]=c,f=b;break}if(d>e.length){y(b+1,n);break}}else C[b]===e.charAt(d)&&d++,k>b&&(f=b);return a?z():k>f+1?g.autoclear||C.join("")===D?(B.val()&&B.val(""),y(0,n)):z():(z(),B.val(B.val().substring(0,f+1))),k?b:l}var B=a(this),C=a.map(c.split(""),function(a,b){return"?"!=a?i[a]?p(b):a:void 0}),D=C.join(""),E=B.val();B.data(a.mask.dataName,function(){return a.map(C,function(a,b){return j[b]&&a!=p(b)?a:null}).join("")}),B.one("unmask",function(){B.off(".mask").removeData(a.mask.dataName)}).on("focus.mask",function(){if(!B.prop("readonly")){clearTimeout(b);var a;E=B.val(),a=A(),b=setTimeout(function(){B.get(0)===document.activeElement&&(z(),a==c.replace("?","").length?B.caret(0,a):B.caret(a))},10)}}).on("blur.mask",v).on("keydown.mask",w).on("keypress.mask",x).on("input.mask paste.mask",function(){B.prop("readonly")||setTimeout(function(){var a=A(!0);B.caret(a),h()},0)}),e&&f&&B.off("input.mask").on("input.mask",u),A()})}})});
