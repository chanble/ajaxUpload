/*
* author chenbo
* 
*/
function WyAjaxUploadImg(el, opts){
	var that = this;
	var dafaultOpt = {
		'url' : '',
		'method' : 'post',
		'dataType' : 'json',
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
	var upload_files = {};
	function init(){
		in_file.setAttribute('type', 'file');
		in_file.setAttribute('multiple', 'multiple');
		wy_ajaxupload_add.id = 'wy_ajaxupload_add';
		wy_ajaxupload_add.appendChild(in_file);
		wy_ajaxupload_files.id = 'wy_ajaxupload_files';
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
		var imageType = /image.*/;
		for (var i = 0, numFiles = fileList.length; i < numFiles; i++) {
			var file = fileList[i];
			if(!file.type.match(imageType)){
				continue;
			}
			var li_file = document.createElement('li');
			var li_file_img = document.createElement('img');
			li_file_img.file = file;
			li_file_img.style.maxHeight = '60px';
			li_file_img.style.maxWidth = '100px';
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
			li_file.appendChild(li_file_img);
			li_file.appendChild(progress_data);
			li_file.appendChild(del_button);
			ul_file_list.appendChild(li_file);
			var reader = new FileReader();
			reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(li_file_img);
			reader.readAsDataURL(file);
		}
		this.value = '';
	}

	var upload = function(){
		var imgs = ul_file_list.querySelectorAll("img");
		for (var i = 0; i < imgs.length; i++) {
			fileUpload(imgs[i], imgs[i].file);
		}
	}
	
	//"data" should be binary data
	var uploadFile = function(url, data){
		// 构造 XMLHttpRequest 对象，发送文件 Binary 数据
		var xhr = new XMLHttpRequest();
		xhr.open("POST",url);
		xhr.overrideMimeType("application/octet-stream");
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
		xhr.sendAsBinary(data);
		xhr.onreadystatechange = function() { 
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					console.log("response: " + xhr.responseText);
				}
			}
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
	function fileUpload(img, file) {

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

		xhr.upload.addEventListener("progress", function(e) {
			if (e.lengthComputable) {
				var progress_node = img.nextSibling.firstChild;
				progress_node.innerHTML = (e.loaded / 1024).toFixed(2) + 'KB';
			}else{
				
			}
		}, false);
		//完成
		xhr.upload.addEventListener("load", function(e){
			var progress_node = img.nextSibling.firstChild;
			progress_node.style.backgroundColor = 'lightgreen';
		}, false);
		
		xhr.upload.addEventListener("error", function(e){
			var progress_node = img.nextSibling.firstChild;
			progress_node.style.backgroundColor = 'red';
		}, false);
		
		xhr.upload.addEventListener("abort", function(e){
			var progress_node = img.nextSibling.firstChild;
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
		var fileKey = encodeURIComponent(file.name + '#' + file.size + '#' + file.type);
		var fullUrl = addArgs(that.options.url, 'filekey=' + fileKey);
		xhr.open("POST", fullUrl);
		xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
		reader.onload = function(evt) {
			xhr.sendAsBinary(evt.target.result);
		};

		reader.readAsBinaryString(file);
	}
	init();
	return this;
}