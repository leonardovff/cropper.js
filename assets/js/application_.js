var get = {
	id: function(el){
		return document.getElementById(el);
	},
	item: function(el){
		return document.querySelector(el);
	},
	list: function(el){
		return document.querySelectorAll(el);	
	},
	class: function(el){
		return document.getElementsByClassName(el);
	}
}
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
var app = {
	initial: function(){
		$('.image-editor').cropit({
          	'onImageLoaded': function(){
           		var distancias = $('.image-editor').cropit('offset');
        		$('.image-editor').cropit('offset', { x: distancias.x-61, y: distancias.y });
            	$('.image-editor').cropit('zoom',.9);
            	$('.image-editor').css('background-image', $('.cropit-image-preview').css('background-image'));
   				changeZoom();
          	}
        });
		var btnTD = get.class('photo-take-discard')[0];
		animationTD = get.item('.photo-take-discard span');
		btnTD.dataset.action = "take";
		btnTD.addEventListener('click', webcam.takeDiscard);
		animationTD.addEventListener("webkitAnimationEnd", webcam.endAnimationBtn,false);
		animationTD.addEventListener("animationend", webcam.endAnimationBtn,false);
		animationTD.addEventListener("oanimationend", webcam.endAnimationBtn,false);
		get.item('.photo-save').addEventListener("click", webcam.send,false);
	}
}
var webcam = {
	video: get.id('video'),
	canvas: get.id('canvas'),
	btnTakeDiscard: true,
	height: 550,
	takeDiscard: function(ev){
		if(webcam.btnTakeDiscard && 
			(this.dataset.action=="take" ||
			this.dataset.action=="discard")){
			webcam.btnTakeDiscard = false;
			if(this.dataset.action=="take") return webcam.take(this);
			return webcam.discard(this);
		}
     	ev.preventDefault();
	},
	take: function(el){
		el.className = "photo-take-discard to-discard";
		el.dataset.action = "discard";
		$('.image-editor').cropit('reenable');
	},
	discard: function(el){
		el.className = "photo-take-discard to-take";
		el.dataset.action = "take";
		console.log('entrou');
		get.id('video').style.opacity = 1;
		get.item('.cropit-image-preview').opacity = 0.1;
		$('.image-editor').cropit('disable');
	},
	endAnimationBtn: function(){
		this.parentNode.className = "photo-take-discard";
		webcam.btnTakeDiscard = true; 
	},
	send: function(){
		console.log('entrou');
		var dataUrl = $('.image-editor').cropit('export', {
		  type: 'image/jpeg',
		  quality: .9,
		  originalSize: true
		});

        var blob = dataURItoBlob(dataUrl);
        var fd = new FormData();
        fd.append("canvasImage", blob);
        $.ajax({
           url: "teste.php",
           type: "POST",
           data: fd,
           processData: false,
           contentType: false,
        }).done(function(respond){
        	console.log(respond);
          alert("enviou, olhar console");
        });
	}	
}
// window.onload = app.initial();
window.onload = function(){
	// var imagem = new ImageEditor({
	    // $el: $('.image-editor'),
	//     width: 250,
	//     height: 250
	// }); 
}