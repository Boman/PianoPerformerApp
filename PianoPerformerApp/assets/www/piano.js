var images = [];
var controlBarHeight = 55;

function Piano() {
	var that = this;

	this.windowWidth;
	this.windowHeight;

	// gui elements
	this.stage;
	this.scrollPane;
	this.pianoBar;
	this.keyPane;
	this.controlBar;

	// status variables
	this.stop = true;
	this.playing;
	this.speed;
	this.songPosition; // in seconds

	// dimensions
	this.whiteKeyWidth;
	this.whiteKeyHeight;
	this.keyOffsetX;
	this.keyScale;

	this.initPiano = function() {
		if (imagesToLoad.length != 0) {
			loadImages(that.initPiano);
		} else {
			// status variables
			that.stop = false;
			that.playing = false;
			that.speed = 1;
			that.songPosition = -1;

			that.createGUI();

			// $(window).resize(function() {
			// that.resizeGUI(true);
			// });

			// register key functions
			// document.onkeyup = that.handleKeyUp;

			// start
			that.stage.update();
			that.tick();
		}
	}

	this.initPiano();

	this.createGUI = function() {
		that.resizeGUI(false);

		this.stage = new Stage($("#mainCanvas").get(0));
		this.stage.snapToPixel = true;
		Touch.enable(this.stage);

		// scrollPane
		this.scrollPane = new ScrollPane(this.windowWidth - 2 * this.keyOffsetX, this.windowHeight
				- this.whiteKeyHeight - controlBarHeight - 5);
		this.scrollPane.x = this.keyOffsetX;
		this.scrollPane.drawNotes();
		this.stage.addChild(this.scrollPane);
		// bar between notes and keys
		this.pianoBar = new Bitmap(images["pianoBar"]);
		this.stage.addChild(this.pianoBar);
		this.pianoBar.setTransform(this.keyOffsetX, this.windowHeight - this.whiteKeyHeight - controlBarHeight - 5,
				this.whiteKeyWidth * 52, 1);
		// keyPane
		this.keyPane = new KeyPane(this.whiteKeyWidth * 52, this.whiteKeyHeight);
		this.keyPane.x = this.keyOffsetX;
		this.keyPane.y = this.windowHeight - this.whiteKeyHeight - controlBarHeight;
		this.stage.addChild(this.keyPane);
		// controlBar
		this.controlBar = new ControlBar(this.whiteKeyWidth * 52, controlBarHeight);
		this.controlBar.x = this.keyOffsetX;
		this.controlBar.y = this.windowHeight - controlBarHeight;
		this.stage.addChild(this.controlBar);
	}

	this.resizeGUI = function(resizeComponents) {
		if (this.windowWidth != $("#mainCanvas").width() || this.windowHeight != $("#mainCanvas").height()) {
			this.windowWidth = 640;// $("#mainCanvas").width();
			this.windowHeight = 400;// $("#mainCanvas").height();
			this.windowWidth = $(document).width();
			this.windowHeight = $(document).height();

			$("#mainCanvas").attr({
				width : this.windowWidth,
				height : this.windowHeight
			});

			// calculate dimensions
			this.whiteKeyWidth = Math.floor(this.windowWidth / 52);
			this.whiteKeyHeight = Math.floor(this.whiteKeyWidth * 177 / 28);
			this.keyOffsetX = Math.floor((this.windowWidth - 52 * this.whiteKeyWidth) / 2);
			this.keyScale = this.whiteKeyWidth / 28;

			if (resizeComponents) {
				this.scrollPane.resize(this.windowWidth - 2 * this.keyOffsetX, this.windowHeight - this.whiteKeyHeight
						- controlBarHeight - 5);
				this.scrollPane.x = this.keyOffsetX;
				this.pianoBar.setTransform(this.keyOffsetX, this.windowHeight - this.whiteKeyHeight - controlBarHeight
						- 5, this.whiteKeyWidth * 52, 1);
				this.keyPane.resize(this.whiteKeyWidth * 52, this.whiteKeyHeight);
				this.keyPane.x = this.keyOffsetX;
				this.keyPane.y = this.windowHeight - this.whiteKeyHeight - controlBarHeight;
				this.controlBar.resize(this.whiteKeyWidth * 52, controlBarHeight);
				this.controlBar.x = this.keyOffsetX;
				this.controlBar.y = this.windowHeight - controlBarHeight;
			}
		}
	}

	this.playPause = function(play) {
		this.playing = play;
		if (play) {
			this.controlBar.playPauseButton.image = images["pause"];
			// start the song again
			if (this.songPosition >= song.songDuration + 1) {
				this.songPosition = -1;
			}
		} else {
			this.controlBar.playPauseButton.image = images["play"];
		}
	}

	// FPS variables
	this.numFrames = 0;
	this.cummulatedTime = 0;
	this.actualFPS = 0;

	this.lastTick = (new Date()).getTime();

	this.tick = function() {
		var tickTime = (new Date()).getTime();
		var delta = Math.min(tickTime - that.lastTick, 1000);
		if (!that.stop && delta > 10) {
			that.lastTick = tickTime;

			if (that.playing) {
				if (that.songPosition >= song.songDuration + 1) {
					that.playPause(false);
				} else {
					that.songPosition += delta * that.speed / 1000;
				}
			}

			that.scrollPane.tick(delta);
			that.updateSongPosition(delta);
			piano.controlBar.tick(delta);

			that.numFrames++;
			that.cummulatedTime += delta;
			if (that.numFrames > 20) {
				that.actualFPS = that.numFrames * 1000 / that.cummulatedTime;
				that.numFrames = 0;
				that.cummulatedTime = 0;
			}

			that.stage.update();
		}
		requestAnimFrame(that.tick);
	}

	this.playedNotes = [];

	this.updateSongPosition = function(delta) {
		var newPlayedNotes = [];
		// read played notes
		for ( var i = 0; i < song.notes.length; ++i) {
			var note = song.notes[i];
			if (note.notePosition <= this.songPosition && note.notePosition + note.noteDuration >= this.songPosition) {
				newPlayedNotes.push(i);
			}
		}
		// check which notes to turn off
		for ( var i = 0; i < this.playedNotes.length; ++i) {
			var noteToStop = song.notes[this.playedNotes[i]];
			var noteStillPlaying = false;
			for ( var j = 0; j < newPlayedNotes.length; ++j) {
				if (noteToStop.noteNumber == song.notes[newPlayedNotes[j]].noteNumber) {
					noteStillPlaying = true;
				}
			}
			if (!noteStillPlaying) {
				//MIDI.noteOff(MIDI.pianoKeyOffset, noteToStop.noteNumber, 0);
				this.keyPane.changeKey(false, midiToneToKeyNumber(noteToStop.noteNumber));
			}
		}
		// check which notes to turn on
		for ( var i = 0; i < newPlayedNotes.length; ++i) {
			var noteToPlay = song.notes[newPlayedNotes[i]];
			var noteAlreadyPlaying = false;
			for ( var j = 0; j < this.playedNotes.length; ++j) {
				if (noteToPlay.noteNumber == song.notes[this.playedNotes[j]].noteNumber) {
					noteAlreadyPlaying = true;
				}
			}
			if (!noteAlreadyPlaying) {
				if (this.playing) {
					//MIDI.noteOn(MIDI.pianoKeyOffset, noteToPlay.noteNumber, noteToPlay.noteVelocity, 0);
				}
				this.keyPane.changeKey(true, midiToneToKeyNumber(noteToPlay.noteNumber));
			}
		}
		this.playedNotes = newPlayedNotes;
	};

	// this.handleKeyUp = function(e) {
	// // cross browser issues exist
	// if (!e) {
	// var e = window.event;
	// }
	// switch (e.keyCode) {
	// case KEYCODE_SPACE:
	// this.playPause(!playing);
	// return false;
	// case KEYCODE_LEFT:
	// this.songPosition = Math.max(0, this.songPosition) - 2;
	// return false;
	// case KEYCODE_RIGHT:
	// this.songPosition = Math.min(song.songDuration, this.songPosition) + 2;
	// return false;
	// case KEYCODE_UP:
	// this.speed += 0.1;
	// return false;
	// case KEYCODE_DOWN:
	// this.speed -= 0.1;
	// return false;
	// case KEYCODE_ENTER:
	// return false;
	// case KEYCODE_ESC:
	// // TODO
	// return false;
	// }
	// }
}