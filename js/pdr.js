;if((!(window.plus)) || (window.plus && (!window.plus.isReady))) window.plus = navigator.plus = {isReady:true};

(function(plus){
    var tools = plus.tools = {
		__UUID__:	0,
		UNKNOWN:	-1,
		IOS:		0,
		ANDROID:	1,
		platform:	-1,
		debug : false,
		UUID: function (obj) {
			return obj + ( this.__UUID__++ ) + new Date().valueOf();
		},
		extend: function(destination, source) {
			for (var property in source) { 
				destination[property] = source[property]; 
			}
		},
		typeName: function(val) {
			return Object.prototype.toString.call(val).slice(8, -1);
		},
		isDate: function(d) {
			return tools.typeName(d) == 'Date';
		},
		isArray: function(a) {
			return tools.typeName(a) == 'Array';
		},
		isDebug :function (){
			return plus.tools.debug;
		},
		stringify : function(args) {
			if ( window.JSON3 ){
				return window.JSON3.stringify(args);
			}
			return JSON.stringify(args);
		},
		isNumber: function(a) {
			return (typeof a === 'number') || (a instanceof Number);
		},
		execJSfile : function(path) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = path;
			function insertScript(s){
				var h=document.head,b=document.body;
				if(h){
					h.insertBefore(s,h.firstChild);
				}else if(b){
					b.insertBefore(s,b.firstChild);
				}else{
					setTimeout(function(){
						insertScript(s);
					},100);
				}
			};
			insertScript(script);
		},
		copyObjProp2Obj : function ( wb, param, excludeProperties ) {
	        var exclude = excludeProperties instanceof Array ?true:false;
	        for ( var p in param ) {
	            var copy = true;
	            if ( exclude ) {
	                for (var i = 0; i < excludeProperties.length; i++) {
	                    if ( p == excludeProperties[i] ) {
	                        copy = false;
	                        break;
	                    }
	                }
	            }
	            if ( copy ) {
	                wb[p] = param[p];
	            } else {
	                copy = true;
	            }
	        }
    	},
		clone: function(obj) {
			if(!obj || typeof obj == 'function' || tools.isDate(obj) || typeof obj != 'object') {
				return obj;
			}

			var retVal, i;

			if(tools.isArray(obj)){
				retVal = [];
				for(i = 0; i < obj.length; ++i){
					retVal.push(tools.clone(obj[i]));
				}
				return retVal;
			}
			retVal = {};
			for(i in obj){
				if(!(i in retVal) || retVal[i] != obj[i]) {
					retVal[i] = tools.clone(obj[i]);
				}
			}
			return retVal;
		}
	};
	tools.debug = (window.__nativeparamer__ && window.__nativeparamer__.debug)? true:false;
	tools.platform = window._____platform_____;

})(window.plus);

(function(plus){
    function createExecIframe() {
		function insertScript(s){
			var b=document.body;
			if(b){
				if ( !s.parentNode ) {
					b.appendChild(s);
				}
			}else{
				setTimeout(function(){
					insertScript(s);
				},100);
			}
		};
	
        var iframe = document.createElement("iframe");
        iframe.id = "exebridge";
        iframe.style.display = 'none';
       // document.body.appendChild(iframe);
        insertScript(iframe);
        return iframe;
    }
var T = plus.tools,
	B = plus.bridge = {
		NO_RESULT:					0,
		OK:							1,
		CLASS_NOT_FOUND_EXCEPTION:	2,
		ILLEGAL_ACCESS_EXCEPTION:	3,
		INSTANTIATION_EXCEPTION:	4,
		MALFORMED_URL_EXCEPTION:	5,
		IO_EXCEPTION:				6,
		INVALID_ACTION:				7,
		JSON_EXCEPTION:				8,
		ERROR:						9,
		callbacks:{},
		commandQueue: [],
		commandQueueFlushing:false,
		synExecXhr: new XMLHttpRequest(),
		execIframe: null,
		nativecomm: function () {
			var json = '[' + B.commandQueue.join(',') + ']';
			B.commandQueue.length = 0;
			return json
		},
		execImg:null,
		createImg : function(){
			function insertScript(s){
				var b=document.body;
				console.log('11111111111111111110'+b);
				if(b){
					b.appendChild(s);
				}else{
					setTimeout(function(){
						insertScript(s);
					},100);
				}
			};
			
			var img = document.createElement("img");
	        img.id = "exebridge";
	        img.style.display = 'none';
	        insertScript(img);
	        return img;
		},
		exec:function ( service, action, args, callbackid ) {
			if ( T.IOS == T.platform ) {
				B.commandQueue.push(T.stringify([window.__HtMl_Id__, service, action, callbackid || null, args]));
				if( B.execIframe && !B.execIframe.parentNode ) {
					document.body.appendChild(B.execIframe);
				}
				if ( B.commandQueue.length == 1 && !B.commandQueueFlushing ) {
					B.execIframe = B.execIframe || createExecIframe();
					B.execIframe.src = "plus://command"
				}
			} else if ( T.ANDROID == T.platform ) {
				/*if(B.execImg && !B.execImg.parentNode){
					document.body.appendChild(B.execImg);
				}else{
					B.execImg = B.execImg || B.createImg();
					B.execImg.src = 'pdr:'+T.stringify([service,action,true,T.stringify(args)]);
				}*/
				
				window.prompt(T.stringify(args),'pdr:'+T.stringify([service,action,true]))
			}
		},
		execSync: function ( service, action, args, fn) {
			if ( T.IOS == T.platform ) {
				var json = T.stringify([[window.__HtMl_Id__, service, action, null, args]]),
					sync = B.synExecXhr;
				sync.open( 'post', "http://localhost:13131/cmds", false );
				sync.setRequestHeader( "Content-Type", 'multipart/form-data' );
				//sync.setRequestHeader( "Content-Length", json.length );
				sync.send( json );
				if ( fn ) {
					return fn(sync.responseText);
				}
				return window.eval( sync.responseText );
			} else if ( T.ANDROID == T.platform ) {
				var ret = window.prompt(T.stringify(args),'pdr:'+T.stringify([service,action,false]));
				if ( fn ) {
					return fn(ret);
				}
				return eval(ret);
			}
		},
		callbackFromNative: function ( callbackId, playload ) {
			var fun = B.callbacks[callbackId];
			if ( fun ) {
				if ( playload.status == B.OK && fun.success) {
					if ( fun.success ) fun.success( playload.message )
				} else {
					if ( fun.fail )fun.fail( playload.message )
				}
				if ( !playload.keepCallback ) {
					delete B.callbacks[callbackId]
				}
			}
		},
		callbackId: function ( successCallback, failCallback ) {
			var callbackId = T.UUID('plus');
			B.callbacks[callbackId] = { success:successCallback, fail:failCallback };
			return callbackId;
		}
	}

})(window.plus);
plus.obj = plus.obj || {};
plus.obj.Callback = (function(){
        function Callback(){
			var __me__ = this;
            __me__.__callbacks__ = {};
            
            __me__.__callback_id__ = plus.bridge.callbackId(function(args){
                var _evt = args.evt,
					_args = args.args,
					_arr = __me__.__callbacks__[_evt];
                if(_arr){
					var len = _arr.length,
						i = 0;
                    for(; i < len; i++){
                        __me__.onCallback(_arr[i],_evt,_args)
                    }
                }
            })
        }
        function onCallback(fun,evt,args){
           //抛异常
           throw "Please override the function of 'Callback.onCallback'"
        }
        
        
        Callback.prototype.addEventListener = function(evtType,fun,capture){
        	var notice = false,
				that = this;
	        if(fun){
	            if(!that.__callbacks__[evtType]){
	            	that.__callbacks__[evtType]=[];
	            	notice = true
	            }
	            that.__callbacks__[evtType].push(fun)
	        }
	        return notice
        }
        
        Callback.prototype.removeEventListener = function(evtType,fun){
        	var notice = false,
				that = this;
            if(that.__callbacks__[evtType]){
                that.__callbacks__[evtType].pop(fun);
                notice = (that.__callbacks__[evtType].length === 0);
                if(notice) that.__callbacks__[evtType] = null
            }
            return notice
        }       
        return Callback;
   })();