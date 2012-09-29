function ScrollPane(width, height) {
	this.initialize(width, height);
}

window.ScrollPane = ScrollPane;

var p = ScrollPane.prototype = new Container();

p.Container_initialize = p.initialize; // unique to avoid overiding base class

var colorsForTracks = [ "Green", "Blue", "Green", "Blue" ];

p.initialize = function(w, h) {
	this.Container_initialize();
	this.width = w;
	this.height = h;
	this.snapToPixel = true;

	this.background = new Shape();
	this.background.snapToPixel = true;
	this.scrollingNotes = new Container();
	this.scrollingNotes.snapToPixel = true;
	this.addChild(this.background);
	this.addChild(this.scrollingNotes);

	this.pixelsPerSecond = 100;// 140

	this.drawBackground();
	this.background.cache(0, 0, this.width, this.height);

	this.onPress = this.handlePress;
};

p.resize = function(w, h) {
	this.width = w;
	this.height = h;
	this.drawBackground();
	this.background.cache(0, 0, this.width, this.height);
	this.drawNotes();
};

p.drawNotes = function() {
	this.scrollingNotes.removeAllChildren();
	for ( var i = 0; i < song.notes.length; ++i) {
		this.addNote(song.notes[i].notePosition, song.notes[i].noteDuration,
				midiToneToKeyNumber(song.notes[i].noteNumber), colorsForTracks[song.notes[i].noteTrack]);
	}
	this.scrollingNotes.cache(0, -song.songDuration * this.pixelsPerSecond, this.width, song.songDuration
			* this.pixelsPerSecond + this.height);
};

p.drawBackground = function() {
	var g = this.background.graphics;
	g.beginFill(Graphics.getRGB(60, 60, 60));
	g.rect(0, 0, this.width, this.height);
	g.endFill();

	g.setStrokeStyle(1);
	g.beginStroke(Graphics.getRGB(20, 20, 20));
	for ( var i = 1; i < 52; ++i) {
		if (i % 7 != 2 && i % 7 != 5) {
			var xPos = Math.floor(this.width * i / 52);
			g.moveTo(xPos, 0);
			g.lineTo(xPos, this.height);
		}
	}
};

p.addNote = function(time, length, tone, color) {
	// white note bars
	if (tone % 2 == 0) {
		var x = Math.floor(this.width * tone / 104);
		var y = Math.floor(-time * this.pixelsPerSecond + this.height);
		var height = Math.floor(length * this.pixelsPerSecond);
		var bitmap = new Bitmap(images["bar" + color]);
		bitmap.setTransform(x, y - height, piano.keyScale, height / 115);
		this.scrollingNotes.addChild(bitmap);
	}
	// black note bars
	else {
		var x = Math.floor((tone / 2 + getBlackKeyXOffset(tone)) * piano.whiteKeyWidth);
		var y = Math.floor(-time * this.pixelsPerSecond + this.height);
		var height = Math.floor(length * this.pixelsPerSecond);
		var bitmap = new Bitmap(images["blackBar" + color]);
		bitmap.setTransform(x, y - height, piano.keyScale, height / 82);
		this.scrollingNotes.addChild(bitmap);
	}
};

p.tick = function(delta) {
	piano.scrollPane.scrollingNotes.y = Math.floor(piano.songPosition * piano.scrollPane.pixelsPerSecond);
};

var playingBeforeDrag;
p.handlePress = function(event) {
	playingBeforeDrag = piano.playing;
	piano.playPause(false);
	piano.scrollPane.mouseOffset = event.stageY;
	event.onMouseMove = this.handleMove;
	event.onMouseUp = function() {
		piano.playPause(playingBeforeDrag);
	};
};

p.handleMove = function(event) {
	var newSongPosition = (piano.scrollPane.scrollingNotes.y + event.stageY - piano.scrollPane.mouseOffset)
			/ piano.scrollPane.pixelsPerSecond;
	if (newSongPosition >= -2 && newSongPosition <= song.songDuration + 2) {
		piano.songPosition = newSongPosition;
	}
	piano.scrollPane.mouseOffset = event.stageY;
};