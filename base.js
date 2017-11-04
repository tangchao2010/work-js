var MSG_SYSTEM_ERROR = '系统错误！';
var MSG_SAVE_SUCCESS = '保存成功！';
var MSG_DELETE_SUCCESS = '删除成功！';
var NOT_SELECTED_ONE_RECORD = '请选择一条记录操作！';

var booleanArr = [{'id': '1', 'name': '是'}, {'id': '0', 'name': '否'}];
var statusArr = [{'id': '0', 'name': '有效'}, {'id': '1', 'name': '无效'}];
var searchAllArr = [{'id': '', 'name': '全部'}];
var comboEditOption = {
    method: 'get',
    editable: true,
    panelHeight: 'auto',
    valueField: 'id',
    textField: 'name'
};
var comboOption = {
    method: 'get',
    //required: false,
    editable: false,
    panelHeight: 'auto',
    valueField: 'id',
    textField: 'name'
};
var widthComboOption = {
    //required: false,
    //editable: false,
    panelWidth: 180,
    panelHeight: 'auto',
    valueField: 'id',
    textField: 'name'
};
var comboRequiredOption = {
    method: 'get',
    required: true,
    editable: false,
    panelHeight: 'auto',
    valueField: 'id',
    textField: 'name'
};
var mulComboOption = {
    method: 'get',
    editable: false,
    multiple: true,
    panelHeight: 'auto',
    valueField: 'id',
    textField: 'name'
};

function datetimeFormat(val, row) {
    if (isNaN(val)) {
        return val;
    }
    return getLocalTime(val);
}

function dateFormat(nS, row) {
    if (nS == '' || nS == 0 || nS == null) {
        return '';
    }
    if (isNaN(nS)) {
        return nS;
    }
    return moment(parseInt(nS) * 1000).format("YYYY-MM-DD");
}

function getLocalTime(nS) {
    if (nS == '' || nS == 0 || nS == null) {
        return '';
    }
    return moment(parseInt(nS) * 1000).format("YYYY-MM-DD HH:mm:ss");
}

(function ($) {
    /**
     * holmes ajax
     *
     * @public
     * @param {object} context object (page)
     * @param {object}  {name: "getList", uri: "/app/path"}
     * @param {object}  {id: "getList", st: 1403582777701, et...}
     * @param {[object]} A set of key/value pairs that configure the Ajax request
     *
     * @return {string} string text that is truncated to
     */
    $.sendAjax = function (page, url, data, settings) {
        var name = url.name;
        var uri = url.uri;

        //data = $.extend(data, { method: uri });
        settings = settings || {};

        var successFn = page['on' + name + 'Done'] || function () {
            };
        var failedFn = page['on' + name + 'Failed'] || function () {
            };
        var redirectFn = page['on' + name + 'Redirect'] || function () {
            };

        // ajax 接口如下：
        // onbefore[NAME], on[NAME], on[NAME]Done, on[NAME]Failed
        return $.ajax(uri, {
            data: data,
            cache: settings.cache || false,
            beforeSend: $.proxy(page['onbefore' + name], page),
            success: function (result, textStatus, jqXHR) {
                try {
                    // result = JSON.parse(jqXHR.responseText);
                    // 取消使用 JSON.parse, 对返回内容限制太多（必须是标准 json）
                    // 由于我们 web 端返回比较可控，所以可以取消类型检查
                    result = (new Function("return (" + jqXHR.responseText + ")"))();
                    if (result.code === 0 || result.code > 3) {
                        // 调用成功函数，传递数据，同时传递状态码
                        successFn && successFn.call(page, result.data, data);
                    }
                    // 状态为1，表示失败
                    else if (result.code === 1) {
                        failedFn && failedFn.call(page, result.msg, result.data || {});
                    }
                    // 状态为2，表示重定向至某个地址
                    else if (result.code === 2) {
                        window.location = result.data;
                    } else if (result.code == 3) {
                        redirectFn && redirectFn.call(page, result, data)
                    } else if (result.totalPages >= 0) {
                        successFn && successFn.call(page, result, data);
                    }

                } catch (e) {
                    if (!!console.error) {
                        console.error(e);
                    }
                    failedFn && failedFn.call(page, "系统错误，请稍候再试…", {});
                }
            },
            error: function (jqXHR) {
                if (jqXHR.status != 0 && failedFn) {
                    failedFn && failedFn.call(page, "系统错误，请稍候再试…", {});
                    // failedFn("系统错误，请稍候再试…");
                }
            },
            type: settings.type || 'post'
        });

    };

    $.applyStyle = function (css) {
        var head = document.getElementsByTagName('head')[0];

        var style = document.createElement('style');

        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    };

    /**
     * Ace Engine Template
     * 一套基于HTML和JS语法自由穿插的模板系统
     * http://code.google.com/p/ace-engine/wiki/AceTemplate
     * @author 王集鹄(wangjihu，http://weibo.com/zswang) 鲁亚然(luyaran，http://weibo.com/zinkey)
     * @version 2011-07-06
     * @copyright (c) 2011, Baidu Inc, All rights reserved.
     */
    (function () {
        var AceTemplate = AceTemplate || {};

        /* Debug Start */
        var logger = {
            /**
             * 打印日志
             * @param {Object} text 日志文本
             */
            log: function (text) {
                /*
                 var dom = document.getElementById("log");
                 if (dom) {
                 dom.value += text + "\n";
                 }
                 */
                window.console && console.log(text)
            }
        };
        /* Debug End */

        var htmlDecodeDict = {
            "#39": "'",
            "quot": '"',
            "lt": "<",
            "gt": ">",
            "amp": "&",
            "nbsp": " "
        };
        var htmlEncodeDict = {
            "'": "#39",
            '"': "quot",
            "<": "lt",
            ">": "gt",
            "&": "amp",
            " ": "nbsp"
        };
        var lib = {
            /**
             * 通过id获得DOM对象
             * @param {String} id
             */
            g: function (id) {
                if (typeof id != "string") return id;
                return document.getElementById(id);
            },
            /**
             * HTML解码
             * @param {String} html
             */
            decodeHTML: function (html) {
                return String(html).replace(/&(#39|quot|lt|gt|amp|nbsp);/ig, function (all, key) {
                    return htmlDecodeDict[key];
                }).replace(/&#u([a-f\d]{4});/ig, function (all, hex) {
                    return String.fromCharCode(parseInt("0x" + hex));
                }).replace(/&#(\d+);/ig, function (all, number) {
                    return String.fromCharCode(+number);
                });
            },
            /**
             * HTML DOM 属性编码
             * @param {String} html
             */
            encodeAttr: function (html) {
                return String(html).replace(/["']/g, function (all) {
                    return "&" + htmlEncodeDict[all] + ";";
                });
            },
            /**
             * HTML编码
             * @param {String} html
             */
            encodeHTML: function (html) {
                return String(html).replace(/['"<>& ]/g, function (all) {
                    return "&" + htmlEncodeDict[all] + ";";
                });
            },
            /**
             * 获得元素文本
             * @param {Element} element
             */
            elementText: function (element) {
                if (!element || !element.tagName) return "";
                if (/^(input|textarea)$/i.test(element.tagName)) return element.value;
                return lib.decodeHTML(element.innerHTML);
            }
        };

        /**
         * 解析器缓存
         */
        var readerCaches = {};

        /**
         * 是否注册了所有模板
         */
        var registerAll = false;

        /**
         * 构造模板的处理函数
         * 不是JS块的规则
         *  非主流字符开头
         *      示例：汉字、#{value}、<div>
         *      正则：/^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$/mg
         *  html标记结束，如：
         *      示例：>、src="1.gif" />
         *      正则：/^.*[<>]\s*$/mg
         *  没有“双引号、单引号、分号、逗号，大小括号”，不是else等单行语句、如：
         *      示例：hello world
         *      正则：/^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$/mg
         *  属性表达式
         *      示例：a="12" b="45"、a='ab' b="cd"
         *      正则：/^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$/mg
         *  样式表达式
         *      示例：div.focus{color: #fff;}、#btnAdd span{}
         *      正则：/^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$/mg
         * @param {String} template 模板字符
         */

        function analyse(template) {
            var body = [],
                processItem = [];
            body.push("with(this){");
            body.push(template.replace(/[\r\n]+/g, "\n") // 去掉多余的换行，并且去掉IE中困扰人的\r
                .replace(/^\n+|\s+$/mg, "") // 去掉空行，首部空行，尾部空白
                .replace(/((^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$|^.*[<>]\s*$|^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$|^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$|^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$)\s?)+/mg, function (expression) { // 输出原文
                    expression = ['"', expression.replace(/&none;/g, "") // 空字符
                        .replace(/["'\\]/g, "\\$&") // 处理转义符
                        .replace(/\n/g, "\\n") // 处理回车转义符
                        .replace(/(!?!?#)\{(.*?)\}/g, function (all, flag, template) { // 变量替换
                            template = template.replace(/\\n/g, "\n").replace(/\\([\\'"])/g, "$1"); // 还原转义
                            var identifier = /^[a-z$][\w+$]+$/i.test(template) && !(/^(true|false|NaN|null|this)$/.test(template)); // 单纯变量，加一个未定义保护
                            return ['",', identifier ? ['typeof ', template, '=="undefined"?"":'].join("") : "", (flag == "#" ? '_encode_' : flag == "!!#" ? '_encodeAttr_' : ''), '(', template, '),"'].join("");
                        }), '"'].join("").replace(/^"",|,""$/g, "");
                    if (expression) return ['_output_.push(', expression, ');'].join("");
                    else return "";
                }));
            body.push("}");
            var result = new Function("_output_", "_encode_", "helper", "_encodeAttr_", body.join(""));
            /* Debug Start */
            //logger.log(String(result));
            /* Debug End */
            return result;
        }

        /**
         * 格式化输出
         * @param {String|Element} id 模板ID或是模板本身(非标识符将识别为模板本身)
         * @param {Object} data 格式化的数据，默认为空字符串
         * @param {Object} helper 附加数据(默认为模板对象)
         */
        AceTemplate.format = function (id, data, helper) {
            if (!id) return "";
            var reader, element;
            if (typeof id == "object" && id.tagName) { // 如果是Dom对象
                element = id;
                id = element.getAttribute("id");
            }
            helper = helper || this; // 默认附加数据
            reader = readerCaches[id]; // 优先读取缓存
            if (!reader) { // 缓存中未出现
                if (!/[^\w-]/.test(id)) { // 合法的标识符按id读取
                    if (!element) {
                        element = lib.g(id);
                    }
                    reader = this.register(id, element);
                } else {
                    reader = analyse(id);
                }
            }
            var output = [];
            reader.call(data || "", output, lib.encodeHTML, helper, lib.encodeAttr);
            return output.join("");
        };

        /**
         * 注册模板，如果没有参数则是注册所有script标签模板
         * @param {String} id 模板ID
         * @param {Element|String} target 模板对象或者是模板字符串，如果没有则默认获取id对应的DOM对象
         */
        AceTemplate.register = function (id, target) {
            if (!arguments.length && !registerAll) { // 无参数并且没有注册过
                registerAll = true;
                var scripts = document.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    var script = scripts[i];
                    if (/^(text\/template)$/i.test(script.getAttribute("type"))) {
                        var id = script.getAttribute("id");
                        id && arguments.callee.call(this, id, script);
                    }
                }
            }
            if (!id) return;
            if (readerCaches[id]) { // 如果已经注册
                return readerCaches[id];
            }
            if (typeof target != "string") {
                if (typeof target == "undefined") {
                    target = lib.g(id);
                }
                target = lib.elementText(target);
            }
            return readerCaches[id] = analyse(target);
        };

        /**
         * 注销模板
         * @param {String} id 模板ID
         */
        AceTemplate.unregister = function (id) {
            delete readerCaches[id];
        };

        /**
         * 去掉标签之间的空白字符，如"</td>   <td>"、"</p>    <div>"
         */
        if (AceTemplate.format) {
            AceTemplate._format = AceTemplate.format;
            AceTemplate.format = function (id, data, helper) {
                var ret = AceTemplate._format(id, data, helper);
                return String(ret).replace(/(.+?)>\s*<(.+?)/g, '$1><$2');
            };
        }

        $.AceTemplate = AceTemplate;
    })();

    window.docCookies = {
        getItem: function (sKey) {
            if (!sKey) {
                return null;
            }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) {
                return false;
            }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            if (!sKey) {
                return false;
            }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
                aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
            }
            return aKeys;
        }
    };

    // 简单扩展一下 format，兼容旧代码
    $.utility = {

        isPhoneNumber: function (num) {
            var reg = /^0?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

            return reg.test(num);
        },

        execAnimOnce: function (ele, x) {
            $(ele).removeClass().addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass();
            });
        },

        /**
         * 对目标字符串进行格式化，同时添加对encode的支持，!{0}保持原有；#{0}html encode； #{0, 10} truncat length
         *
         * @public
         * @name h.format
         * @function
         * @grammar h.format(source, opts)
         * @param {string} source 目标字符串
         * @param {Object|string...} opts 提供相应数据的对象或多个字符串
         * @remark
         *
         opts参数为"Object"时，替换目标字符串中的#{property name}部分。<br>
         opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。
         * @shortcut h.format
         * @meta standard
         *
         * @returns {string} 格式化后的字符串
         */
        format: function (source, opts) {
            source = String(source);
            var data = Array.prototype.slice.call(arguments, 1),
                toString = Object.prototype.toString;
            if (data.length) {
                data = data.length == 1 ? /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                    (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data;
                return source.replace(/(#|!)\{(.+?)(?:\s*,\s*(\d+?))*?\}/g, function (match, type, key, length) {
                    var replacer = data[key];
                    // chrome 下 typeof /a/ == 'function'
                    if ('[object Function]' == toString.call(replacer)) {
                        replacer = replacer(key);
                    }
                    if (length) {
                        replacer = $.holmes.utils.truncate(replacer, length);
                    }
                    //html encode
                    if (type == "!") {
                        replacer = $.holmes.utils.encodeHTML(replacer);
                    }
                    return ('undefined' == typeof replacer ? '' : replacer);
                });
            }
            return source;
        },
        /**
         * Truncate string
         *
         * @public
         * @param {string} str the source string text
         * @param {number} length determine how many characters to truncate to
         * @param {string} truncateStr this is a text string that replaces the truncated text, tts length is not included in the truncation length setting
         * @param {[type]} middle this determines whether the truncation happens at the end of the string with false, or in the middle of the string with true
         *
         * @return {string} string text that is truncated to
         */
        truncate: function (str, length, truncateStr, middle) {
            if (str == null) {
                return '';
            }

            str = String(str);

            if (typeof middle !== 'undefined') {
                middle = truncateStr;
                truncateStr = '...';
            } else {
                truncateStr = truncateStr || '...';
            }

            length = ~~length;
            if (!middle) {
                return str.length > length ? str.slice(0, length) + truncateStr : str;
            } else {
                return str.length > length ? str.slice(0, length / 2) + truncateStr + str.slice(-length / 2) : str;
            }
        },
        encodeHTML: function (str) {
            return str && str.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        numberFormat: function () {
            this.formatNumber = function (num) {
                if (num == null) {
                    return '';
                }
                if (num == '--') {
                    return num;
                }
                if (isNaN(parseFloat(num))) {
                    return num;
                }
                return T.i18n.number.format(num, T.i18n.currentLocale)
            };
            this.formatRatio = function (num) {
                if (num == null) {
                    return '';
                }
                if (num == '--') {
                    return num;
                }
                if (isNaN(parseFloat(num))) {
                    return num;
                }
                return T.i18n.number.format(num, T.i18n.currentLocale) + '%'
            };
            //格式化时间
            this.formatTime = function (second, type) {
                var dd, hh, mm, ss, result;
                if (second == '--') {
                    return second;
                }

                if (type == 2) {
                    //时间的另一种表示法： 22'11"
                    mm = second / 60 | 0;
                    ss = Math.round(second) - mm * 60;
                    var ret = "";
                    if (mm) {
                        ret += mm + "&#039;";
                    }
                    ret += ss + "&quot;";
                    return ret;
                }

                //先处理天
                dd = second / (24 * 3600) | 0;
                second = Math.round(second) - dd * 24 * 3600;
                //接着是小时
                hh = second / 3600 | 0;
                second = Math.round(second) - hh * 3600;
                //之后是分
                mm = second / 60 | 0;
                //最后是秒
                ss = Math.round(second) - mm * 60;

                if (Math.round(dd) < 10) {
                    dd = dd > 0 ? '0' + dd : '';
                }
                if (Math.round(hh) < 10) {
                    hh = '0' + hh;
                }
                if (Math.round(mm) < 10) {
                    mm = '0' + mm;
                }
                if (Math.round(ss) < 10) {
                    ss = '0' + ss;
                }
                if (dd) {
                    result = dd + ' ' + hh + ':' + mm + ':' + ss;
                } else {
                    result = hh + ':' + mm + ':' + ss;
                }
                return result;
            };
        },
        filterChinese: function (str) {
            var reg = /[\u4E00-\u9FA5]/g;

            if (reg.test(str)) {
                return str.match(reg);
            }
            else {
                return [];
            }
        },
        filterNumbers: function (str) {
            var reg = /[0-9]/g;

            if (reg.test(str)) {
                return str.match(reg);
            }
            else {
                return [];
            }
        },
        isUrl: function (url) {
            return /^((https|http|ftp|rtsp|mms)?:\/\/)?(([\w-]+\.)+[a-z]{2,6}|((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d))(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i.test(url);
        },
        isUrlWithoutPrefix: function (url) {
            return new RegExp("^((https|http|ftp|rtsp|mms)?://)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|" + "([0-9a-z_!~*'()-]+\.)*" + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})" + "(:[0-9]{1,4})?" + "((/?)|" + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$", 'i').test(url);
        }
    };

})(jQuery);