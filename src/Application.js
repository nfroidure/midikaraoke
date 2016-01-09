// MIDIKaraoke : MIDI Karaoke right in your browser!
var Commandor = require('commandor')
  , MIDIPlayer = require('midiplayer')
  , MIDIFile = require('midifile')
  , MIDILyricsDisplayer = require('./MIDILyricsDisplayer')
;

function Application() {

  // GA Tracking
  this._trackEvent = function() {
    if('function' === typeof window.ga) {
      ga.apply(null, ['send', 'event'].concat([].slice.call(arguments, 0)));
    }
  };

	// Registering ui elements
	this.filePicker=document.querySelector('input[type="file"]');
  this.filePicker.addEventListener('change', this.readFile.bind(this));
	this.pickFileButton=document.getElementsByClassName('pick')[0];
	this.playButton=document.getElementsByClassName('play')[0];
	this.pauseButton=document.getElementsByClassName('pause')[0];
	this.stopButton=document.getElementsByClassName('stop')[0];
	this.previousButton=document.getElementsByClassName('previous')[0];
	this.nextButton=document.getElementsByClassName('next')[0];
	this.volumeUpButton=document.getElementsByClassName('volumeup')[0];
	this.volumeDownButton=document.getElementsByClassName('volumedown')[0];
	this.volumeMuteButton=document.getElementsByClassName('volumemute')[0];
	this.textSmallerButton=document.getElementsByClassName('textsmaller')[0];
	this.textBiggerButton=document.getElementsByClassName('textbigger')[0];
	this.outputSelectButton=document.getElementsByClassName('outputselect')[0];
	// lyrics display
	this.lyricsDisplayer=new MIDILyricsDisplayer(
		document.querySelector('div.lyrics'));
	// Commands management
	this.cmdMgr=new Commandor(document.documentElement);
	this.cmdMgr.suscribe('pickFile',this.pickFile.bind(this));
	this.cmdMgr.suscribe('setOutput',this.setOutput.bind(this));
	this.cmdMgr.suscribe('play',this.play.bind(this));
	this.cmdMgr.suscribe('pause',this.pause.bind(this));
	this.cmdMgr.suscribe('stop',this.stop.bind(this));
	this.cmdMgr.suscribe('backward',this.backward.bind(this));
	this.cmdMgr.suscribe('forward',this.forward.bind(this));
	this.cmdMgr.suscribe('volume',this.volume.bind(this));
	this.cmdMgr.suscribe('setTextSize',
		this.lyricsDisplayer.setTextSize.bind(this.lyricsDisplayer));
	this.cmdMgr.suscribe('closePopin',this.closePopin.bind(this));
	this.cmdMgr.suscribe('selectOutput',this.selectOutput.bind(this));
	this.cmdMgr.suscribe('setOutput',this.setOutput.bind(this));
	// Try to enable the MIDI Access
	if(!navigator.requestMIDIAccess) {
		this.noMidiAccess();
	} else {
		navigator.requestMIDIAccess().then(this.midiAccess.bind(this),
			this.noMidiAccess.bind(this));
	}
};

Application.prototype.midiAccess = function(midiAccess) {
	this.outputs = midiAccess.outputs;
	this.outputKeys = [];
  var iter = this.outputs.values();
  var output;
  while(output = iter.next()) {
    if(output.done) {
      break;
    }
    this.outputKeys.push(output.value.id);
  }

	// check output
	if(!this.outputs.size) {
	  this.noMidiOutputs();
	  return;
	}
  this._trackEvent('setup', 'midiaccess', this.outputKeys[0], this.outputs.size);
	document.getElementById('about').classList.add('selected');
	// creating player
	this.midiPlayer=new MIDIPlayer({
	  'output': this.outputs.get(this.outputKeys[0])
	});
	// Download the intro
	this.downloadFile("./sounds/Hello.mid");
	// enable the file picker
	this.pickFileButton.removeAttribute('disabled');
	this.volumeUpButton.removeAttribute('disabled');
	this.volumeDownButton.removeAttribute('disabled');
	this.volumeMuteButton.removeAttribute('disabled');
	this.textSmallerButton.removeAttribute('disabled');
	this.textBiggerButton.removeAttribute('disabled');
	this.outputSelectButton.removeAttribute('disabled');
};

Application.prototype.noMidiAccess = function() {
  this._trackEvent('setup', 'nomidiaccess', window.navigator.userAgent);
	document.getElementById('jazz').classList.add('selected');
};

Application.prototype.noMidiOutputs = function() {
  this._trackEvent('setup', 'nomidioutput', window.navigator.userAgent);
	document.getElementById('nooutput').classList.add('selected');
};

Application.prototype.pickFile = function() {
  this._trackEvent('use', 'pickfile');
	this.filePicker.click();
};

Application.prototype.setOutput = function(event, params) {
  this.midiPlayer.output = this.outputs[params.value];
};

Application.prototype.readFile = function(event) {
	var reader = new FileReader();
	this._trackEvent('use', 'filepicked', event.target.files[0].name, event.target.files[0].length);
	reader.readAsArrayBuffer(event.target.files[0]);
	reader.onloadend=(function(event) {
    this._trackEvent('use', 'fileloaded');
		this.loadFile(event.target.result);
	}).bind(this);
};

Application.prototype.loadFile = function(buffer) {
	// creating the MidiFile instance
	midiFile=new MIDIFile(buffer);
	this.midiPlayer.load(midiFile);
	this.playButton.removeAttribute('disabled');
	this.lyricsDisplayer.loadLyrics(midiFile.getLyrics());
};

Application.prototype.play = function(buffer) {
	var playTime;
	if((playTime=this.midiPlayer.play(this.endCallback.bind(this)))
			||(playTime=this.midiPlayer.resume(this.endCallback.bind(this)))) {
		this.playButton.setAttribute('disabled','disabled');
		this.pauseButton.removeAttribute('disabled');
		this.stopButton.removeAttribute('disabled');
		this.lyricsDisplayer.start(playTime);
	}

};

Application.prototype.pause = function(buffer) {
	if(this.midiPlayer.pause()) {
    this._trackEvent('use', 'pause');
		this.playButton.removeAttribute('disabled');
		this.pauseButton.setAttribute('disabled','disabled');
		this.stopButton.setAttribute('disabled','disabled');
		this.lyricsDisplayer.stop();
	}
};

Application.prototype.stop = function(buffer) {
	if(this.midiPlayer.stop()) {
    this._trackEvent('use', 'stop');
		this.playButton.removeAttribute('disabled');
		this.pauseButton.setAttribute('disabled','disabled');
		this.stopButton.setAttribute('disabled','disabled');
		this.lyricsDisplayer.stop();
	}
};

Application.prototype.endCallback = function() {
  this._trackEvent('use', 'playend');
	this.playButton.removeAttribute('disabled');
	this.pauseButton.setAttribute('disabled','disabled');
	this.stopButton.setAttribute('disabled','disabled');
};

Application.prototype.backward = function(buffer) {
};

Application.prototype.forward = function(buffer) {
};

Application.prototype.volume = function(event, params) {
  this._trackEvent('use', 'volume', params.type, this.midiPlayer.volume);
	if('less'===params.type) {
		this.midiPlayer.volume=(this.midiPlayer.volume<10?
			0:this.midiPlayer.volume-10);
	} else if('more'===params.type) {
		this.midiPlayer.volume=(this.midiPlayer.volume>90?
			100:this.midiPlayer.volume+10);
	} else if('mute'===params.type) {
		this.midiPlayer.volume=0;
	}
};

Application.prototype.downloadFile = function(url) {
	var oReq = new XMLHttpRequest();
	oReq.open("GET", url, true);
	oReq.responseType = "arraybuffer";
	oReq.onload = (function (oEvent) {
		this.loadFile(oReq.response);
		this.play();
	}).bind(this);
	oReq.send(null);
};

Application.prototype.selectOutput = function(event) {
  this._trackEvent('use', 'selectoutput');
  var iter = this.outputs.values();
  var output;
  var outputChooser = document.getElementById("outputChooser");
  while(outputChooser.firstChild) {
    outputChooser.removeChild(outputChooser.firstChild);
  }
  while(output = iter.next()) {
    if(output.done) {
      break;
    }
    var opt = document.createElement("option");
    opt.value = output.value.id;
    opt.text = output.value.name;
    outputChooser.add(opt);
  }
	document.getElementById('output').classList.add('selected');
};

Application.prototype.setOutput = function(event) {
  this._trackEvent('use', 'setoutput', event.target[0].value);
	document.getElementById('output').classList.remove('selected');
	if(!event.target[0].value)
		return;
	this.midiPlayer.stop();
	this.midiPlayer.output = this.outputs.get(event.target[0].value);
	this.midiPlayer.play();
};

Application.prototype.selectFile = function() {
	if(!event.target.value)
		return;
	downloadFile("/sounds/"+event.target.value);
	//document.querySelector('select').addEventListener('change', selectFile);
};

Application.prototype.closePopin = function(event, params) {
  this._trackEvent('use', 'closepopin', params.id);
	document.getElementById(params.id).classList.remove('selected');
};

new Application();

module.exports = Application;

