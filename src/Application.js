// MIDIKaraoke : MIDI Karaoke right in your browser!
var Commandor = require('commandor')
  , MIDIPlayer = require('midiplayer')
  , MIDIFile = require('midifile')
  , MIDILyricsDisplayer = require('./MIDILyricsDisplayer')
;

function Application() {
	window.karaoke = this;
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
};

Application.prototype.noMidiAccess = function() {
	document.getElementById('jazz').classList.add('selected');
};

Application.prototype.noMidiOutputs = function() {
	document.getElementById('outputs').classList.add('selected');
};

Application.prototype.pickFile = function() {
	this.filePicker.click();
};

Application.prototype.setOutput = function(event, params) {
  this.midiPlayer.output = this.outputs[params.value];
};

Application.prototype.readFile = function(event) {
	var reader = new FileReader();
	reader.readAsArrayBuffer(event.target.files[0]);
	reader.onloadend=(function(event) {
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
		this.playButton.removeAttribute('disabled');
		this.pauseButton.setAttribute('disabled','disabled');
		this.stopButton.setAttribute('disabled','disabled');
		this.lyricsDisplayer.stop();
	}
};

Application.prototype.stop = function(buffer) {
	if(this.midiPlayer.stop()) {
		this.playButton.removeAttribute('disabled');
		this.pauseButton.setAttribute('disabled','disabled');
		this.stopButton.setAttribute('disabled','disabled');
		this.lyricsDisplayer.stop();
	}
};

Application.prototype.endCallback = function() {
	this.playButton.removeAttribute('disabled');
	this.pauseButton.setAttribute('disabled','disabled');
	this.stopButton.setAttribute('disabled','disabled');
};

Application.prototype.backward = function(buffer) {
};

Application.prototype.forward = function(buffer) {
};

Application.prototype.volume = function(event, params) {
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

Application.prototype.selectFile = function() {
	if(!event.target.value)
		return;
	downloadFile("/sounds/"+event.target.value);
	//document.querySelector('select').addEventListener('change', selectFile);
};

Application.prototype.closePopin = function(event, params) {
	document.getElementById(params.id).classList.remove('selected');
};

new Application();

module.exports = Application;

