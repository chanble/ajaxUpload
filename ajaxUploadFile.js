/*
* author chenbo
* 
*/
function WyAjaxUploadFile(el, opts){
	this.element = el;
	var that = this;
	var dafaultOpt = {
		'url' : '',
		'method' : 'post',
		'dataType' : 'json',
		'multiple' : '',
		'fileType' : /.*/,
		'async' : true,
		'succ' : function(data){
			
		}
	};
	
	//不递归，
	var o_extend = function(o1, o2){
		var oRes = {};
		if(isJson(o1) && isJson(o2)){
			for(var o1i in o1){
				if(o2[o1i] != null){
					oRes[o1i] = o2[o1i];
				}else{
					oRes[o1i] = o1[o1i];
				}
			}
		}else if(isJson(o1) ^ isJson(o2)){
			oRes = isJson(o1) ? o1 : o2;
		}
		return oRes;
	}
	
	//判断变量是否市json对象
	var isJson = function(v){
		return v && typeof v == 'object';
	}
	this.options = o_extend(dafaultOpt, opts);
	
	var in_file = document.createElement('input');
	var wy_ajaxupload_add = document.createElement('div');
	var ul_file_list = document.createElement('ul');
	var wy_ajaxupload_files = document.createElement('div');
	var wy_ajaxupload_upload = document.createElement('div');
	var upload_btn = document.createElement('button');
	var wy_ajaxupload = document.createElement('div');
	var upload_files = [];
	function init(){
		in_file.setAttribute('type', 'file');
		if(that.options['multiple'] == 'multiple'){
			in_file.setAttribute('multiple', 'multiple');
		}
		wy_ajaxupload_add.className = 'wy_ajaxupload_add';
		wy_ajaxupload_add.appendChild(in_file);
		wy_ajaxupload_files.className = 'wy_ajaxupload_files';
		wy_ajaxupload_files.appendChild(ul_file_list);
		in_file.addEventListener("change", that.addFile, false);
		upload_btn.setAttribute('type', 'button');
		upload_btn.innerHTML = '上传';
		upload_btn.addEventListener('click', upload);
		wy_ajaxupload_upload.appendChild(upload_btn);
		wy_ajaxupload.appendChild(wy_ajaxupload_add);
		wy_ajaxupload.appendChild(wy_ajaxupload_files);
		wy_ajaxupload.appendChild(wy_ajaxupload_upload);
		el.appendChild(wy_ajaxupload);
	}

	this.addFile = function(event){
		var fileList = this.files;
		var fileType = that.options['fileType'];
		for (var i = 0, numFiles = fileList.length; i < numFiles; i++) {
			var file = fileList[i];
			if(!file.type.match(fileType)){
				continue;
			}
			var li_file = document.createElement('li');
			var reader = new FileReader();
			reader.onloadstart = function() {
				if(that.options['multiple'] != 'multiple'){
					ul_file_list.innerHTML = "";
					upload_files = [];
				}
				var li_file_span = document.createElement('span');
				if(file.name.length > 20){
					li_file_span.innerHTML = '&nbsp;&nbsp;...' + file.name.substr(-20, 20) + '&nbsp;&nbsp;';
				}else{
					li_file_span.innerHTML = '&nbsp;&nbsp;' + file.name + '&nbsp;&nbsp;';
				}
				li_file_span.setAttribute('title', file.name);
				var del_button = document.createElement('a');
				del_button.setAttribute('href', 'javascript:;');
				del_button.innerHTML = '删除';
				var progress_data = document.createElement('span');
				var progress_data_total = document.createElement('span');
				progress_data_total.innerHTML = '/' + (file.size / 1024).toFixed(2) + 'KB';
				var progress_data_progress = document.createElement('span');

				progress_data.appendChild(progress_data_progress);
				//进度显示
				//progress_data_progress.id = 'wy_ajaxupload_progress_' + ;
				progress_data_progress.innerHTML = '0';
				progress_data.appendChild(progress_data_total);
				del_button.addEventListener('click', function(){
					var del_li = this.parentNode;
					del_li.remove();
				});
				li_file.appendChild(li_file_span);
				li_file.appendChild(progress_data);
				li_file.appendChild(del_button);
				ul_file_list.appendChild(li_file);
			}
			reader.onloadend = function() {
				if(reader.error){
					alert(reader.error);
				}else{
					upload_files.push({'el':li_file, 'file': file, 'reader': reader});
				}
			}
			reader.readAsBinaryString(file);
			this.value = '';
		}
	}

	var upload = function(){
		for (var i = 0; i < upload_files.length; i++) {
			fileUpload(upload_files[i]);
			upload_files[i] = null;
		}
	}

	var url_parser = function(url){
		var parser = document.createElement('a');
		parser.href = url;
		return {
			'protocol': parser.protocol,
			'host': parser.host,
			'hostname': parser.hostname,
			'port': parser.port,
			'path': parser.pathname,
			'query': parser.search,
			'fragment': parser.hash,
		}
	}
	
	//
	function fileUpload(uploadObj) {
		if(!uploadObj){
			return false;
		}
		function addArgs(url, args){
			var ourl = url_parser(url);
			return ourl.protocol + '//' + ourl.host + ourl.path + (ourl.query.length > 0 ? (ourl.query + '&') : ('?'))  + args + ourl.fragment;
		}
		var reader = new FileReader();
		if(XMLHttpRequest.prototype.sendAsBinary == null){
			XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
				function byteValue(x) {
					return x.charCodeAt(0) & 0xff;
				}
				var ords = Array.prototype.map.call(datastr, byteValue);
				var ui8a = new Uint8Array(ords);
				this.send(ui8a.buffer);
			}
		}

		var xhr = new XMLHttpRequest();
		var progress_node = uploadObj.el.childNodes['1'].children['0'];

		xhr.upload.addEventListener("progress", function(e) {
			if (e.lengthComputable) {
				progress_node.innerHTML = (e.loaded / 1024).toFixed(2) + 'KB';
			}else{
				
			}
		}, false);
		//完成
		xhr.upload.addEventListener("load", function(e){
			progress_node.style.backgroundColor = 'lightgreen';
		}, false);
		
		xhr.upload.addEventListener("error", function(e){
			progress_node.style.backgroundColor = 'red';
		}, false);
		
		xhr.upload.addEventListener("abort", function(e){
			progress_node.style.backgroundColor = '';
		}, false);

		xhr.addEventListener('readystatechange', function(e){
			if(xhr.readyState == 4){
				if(xhr.status != '200'){
					that.options.succ.call(that, false);
				}else{
					var responseRes = that.options.dataType == 'json'
						? JSON.parse(xhr.responseText) : xhr.responseText;
					that.options.succ.call(that, responseRes);
				}
			}
		});
		var file = uploadObj.file;
		var fileKey = encodeURIComponent(file.name + '#' + file.size + '#' + file.type);
		var fullUrl = addArgs(that.options.url, 'filekey=' + fileKey);
		xhr.open("POST", fullUrl, that.options.async);
		xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
		xhr.sendAsBinary(uploadObj.reader.result);
	}
	init();
	return this;
}