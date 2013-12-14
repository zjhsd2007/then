/**
 * @fileoverview 果果的JS库
 * @author 果牛
 **/
(function(Here, _empty) {
	if ('thenjs' in Here) {
		return
	}
	var Super,
	$,
	DOM,
	_$,
	SuperNodes,
	load,
	domReady,
	importer,
	basePath,
	abbr = {},
	waitImports = [],
	obj_events = {},
	r_fxval = /^\s*([\.\d]+)(\D+)?\s*$/,
	r_class = /^[A-Z]\w*Class$/,
	r_replace = /\{\s*#([^\}#\s]+)\s*\}/g,
	is_html = /<[^>]+>/,
	r_word = /[^, ]+/g,
	r_trim = /^\s+|\s+$/g,
	r_query = /([^=;&?# ]+)\s*=\s*([^=;&?#]+)/g,
	r_hasUnit = /[^\.0-9+\-]/,
	r_defPx = /width|height|margin|padding|left|top|bottom|right|size|spacing|indent|radius/i,
	r_stats = /checked|selected|disabled/i,
	IDKEY = 'data-then-guid',
	SgKey = '/Singleton/',
	UK = 'then_quid',
	Fn = Function,
	MR = Math.random,
	utos = Fn('v', "return v || ''"),
	_guid = ( + new Date()) % 1024 + 9e4,
	arr_slice = Array.prototype.slice,
	has_own = Object.prototype.hasOwnProperty,
	UA = navigator.userAgent.toLowerCase(),
	cb_css = {
		msie: '',
		firefox: '-moz-',
		opera: '-o-',
		chrome: '-webkit-'
	};
	function NOP(x) {
		return x
	}
	//设置对象toString时返回的内容
	function to_string(o, str) {
		o.toString = Fn('return "' + str + '"')
	}
	//构建一个类
	function build_class(f, p) {
		f = $.func(f, Fn());
		f.prototype = Object(p);
		f.prototype.constructor = f;
		return f
	}
	//将参数转换成数组
	function _A() {
		return arr_slice.call.apply(arr_slice, arguments)
	}
	//复制一个对象的副本
	function copy(a) {
		var i = a.length,
		b = [];
		for (; i--;) {
			b[i] = a[i]
		}
		return b
	}
	//合并两个对象，并返回一个新对象
	function merge(a, b) {
		var r = $.isArray(a) ? a.slice() : [a];
		for (var i = 0, j = b.length; i < j; i++) {
			r.push(b[i])
		}
		return r
	}
	//返回对象指定的属性，如果属性不存在，则返回空数组，如果有第三个参数，则追加到返回结果中
	function group(obj, g, v) {
		if (! (g in obj)) {
			obj[g] = []
		}
		var a = obj[g];
		if (arguments.length > 2) {
			a.push(v)
		}
		return a
	}
    //创建一个构造函数
	function Constructor(name, single) {
		function Class() {
			var p = this.constructor,
			a = _A(arguments);
			if (a[0] !== Constructor) {
				return new Class(Constructor, a)
			}
			if (single) {
				if (p[SgKey]) {
					return p[SgKey]
				} else {
					p[SgKey] = this
				}
			}
			this.guid = $.guid(name);
			obj_events[this.guid] = {};
			this.__init__.apply(this, a[1]);
			this.init.apply(this, a[1])
		}
		to_string(Class, '[class ' + name + ']');
		Class.extend = Super.extend;
		return Class
	}
    /*
    * @name $
    * @class 当第一个参数为function时，在文档节点加载完毕后执行a，并设置其作域为b,否则作为选择器，并返回相应的选择结果，当b存在，则在节点b中查找a,否则返回选择a查询的结果
    *
    * */
	$ = function(a, b) {
		return $.isFunction(a) ? domReady(a.bind(b)) : (b ? _$(b).find(a) : _$(a))
	};
	//设置$函数的toString时返回的内容[thenQ]
	to_string($, '[thenQ]'); 

	//创建isFunction,isString,isArray,isRegExp,isNumber,isDate方法
	(function(t) {
		for (var i = t.length; i--;) {
			$['is' + t[i]] = new Fn('t', 'return Object(t) instanceof ' + t[i])
		}
	})('Function,String,Array,RegExp,Number,Date'.split(','));

    /*
    *   @name func
    *   @return {function}
    *   @desc 根据参数返回不同的函数，f为函数时返回，否则d为函数的时候，返回d，否则返回空函数
    *   @param {function|others} f 如果f为function，返回f
    *   @param {function|others} d 如果f不为function,而d为function,返回 d，否则返回空函数NOP
    * */
	$.func = function(f, d) {
		return $.isFunction(f) ? f: ($.isFunction(d) ? d: NOP)
	};

    /*
    *   @name each
    *   @desc 遍历一个对象，并将其值，索引，原对象作为参数传到指定的函数中，当返回false时，停止遍历
    *   @param {Object} o 被遍历的对象
    *   @param {Function} f 处理函数
    *   @param {Object} w 作用域
    *   @param {Boolean} 用于决定是否将继承过来的属性也同样遍历
    * */
	$.each = function(o, f, w, m) {
		for (var k in (o || {})) {
			if (m || has_own.call(o, k)) {
				if (false === f.call(w, o[k], k, o)) {
					break
				}
			}
		}
		return w
	};
	/*
	*	@name extend
	*   @return {Object}
	*	@desc 扩展一个对象，并返回扩展后的对象
	*	@param {Object} a 被扩展的对象
	* 	@param {Object} arguments需要扩展对a对象上的属性和方法
	*	@param {Boolean}  arguments 最后一个参数，用于决定是否覆盖已存在的属性和方法
	*	@example
	*	var a = {b:1},b = {b:2},c = {c:3};
	*	$.extend(a,b,false) ==> a.b //1
	*	$.extend(a,b,true) ==> a.b //2
	*	$.extend(a,b,c,false) ==> a.c //3
	*/
	$.extend = function(a) {
		if (a) {
			var A = arguments,
			j = A.length,
			n = A[j - 1] === false,//如果最后一个参数明确定为false(n的值为true),则不覆盖已存在属性或方法
			cy = function(v, k) {
				if (!n || !(k in a)) { //注意这里的逻辑
					a[k] = v
				}
			};
			for (var i = 1; i < j; i++) {
				$.each(A[i], cy)
			}
		}
		return a
	};

	//给function实例扩展方法，不覆盖已存在的方法
	$.extend(Fn.prototype, /*@lends Function.prototype*/{
		/*
		*	@name bind
		*	@desc 绑定函数并设置其作用域
		*	@param {Object} o作用域
		*	@example 
		*	var a = function(){ return this.b};
		*	var c = {b:2};
		*  	var d = a.bind(c);
		*	d() ==> 2
		*/
		bind: function(o) {
			var f = this,
			args = _A(arguments, 1);
			return function() {
				return f.apply(o, args.concat(_A(arguments)))
			}
		}
	},false);

    //给Array实例扩展方法，不覆盖已存在的方法
	$.extend(Array.prototype, /*@lends Array.prototype*/{
        /*
        *   @name forEach
        *   @return {Array}
        *   @desc 遍历数组
        *   @param {Function} f 处理数组元素的方法
        *   @param {Object} o 作用域
        *   @example
        *   var a = [1,2,3];
        *   a.forEach(function(item,i){ alert(item+1)}) ==>2,3,4
        * */
		forEach: function(f, o) {
			var i = 0,
			j = this.length;
			for (; i < j; i++) {
				if (i in this) {
					f.call(o, this[i], i, this)
				}
			}
		},

        /*
        *   @name map
        *   @return {Array}
        *   @desc 遍历一个数组，返回一个装载处理结果的新数组
        *   @param {Function} f 处理数组元素的方法
        *   @param {Object} o 作用域
        *   @example
        *   var a = [1,2,3];
        *   a.forEach(function(item,i){ return item+1;}) ==> [2,3,4]
        * */
		map: function(f, o) {
			var i = 0,
			r = [],
			j = this.length;
			for (; i < j; i++) {
				if (i in this) {
					r[i] = f.call(o, this[i], i, this)
				}
			}
			return r
		},
        /*
        *   @name filter
        *   @return {Array}
        *   @desc 过滤一个数组，返回一个装载处理结果为true的元素的集合
        *   @param {Function} f 处理数组元素的方法
        *   @param {Object} o 作用域
        *   @example
        *   [1,2,3,4,5].filter(function(x){ return x > 2}); ==> [3,4,5]
        * */

 		filter: function(f, o) {
			var i = 0,
			r = [],
			j = this.length;
			for (; i < j; i++) {
				if (f.call(o, this[i], i, this)) {
					r.push(this[i])
				}
			}
			return r
		},
        /*
        *   @name indexOf
        *   @return {Number}
        *   @desc 查找一个指定的元素在数组中的索引，如果没有找到，则返回-1,
        *   @param {any} v 用于查找的指定元素
        *   @param {Number} s 查找的起始位置,如果s为负值，则s为length+s，length为数组的长度，如果length+s还是为负值，则s为0
        * */
		indexOf: function(v, s) {
			var j = this.length,
			k = parseInt(s, 10) || 0,
			i = k >= 0 ? k: Math.max(0, j + k);
			for (; i < j; i++) {
				if (i in this && this[i] === v) {
					return i
				}
			}
			return - 1
		},

        /*
        *   @name reduce
        *   @return 任意数据
        *   @desc 遍历一个数组或对象，并用累计处理，如果数组的长度为1的时候，将会报错
        *   @param {Function} fn 处理函数
        *   @param {any} b 可选，如果b不存在，则为数组中的第一个值
        *   @example
        *   [1,2,3,4].reduce(function(x,y){ return x+y }); ==> 10 (1+2+3+4)
        * */
		reduce: function(fn, b) {
			var i = 0,
			j = this.length;
			if (arguments.length == 1) {
				for (; i < j; i++) {
					if (i in this) {
						b = this[i];//设置b的初始值
						break
					}
				}
				if (++i >= j) {
					throw Error('reduce error');
				}
			}
			for (; i < j; i++) {
				if (i in this) {
					b = fn.call(null, b, this[i], i, this)//累计处理
				}
			}
			return b
		}
	},false);

    //给Date实例扩展方法，不覆盖已存在的方法
	$.extend(Date, /*@lends Date*/{
        /*
        *   @name now
        *   @return {Number}
        *   @desc 返回现在距离1970年1月1日午夜的毫秒数
        * */
		now: function() {
			return new Date().getTime()
		}
	},false);

    //给String实例扩展方法，不覆盖已存在的方法
	$.extend(String.prototype,/*@lends String.prototype*/ {
        /*
        *   @name trim
        *   @return {String}
        *   @desc 去掉字符串首尾的空格
        * */
		trim: function() {
			return this.replace(r_trim, '')
		}
	},false);

    /*
    *   @name guid
    *   @return {String}
    *   @desc 根据传入的参数，返回一个以该参数为首的不重复字符串，用作产生唯一标示符
    * */
	$.guid = function(h) {
		return (h || 'then') + '_e' + (++_guid).toString(16) + ((MR() * 9e5) >>> 0).toString(16)
	};
    /*
    * 设置或获取__hash__中的属性
    * */
	function Data(k, v, c) {
		var old = this.__hash__[k];
		if (arguments.length > 1) {
			v = c ? (old + v) : v;//c决定是否累计
			this.__hash__[k] = v; //设置新值
			this.fireEvent(k + 'Change', v, old);//解发change事件
			return this
		} else {
			return old  //获取值
		}
	}
	public_class = $.Class = function() {
		var single,
		name,
		n0,
		_super,
		des,
		_class,
		exec,
		base = Super,
		exts = [],
		when = [];
		_A(arguments).forEach(function(a) {
			if ($.isArray(a) || $.ready === a || $.isTask(a)) {
				exec = when = when.concat(a)
			} else if ($.isString(a)) {
				n0 = name = a.trim()
			} else if (a === true) {
				single = true
			} else if (typeof a == 'object' || $.isFunction(a)) {
				exts.push(a);
				_super = a.Extends || _super
			}
		});
		if (name) {
            //类名必须为大写字母开头Class结尾
			name = (name.match(r_class) || [])[0];
			if (!name) {
				throw Error('Invalid class name "' + n0 + '"');
			}
		}
		if (_super) {
			_super = $.isString(_super) ? $[_super] : _super;
			base = _super.prototype;
			if (!$.isStdObject(base)) {
				throw Error("Invalid super class");
			}
		}
		des = new(build_class(0, base))();
		_class = build_class(Constructor(name || '*', single), des);
		$.extend(_class.prototype, {
			'super': base,
			'class': _class
		});
		if (name) {
			if (name in $) {
				throw Error('class "' + name + '" is exists');
			}
			$[name] = _class
		}
		exts.forEach(function(f) {
			$.extend(des, $.isFunction(f) ? {
				init: f
			}: f)
		});
		if (exec) {
			$.when(when, _class)
		}
		return _class
	};
	$.extend($, {
		ie: 0,
		NOP: NOP,
		args: _A,
		group: group,
		merge: merge,
		log: function(s) {
			try {
				console.log(s)
			} catch(e) {}
		},
		base: function(b) {
			basePath = b
		},
		abbr: function(k, v) {
			abbr[k] = v
		},

        /*
        *   @name match
        *   @return {Array}
        *   @desc 用正则对字符串进行匹配，返回一个包含匹配结查的二维数组
        *   @param {string} s 必填 需要进行匹配的字符串
        *   @param {RegExp} r 必填 用于匹配的正则表达式
        *   @example
        *   var str = "a=1&b=2&c=3";
        *   $.match(str,/(\w+)\=(\d+)/g) ==> [['a=1','a','1'],['b=2','b','2'],['c=3','c','3']]
        * */
		match: function(s, r) {
			var b = [],t;
			r.lastIndex = 0;
			do {
				t = r.exec(s);
				if (t) {
					b.push(t)
				}
			}while (t && r.global);
			return b
		},

        /*
        *   @name parse
        *   @return {Object}
        *   @desc 将类似查询语句的字符串转换成对象的表现形式
        *   @param {String} str 被转换的字符串
        *   @param {Function} en 可选 处理函数
        *   @param {RegExp} r 可选 折分字符串的正则
        *   @example
        *   var str =  'a=1&b=2&c=3';
        *   $.parse(str) ==> {a: "1", b: "2", c: "3"}
        *   $.parse(str,function(v){ return v-0+1}) ==> {a: 2, b: 3, c: 4}
        * */
		parse: function(str, en, r) {
			var o = {},
			m = $.match(str, r || r_query),
			f = $.func(en);
			m.forEach(function(v, i) {
				o[v[1]] = f(v[2])
			});
			return o
		},

        /*
        *   @name getParam
        *   @return {String}
        *   @desc 将对象返回查询语句的格式
        *   @param {Object} obj 被转换格式的数据
        *   @example
        *   var obj = {a:1,b:[2,3,4],c:5}
        *   $.getParam(obj) ==> a=1&b[]=2&b[]=3&b[]=4&c=5;
        * */
		getParam: function(obj) {
			return $.each(obj,function(v, k) {
				var v2 = k + '=' + v;
				if ($.isArray(v)) {
					var k2 = k + '[]=';
					v2 = k2 + v.join('&' + k2)
				}
				this.push(v2)
			},[]).join('&')
		},
        /*
        *   @name replace
        *   @return {String}
        *   @desc 将数据按指定的格式输出。类似JS模板
        *   @param {String} tpl 模板
        *   @param {Object} data 数据对象，一般为json
        *   @example
        *   var tpl = '<h1>{#title}</h1><p>{#content}</p>'
        *   var data = {'title':'this is test','content':'haha!'}
        *   $.repalce(tpl,data) ==> <h1>this is test</h1><p>haha!</p>
        * */
		replace: function(tpl, data) {
			return (tpl + '').replace(r_replace,function(s, w) {
				var v = w ? data[w] : data;
				return $.isEmpty(v) ? '': v
			})
		},
        /*
        *   @name formatDate
        *   @return {String}
        *   @desc 将日期按指定的格式输出
        *   @param {Date} date 需要转换格式的日期
        *   @param {String} t 需要输出的格式
        *   @example
        *   $.formatDate(new Date(),'yyyy-mm-dd') ==> '2013-03-04'
        * */
		formatDate: (function() {
			var w = '\u65e5\u4e00\u4e8c\u4e09\u56db\u4e94\u516d',
			R = 'yy,yyyy,m,mm,d,dd,H,h,G,g,i,s,u,w,a'.split(',').map(function(f) {
				return RegExp('\\b' + f + '\\b', 'g')
			}),
			z = function(n, b) {
				return ('00' + n).slice( - (b || 2))
			};
			return function(date, t) {
				var d = $.getDate(date),
				o = [0, d.getFullYear(), d.getMonth() + 1, 3, d.getDate(), 5, 6, 7, d.getHours(), 9, d.getMinutes(), d.getSeconds(), z(d.getMilliseconds(), 3), w.charAt(d.getDay())],
				a = o[8] > 12;
				o[0] = (o[1] + '').slice( - 2);
				o[3] = z(o[2]);
				o[5] = z(o[4]);
				o[9] = o[8] - (a ? 12: 0);
				o[6] = z(o[8]);
				o[7] = z(o[9]);
				o[14] = (a ? '\u4e0b': '\u4e0a') + '\u5348';
				return R.reduce(function(f, r, i) {
					return f.replace(r, o[i])
				},
				t || 'yyyy-mm-dd H:i:s').replace(/`/g, '')
			}
		})(),

        /*
        *   @name getDiff
        *   @return {Array}
        *   @desc 计算一个数值里包含的天，小时，分钟，秒，毫秒数
        *   @param {Number} d 需要计算的时间
        *   @param {Boolen} z 不满10时是否有前面补0
        * */
		getDiff: function(d, z) {
			return [8.64e7, 3.6e6, 6e4, 1e3, 1].reduce(function(a, b) {
				var v = (d / b).toFixed(0);
				d %= b;
				return a.concat(z ? ((v < 10 ? '0': '') + v) : v)
			},[]);
		},

        /*
        *   @name getDate
        *   @return {Date}
        *   @desc 根据参数返回一个Date对象
        *   @param {Date|String|Number} d 必填 如果d是Date对象，则直接近回该对象，如果是时间的字符串表现形式，如（2012-3-5）
        *   则转换成Date能接受的格式，如果是数字，返回new Date(number);
        *   @example
        *   $.getDate(new Date()) ==> Tue Mar 05 2013 10:13:42 GMT+0800 (中国标准时间)
        *   $.getDate('2013-03-05') ==> Tue Mar 05 2013 00:00:00 GMT+0800 (中国标准时间)
        *   $.getDate(456456123) ==> Tue Jan 06 1970 14:47:36 GMT+0800 (中国标准时间)
        * */
		getDate: function(d) {
			return $.isDate(d) ? d: (new Date($.isString(d) ? d.replace(/-/g, '/') : d))
		},

        /*
        *   @name getVal
        *   @desc 根据指定的函数，返回处理后的结果
        *   @param {Function|others} v 如果是一个函数，则将其作为处理函数，处理第二个参数，并将作用域设置第二个参数，返回处理后的结果
        *   如果v不是函数，则直接返回
        *   @example
        *   $.getVal(function(n){ return n+10;},10)  ==> 20
        *   $.getVal(function(n){ return this.b+10},{b:10}) ==> 20
        *   $.getVal(10) ==> 10;
        *
        * */
		getVal: function(v, o) {
			return $.isFunction(v) ? v.call(o, o) : v
		},

        /*
        *   @name getRmb
        *   @return {String} 人民币的表现形式的字符串
        *   @desc 将一个数字转换成一个三位一逗号的写法的人民币的表现形式的字符串
        *   @param {Number} n 必填，需要转换的数字
        *   @param {Boolen} f 可选，用于决定是否需要在结果前面加上"￥"
        *   @param {Number} l 可选，用于决定小数长度
        *   @example
        *   $.getRmb(123456) ==>￥123,456.00
        *   $.getRmb(123456,1,1) ==>￥123,456.0
        *   $.getRmb(123456,false) ==>123,456.00
        * */
		getRmb: function(n, f, l) {
			var s = parseFloat(n).toFixed(l === _empty ? 2: l).toString().split('.');
			s[0] = s[0].replace(/(\d)(?=(\d{3})+($|\.))/g, '$1,');
			return (f === false ? '': '\uffe5') + s.join('.')
		},
        /*
        *   @name kv2Obj
        *   @return {Object}
        *   @desc 根据参数返回一个由它们组成的对象
        *   @param {String} k 对象名
        *   @param {any} v 对应于K的值
        *   @example
        *   $.kv2obj('a',1) ==> {'a':1}
        * */
		kv2obj: function(k, v) {
			var o = {};
			o[k] = v;
			return o
		},

        /*
        *   @name isEmpty
        *   @return {Boolen}
        *   @desc 判断一个数据是否为空（全等于null或全等于undefined）
        *
        * */
		isEmpty: function(v) {
			return v === null || v === _empty
		},

        /*
        *   @name getArray
        *   @return {Array}
        *   @desc 将传入的数据转入数组后返回，如果不传参数，则返回一个空数组
        *   @param {any} x 任意数据
        *   @example
        *   $.getArray(1) ==> [1]
        *   $.getArray([1,2,3]) ==> [1,2,3]副本
        *   $.getArray('i love you') ==> ['i','love','you'];
        *   var oDivs = document.getElementsByTagName('div');
        *   $.getArray(oDivs) ==> [div1,div2,div3]
        * */
		getArray: function(x) {
			var f = [];
			if (!$.isEmpty(x)) {
				if (x instanceof SuperNodes) { //如果是SuperNodes实例
					f = x.get()
				} else if ($.isArray(x)) {//数组
					f = x.slice()
				} else if ($.isString(x)) { //字符串
					f = x.match(r_word) || []
				} else if (('length' in Object(x)) && !(x.nodeType || $.isFunction(x) || x.alert)) { //nodeList  注意window.length属性指向所有的iframe.contentWindow
                    f = copy(x)
				} else {
					f = [x]
				}
			}
			return f
		},
		isStdObject: function(o) {
			return Super === o || Super.isPrototypeOf(o)
		},

        /*
        *   @name isPlainObject
        *   @return {Boolen}
        *   @desc 判断传入的参数是否是字面量定义及通过自定义类（构造器）创建的对象
        *   @param {any} a 被判断的数据
        *   @example
        *   var a  = function(){},b={},c = [],d='text';
        *   $.isPlainObject(a) ==> false
        *   $.isPlainObject(new a) ==> true
        *   $.isPlainObject(b) ==>true
        *   $.isPlainObject(c) ==>false
        *   $.isPlainObject(d) ==> false
        * */
		isPlainObject: function(a) {
            //'isPrototypeOf' in Object(a)解决在IE中window/document/document.body/HTMLElement/HTMLCollection/NodeList/也返回[object Object]的问题
			return a && ('isPrototypeOf' in Object(a)) && Object.prototype.toString.call(a) === '[object Object]'
		},

        /*
        *   @name parseJSON
        *   @desc 将传入的字符串解析成json对象，注意字符串需要是json形式
        *   @param {String} x json格式的字符串，如'{a:1,b:2,c:3}'
        *   @example
        *   $.parseJSON('{a:1,b:2,c:3}') ==> {a:1,b:2,c:3}
        * */
		parseJSON: function(x) {
			try {
				return Fn('return (' + x + ')')()//x必需为表达式
			} catch(e) {}
		},

        /*
        *   @name nextRefresh
        *   @desc 逐帧动画，requestAnimationFram可参考http://www.cnblogs.com/rubylouvre/archive/2011/08/22/2148793.html
        *   @see http://www.cnblogs.com/rubylouvre/archive/2011/08/22/2148793.html
        *   @param {Function} f，下一帧需要执行的函数
        * */
		nextRefresh: (function(b, w) {
			return (w['r' + b] || w['oR' + b] || w['webkitR' + b] || w['mozR' + b] || w['msR' + b] ||
			function(f) {
				setTimeout(f, 10)
			}).bind(w)
		})('equestAnimationFrame', Here),

        /*
        *   @name random
        *   @desc 将数组按随机排序
        *   @param 需要被排序的数组
        *   @example
        *   $.random([1,2,3,4,5,6,7,8]) ==>[3, 4, 2, 7, 8, 5, 1, 6]
        * */
		random: function(a) {
			for (var k, v, i = 0, j = a.length; i < j; i++) {
				k = Math.floor(MR() * j);
				v = a[i];
				a[i] = a[k];
				a[k] = v
			}
			return a
		},

        /*
        *   @name range
        *   @desc 返回指定范围内的值，这个类似于Math.max(a,Math.min(val,b)),在一定的范围内拖动元素时c为false，可以用来控制拖动范围，用做逐帧动画时(c为true),可以用来控制循环
        *   @param {Number} v 用来作比较的值
        *   @param {Number} a 起始值
        *   @param {Number} b 结束值
        *   @param {Boolen} c 用于决定是否回旋，值为false不回旋，true时回旋
        *   @example
        *   $.range(x,0 100) 这相当于Math.max(0,Math.max(x,100)),当x小于0时，让x等于0，当x大于100时，让x等于100，一般用作控制范围
        *   $.range(x,0,100,true) 当x小于0时，让x等于100，当x大于100时，让x等于0,一般用作循环动画
        * */
		range: function(v, a, b, c) {
			return v > b ? (c ? a: b) : (v < a ? (c ? b: a) : v)
		},

        /*
        *   @name find
        *   @desc 根据传入的参数，查找对应的结果
        *   @return {Object} 包含查找结果的对象
        *   @param {Object} o 查询条件集合
        *   @param {Object} b 存放查询结果
        *   @example
        *   $.find({'divs':'div'}) ==>{'divs':{all:[div1,div2,div3]}}
        *   var b = {a:1};
        *   $.find({'divs':'div'},b);
        *   console.log(b) ==> {a:1,'divs':{all:[div1,div2,div3]}}
        * */
		find: function(o, b) {
			return $.each(o,function(v, k) {
				this[k] = _$(v)
			},b || {})
		},

        /*
        *   @name createData
        *   @desc 将数据添加到对象的__hash__属性上，并将Data方法添加到data属性上
        *   @param {Object} o 被添加属性的对象
        *   @param {Object} b 属性数据
        *   @example
        *   var a = {},b={c:1};
        *   $.createData(a,b);
        *   a.data('c'); ==>1
        * */
		createData: function(o, b) {
			if (o.data !== Data) {
				o.__hash__ = $.extend({},b);
				o.data = Data
			}
			return o
		},

		order: function(k, f) {
			if (!k || $.isNumber(k)) {
				f = k === -1 ? k: 1;//当k为－1时，f=-1,当k为空或其它数字时，f=1
				return function(a, b) {
					return a > b ? f: -f
				}
			} else {
				f = f === -1 ? f: 1;
				k = $.getArray(k).map(function(s) {
					return $.isFunction(s) ? s: Fn('o', 'try{return o["' + s + '"];}catch(e){}')
				});
				var j = k.length;
				return function(a, b) {
					var t,ta,tb,i = 0;
					for (; i < j; i++) {
						t = k[i];
						ta = t(a);
						tb = t(b);
						if (ta === tb) {
							continue
						}
						return ta > tb ? f: -f
					}
					return 0
				}
			}
		}
	});
    //获取对象上指定的事件，如果没有绑定任何事件，返回[]
	function get_obj_events(obj, n) {
		return group(obj_events[obj.guid], (n + '').toLowerCase())
	}
	Super = {
		__init__: NOP,
		__NotListening__: NOP,
		init: function() {
			this.parent.apply(this, merge('init', _A(arguments)))
		},
		parent: function(n) {
			var k = 'super_track',args = _A(arguments, 1),r,a;
			if (! (k in this)) {
				this[k] = this
			}
			a = this[k]['super'];
			while (a && !has_own.call(a, n)) {
				a = a['super']
			}
			if (a) {
				this[k] = a;
				r = a[n].apply(this, args)
			}
			delete this[k];
			return r
		},
        /*设置Super.toString的内容*/
		toString: function() {
			return '[object ' + this.guid + (this.name ? ('@' + this.name) : '') + ']'
		},
        /*
        *   @name on
        *   @desc 绑定事件
        *   @param {String|Function|Object} n 可接受三种类型的数据，n为字符串时，作为事件类型的名称，如'click',当为function时，就是普通的函数，当为Object时，可以批量绑定事件，如{'click':function(){},'change':function(){}}
        *   @param {Function} f 事件处理函数
        *   @param {Boolen} lt 用于响应历史上最后一次触发的,也就是说只要这个事件触发过， 再添加的时候就会自动响应一下
        *   @example
        *   on('click',function(){})
        *   on(function(){})
        *   on({
        *       'click':function(){},
        *       'mouseover':function(){}
        *   })
        * */
		on: function(n, f, lt) {
			if ($.isString(n)) {
				var me = this,
				s = get_obj_events(this, n),
				g = function() {
					return f.apply(me, arguments)
				};
				s.push([f, g]);
				if (('@last_evt' in s) && lt) {
					g.apply(this, s['@last_evt'])
				}
			} else if ($.isFunction(n)) {
				this.__NotListening__ = n
			} else {
				$.each(n,function(v, k) {
					this.on(k, v, f)
				},this)
			}
			return this
		},

        /*
        *   @name once
        *   @desc 绑定一次性事件，也就是绑定的事件监听函数只执行一次
        *   @param {String} n 事件类型
        *   @param {Function} f 处理函数
        *   @param {lt} 用于响应历史上最后一次触发的,也就是说只要这个事件触发过， 再添加的时候就会自动响应一下
        *   @example
        *   once('click',function(){})
        * */
		once: function(n, f, lt) {
			var f1 = function(e) {
				this.un(n, f1);
				f.call(this, e)
			};
			return this.on(n, f1, lt)
		},

        /*
        *   @name un
        *   @desc 取消绑定的事件监听函数
        *   @param {String} t 事件类型
        *   @param {Function} f 要取消的监听函数，当不指定具体的监听函数时，则删除掉对象上绑定的该类型的所有事件
        *   @example
        *   un('click',fn1) ==>取消对象上click事件中的名为fn1的监听函数
        *   un('click') ==>取消对象上所有的click事件监听函数
        * */
		un: function(t, f) {
			var s = get_obj_events(this, t);
			if (arguments.length == 1) {
				s.length = 0
			} else {
				for (var i = s.length; i--;) {
					if (s[i][0] === f) {
						s.splice(i, 1)
					}
				}
			}
			return this
		},

        /*
        *   @name fireEvent
        *   @desc 主动触发对象上的某个类型的监听函数
        *   @param {String} n 事件类型
        *   @example
        *   firevent('click') ==>主动触发对象上的所有click事件监听函数
        * */
		fireEvent: function(n) {
			var A = arguments,args = _A(A, 1),es,f,i,j;
			es = get_obj_events(this, n);
			f = es.slice();
			es['@last_evt'] = args;
			i = 0;
			j = f.length;
			for (; i < j; i++) {
				if (false === f[i][1].apply(this, args)) {
					break
				}
			}
			if (!j) {
				this.__NotListening__.apply(this, A)
			}
			return j
		},

        /*
        *   @name destroy
        *   @desc 取消掉对象上的所有事件及其事件监听函数
        * */
		destroy: function() {
			this.constructor[SgKey] = null;
			delete obj_events[this.guid];
			$.each(this,function(v, k, o) {
				delete o[k]
			});
			this.__ISDESTROY__ = Date.now();
			this.fireEvent('destroy')
		},

        /*
        *   @name extend
        *   @desc 扩展Super类
        *   @param {String|Function|Object} a  如果a是字符串，则将a,b参数转换成{a:b},如果a是function,则返回a的执行结果
        *   @param {any} b 可选，任意数据
        * */
		extend: function(a, b) {
			a = $.isString(a) ? $.kv2obj(a, b) : ($.isFunction(a) ? a.call(this) : a);
			return $.extend(this, a)
		},

        /*
        *   @name bind
        *   @return {Function}
        *   @desc 绑定事件
        *   @param {Object|String} el 绑定事件的对象，可以Super实例，也可以是字符串，是字符串时，将获取相应的节点
        *   @param {String} type 事件类型
        *   @param {String|Function} f 事件处理函数
        * */
		bind: function(el, type, f) {
			var fn = ($.isString(f) ? this[f] : f).bind(this); ($.isStdObject(el) ? el: $(el)).on(type, fn);
			return fn
		}
	};
	var Folder = build_class(0, {
		extend: Super.extend
	});

    /*
    *   @name namespace
    *   @desc  创建命名空间
    *
    * */
	namespace = $.namespace = function(path, base) {
		base = base || $;
		path.trim().match(/[^\.]+/g).forEach(function(p) {
			if (p in base) {
				if (! (base[p] instanceof Folder || $.isStdObject(base[p]))) {
					throw Error('Invalid namespace "' + p + '"');
				}
			} else {
				base[p] = new Folder()
			}
			base = base[p]
		});
		return base
	};
	$.fn = {};
    //构建一个SuperNodes类
	SuperNodes = build_class(function(x) {
		this.all = $.getArray(x)
	},$.fn);
    //返回一个SuperNodes实例
	function $A(a) {
		return new SuperNodes(a)
	}
    //
	var taskSuper = {
        /*
        *   @name trigger
        *   @desc 主动触发函数
        *   @param {Array} fs 被触发的函数组
        *   @param {Object} o 作用域
        *   @param {any} 附加参数
        * */
		trigger: function(fs, o, d) {
			fs.forEach(function(f) {
				f.apply(o, d)
			})
		},
        //更新状态
        update: function(d, c, g) {
            var e = this.callbacks,//回调集
                _do = $.getArray(e[c]);//状态对应的回调组
            this.data = d;//记录数据
            this.state = g;//记录状态
            if (g !== 1) {//如果状态不是progress
                _do = _do.concat(e[2]);//把完成事件的回调组追加到后面
                e.length = 0;//删除回调集
                this.update = function() {//重置update为空
                    return this;
                };
                this.isEnd = true;//标记结束
            }
            this.trigger(_do, this.context, d);//把收集到的函数运行一次
            return this;
        },
        then: function(a, b, c) {//a,b,c分别对应正常结束, 错误或者进度，不管怎么样都完成了的事件
			var d = this.state;//获取状态
            [a, b, c].forEach(function(f, i) {
				if ($.isFunction(f)) {
					if (this.isEnd) {//如果已经结束
                        //i === 0 && d === 2 表示正常结束
                        //i === 1 && d === -1 表示错误或者进度
                        //i === 2 表示不管怎么样都完成了的事件
						if (i === 0 && d === 2 || i === 1 && d === -1 || i === 2) {
							f.apply(this.context, this.data)//执行回调
						}
					} else {
						this.callbacks[i].push(f)//如果没有结束，刚将回调添加到相应的回调集中
					}
				}
			},this);
			return this
		}
	};
	$.each({
		stop: [9, -2],//设置停止状态
		progress: [1, 1],//设置正在进行状态
		done: [0, 2],//设置已经完成状态
		error: [1, -1]//设置错误状态
	},function(v, k) {
		taskSuper[k] = function() {
			return this.update(_A(arguments), v[0], v[1])
		}
	});
    //创建任务，o表示上下文
	function create_task(o) {
		var task = function() {
			return task.then.apply(task, arguments)
		};
		task.context = o || task;
		task.callbacks = [[], [], []];//回调参数集，分别对应正常结束, 错误或者进度，完成
		return $.extend(task, taskSuper)
	}
	$.extend($, {
		task: function(init, f, context) {//init 初始化函数，f回调函数，context 上下文
			var t = create_task(context);
			if ($.isFunction(init)) {
				init.call(t, t, context)//执行初始化
			}
			return t.then(f)
		},
		isTask: function(t) {
			return t && t.trigger === taskSuper.trigger
		},
		toTask: function(a, o) {
			if (!$.isTask(a)) {//如果不是task
				if ($.isNumber(a)) {//如果是数字，则返回一个task ,并在指定的时间数(a)后，更改task状态为done
					return $.task(function(tk) {
						setTimeout(function() {
							tk.done()
						},a)
					},0, o)
				} else if (a === $) {
					a = domReady
				} else if ($.isFunction(a)) {
					a = a.call(o)
				} else if (a && ($.isString(a) || a.url)) {
					a = load(a, o)
				} else if ($.isArray(a)) {
					a = $.when(a, o)
				}
			}
			return a
		},
        when: function(ts, o) {
            //创建一个任务，并且初始化
            return $.task(function(tk) {
                var check,
                    q = $.getArray(ts),//任务转成数组
                    all = q.indexOf(true) > -1 || q.async,//判断任务与任务间是并行还是顺序
                    len = q.length,//任务的数量
                    i = 0;//记数器
                //用来取得下一个任务
                function next() {
                    var cur = $.toTask(q.shift(), o);//从数组最前弹出一个任务做为当前任务
                    if (all && q.length) {
                        next();//如果是并行的任务直接去找下一个
                    }
                    //如果是任务就把检测函数做为完成事件注册到任务中，否则直接运行检测函数
                    return $.isTask(cur, o) ? cur.then(0, 0, check) : check(copy);
                }
                //检测整个任务组是否完成
                check = function(z) {
                    i++;//记数器累加
                    if (z !== copy) {//如果不是第一个任务, 因为外部不能访问到copy这个内部函数，所以用来做判断
                        //执行进度事件
                        tk.progress(z, parseInt(i / len * 100, 10), i, len);
                    }
                    if (!all) {//如果不是并行的，如果有任务调用下一个任务，否则完成
                        return q.length ? next() : tk.done(i, len);
                    } else if (i >= len) {//如果是并行的，只检测记数器，因为记数器是回调只累加的，相当于所有任务都回调了就完成了
                        tk.done(i, len);
                    }
                };
                next();//开始执行第一个
            }, o);
        }
    });
	$.browser = [UA.match(/msie|firefox|opera/) || ['chrome']][0];
	cb_css = cb_css[$.browser];
	var single_load,
	tmp_div,
	Doc = Here.document,
	W3C = Doc.dispatchEvent,
	events = {},
	urlcls = /([#&]+(?=[#&\?]))|(#.*$)/g,
	urlParse = /^([^\?#]*)(?:\?(.*))?$/,
	isAbs = /^(\w+\:\/+|\/|\.+\/)/i,
	noExt = /(\.\w+[^\/]*$)|(\/$)/;
	function mapAbbr(a) {
		return $.replace((a + '').trim().replace(/^([@~])/, '{#$1}'), abbr)
	}
	$.joinPath = function(a, p, b, x) {
		var url,
		g3 = mapAbbr(a).match(urlParse).map(utos);
		p = p ? ($.isString(p) ? p: $.getParam(p)) : '';
		p = g3[2] ? p + (p ? '&': '') + g3[2] : p;
		p = (p ? '?': '') + p;
		b = b ? (mapAbbr(b) + '/').replace(/([^:])\/+/g, '$1/') : '';
		x = x ? '.' + x: '';
		url = (isAbs.test(g3[1]) ? '': b) + g3[1] + (noExt.test(g3[1]) || g3[2].indexOf('#') != -1 ? '': x);
		return (url + p).replace(urlcls, '')
	};

    /*
    *   @name element
    *   @desc 创建节点或代码片断
    *   @param {String} t 需要创建的节点名或者HTML片断
    *   @example
    *   $.element('div') ==>div node
    *   $.element('<ul id="nav"><li></li></ul>') ==> <ul id="nav"><li></li></ul>
    * */
	$.element = function(t) {
		if (is_html.test(t)) {
			tmp_div = tmp_div || Doc.createElement('DIV');
			tmp_div.innerHTML = t;
			return $A(tmp_div.childNodes).remove()
		} else {
			return $A(Doc.createElement(t))
		}
	};
	var loadeds = {},
	readying = {};

    /*加载CSS或者JS文件*/
	single_load = function(url, fn, chs) {
		if (url in loadeds) { //如果该文件已经被加载过，直接执行回调函数
			fn()
		} else if (url in readying) { //如果该文件正在被加载，将回调函数存储起来
			readying[url].push(fn)
		} else {
			var h = $('head').get(0) || Doc.documentElement;
			if (/\.css(?=[#?&]|$)/i.test(url)) { //如果是CSS文件
				$.element('link').attr({
					type: 'text/css',
					rel: 'stylesheet',
					href: url
				}).appendTo(h);
				setTimeout(fn, 200)
			} else {
				var js = $.element('script').attr({ //如果是JS文件
					type: 'text/javascript',
					charset: chs || 'utf-8'
				}).get(0);
				readying[url] = [fn]; //标记正在加载，并存储回调
				js[W3C ? 'onload': 'onreadystatechange'] = function(e) {
					if (W3C || /loaded|complete/.test(js.readyState)) {
						js.onload = js.onreadystatechange = '';
						setTimeout(function() {
							h.removeChild(js)
						},16);
						loadeds[url] = url;
						readying[url].forEach(function(f) {
							f()
						});
						delete readying[url]
					}
				};
				setTimeout(function() {
					js.src = url;
					_$(h).append(js, true)
				},16)
			}
		}
	};
	$.load = load = function(a, f, o) {
		return $.when($.getArray(a).map(function(s) {
			if ($.isString(s)) {
				s = {
					url: s
				}
			} else if ($.isArray(s)) {
				return load(s)
			} else if (s === true) {
				return s
			}
			if (s && s.url) {
				s.url = $.joinPath(s.url, s.data, basePath, 'js');
				return function() {
					return $.task(function(tk) {
						single_load(s.url,function() {
							tk.done(s.url)
						},s.charset)
					})
				}
			}
		}), f, o)
	};
	importer = $.task().done();
	function tryImport() {
		return waitImports.length ? $.load(waitImports.shift()).then(0, 0, tryImport) : importer.done($)
	}
	imports = $.require = function(s, f, o) {
		waitImports.push(s);
		if (!importer || importer.isEnd) {
			importer = $.task();
			tryImport()
		}
		return importer.then($.func(f).bind(o))
	};
	$.Class('StdClass');
	var $M = $.message = $.StdClass();
	$M.send = $M.fireEvent;
    (function(Here) {
		var PID = 1,
		getPID = function() {
			return (PID++) + ''
		},
		RE = {
			ID: /^#[\w\-]+$/,
			TAG: /^\w+$/,
			QID: /#([\w\-]+)/,
			QTAG: /^\w+/,
			QCLS: /\.[\w\-]+/g,
			QATTR: /\[[^\]]+\]/g,
			QEXP: /\:[\w\-]+/g,
			ATTRID: /#([\w\-]+)/g,
			HEADSPACE: /^\s*([^+>~])/,
			AXIS: /[ +>~]/g,
			NAXIS: /[^ +>~]+/g,
			TRIM: /^\s+|\s+$/g,
			SPACE: /\s*([>+~,])\s*/g,
			EMPTY: /^\s*$/,
			PSEU_PARAM: /\(([^()]+)\)/g,
			ATTR_PARAM: /[^\[]+(?=\])/g,
			ATTR: /[!\^$*|~]?=/,
			CLS: /\./g,
			TCLS: /^(\w+)?((?:\.[\w\-]+)+)$/,
			PSEU: /[^:]+/g,
			NUM: /\d+/,
			TYPE: /\:(checkbox|text|radio|file|submit|image|button|hidden)/g
		},
		attrCheck = {
			" ": function() {
				return true
			},
			"=": function(a, b) {
				return a === b
			},
			"!=": function(a, b) {
				return a !== b
			},
			"^=": function(a, b) {
				return a.indexOf(b) === 0
			},
			"$=": function(a, b) {
				return a.substring(a.length - b.length) === b
			},
			"*=": function(a, b) {
				return a.indexOf(b) !== -1
			},
			"~=": function(a, b) {
				return (" " + a + " ").indexOf(" " + b + " ") !== -1
			}
		},
		nextLevel = {
			" ": function(ctxs, tag) {
				var len = ctxs.length,i = 0,arr = [],el,par,pid = getPID(),k = UK;
				for (; i < len; i++) {
					el = ctxs[i];
					par = el.parentNode;
					if (par) {
						el[k] = pid;
						if (par[k] == pid) {
							continue
						}
					}
					arr = arr.concat(copy(el.getElementsByTagName(tag)))
				}
				return arr
			},
			">": function(ctxs, tag) {
				var len = ctxs.length,
				i = 0,
				j,
				k,
				arr = [],
				el,
				n;
				for (; i < len; i++) {
					n = ctxs[i].childNodes;
					for (j = 0, k = n.length; j < k; j++) {
						el = n[j];
						if (el.nodeType === 1 && (tag === "*" || el.nodeName.toLowerCase() === tag)) {
							arr[arr.length] = el
						}
					}
				}
				return arr
			},
			"+": function(ctxs, tag) {
				return nextLevel.sibling(ctxs, tag, true)
			},
			"~": function(ctxs, tag) {
				return nextLevel.sibling(ctxs, tag)
			},
			sibling: function(ctxs, tag, one) {
				var el,
				par,
				pid = getPID(),
				arr = [],
				len = ctxs.length,
				k = UK,
				i = 0;
				for (; i < len; i++) {
					el = ctxs[i];
					if (!one) {
						par = el.parentNode;
						if (par) {
							if (par[k] === pid) {
								continue
							}
							par[k] = pid
						}
					}
					while (el) {
						el = el.nextSibling;
						if (el && el.nodeType === 1) {
							if (tag === "*" || el.nodeName.toLowerCase() === tag) {
								arr.push(el)
							}
							if (one) {
								break
							}
						}
					}
				}
				return arr
			}
		},
		exprs = {
			checked: function(el) {
				return el.checked === true
			},
			empty: function(el) {
				return ! el.firstChild
			},
			selected: function(el) {
				return el.selected === true
			},
			first: function(el, i) {
				return i === 0
			},
			last: function(el, i, len) {
				return i === (len - 1)
			},
			even: function(el, i) {
				return i % 2 === 0
			},
			odd: function(el, i) {
				return i % 2 === 1
			},
			contains: {
				fn: function(el, index, param) {
					return (el.textContent || el.innerText || "").indexOf(param) !== -1
				}
			}
		};
		DOM = {
			getPID: getPID,
			attrFix: {
				"class": "className",
				"for": "htmlFor"
			},
			query: function(str, ctxs) {
				var all = [],
				find,
				group,
				dir,
				marks,
				n,
				m;
				if (typeof ctxs == 'string') {
					str = ctxs + " " + str;
					ctxs = null
				}
				if (!ctxs) {
					ctxs = Doc
				}
				str = str.replace(RE.TRIM, '');
				if (str == 'body') {
					return [Doc.body]
				} else if (str == 'html') {
					return [Doc.documentElement]
				} else if (RE.ID.test(str)) {
					var el = Doc.getElementById(str.slice(1));
					return el ? [el] : []
				} else if (ctxs.nodeType && RE.TAG.test(str)) {
					return copy(ctxs.getElementsByTagName(str))
				}
				ctxs = ctxs.nodeType ? [ctxs] : ctxs;
				group = this.parseOther(this.clean(str)).split(",");
				for (var i = 0, j = group.length; i < j; i++) {
					str = group[i];
					dir = str.replace(RE.HEADSPACE, ' $1').match(RE.AXIS);
					marks = str.match(RE.NAXIS);
					find = ctxs;
					for (n = 0, m = dir.length; n < m; n++) {
						find = this.parse(marks[n], find, dir[n])
					}
					all = all.concat(find)
				}
				return this.unique(all)
			},
			filter: function(all, str) {
				var pid = getPID(),
				k = UK;
				$.query(str).forEach(function(el) {
					el[k] = pid
				});
				return all.filter(function(el) {
					return el[k] === pid
				})
			},
			clean: function(selector) {
				return selector.replace(RE.ATTRID, '[id=$1]').replace(/[\'\"]/g, '').replace(RE.SPACE, '$1')
			},
			parseOther: function(str) {
				var P = [],
				A = [];
				this.exprParams = P;
				this.attrParams = A;
				function GOP(x, a) {
					return P.push(a) - 1
				}
				str = str.replace(RE.ATTR_PARAM,
				function(a) {
					return A.push(a) - 1
				});
				while (str.indexOf('(') > -1) {
					str = str.replace(RE.PSEU_PARAM, GOP)
				}
				return str
			},
			parse: function(mark, ctxs, dir) {
				var all,
				id,
				tag,
				cls,
				attrs,
				exp;
				id = mark.match(RE.QID);
				if (id) {
					id = Doc.getElementById(id[1]);
					return id ? [id] : []
				}
				tag = mark.match(RE.QTAG);
				all = nextLevel[dir](ctxs, tag ? tag[0] : "*");
				cls = mark.match(RE.QCLS);
				if (cls) {
					all = this.filterClass(all, cls.join(''))
				}
				attrs = mark.match(RE.QATTR);
				if (attrs) {
					all = this.filterAttr(all, this.getAttrRules(attrs.join('').match(RE.ATTR_PARAM), this.attrParams))
				}
				exp = mark.match(RE.QEXP);
				if (exp) {
					all = this.filterExpr(all, this.getExprRules(exp.join('').match(RE.PSEU), this.exprParams))
				}
				return all
			},
			getRules: function(str) {
				var rules = [null, [str.match(RE.QID) || []][0] + '', [str.match(RE.QTAG) || ['*']][0] + '', [str.match(RE.QCLS) || ['']].join(''), [str.match(RE.QATTR) || ['']].join(''), [str.match(RE.QEXP) || ['']].join('')];
				if (rules[4]) {
					rules[4] = this.getAttrRules(rules[4].match(RE.ATTR_PARAM), this.attrParams)
				}
				if (rules[5]) {
					rules[5] = this.getExprRules(rules[5].match(RE.PSEU), this.exprParams)
				}
				return rules
			},
			getAttrRules: function(indexs, vals) {
				var val,
				chks = [],
				i = 0,
				j = indexs.length;
				for (; i < j; i++) {
					val = vals[indexs[i]];
					if (RE.ATTR.test(val)) {
						val = RegExp["$'"];
						chks.push(attrCheck[RegExp["$&"]], RegExp["$`"], val)
					} else {
						chks.push(attrCheck[" "], val, "")
					}
				}
				return chks
			},
			getExprRules: function(arrPseu, exprParams) {
				var arr = [],
				i = 0,
				len = arrPseu.length,
				pseus = exprs,
				pseu,
				param;
				for (; i < len; i++) {
					pseu = arrPseu[i];
					if (RE.NUM.test(pseu)) {
						pseu = pseus[RegExp["$`"]];
						param = exprParams[RegExp["$&"]];
						arr.push(true, pseu.fn, pseu.getParam ? pseu.getParam(param, this) : param)
					} else {
						arr.push(false, pseus[pseu], null)
					}
				}
				return arr
			},
			filterExpr: function(els, exprRules) {
				var n = 0,
				m = exprRules.length,
				all = els,
				len,
				el,
				expr,
				hasParam,
				param,
				i;
				for (; n < m; n += 3) {
					expr = exprRules[n + 1];
					hasParam = exprRules[n];
					param = exprRules[n + 2];
					els = all;
					all = [];
					for (i = 0, len = els.length; i < len; i++) {
						el = els[i];
						if (hasParam) {
							if (!expr(el, i, param, this)) {
								continue
							}
						} else {
							if (!expr(el, i, len, this)) {
								continue
							}
						}
						all.push(el)
					}
				}
				return all
			},
			filterAttr: function(els, attrRules) {
				var len = els.length,
				i = 0,
				m = attrRules.length,
				all = [],
				n,
				el,
				rule,
				val,
				name;
				for (; i < len; i++) {
					el = els[i];
					for (n = 0; n < m; n += 3) {
						rule = attrRules[n];
						name = attrRules[n + 1];
						if (! (val = (name === "href" ? el.getAttribute(name, 2) : el.getAttribute(name)))) {
							if (! (val = el[this.attrFix[name] || name])) {
								break
							}
						}
						if (!rule(val + "", attrRules[n + 2])) {
							break
						}
					}
					if (n === m) {
						all.push(el)
					}
				}
				return all
			},
			hasClass: function(cln, c) {
				var S = ' ' + cln + ' ';
				for (var i = c.length; i--;) {
					if (S.indexOf(' ' + c[i] + ' ') === -1) {
						return false
					}
				}
				return true
			},
			filterClass: function(els, cls) {
				var i = 0,
				el,
				cln,
				len = els.length,
				has = DOM.hasClass,
				all = [];
				cls = cls.slice(1).split('.');
				for (; i < len; i++) {
					el = els[i];
					cln = el.className;
					if (cln && has(cln, cls)) {
						all[all.length] = el
					}
				}
				return all
			},
			filterEl: function(el, tag, cls, attrRules, exprRules) {
				return ! (tag !== "*" && el.nodeName.toLowerCase() !== tag || cls && !this.filterClass([el], cls).length || attrRules && !this.filterAttr([el], attrRules).length || exprRules && !this.filterExpr([el], exprRules).length)
			},
			unique: function(arr) {
				if (arr.length > 1) {
					var pid = getPID(),
					k = UK;
					arr = arr.filter(function(el, i) {
						if (el.getAttribute(k) !== pid) {
							el.setAttribute(k, pid);
							return true
						}
					})
				}
				return arr
			}
		};
		if (!$.ie && Doc.querySelectorAll) {
			var $query = DOM.query;
			DOM.query = function(str, ctx) {
				if (!ctx) {
					try {
						return copy(Doc.querySelectorAll(str))
					} catch(e) {}
				}
				return $query.call(DOM, str, ctx)
			}
		}
		$.query = function(str, ctxs) {
			return str ? DOM.query(str.replace(RE.TYPE, '[type=$1]'), ctxs) : []
		}
	})(Here);
	_$ = function(q, ctx) {
		var all;
		if ($.isString(q)) {
			if (is_html.test(q)) {
				return $.element(q)
			}
			all = $.query(q, ctx)
		} else if ($.isArray(q)) {
			return $A(q.reduce(function(a, s) {
				return a.concat(_$(s, ctx).all)
			},[])).unique()
		} else {
			all = $.getArray(q)
		}
		return $A(all)
	};
	var rounds = {
		'next': 'nextSibling',
		'nextAll': 'nextSibling',
		'siblings': 'nextSibling',
		'children': 'nextSibling',
		'prev': 'previousSibling',
		'prevAll': 'previousSibling',
		'parents': 'parentNode',
		'parent': 'parentNode'
	};

    //获取节点
	function get_round(el, dir, fr, u) {
		var all = [], //存储结果
		ori = el,//记住原始节点
		first = dir == 'parent' || dir == 'next' || dir == 'prev', //决定是否只需要返回第一次匹配到的节点，不需要循环
		op = rounds[dir]; //查找节点的方向
        //获取所有兄弟节点(siblings)时，定位到父元素的第一个子节点，获取元素所有子节点的时候，定位到第一个子节点
		el = dir == 'siblings' ? el.parentNode.firstChild: (dir == 'children' ? el.firstChild: el[op]);
		while (el && el !== Doc.documentElement) {
			if (el.nodeType == 1 && el !== ori) {  //当元素为节点，并不等于原始节点时
				all.push(el);
				if (first) { //如果不需要循环，直接跳出
					break
				}
			}
			el = el[op]
		}
        //当fr为字符串时，将它作为过滤条件对结果进行过滤，当它为function时，则对每一个元素进行过滤处理，两者都不是，返回本身
		all = $.isString(fr) ? DOM.filter(all, fr) : ($.isFunction(fr) ? all.filter(fr) : all);
		return u ? all.slice(0, 1) : all //u决定中否返回第一个结果
	}

    /*生成next,nextAll,siblings,children,prev,prevAll,parents,parent函数*/
	$.each(rounds,function(v, k) {
		$.fn[k] = function(f, _until) { //f 字符串或者function,过滤条件 ,_until决否是否只返回第一条结果
			var a = [];
			this.each(function(el) {
				a = a.concat(get_round(el, k, f, _until))
			}).size();
			return $A(a).unique() //返回一个包含结果的SuperNodes实例，并去重
		}
	});
    /*修复event对象在各浏览器下的差异*/
	function fix_event(e) {
		e = e || Here.event || {};
		if (e) {
			e.wheel = (e.detail ? e.detail < 0: e.wheelDelta > 0) ? 1: -1;//修复滚轮
			if (!e.stopPropagation) {
				e.target = e.srcElement; //修复事件对象
				e.stopPropagation = function() { //修复冒泡
					e.cancelBubble = true
				};
				e.preventDefault = function() { //修复默认操作
					e.returnValue = false
				}
			}
		}
		return e //返回事件
	}

    /*
    *   @name contains
    *   @return {Boolen}
    *   @desc 判断一个节点是否是另一个节点的子节点
    *   @param {Object} a DOM对象
    *   @param {Object} b DOM对象
    *   @example
    *   DOM <div id="a"><div id="b"></div></div>
    *   $.contains(a,b) ==> true
    *   $.contains(b,a) ==> false
    * */
	$.contains = function(a, b) {
		if (a.compareDocumentPosition) {
			return !! (a.compareDocumentPosition(b) & 16)
		}
		return a && (a !== b) && (!a.contains || a.contains(b))
	};

    //保存事件
	function save_events(el, type, f2) {
		var id = $.getGuid(el),//返回节点上的唯一标示符
            es = events[id]; //获取与该标示符对应的事件集
		if (!es) {
			events[id] = es = {} //如果不存在，则设置空对象
		}
		group(es, type, f2) //将指定的事件处理函数f2存入到es事件集中
	}

    //删除事件
	function del_events(el, type, fn) {
		var id = $.getGuid(el), //获取节点上的唯一标示符
		data = events[id], //获取与之对应的事件
		ret = []; //保存被删除的事件
		if (data) {
			if (type) {
				var f2,
				bs = data[type], //获取type类型的事件集
				i = bs.length;
				for (; i--;) {
					f2 = bs[i];
					if (!fn || f2[0] === fn) { //删除指定的函数，如果不指定需要删除的函数名，则删除所有
						ret.push([type, f2[1]]); //保存被删掉函数
						bs.splice(i, 1) //删除函数
					}
				}
			} else {
                //如果type也不指定，则删除对象上所有绑定的事件
				$.each(data,function(bs, t) {
					bs.forEach(function(fs) {
						ret.push([t, fs[1]]) //保存被删掉的事件与类型
					})
				});
				events[id] = {} //清空该标示符上对应的所有事件
			}
		}
		return ret //返回被删除的事件集
	}
	var evtMap;
    //获取事件类型,注意FF不支持onmousewheel，但支持DOMMouseScroll，
    // 不支持mouseenter和mouseleave，但可以用mouseover和mouseout再加上一点技术手段达到类似的效果
    //不支持focusin和focusout，但可以通过事件捕获来达到冒泡的目的
	function get_event_type(x) {
		if (!evtMap && Doc.body) {
			var t = {},b = Doc.body;
			if (! ('onmousewheel' in b)) {
				t.mousewheel = 'DOMMouseScroll' //FF
			}
			if (! ('onmouseenter' in b)) {
				t.mouseenter = 'mouseover';
				t.mouseleave = 'mouseout'
			}
			if (! ('onfocusin' in b)) {
				t.focusin = 'focus';
				t.focusout = 'blur'
			}
			evtMap = t
		}
		return evtMap ? (evtMap[x] || x) : x
	}
    //删除绑定在元素上的监听函数
	function __un(el, t, fn) {
		del_events(el, get_event_type(t), fn).forEach(function(x) {
			if (el.detachEvent) {
				el.detachEvent('on' + x[0], x[1])
			} else {
				el.removeEventListener(x[0], x[1], false)
			}
		})
	}
    //绑定监听函数
	function __on(el, type, _do) {
		type = type.trim();
		if (type.indexOf(',') > 0) { //如果type是由‘，’分开的多个事件类型，如"click,mouseover,mouseout"
			return type.split(',').forEach(function(t) { //折分后循环绑定
				__on(el, t, _do)
			})
		} else if (type.indexOf(' ') > 0) {
			return _$(el).delegate(type, _do)
		}
		var g,t2,w3cHover;
		if (!$.isFunction(_do)) {
			throw Error('fn.on error: not function');
		};
		t2 = get_event_type(type); //修复事件类型
		g = function(e) {
			e = fix_event(e);
			e.currentTarget = el;
			var b = e.relatedTarget;
            //ff下不支持mouseenter和mosueleave，通过下面的判断达到类似的效果
			return (w3cHover && b && (el === b || $.contains(el, b))) ? false: _do.call(el, e, el)
		};
		if (el.attachEvent) {
			el.attachEvent('on' + t2, g)
		} else {
			w3cHover = type != t2 && t2.match('mouse(out|over)');
			el.addEventListener(t2, g, /focus(in|out)/.test(type)) //通过捕获来实现focusin和focusout的冒泡效果
		}
		save_events(el, t2, [_do, g]) //保存事件，可以用来主动触发
	}

    //触发元素上的某个类型的事件监听函数
	function fireEvent(el, t) {
		if ($.isFunction(el[t]) || /^\s*function\s+/i.test(el[t])) {  //fix ie6,7下的a标签
			el[t]({})
		} else {
			if (el.fireEvent) {
				el.fireEvent('on' + t, Doc.createEventObject())
			} else {
				var e = Doc.createEvent("HTMLEvents");
				e.initEvent(t, true, true);
				el.dispatchEvent(e)
			}
		}
	}
    //fix 设置opacity在各浏览器下的差异
	$.namespace('userStyle', $).opacity = function(v) {
		v = parseFloat(v);
		this.style.filter = v < 1 ? "alpha(opacity=" + parseInt(v * 100, 10) + ")": "";
		this.style.opacity = v
	};
    //将带中划线的CSS转成JS识别的驼峰式写法
	function css2js(key) {
		return (key.replace(/^\-/, cb_css)).replace(/\-(\w)/g,function(a, b) {
			return b.toUpperCase()
		})
	}
    //给参数加上'px'单位
	function addPx(k, v) {
                //v必须为数字，且k必须width,height,padding,margin之类的字符串时才加上px
		return (!r_hasUnit.test(v) && r_defPx.test(k)) ? (v + 'px') : v
	}
    //设置样式
	function set_style(el, v, k) {
		k = css2js(k).replace('~', '');//将样式转成驼峰式
		if (k.indexOf('scroll') === 0) { //如果设置的是scrollTop或scrollLeft
			el[k] = parseInt(v, 10)
		} else {
			var s = $.userStyle[k];//如果设置的是opacity
			v = addPx(k, v); //带px单位
			if ($.isFunction(s)) {//如果是function，说明设置的是opacity
				s.call(el, v)
			} else {
				el.style[k] = v
			}
		}
	}
    //获取样式
	function get_style(el, k) {
		k = css2js(k);//将样式转成驼峰式
		var v = el.style[k]; //获取内联的样式
		return (v == '') ? (el.currentStyle || Doc.defaultView.getComputedStyle(el, null))[k] : v
	}

    /*
    *   @name style
    *   @desc 设置样式内容
    *   @param {String} 样式内容
    *   @example
    *   $.style('body{font-size:24px; color:red;}')
    * */
	$.style = function(t) {
		if (Doc.createStyleSheet) {//IE
			Doc.createStyleSheet().cssText += t;
		} else {
			$.element('style').attr({
				type: 'text/css'
			}).appendTo('head').append(Doc.createTextNode(t))
		}
	};
	var __gData = {},
	propMap = {
		"class": "className",
		"for": "htmlFor"
	};
    //修复for和class
	function fixProp(k) {
		return propMap[k.toLowerCase()] || k
	}

    /*
    *   @name getGuid
    *   @return {String} 返回唯一标示符
    *   @desc 获取对象的唯一标示符，如果不存在，则设置一个标签符并返回
    * */
	$.getGuid = function(o) {
		return (IDKEY in o) ? o[IDKEY] : (o[IDKEY] = $.guid())
	};

    //获取对象上唯一标示符所对应的数据
	function get_data(el) {
		var x,d = {};
		if (el) {
			x = $.getGuid(el); //获取标示符
			d = __gData[x]; //获取在__gData中与标示符所对应的数据
			if (!d) {
				__gData[x] = d = {} //如果不存在，则设置为空对象
			}
		}
		return d
	}
    //获取数组中指定的值，n为非数字时，直接返回数组副本，n为负数的时候，返回数组中倒数第n个的值，正数的时候，返回数组中与该索引对应的值
	function arrayGet(arr, n) {
		return $.isNumber(n) ? n < 0 ? (arr.slice(n)[0]) : arr[n] : arr.slice()
	}

    var Dpy = {};
    //获取元素默认的display值
    function getDisplay(type){
        return Dpy[type] || (Dpy[type] = getStyle(Doc.createElement(type), 'display'));
    }
    //扩展$.fn
	$.extend($.fn, {
        /*
        *   @name data
        *   @desc 获取或设置元素上的属性，当参数为空或只有一个参数时，返回集合中的第一个元素的属性，参数长度为2的时候，设置集合中每个元素的属性
        *   @param {String} k 可选 当k为空时，返回元素上的所有属性，为字符串时，返回指定的属性
        *   @param {any} v 可选 v存在时，给所有的元素设置属性K，值为V
        * */
		data: function(k, v) {
			if (!k) {
				return get_data(this.all[0]) //参数为空时，返回集合中第一条记录的所有属性
			} else if ($.isString(k)) {
				if (arguments.length === 1) {
					return get_data(this.all[0])[k] //只有一个参数并且为字符串时，返回集合中第一条记录里相对应的属性
				}
				k = $.kv2obj(k, v) //两个参数时，将参数转成键值对的形式
			}
			this.each(function(el) {
				$.each(k,function(v, k) {
					get_data(el)[k] = v //设置值
				})
			});
			return this
		},
        /*
        * @name removeData
        * @desc 删除元素标示符对应的所有数据
        * */
		removeData: function() {
			return this.each(function(el) {
				delete __gData[$.getGuid(el)]
			})
		},
        /*
        * @name size
        * @desc 返回集合的长度
        * */
		size: function() {
			return this.all.length
		},
        /*
        * @name each
        * @desc 遍历集合
        * */
		each: function(f, o) {
			var x,
			s = this.all,
			i = 0,
			j = s.length;
			o = o || this;
			for (; i < j; i++) {
				x = s[i];
				if (f.call(o, x, i, s) === false) {
					break
				}
			}
			return this
		},
        /*
        * @name unique
        * @desc 去掉集合中重复的记录
        * */
		unique: function() {
			this.all = DOM.unique(this.all);
			return this
		},
        /*
        *  @name eq
        *  @desc 返回集合的指定记录，并转成SuperNodes实例
        * */
		eq: function(i) {
			return $A(this.get(i))
		},
        /*
        *  @name get
        *  @desc 返回集合的指定记录，普通DOM
        * */
		get: function(n) {
			return arrayGet(this.all, n)
		},
        /*
        * @name slice
        * @desc 返回集合中的片断，类似JQ，返回SuperNodes实例
        * */
		slice: function() {
			return $A(arr_slice.apply(this.all, arguments))
		},
        /*
        * @name filter
        * @desc 过滤集合中的记当，f为过滤条件，返回结果为true的记录，当参数为空，效果与slice相同
        * @param {String|Function} 过滤条件
        * @param {Object} o 作用域
        * */
		filter: function(f, o) {
			var a = this.all;
			return $A($.isString(f) ? DOM.filter(a, f) : ($.isFunction(f) ? a.filter(f, o) : a.slice()))
		},

        /*
        * @name map
        * @desc 遍历集合，并返回处理后的结果
        * */
		map: function(f, o) {
			return this.all.map(f, o)
		},

        /*
        * @name find
        * @desc 在当前集合中查找出符合查询条件的新集合
        * @param {Sting} 查询条件
        * */
		find: function(r) {
			var x = [];
			this.each(function(el) {
				x = x.concat($.query(r, el))
			}).size();
			return $A(x).unique()
		},
        /*
        * @name hover
        * @desc 给当前集合绑定mouseenter和mouseout事件
        * @param {Function} a mouseenter的处理函数
        * @param {Function} b mouseout的处理函数
        * */
		hover: function(a, b) {
			return this.on({'mouseenter': a,'mouseleave': b || NOP})
		},
        /*
        * @name delegate
        * @desc 事件委拖
        *
        * */
		delegate: function(dx, fn) {
			var d = dx.match(/^(\w+)\s+(.+)$/),
			t = d[1],
			f = d[2];
			return this.each(function(el) {
				__on(el, t,function(e) {
					var s = e.target,
					k = UK,
					pid = DOM.getPID();
					_$(f, this).prop(k, pid);
					while (s && s !== this) {
						if (s[k] === pid) {
							e.currentTarget = s;
							if (false === fn.call(s, e, s)) {
								return false
							}
						}
						s = s.parentNode
					}
				})
			})
		},
        /*
        * @name on
        * @desc 给集合中的每一个对象绑定事件
        * @param {String|Object} t 为字符串时，为事件类型，如click,为对象时，则表示事件与函数集，如{'click',fuction(){},'mouseover':function(){}}
        * @param {Function} f 处理函数，当t为对象时，f不用传
        * */
		on: function(t, f) {
			if ($.isString(t)) {
				return this.each(function(el) {
					__on(el, t, f)
				})
			} else {
				$.each(t,function(f, s) {
					this.on(s + '', f)
				},this);
				return this
			}
		},

        /*
        * @name once
        * @desc 给集合中的每一个对象绑定一次性事件
        * @param {String|Object} t 为字符串时，为事件类型，如click,为对象时，则表示事件与函数集，如{'click',fuction(){},'mouseover':function(){}}
        * @param {Function} f 处理函数，当t为对象时，f不用传
        * */
		once: function(n, f) {
			var f1 = function(e) {
				__un(this, n, f1);
				f.call(this, e, this)
			};
			return this.on(n, f1)
		},

        /*
        * @name un
        * @desc 给集合取消事件绑定
        * @param {String} type 事件类型
        * @param {Function} fn 处理函数
        * */
		un: function(type, fn) {
			return this.each(function(el) {
				__un(el, type, fn)
			})
		},
        /*
        * @name fireEvent
        * @desc 主动触发集合中每一个元素上的指定类型的事件
        * @param {String} type 事件类型
        * */
		fireEvent: function(type) {
			return this.each(function(el) {
				fireEvent(el, type)
			})
		},

        /*
        * @name hasClass
        * @return {Boolen} 当有指定的类时，返回true，否则返回false
        * @desc 判断集合中的元素是否有指定的类
        * @param {String} css 指定的类名
        * */
		hasClass: function(css) {
			var r = true;
			css = css.trim().split(/\s+/);
			this.each(function(el) {
				if (!DOM.hasClass(el.className, css)) {
					r = false;
					return r
				}
			});
			return r
		},

        /*
        * @name removeClass
        * @desc 删除集合中每个元素指定的类
        * @param {String} css 指定的类名
        *
        * */
		removeClass: function(css) {
			return this.each(function(el) {
				if (_$(el).hasClass(css)) {
					el.className = el.className.replace(RegExp('\\b' + css + '\\b', 'g'), '')
				}
			})
		},
        /*
        * @name addClass
        * @desc 给集合中的每个元素添加指定的类
        * @param {String} css 指定的类名
        * */
		addClass: function(css) {
			return this.each(function(el) {
				if (!_$(el).hasClass(css)) {
					el.className = (el.className + ' ' + css).trim().replace(/\s+/g, ' ')
				}
			})
		},

        /*
        * @name toggleClass
        * @desc 切换集合中元素的类
        * @param {String} css 类名
        * @param {Boolen} s 直接决定是添加还是删除类 ，true值时添加，false时删除
        *
        * */
		toggleClass: function(css, s) {
            //s不存在时，得到一个判断元素是否含有类的function
			var chk = arguments.length > 1 ? s: function() {
				return ! this.hasClass(css)
			};
			return this.each(function(el) {
				var q = _$(el);
				q[$.getVal(chk, q) ? 'addClass': 'removeClass'](css)
			})
		},
        /*
        * @name attr
        * @desc 对getAttribute和setAttribute的包装，设置或获取元素的属性，当仅有一个参数的时候为获取集合中的第一个元素的属性，两个的时候为设置集合中每一个元素的属性
        * @param {String} k 字符串，v不存在时，获取集中合第一个元素的属性,当k为checked selected disabled时，返回true或false
        * @param {String|Function} v 当v为function时,则将每个元素作为function的作用域，并返回执行后的结果，为其它类型的数据时，则直接为属性对应的值
        * @example
        * attr('id') ==> 返回第一个元素的ID
        * attr('checked',true) ==>设置每个元素状态为选中
        * attr('checked',function(){ return !this.checked}) ==>checkbox反选效果
        * */
		attr: function(k, v) {
			if ($.isString(k)) {
				if (arguments.length === 1) { //如果参数长度为1，则为获取
					var el = this.all[0];
					return el ? (r_stats.test(k) ? el[k] : el.getAttribute(k)) : '' //如果获取的属性为checked selected disabled时返回true或false
				} else {
					k = $.kv2obj(k, v) //参数长度为2时，转换成json格式
				}
			}
			return this.each(function(el) {
				$.each(k,function(v, k) {
					var b = $.getVal(v, el); //v可以为函数或其它类型的数据
					if (r_stats.test(k)) {
						el[k] = b
					} else {
						el.setAttribute(k, b)
					}
				})
			})
		},
        /*
        * @name prop
        * @desc 对对象的直接属性的包,设置或获取元素的属性,设置或获取元素的属性，当仅有一个参数的时候为获取集合中的第一个元素的属性，两个的时候为设置集合中每一个元素的属性
        * @param {String｜Object} k 字符串，v不存在时，获取集中合第一个元素的属性,当k为对象时，设置每个元素的属性
        * @param {String|Function} v 当v为function时,则将每个元素作为function的作用域，并返回执行后的结果，为其它类型的数据时，则直接为属性对应的值
        * */
		prop: function(k, v) {
			if ($.isString(k)) {
				k = fixProp(k);
				return arguments.length > 1 ? this.each(function(el) {
					el[k] = $.getVal(v, el)
				}) : (this.all[0] ? this.all[0][k] : _empty)
			} else {
				$.each(k,function(v, k) {
					this.prop(k, v)
				},this);
				return this
			}
		},
        /*
        * @name html
        * @desc 设置或获取集合中元素的innerHTML,参数为空时，获取第一个元素的innerHTML
        * @param {String} html代码片断,参数为空时，获取第一个元素的html
        * */
		html: function() {
			return this.prop.apply(this, merge('innerHTML', _A(arguments)))
		},
        /*
         * @name val
         * @desc 设置或获取集合中元素的value,参数为空时，获取第一个元素的value
         * @param {String} value值,参数为空时，获取第一个元素的value
         * */
		val: function() {
			return this.prop.apply(this, merge('value', _A(arguments)))
		},
        /*
        * @name text
        * @desc 获取集合中第一个元素的text文本，注意这个不能设置值，如需设置，可用html方法。
        * */
		text: function() {
			var el = this.all[0];
			return el ? (el.innerText || el.text || el.textContent || '') : ''
		},
        /*
        * @name show
        * @desc 显示集合中的所有元素
        * */
		show: function(v) {
			return this.each(function(el) {
				var s = el.style;
				s.visibility = 'visible';
				s.display = v || getDisplay(el.nodeName);
			})
		},
        /*
         * @name hide
         * @desc 隐藏集合中的所有元素
         * */
		hide: function(v) {
			return this.each(function(el) {
				var s = el.style;
				if (v) {
					s.visibility = 'hidden'
				} else {
					s.display = 'none'
				}
			})
		},
		client: function() {
			var pos = {
				left: 0,
				top: 0
			};
			this.eq(0).each(function(el) {
				$.each(el.getBoundingClientRect(),function(v, k) {
					pos[k] = v
				},false, true)
			});
			return pos
		},
		offset: function(stop) {
			var t = $(stop).get(0),
			x = 0,
			y = 0;
			this.eq(0).each(function(el) {
				while (el && (!t || el !== t)) {
					x += el.offsetLeft;
					y += el.offsetTop;
					el = el.offsetParent
				}
			});
			return {
				left: x,
				top: y
			}
		},
		css: function(key, val) {
			return $.isString(key) ? (arguments.length === 1 ? (this.all[0] ? get_style(this.all[0], key) : '') : this.each(function(el) {
				set_style(el, $.getVal(val, el), key)
			})) : this.each(function(el) {
				$.each(key,
				function(v, k) {
					set_style(el, $.getVal(v, el), k)
				})
			})
		},
		insertTo: function(t, after) {
			t = _$(t).get(0);
			if (t && this.size()) {
				var b = t.parentNode;
				if (b) {
					this.each(function(el) {
						b.insertBefore(el, t)
					});
					if (after) {
						b.insertBefore(t, this.get(0))
					}
				}
			}
			return this
		},
		append: function(a, b) {
			this.eq(0).each(function(el) {
				var f = el.firstChild;
				_$(a).each(function(s) {
					if (b && f) {
						el.insertBefore(s, f)
					} else {
						el.appendChild(s)
					}
				})
			});
			return this
		},
		appendTo: function(a, b) {
			_$(a).append(this, b);
			return this
		},
		remove: function(x) {
			return this.filter(x).each(function(s) {
				var p = s.parentNode;
				if (p) {
					p.removeChild(s)
				}
			})
		},
		fx: function(k, v, p) {
			if (!$.isArray(v)) {
				v = (v + '').match(r_fxval);
				v[0] = 0
			}
			v[2] = v[2] || '';
			return $.fx(function(f) {
				this.css(k, f(v[0], v[1]) + v[2])
			},
			this, p)
		},
		get2d: function() {
			return this.get(0).getContext('2d')
		}
	});
	function metrics(el, p) {
		var b = Doc.body,
		c = Doc.documentElement,
		u = /^(wi|he)/.test(p),
		w = u ? p.charAt(0).toUpperCase() + p.slice(1) : '',
		n = el.get(0);
		if (n === b || n === c) {
			return u ? (c['client' + w] || b['client' + w]) : Math.max(c[p], b[p])
		} else {
			return el.prop(u ? ('offset' + w) : p)
		}
	}
	'width,height,scrollTop,scrollLeft'.split(',').forEach(function(g) {
		$.fn[g] = function(v) {
			return arguments.length ? this.css(g, v) : metrics(this, g)
		}
	});
	$.shortcutEvent = function(v) {
		$.getArray(v).forEach(function(v, i) {
			$.fn[v] = function(fn) {
				return this.on(v, fn)
			}
		})
	};
	$.shortcutEvent(('blur,focus,focusin,focusout,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,input,select,submit,keydown,keypress,keyup,error,losecapture,mousewheel,contextmenu,message').split(','));
	var tween = function(x) {
		return (x /= 0.5) < 1 ? (0.5 * Math.pow(x, 2)) : ( - 0.5 * ((x -= 2) * x - 2))
	},
	fxs = {};
	function clean_fx(id, tk) {
		var fx = fxs[id];
		if (fx) {
			fx.stop()
		}
		fxs[id] = tk
	}
	$.fx = function(f, o, m) {
		m = Object(m);
		var s,
		sd = Date.now(),
		tk = $.task(0, 0, o),
		l = Math.max(10, m.time || 480),
		pv = $.func(m.tween, tween),
		uid = m.guid;
		function g(f, t) {
			return + f + (t - f) * pv(s)
		}
		if (uid) {
			clean_fx(uid, tk)
		}
		function fx() {
			s = Math.min(1, (Date.now() - sd) / l);
			if (!tk.isEnd) {
				if (false === tk.progress(g, s) || s === 1) {
					tk.done()
				}
				$.nextRefresh(fx)
			}
		}
		fx();
		return tk.then(0, f)
	};
	var T1 = 'Msxml2.XMLHTTP',
	T2 = 'Microsoftf.XMLHTTP',
	AO = Here.ActiveXObject,
	XHR = function() {
		return new Here.XMLHttpRequest()
	};
	$.jsonp = function(s, f, o) {
		return $.task(function(tk) {
			var n,
			tid,
			js = $.isString(s) ? {
				url: s
			}: $.extend({},
			s),
			ck = /(\w+=)(\?)/;
			js.url = $.joinPath(js.url, js.data, false, '') + '#';
			delete js.data;
			if ($.isString(js.callback)) {
				n = js.callback
			}
			if (ck.test(js.url)) {
				n = $.guid('jsonp');
				js.url = js.url.replace(ck, '$1' + n)
			}
			if (n) {
				Here[n] = function() {
					Here[n] = NOP;
					clearTimeout(tid);
					tk.done.apply(tk, arguments)
				}
			}
			if (js.timeout) {
				tid = setTimeout(function() {
					Here[n] = NOP;
					tk.error('timeout')
				},
				js.timeout || 1000 * 5)
			}
			load(js)
		},
		f, o)
	};
	if (AO) {
		var v = UA.match(/msie\s*(\d+)/i);
		$.ie = v ? (v[1] >>> 0) : 1e6;
		XHR = function() {
			try {
				return new AO(T1)
			} catch(e) {
				return new AO(T1 = T2)
			}
		}
	}
	function parse_xhr(o, type) {
		switch (type.toLowerCase()) {
		case 'buffer':
			return o.response;
		case 'json':
			return $.parseJSON(o.responseText);
		case 'xml':
			var xml = o.responseXML;
			return xml ? xml.documentElement: null;
		default:
			return o.responseText
		}
	}
	function Net(opts, f, o) {
		var data,
		url,
		src,
		hs = {},
		R = XHR(),
		tk = $.task(null, f, o),
		type = (opts.type || 'get').toUpperCase(),
		isPost = type == 'POST',
		wait = opts.timeout || 1000 * 10,
		dataType = opts.dataType || '';
		if (dataType == 'buffer') {
			R.responseType = 'arraybuffer'
		}
		src = opts.url;
		url = $.joinPath(src, isPost ? false: opts.data);
		data = isPost ? $.getParam(opts.data) : null;
		R.open(type, url, opts.sync !== true);
		$.extend(hs, opts.headers);
		hs['If-Modified-Since'] = opts.cache === false ? 0: (Net[src] || 0);
		if (isPost) {
			hs['Content-Type'] = 'application/x-www-form-urlencoded; charset=' + (opts.dataCharset || 'UTF-8')
		}
		if (opts.charset) {
			R.overrideMimeType("text/html;charset=" + opts.charset)
		}
		$.each(hs,
		function(v, k) {
			R.setRequestHeader(k, v)
		});
		tk.stop = function() {
			try {
				R.abort()
			} catch(e) {}
			tk.error('timeout')
		};
		var TID = setTimeout(function() {
			tk.stop()
		},
		wait);
		R.onreadystatechange = function() {
			if (R.readyState == 4) {
				clearTimeout(TID);
				if (R.status == 200) {
					Net[src] = R.getResponseHeader('Last-Modified');
					tk.done(parse_xhr(R, dataType), R)
				} else {
					tk.error(R.status)
				}
			}
		};
		R.send(data);
		return tk
	}
    ['post', 'get', 'ajax'].forEach(function(t) {
		$[t] = function(a) {
			return Net.apply($, merge($.extend($.isString(a) ? {
				url: a
			}: a, t == 'ajax' ? {}: {
				type: t
			}), _A(arguments, 1)))
		}
	});
	domReady = $.task();
	function _done() {
		domReady.done($)
	}
	function try_scroll() {
		try {
			Doc.documentElement.doScroll("left")
		} catch(e) {
			return $.nextRefresh(try_scroll)
		}
		_done()
	}
	_$(Here).on("load", _done);
	if (Doc.readyState == "complete") {
		setTimeout(_done, 0)
	} else {
		_$(Doc).on('DOMContentLoaded', _done);
		if (Doc.documentElement.doScroll) {
			try {
				if (Here.frameElement === null) {
					try_scroll()
				}
			} catch(e) {
				_$(Doc).on('readystatechange',function() {
					if (Doc.readyState == "complete") {
						_$(Doc).un('readystatechange');
						_done()
					}
				})
			}
		}
	}
	try {
		Doc.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
		Doc.execCommand("BackgroundImageCache", false, true)
	} catch(x) {}
	var isthenjs = /(^|\/)(then)(\.[^\/]+)*(?=\.js)/i,
	dev,
	rh = /^(https?|file):\/{2,}[^\/]+(?=\/|$)/;
	$.host = (location.href.match(rh) || [''])[0];
	_$('script').each(function(js, i, st) {
		if (isthenjs.test(js.src)) {
			var src = js.hasAttribute ? js.src: js.getAttribute('src', 4);
			$.abbr('~', (src.match(rh) || [$.host])[0]);
			$.abbr('@', src.replace(/^(.*?)\/(?=[\w.]+\.js)[^\/]*$/i, '$1') + '/lib/');
			dev = _$(js).attr('data-ready');
			dev = dev && $.task(function(tk) {
				$(Doc).on(dev, tk.done.bind(tk))
			});
			$.require(merge($.getArray(Here.thenq), $.getArray(_$(js).attr('data-load') || '')))
		}
	});
	allReady = $.ready = function(f, o) {
		return $.when([$, importer, dev, true], f, o)
	};
	Here.T = Here.thenjs = $;
	Here.$ = Here.$ || $;
	$.log("thenjs Ready")
})(this);