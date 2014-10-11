// MIDILyricsDisplayer : Shows MIDI lyrics in a given element

var PLAY_BUFFER_DELAY=600;

function MIDILyricsDisplayer(rootElement,options) {
	this.rootElement=rootElement;
	options=options||{};
	this.timeouts=[];
}

// Parsing all tracks and add their events in a single event queue
MIDILyricsDisplayer.prototype.loadLyrics = function(lyrics) {
 	// Empty old lyrics
 	while(this.rootElement.firstChild)
 		this.rootElement.removeChild(this.rootElement.firstChild)
 	// stopping previous timeout
	if(this.timeout)
		clearTimeout(this.timeout);
	// Appending the first paragraph
	var lineP=document.createElement('p'), lyricSpan;
	this.rootElement.appendChild(lineP);
	// Setting lyrics
	for(i=0, j=lyrics.length; i<j; i++) {
		if('\n'===lyrics[i].text[0]||'\\'===lyrics[i].text[0]
			||'\r'===lyrics[i].text[0]||'/'===lyrics[i].text[0]) {
			if(lineP.childNodes.length) {
				lineP=document.createElement('p');
				this.rootElement.appendChild(lineP);
			}
			lyrics[i].text=lyrics[i].text.substring(1);
		}
		if(lyrics[i].text) {
			var lyricSpan=document.createElement('span');
 			lyricSpan.appendChild(document.createTextNode(lyrics[i].text));
 			lyricSpan.setAttribute('data-playtime', lyrics[i].playTime);
 			lineP.appendChild(lyricSpan);
		}
 	}
};

MIDILyricsDisplayer.prototype.start = function(playTime) {
	// cleanup
	if(this.curP) {
		this.curP.removeAttribute('class');
		if(this.curP.previousSibling) {
			this.curP.previousSibling.removeAttribute('class');
			if(this.curP.previousSibling.previousSibling) {
				this.curP.previousSibling.previousSibling.removeAttribute('class');
			}
		}
		if(this.curP.nextSibling)
			this.curP.nextSibling.removeAttribute('class');
		for(var i=this.curP.childNodes.length-1; i>=0; i--) {
			this.curP.childNodes[i].removeAttribute('class')
		}
	}
	// saving start time
	this.startTime=Date.now()-playTime;
	// looping throught lyrics tu find the currently played
	for(var i=0, j=this.rootElement.childNodes.length; i<j; i++) {
		// if lyric paragraph is playing
		if(i===j-1||parseInt(this.rootElement.childNodes[i+1]
			.firstChild.getAttribute('data-playtime'),10)>playTime) {
			// Setting previous paragraph class
			if(i>0) {
				this.rootElement.childNodes[i-1].setAttribute('class','popout');
			}
			// Setting next paragraph class
			if(i<j-1) {
				this.rootElement.childNodes[i+1].setAttribute('class','closetopop');
			}
			// Setting current paragraph classes
			this.curP=this.rootElement.childNodes[i];
			this.curP.setAttribute('class','pop');
			for(i=0, j=this.curP.childNodes.length; i<j; i++) {
				if(i===j-1||parseInt(this.curP.childNodes[i+1].getAttribute('data-playtime'),10)>playTime) {
					this.lyricSpan=this.curP.childNodes[i];
					break;
				} else {
					this.curP.childNodes[i].setAttribute('class','sing');
				}
			}
			break;
		}
	}
	if(this.lyricSpan) {
			// programming the next sing
			this.timeout=setTimeout(this.next.bind(this),Math.floor(
				parseInt(this.lyricSpan.getAttribute('data-playtime'),10)
				-playTime
			));
	}
};

MIDILyricsDisplayer.prototype.next = function() {
	// Just jumped to a new paragraph
	if(this.lyricSpan.parentNode.firstChild===this.lyricSpan) {
		if(this.lyricSpan.parentNode.previousSibling) {
			// hide the n-2 p
			if(this.lyricSpan.parentNode.previousSibling.previousSibling) {
				this.lyricSpan.parentNode.previousSibling.previousSibling.removeAttribute('class');
			}
			// mark the n-1 p
			this.lyricSpan.parentNode.previousSibling.setAttribute('class','popout');
			// remove sing classes
			for(var i=this.lyricSpan.parentNode.previousSibling.childNodes.length-1; i>=0; i--) {
				this.lyricSpan.parentNode.previousSibling.childNodes[i].removeAttribute('class')
			}
		}
		// highlight the current p
		this.lyricSpan.parentNode.setAttribute('class','pop');
		// prepare the next p
		if(this.lyricSpan.parentNode.nextSibling) {
			this.lyricSpan.parentNode.nextSibling.setAttribute('class','closetopop');
		}
	}
	this.lyricSpan.setAttribute('class','sing');
	// finding the next span
	if(this.lyricSpan.nextSibling) {
		this.lyricSpan=this.lyricSpan.nextSibling;
	} else if(this.curP.nextSibling&&this.curP.nextSibling.firstChild) {
		this.lyricSpan=this.curP.nextSibling.firstChild;
		this.lyricSpan=this.curP.nextSibling.firstChild;
	} else {
		this.lyricSpan=null;
	}
	if(this.lyricSpan) {
		this.curP=this.lyricSpan.parentNode;
		// programming the next sing
		this.timeout=setTimeout(this.next.bind(this),Math.floor(
			parseInt(this.lyricSpan.getAttribute('data-playtime'),10)
			-(Date.now()-this.startTime)
		));
	}
};

MIDILyricsDisplayer.prototype.stop = function() {
 	// stopping previous timeout
	if(this.timeout)
		clearTimeout(this.timeout);
};

MIDILyricsDisplayer.prototype.setTextSize = function(event, params) {
	var size=parseInt(this.rootElement.style.fontSize,10)||50;
	if('smaller'===params.type&&size>10) {
		this.rootElement.style.fontSize=(size-5)+'px';
	} else if('bigger'===params.type) {
		this.rootElement.style.fontSize=(size+5)+'px';
	}
};

module.exports = MIDILyricsDisplayer;

