function changeZoom(){
    var cropited = $('.cropit-image-preview')[0].getBoundingClientRect(),
    modal = $('.image-editor')[0].getBoundingClientRect(),
    position = $('.cropit-image-preview').css('background-position').split(" "),
    top = parseInt(position[1])+cropited.top-modal.top,
    left = parseInt(position[0])+cropited.left-modal.left;
    $('.image-editor').css('background-size', $('.cropit-image-preview').css('background-size')); 
    
    $('.image-editor').css('background-position', left+"px "+top+"px");
}
(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 0;    // We will scale the photo width to this
  var height = 550;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var cropped = null;
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

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementsByClassName('photo-take-discard')[0];
    cropped = document.getElementsByClassName('cropit-image-preview')[0];

    navigator.getMedia = ( navigator.getUserMedia ||
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
      },
      function(err) {
        console.log("An error occured! :");
        console.log(err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        width = video.videoWidth / (video.videoHeight/height);
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(width)) {
          width = height * (4/3);
        }
        video.setAttribute('width', width);
        video.setAttribute('height', height);        
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);
    
    clearphoto();
    var config = { childList: false, attributes: true };
    var target = document.querySelector( '.cropit-image-preview' );
    // $('.export').click(function() {
    //   var imageData = $('.image-editor').cropit('export');
    //   window.open(imageData);
    // });
    var observer = new MutationObserver(onResize);
    observer.observe(target, config);
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    // photo.setAttribute('src', data);
  }
  
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width*2;
      canvas.height = height*2;
      //Desenha um imagem com o frame atual do video
      context.drawImage(video, 0, 0, width*2, height*2);

      //Converte a imagem do canvas em um png
      var data = canvas.toDataURL('image/png');
      //Coloca a imagem no img
      $('.image-editor').cropit('imageSrc',data);
      // photo.setAttribute('src', data);
      cropped.style.opacity = '1';
      video.style.opacity = 0;
      document.getElementsByClassName('photo-fundo')[0].style.background = "rgba(255,255,255,0.6)";
    } else {
      // clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();