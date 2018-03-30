
var audioContext = null;
var meter = null;
var rafID = null;
var mediaStreamSource = null;
var recognizing = false;
var recognition;

var socket;

var DOM_screen = $('.screen'),
    DOM_screenBackground = $('.screen-background'),
    screenW = DOM_screen.width(),
    screenH = DOM_screen.height();

var maxBubbleScale = 3,
    minBubbleScale = .8;
var removeZoneSize = 150; // width and height of delete zones

var lastView = 'topic',
    currentView = 'topic';

var defaultRotation = 90;

var wordPlaceholders = [
  [ 540, 540 ],
  [ 1400, 540 ],
  [ 625, 250 ],
  [ 1285, 820 ],
  [ 625, 820 ],
  [ 1285, 250 ],
  [ 370, 320 ],
  [ 1570, 760 ],
  [ 370, 760 ],
  [ 1570, 320 ],
];

var room;

window.onload = function () {
  // Disable right click
	document.addEventListener('contextmenu', event => event.preventDefault());

	var url_array = document.location.pathname.split('/');
	room = url_array[1];
	socket = io();
	var once = 1;

	socket.emit('room', {
  	"client": "app",
		"room_id": room
	});

	socket.emit('get_data');

	socket.on('get_data', function(datas) {
		init(datas);
	});

	socket.on('bubble/add', function(bubble) {
		console.log("on('bubble/add')", bubble);
		createBubble(bubble.type, bubble.bubble);
	});

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();
	try {
		navigator.getUserMedia =
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		navigator.getUserMedia(
		{
			"audio": {
				"mandatory": {
					"googEchoCancellation": "false",
					"googAutoGainControl": "false",
					"googNoiseSuppression": "false",
					"googHighpassFilter": "false"
				},
			"optional": []
			},
		}, gotStream, didntGetStream);
	} catch (e) {
		alert('getUserMedia threw exception :' + e);
	}

	init_microphone(socket);
}

/* MICROPHONE */

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;
	processor.connect(audioContext.destination);

	processor.checkClipping = function() {
		if (!this.clipping)
			return false;
		if ((this.lastClip + this.clipLag) < window.performance.now())
			this.clipping = false;
		return this.clipping;
	};
	processor.shutdown = function() {
		this.disconnect();
		this.onaudioprocess = null;
	};
	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
	var bufLength = buf.length;
	var sum = 0;
	var x;
	for (var i=0; i<bufLength; i++) {
		x = buf[i];
		if (Math.abs(x)>=this.clipLevel) {
			this.clipping = true;
			this.lastClip = window.performance.now();
		}
		sum += x * x;
	}
	var rms =  Math.sqrt(sum / bufLength);
	this.volume = Math.max(rms, this.volume*this.averaging);
}

function didntGetStream() {
	alert('Stream generation failed.');
}

function gotStream(stream) {
	mediaStreamSource = audioContext.createMediaStreamSource(stream);
	meter = createAudioMeter(audioContext);
	mediaStreamSource.connect(meter);
	listenLoop();
}

function listenLoop() {
	console.log('meter.volume', meter.volume);
      	if (meter.volume < 0.01) {
		recognition.stop();
	} else {
		if (!recognizing) {
			recognition.start();
		}
	}
	rafID = window.requestAnimationFrame( listenLoop );
}

function init_microphone(socket) {
	if (!('webkitSpeechRecognition' in window)) {
		upgrade();
	} else {
		var transcription = '';
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'fr-FR';
		recognition.start();

		recognition.onstart = function() {
			console.log('Recognition started');
			recognizing = true;
		}

		recognition.onresult = function(event) {
			for (var i = event.resultIndex; i < event.results.length; ++i)
				if (event.results[i].isFinal) {
					transcription += event.results[i][0].transcript;
					console.log('FINAL', transcription);
				} else {
					console.log('INTERIM', event.results[i][0].transcript);
				}
			console.log('transcription:', transcription);
			socket.emit('transcription/send', transcription);
			transcription = '';
		}

		recognition.onerror = function(event) {
			console.log('Recognition error');
			recognizing = false;
		}

		recognition.onend = function() {
			console.log('Recognition finished. Should never happen');
			recognizing = false;
			if (!transcription)
				return;
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
				document.createRange();
			}
		}
	}
}

// Graphic

  function init(datas) {
   setView('topic');
   setEye('bottom');

    DOM_screenBackground.on('click', function(e){
      setPreviousView();
    });

   $('.eye').on('click', function(){
      setEye($(this).data('side'));
    });

    createBubble('topic', { name: datas.name });

    for (child in datas.children) {
      createBubble('interest', {"name": datas.children[child].name});
        for (word in datas.children[child].children) {
  	       createBubble('word', {"name": datas.children[child].children[word].name, "interest": datas.children[child].name});
        }
    }

    createBubble('content', { type: 'quote', word: 'Truc', content: 'La convention collective nationale pour l\'entreprise de la société accorde une journée pour père et mère quand l\'enfant entre pour la première fois à l\'école' });
    createBubble('content', { type: 'image', word: 'Truc', content: 'Texte de loi n°2', file: '/img/photo1.jpg' });
    createBubble('content', { type: 'image', word: 'Truc', content: 'Texte de loi n°4', file: '/img/photo1.jpg' });

    /*createBubble('interest', { name: 'Transports' });
    createBubble('interest', { name: 'Imprévus externes' });

    createBubble('word', { name: 'Imprévu 1', interest: 'Imprévus externes' });
    createBubble('word', { name: 'Imprévu 2', interest: 'Imprévus externes' });
    createBubble('word', { name: 'Imprévu 3', interest: 'Imprévus externes' });

    createBubble('word', { name: 'Transports 1', interest: 'Transports' });
    createBubble('word', { name: 'Transports 2', interest: 'Transports' });
    createBubble('word', { name: 'Transports 3', interest: 'Transports' });
    createBubble('word', { name: 'Transports 4', interest: 'Transports' });
    createBubble('word', { name: 'Transports 5', interest: 'Transports' });
    createBubble('word', { name: 'Transports 6', interest: 'Transports' });
    createBubble('word', { name: 'Transports 7', interest: 'Transports' });
    createBubble('word', { name: 'Transports 8', interest: 'Transports' });

    createBubble('word', { name: 'Imprévu 1sfsfsef', interest: 'Imprévus internes' });
    createBubble('word', { name: 'Imprévu 2 sdfds fdsfd sds dsfdsf', interest: 'Imprévus internes' });
    createBubble('word', { name: 'Imprévu sdf dsf dsf dsf ds f sd fd3', interest: 'Imprévus internes' });

    setTimeout(function(){
      createBubble('interest', { name: 'Imprévus internes' });
    }, 1500);
    */
    //
    // setTimeout(function(){
    //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
    //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
    //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
    // },1000);

    // setView('interest', { name: 'Imprévus externes' });
  }

  function setEye(side) {
    DOM_screen.attr('data-eye-side', side);

    var sides = {
      'bottom': 0,
      'left': 90,
      'right': -90,
      'top': 180
    };

    defaultRotation = sides[side];

    $('.bubble-inner, .bubble--content .bubble-container')
      .css({
        transform: 'rotate('+defaultRotation+'deg)'
      });

    $('.bubble--word')
      .data('rotation', defaultRotation);
  }




  function changeBubbleSize(mode, d) {
    var changeDiff = .1;
    var bubble = $('.bubble[data-type="'+d.type+'"][data-name="'+d.name+'"]');
    var newScale;

    if (mode == 'inc') {
      newScale = bubble.data('scale') + changeDiff;
    }
    if (mode == 'dec') {
      newScale = bubble.data('scale') - changeDiff;
    }

    bubble
      .data('scale', newScale)
      .find('.bubble-scale').css({
        transform: 'scale('+Math.min(Math.max(newScale, minBubbleScale), maxBubbleScale)+')'
      });
  }




  function setPreviousView() {
    var view = DOM_screen.attr('data-view');

    if (view == 'word') {
      setView('interest', { name: $('.bubble--interest.current').data('name') });
    }

    if (view == 'interest') {
      setView('topic');
    }
  }




  function setView(v, d = null) {
    lastView = currentView;
    currentView = v;

    if (v == 'topic') {
      $('.bubble--interest').removeClass('current');
      $('.bubble--word').removeClass('related current no-transition'); // flickr because of no-transition: deletable TODO
      $('.bubble--content').removeClass('related current');

      // $('.bubble--word')
      //   .css({
      //     'transform': 'translate('+(screenW/2)+'px, '+(screenH/2)+'px)'
      //   });

      $('.bubble--word').each(function(){
        var interestBubbleParent = $('.bubble--interest[data-name="' + $(this).data('interest') + '"]');

        var interestBubbleParentX = interestBubbleParent.data('x');
        var interestBubbleParentY = interestBubbleParent.data('y');

        $(this).css({
          'transform': 'translate(' + interestBubbleParentX + 'px, ' + interestBubbleParentY + 'px)'
        })
      });
    }

    if (v == 'interest') {
      var interestBubble = $('.bubble--interest[data-name="'+d.name+'"]');

      $('.bubble--interest').removeClass('current');
      interestBubble.addClass('current');

      $('.bubble--word').removeClass('current related');
      $('.bubble--content').removeClass('related current');

      if (lastView != 'word') {
        // Set initial wordBubble position to parent interestBubble
        $('.bubble--word[data-interest="'+d.name+'"]')
          .addClass('no-transition')
          .css({
            'transform': 'translate('+(screenW/2)+'px, '+(screenH/2)+'px)'
          });

        // Then animate transition from interestBubble position to wordBubble position
        setTimeout(function(){
          $('.bubble--word[data-interest="'+d.name+'"]').each(function(){
            $(this)
              .addClass('related')
              .removeClass('no-transition')
              .css({
                'transform': 'translate('+$(this).data('x')+'px, '+$(this).data('y')+'px)'
              });
          });
        },100);
      } else {
        $('.bubble--word[data-interest="'+d.name+'"]')
          .addClass('related');
      }
    }

    if (v == 'word') {
      var interestBubble = $('.bubble--interest[data-name="'+d.interest+'"]');
      var wordBubble = $('.bubble--word[data-name="'+d.name+'"]');

      $('.bubble--interest').removeClass('current');
      $('.bubble--word').removeClass('current');
      $('.bubble--content').removeClass('related current');

      interestBubble.addClass('current');
      wordBubble.addClass('current');

      if (lastView != 'xxx') {
        // Set initial wordBubble position to parent interestBubble
        $('.bubble--content[data-word="'+d.name+'"]')
          .addClass('no-transition')
          .css({
            'transform': 'translate('+(wordBubble.data('x'))+'px, '+(wordBubble.data('y'))+'px)'
          });

        // Then animate transition from interestBubble position to wordBubble position
        setTimeout(function(){
          $('.bubble--content[data-word="'+d.name+'"]').each(function(){
            $(this)
              .addClass('related')
              .removeClass('no-transition')
              .css({
                'transform': 'translate('+$(this).data('x')+'px, '+$(this).data('y')+'px)'
              });
          });
        },100);
      } else {
        $('.bubble--content[data-word="'+d.name+'"]')
          .addClass('related');
      }
    }

    DOM_screen.attr('data-view',currentView);

    updateView();
  }




  function createBubble(_type, d) {
    var type = _type;

    var DOM_bubble = $('<div/>')
      .addClass('bubble bubble--'+type)
      .attr('data-name', d.name)
      .attr('data-type', type)
      .data('scale', 1)

      .on('click', function(){
        if (type == 'topic') {
          setView('topic');
        }

        if (type == 'interest') {
          if ($(this).hasClass('current')) {
            setView('topic');
          } else {
            setView('interest', { name: d.name });
          }
        }

        if (type == 'word') {
          if ($(this).hasClass('current')) {
            setView('interest', { name: d.interest });
          } else {
            setView('word', { name: d.name, interest: d.interest });
          }
        }

        if (type == 'content') {
          if (d.type == 'image') {
            if ($(this).hasClass('current')) {
              hideContentImage($(this));
            } else {
              showContentImage($(this));
            }
          }
        }
      });

    if (type == 'content') {
      DOM_bubble
        .attr('data-word', d.word)
        .attr('data-interet', d.interet)
        .attr('data-content-type', d.type);
    }

    if (type == 'word') {
      var placeholderIndex = $('.bubble--word[data-interest="'+d.interest+'"]').length || 0;

      if (placeholderIndex < wordPlaceholders.length) {
        // Defined position
        var x = wordPlaceholders[placeholderIndex][0];
        var y = wordPlaceholders[placeholderIndex][1];
      } else {
        // Then random positions
        if (Math.random() >= 0.5) {
          var x = (Math.random() * 500) + 100;
        } else {
          var x = screenW/2 + (Math.random() * 450) + 100;
        }
        var y = parseInt(Math.random() * (screenH - 300)) + 150;
      }

      DOM_bubble
        .css({
          transform: 'translate(' + x + 'px, ' + y + 'px)'
        })
        .data('x', x)
        .data('y', y)
        .data('scale', 1)
        .data('rotation', defaultRotation)
        .attr('data-interest',d.interest);


      DOM_bubble
        .hammer({
          recognizers: [
            [Hammer.Pinch, { enable: true }],
            [Hammer.Pan, { enable: true }],
          ]
        })

        .on('panstart pinchstart', function(event) {
          var target = event.target;

          if (event.type == 'pinchstart') {
            $(target).data('startrotation', event.gesture.rotation);
          }

          if ($(target).hasClass('bubble--word') && $(target).hasClass('current')) {
            $(target).removeClass('current');
            setView('interest', { name: $(target).data('interest') });
          }
        })

        .on('pinch pan', function(event) {
          var target = event.target;

          $(target).addClass('no-transition');

          var currentDeltaX = $(target).data('x') + (event.gesture.deltaX);
          var currentDeltaY = $(target).data('y') + (event.gesture.deltaY);

          if ((currentDeltaX <= removeZoneSize && currentDeltaY <= removeZoneSize) // top left
           || (currentDeltaX <= removeZoneSize && currentDeltaY >= screenH - removeZoneSize) // bottom left
           || (currentDeltaX >= screenW - removeZoneSize && currentDeltaY <= removeZoneSize) // top right
           || (currentDeltaX >= screenW - removeZoneSize && currentDeltaY >= screenH - removeZoneSize)) { // bottom right
            $(target).addClass('deletable');
            DOM_screen.addClass('show-delete-ui');
          } else {
            $(target).removeClass('deletable');
            DOM_screen.removeClass('show-delete-ui');
          }

          $(target).data('lastx', currentDeltaX);
          $(target).data('lasty', currentDeltaY);

          $(target).css({
            'transform': 'translate(' + currentDeltaX + 'px,' + currentDeltaY + 'px)'
          });

          if (event.type == 'pinch') {
            var currentScale = Math.min(Math.max($(target).data('scale') * event.gesture.scale, minBubbleScale), maxBubbleScale);

            var diff = $(target).data('startrotation') - event.gesture.rotation;
            var currentRotation = $(target).data('rotation') - diff;

            $(target).find('.bubble-scale').css({
              'transform':'scale('+currentScale+')'
            });

            $(target).find('.bubble-inner').css({
              'transform':'rotate('+currentRotation+'deg)'
            });
          }
        })

        .on('panend pinchend', function(event) {
          var target = event.target;

          DOM_screen.removeClass('show-delete-ui');

          if (($(target).data('lastx') <= removeZoneSize && $(target).data('lasty') <= removeZoneSize) // top left
           || ($(target).data('lastx') <= removeZoneSize && $(target).data('lasty') >= screenH - removeZoneSize) // bottom left
           || ($(target).data('lastx') >= screenW - removeZoneSize && $(target).data('lasty') <= removeZoneSize) // top right
           || ($(target).data('lastx') >= screenW - removeZoneSize && $(target).data('lasty') >= screenH - removeZoneSize)) { // bottom right
            removeBubble($(target));
            return;
          }

          // Avoid pinchend flickering (because of these two fingers crashing the final position)
          if (event.type != "pinchend") {
            $(target).data('x', $(target).data('lastx'));
            $(target).data('y', $(target).data('lasty'));
          }

          // Only with a pinch
          if (event.type == 'pinchend') {
            var diff = $(target).data('startrotation') - event.gesture.rotation;
            var currentRotation = $(target).data('rotation') - diff;

            $(target).data('scale', ($(target).data('scale') * event.gesture.scale));
            $(target).data('rotation', currentRotation);
          }

          setTimeout(function(){
            $(target).removeClass('no-transition');
          },100);
        });
    }

    var DOM_bubbleContainer = $('<div/>')
      .addClass('bubble-container');

    var DOM_bubbleScale = $('<div/>')
      .addClass('bubble-scale');

    if (type == 'content') {
      if (d.type == 'image') {
        var DOM_bubbleThumbnail = $('<div/>')
          .addClass('bubble-thumbnail')
          .css({
            'background-image':'url('+d.file+')',
            transform: 'rotate('+defaultRotation+'deg)'
          });

        var DOM_bubbleThumbnailLabel = $('<div/>')
          .addClass('bubble-thumbnail-label')
          .text(d.content);

        DOM_bubbleScale
          .append(DOM_bubbleThumbnail)
          .append(DOM_bubbleThumbnailLabel);
      }

      if (d.type == 'quote') {
        var DOM_bubbleQuote = $('<div/>')
          .addClass('bubble-quote')
          .text(d.content);

        DOM_bubbleScale
          .append(DOM_bubbleQuote);
      }
    }

    var DOM_bubbleBackground = $('<div/>')
      .addClass('bubble-background');

    var DOM_bubbleBackgroundLayer1Wrapper = $('<div/>')
      .addClass('bubble-background-layer-wrapper bubble-background-layer-wrapper-1');

    var DOM_bubbleBackgroundLayer1 = $('<div/>')
      .addClass('bubble-background-layer bubble-background-layer-1')
      .css({
        'animation-delay': - parseInt(Math.random() * 10) +'s'
      });

    var DOM_bubbleBackgroundLayer2Wrapper = $('<div/>')
      .addClass('bubble-background-layer-wrapper bubble-background-layer-wrapper-2');

    var DOM_bubbleBackgroundLayer2 = $('<div/>')
      .addClass('bubble-background-layer bubble-background-layer-2')
      .css({
        'animation-delay': - parseInt(Math.random() * 10) +'s'
      });

    var DOM_bubbleInner = $('<div/>')
      .addClass('bubble-inner')
      .css({
        transform: 'rotate('+defaultRotation+'deg)'
      })
      .text(d.name);

    DOM_bubbleBackgroundLayer1Wrapper
      .append(DOM_bubbleBackgroundLayer1);

    DOM_bubbleBackgroundLayer2Wrapper
      .append(DOM_bubbleBackgroundLayer2);

    DOM_bubbleBackground
      .append(DOM_bubbleBackgroundLayer1Wrapper)
      .append(DOM_bubbleBackgroundLayer2Wrapper);

    DOM_bubbleScale
      .append(DOM_bubbleBackground)
      .append(DOM_bubbleInner);

    DOM_bubbleContainer
      .append(DOM_bubbleScale);

    DOM_bubble
      .append(DOM_bubbleContainer)
      .appendTo($('.layer--'+type));

    setTimeout(function(){
      DOM_bubble
        .addClass('exists')

      updateView();
    },100);
  }

  function updateView() {
    if (currentView == 'topic') {
      setPositionOfInterestBubblesInTopicView();
    }

    if (currentView == 'interest') {
      setPositionOfInterestBubblesInInterestView();
    }

    if (currentView == 'word') {
      setPositionOfContentBubblesInWordView();
    }
  }



  function showContentImage(b) {
    console.log('showContentImage');
    b.addClass('current');
  }

  function hideContentImage(b) {
    b.removeClass('current');
  }


  function removeBubble(b, silent = false) {
    var setViewAfterRemove = (silent == false) ? true : false;
    var type = b.data('type');
    var name = b.data('name');
    var wordName = null;

    if (type == 'word') {
      var interestName = b.data('interest');

      $('.bubble--content[data-word="'+name+'"]').each(function(){
        removeBubble($(this), true);
      });
    }

    if (type == 'content') {
      var interestName = b.data('interest');
      var wordName = b.data('word');
    }

    socket.emit('bubble/remove', {
      type: type,
      interest: interestName,
      word: wordName,
      name: name
    });

    if (type == 'content') {
      $('.bubble--'+type+'[data-word="'+wordName+'"]').addClass('deleted');
    } else {
      $('.bubble--'+type+'[data-name="'+name+'"]').addClass('deleted');
    }

    setTimeout(function(){
      console.log(type);

      if (type == 'content') {
        $('.bubble--'+type+'[data-word="'+wordName+'"]').remove();

        if (setViewAfterRemove == true) {
          setView('word', { name: wordName });
        }
      } else {
        $('.bubble--'+type+'[data-name="'+name+'"]').remove();

        if (setViewAfterRemove == true) {
          setPreviousView();
          /*
          if (type == 'word') {
            setView('interest', { name: interestName });
          }
          if (type == 'interest') {
            setView('topic');
          }
          */
        }
      }
    },600);
  }



  function setPositionOfContentBubblesInWordView() {
    var radius = 250;
    var angleOffset = 90;

    $('.bubble--word').each(function(){
      var wordName = $(this).data('name');
      var word = $('.bubble--word[data-name="'+wordName+'"]');

      var contentBubbles = $('.bubble--content[data-word="'+wordName+'"]');
      var nbContentBubbles = contentBubbles.length;

      var angleMin = 360 * 0.0174532925 / nbContentBubbles;

      for (var i = 0; i < nbContentBubbles; i++) {
        var contentBubble = contentBubbles.eq(i);

        if (!contentBubble.hasClass('current')) {
          var x = (radius * Math.cos(angleMin * i + angleOffset) + word.data('x'));
          var y = (radius * Math.sin(angleMin * i + angleOffset) + word.data('y'));

          contentBubble
            .data('x', x)
            .data('y', y)
            .css({
              transform: 'translate(' + x + 'px, ' + y + 'px)'
            });
        }
      }
    });
  }


  /*
   *  setPositionOfInterestBubblesInInterestView
   *
   *  Set the position of each interest bubble except the current one (handled with CSS)
   */

  function setPositionOfInterestBubblesInInterestView() {
    var radius = 850;
    var nbInterestBubbles = $('.bubble--interest').length;
    var angleOffset = 20;
    var angleMin = 360 * 0.0174532925 / nbInterestBubbles;

    for (var i = 0; i < nbInterestBubbles; i++) {
      var bubble = $('.bubble--interest').eq(i);

      if (!bubble.hasClass('current')) {
        var x = (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2);
        var y = (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2);

        bubble
          .data('x', x)
          .data('y', y)
          .css({
            transform: 'translate(' + x + 'px, ' + y + 'px)'
          });
      }
    }
  }




  function setPositionOfInterestBubblesInTopicView() {
    var radius = 350;
    var nbInterestBubbles = $('.bubble--interest').length;
    var angleOffset = 20;
    var angleMin = 360 * 0.0174532925 / nbInterestBubbles;

    for (var i = 0; i < nbInterestBubbles; i++) {
      var x = (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2);
      var y = (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2);

      $('.bubble--interest')
        .eq(i)
        .data('x', x)
        .data('y', y)
        .css({
          transform: 'translate(' + x + 'px, ' + y + 'px)'
        });
    }
  }
