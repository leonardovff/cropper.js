var webCam = (function(elCam, elModal,options){
	'use strict';
	var get = {
		id: function(el){
			return document.getElementById(el);
		},
		item: function(el,parent){
			if(parent) return parent.querySelector(el);
			return document.querySelector(el);
		},
		list: function(el,parent){
			if(parent) return parent.querySelector(el);
			return document.querySelectorAll(el);
		}
	},
	_self = this,
	methods = {},
	elModal = get.item(elModal),
	elCam = get.item(elCam),
	width = 0,
	height = 550,
	video = null,
	canvas = null,
	photoEdit = null,
	zoomInput = null,
	btnCapture = null,
	btnSend = null,
	btnCaptureFlag = false, 
	streaming = false,
	dataUrl = null,
	app = {
		init: function(){
			if(options.height) height = options.height
			photoEdit = get.item('.photo-edit',elCam);
			video = get.item('#video',elCam);
		    canvas = get.item('#canvas',elCam);
		    zoomInput = get.item('.photo-zoom-input',elCam);
		    btnCapture = get.item('.photo-take-discard',elCam);
			btnSend = get.item('.photo-save', elCam);
			elCam.dataset.status = "waint";
		    app.acessCam();
		    btnActions.init();
		},
		initFromFile: function(base64){
			if(options.height) height = options.height
			photoEdit = get.item('.photo-edit',elCam);
			video = get.item('#video',elCam);
		    canvas = get.item('#canvas',elCam);
		    zoomInput = get.item('.photo-zoom-input',elCam);
		    btnCapture = get.item('.photo-take-discard',elCam);
			btnSend = get.item('.photo-save', elCam);
			elCam.dataset.status = "waint";
		    btnActions.init(base64);
        	modal.open();
		    btnActions.take(btnCapture,base64);
	      	setTimeout(function(){
				elModal.className = "open";
			},200);
		},
		acessCam: function(){
		    navigator.getMedia = ( 	navigator.getUserMedia ||
		                           	navigator.webkitGetUserMedia ||
		                           	navigator.mozGetUserMedia ||
                           			navigator.msGetUserMedia);
		    navigator.getMedia(
		      	{
		        	video: true,
		        	audio: false
		      	},
		      	function(stream) {
		        	if (navigator.mozGetUserMedia) {
			          	video.mozSrcObject = stream;
			        } else {
			          	var vendorURL = window.URL || window.webkitURL;
			          	video.src = vendorURL.createObjectURL(stream);
			        }
		        	video.play();
		        	modal.open();
		      	},
		      	function(err) {
		      		var temp = err.name=='PermissionDeniedError'?"Permissão à camera negada!":"Camera não encontrada!"
		        	console.log("An error occured! :");
		        	console.log(err);
		        	alert(temp);
		        	modal.close();
		        	app.destroy();
		     	}
		    );
		    video.addEventListener('canplay', app.setDimension, false);
		},
		setDimension: function(ev){
			if (!streaming) {
	   	     	width = video.videoWidth / (video.videoHeight/height);
	        	// Firefox currently has a bug where the height can't be read from
	        	// the video, so we will make assumptions if this happens.
	  
	        	if (isNaN(width)) {
	          		width = height * (4/3);
	        	}
	        	// video.setAttribute('width', width);
	        	video.setAttribute('height', height);        
	        	// canvas.setAttribute('width', width);
	        	canvas.setAttribute('height', height);

	        	streaming = true;
      			ev.preventDefault();
      		}
		},
		takePicture: function(callback, base64){
			if(base64){
				$('.photo').cropit('imageSrc',base64);
		      	if(typeof(callback)==='function')
					callback.call();
				return true;
			}
			var context = canvas.getContext('2d');
		    if (width && height) {
		      	canvas.width = width*2;
		      	canvas.height = height*2;
		      	//Desenha um imagem com o frame atual do video
		      	context.drawImage(video, 0, 0, width*2, height*2);

		      	//Converte a imagem do canvas para base64
		      	var data = canvas.toDataURL('image/png');

		      	dataUrl = data;
      			$('.photo').cropit('imageSrc',dataUrl);
		      	if(typeof(callback)==='function') 
				callback.call();
		    }
		},
		destroy: function(){
			video.removeEventListener('canplay');
			btnCapture.removeEventListener('click');
			btnSend.removeEventListener('click');

		}

	},
	btnActions = {
		init: function(base64){
			if(base64){
				btnCapture.className = "photo-take-discard";
			   	btnCapture.addEventListener('click', btnActions.exit);
			   	btnCapture.dataset.action = 'take';
			    btnCaptureFlag = true;
			    btnSend.addEventListener('click', btnActions.confirmPhoto);
			    return true;
			}
			btnCapture.className = "photo-take-discard";
		   	btnCapture.addEventListener('click', btnActions.takeDiscard);
		   	btnCapture.dataset.action = 'take';
		    btnCaptureFlag = true;
		    btnSend.addEventListener('click', btnActions.send);
		},
		exit: function(){
			modal.close();
			get.id("ccfile").value = "";
		},
		confirmPhoto: function(){
			modal.close();
		 	var imagem = $('.photo').cropit('export', {
			  type: 'image/jpeg',
			  quality: .9,
			  originalSize: true
			});
			get.id("ccFoto").value = imagem;
			get.id("ccPreview").src = imagem;
		},
		takeDiscard: function(ev){
			if(btnCaptureFlag && 
				(this.dataset.action=="take" ||
				this.dataset.action=="discard")){
				var spanAnimation = get.item('span', btnCapture);
				spanAnimation.addEventListener("webkitAnimationEnd", btnActions.endAnimationTD,false);
				spanAnimation.addEventListener("animationend", btnActions.endAnimationTD,false);
				spanAnimation.addEventListener("oanimationend", btnActions.endAnimationTD,false);
				btnCaptureFlag = false;
				if(this.dataset.action=="take") return btnActions.take(this);
				return btnActions.discard(this);
			}
	     	ev.preventDefault();
		},
		take: function(el, base64){
			el.className = "photo-take-discard to-discard";
			el.dataset.action = "discard";
			setTimeout(function(){
				app.takePicture(function(){
					elCam.dataset.status = "captured";
					zoomInput.removeAttribute('disabled');
					btnSend.removeAttribute('disabled');
					$('.photo').cropit('reenable');
					get.item('div img', btnCapture).src = "assets/img/discard.png";
				},base64);
			},500);
		},
		discard: function(el){
			el.className = "photo-take-discard to-take";
			el.dataset.action = "take";
			elCam.dataset.status = "waint";
			zoomInput.setAttribute('disabled', 'on'); 
			btnSend.setAttribute('disabled', 'on');
			$('.photo').cropit('disable');
			$('.photo-edit').css('backgroundImage','');
			$('.photo').css('backgroundImage','');
			get.item('div img', btnCapture).src = "assets/img/take.png";
		},
		endAnimationTD: function(){
			this.parentNode.className = "photo-take-discard";
			btnCaptureFlag = true; 
		},
		send: function(){
	        var imagem = $('.photo').cropit('export', {
			  type: 'image/jpeg',
			  quality: .9,
			  originalSize: true
			});
	        var blob = dataURItoBlob(imagem);
	        var fd = new FormData();
	        fd.append("canvasImage", blob);
	        btnSend.dataset.status = "sending";
	        btnSend.setAttribute('disabled','on');
	        $.ajax({
	           url: "teste.php",
	           type: "POST",
	           data: fd,
	           processData: false,
	           contentType: false,
	           error:function(){
	        		btnSend.dataset.status = "sended";
	        		btnSend.removeAttribute('disabled');
	           		alert('Erro no envio, olhar console!');
	           }
	        }).done(function(respond){
	        	console.log(respond);
	        	btnSend.dataset.status = "sended";
	        	btnSend.removeAttribute('disabled');
	          	alert("Enviou, olhar console");
	          	modal.close();
	        });
		}
	},
	modal = {
		backgroundOpen: function(callback){
			elModal.style.display = "block";
			setTimeout(function(){
				elModal.className = 'opening';
			},10);
			if(typeof(callback)==='function') 
				callback.call();
		},
		open: function(){
			elModal.className = 'open';
		},
		close: function(){
			elModal.className = '';
			setTimeout(function(){
				elModal.style.display = "none";
			},1000);
		}

	};
	function dataURItoBlob(dataURI) {
	    // convert base64/URLEncoded data component to raw binary data held in a string
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0)
	        byteString = atob(dataURI.split(',')[1]);
	    else
	        byteString = unescape(dataURI.split(',')[1]);

	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    // write the bytes of the string to a typed array
	    var ia = new Uint8Array(byteString.length);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }

	    return new Blob([ia], {type:mimeString});
	}
	return methods = {
		open: function(){
			modal.backgroundOpen(function(){
				app.init();
			});
		},
		loadImage: function(dataBase64){
			modal.backgroundOpen(function(){
				app.initFromFile(dataBase64);
			});
		}
	};
});
function changeZoom(){
    var edit = $('.photo-edit')[0].getBoundingClientRect(),
    modal = $('.photo')[0].getBoundingClientRect(),
    position = $('.photo-edit').css('background-position').split(" "),
    top = parseInt(position[1])+edit.top-modal.top,
    left = parseInt(position[0])+edit.left-modal.left;
    $('.photo').css('background-size', $('.photo-edit').css('background-size')); 
    
    $('.photo').css('background-position', left+"px "+top+"px");
}
$('.photo').cropit({
  	'onImageLoaded': function(){
   		var distancias = $('.photo').cropit('offset');
		$('.photo').cropit('offset', { x: distancias.x-61, y: distancias.y });
    	$('.photo').cropit('zoom',.9);
    	$('.photo').css('background-image', $('.photo-edit').css('background-image'));
		changeZoom();
  	},
  	onImageError: function(){
  		console.log('erro');
  	}
});
  // width: 354px;
  // height: 472px;

var onResize = (function () {
	'use strict';

	var timeWindow = 50; // tempo em ms
	var lastExecution = new Date((new Date()).getTime() - timeWindow);

	var onResize = function (args) {
	  // nosso código é escrito nessa função
	  changeZoom();	
	};

	return function() {
	  if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
	    lastExecution = new Date();
	    return onResize.apply(this, arguments);
	  }
	};
}());
window.onload = function(){
	var config = { childList: false, attributes: true },
	target = document.querySelector( '.photo-edit'),
	observer = new MutationObserver(onResize);
	observer.observe(target, config);

	var camera = new webCam('.photo','#modalContainer',{
		height:550
	});
	document.getElementById('openModal').addEventListener('click',camera.open, false);
	document.querySelector('#ccfile').addEventListener('change',function(e){
	    console.log(e);
	    e.preventDefault();
	    var target = e.dataTransfer || e.target,
	    file = target && target.files && target.files[0],
	    options = {
	      canvas: true,
	      pixelRatio: window.devicePixelRatio,
	      downsamplingRatio: 0.5
	    }
	    if (!file) {
	      return
	    }
	    var reader  = new FileReader();
	    reader.onloadend = function () {
	      loadImage.parseMetaData(file, function (data) {
	        if (data.exif) {
	          loadImage(reader.result, function (img) {
	            camera.loadImage(img.toDataURL("image/jpeg"));
	          }, {orientation: data.exif.get('Orientation')});
	          return 
	        }
	        camera.loadImage(reader.result);
	      });
	    }
	    reader.readAsDataURL(file);
  	});
}