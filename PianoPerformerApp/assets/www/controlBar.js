function ControlBar(width, height) {
	this.initialize(width, height);
}

window.ControlBar = ControlBar;

var p = ControlBar.prototype = new Container();

p.Container_initialize = p.initialize; // unique to avoid overiding base class

p.initialize = function(w, h) {
	this.Container_initialize();
	this.width = w;
	this.height = h;
	this.snapToPixel = true;

	this.backGroundGraphics = new Graphics();
	this.backGroundGraphics.beginFill(Graphics.getRGB(68, 68, 68));
	this.backGroundGraphics.rect(0, 0, this.width, this.height);
	this.backGroundGraphics.endFill();
	var background = new Shape(this.backGroundGraphics);
	this.addChild(background);
	background.snapToPixel = true;

	this.playPauseButton = new Bitmap(images["play"]);
	this.addChild(this.playPauseButton);
	this.playPauseButton.onPress = handlePlayPausePress;
	this.playPauseButton.setTransform(15, 10);
	this.playPauseButton.snapToPixel = true;

	this.progressText = new Text("", "16px bold arial, sans-serif", Graphics.getRGB(157, 243, 90));
	this.addChild(this.progressText);
	this.progressText.x = 98;
	this.progressText.y = 20;
	this.progressText.snapToPixel = true;

	this.fpsText = new Text("", "16px bold arial, sans-serif", Graphics.getRGB(157, 243, 90));
	this.addChild(this.fpsText);
	this.fpsText.x = 250;
	this.fpsText.y = 20;
	this.fpsText.snapToPixel = true;

	this.speedText = new Text("", "16px bold arial, sans-serif", Graphics.getRGB(157, 243, 90));
	this.addChild(this.speedText);
	this.speedText.x = 400;
	this.speedText.y = 20;
	this.speedText.snapToPixel = true;
};

p.resize = function(w, h) {
	this.width = w;
	this.height = h;
	// TODO
};

function handlePlayPausePress(event) {
	piano.playPause(piano.controlBar.playPauseButton.image == images["play"]);
};

p.tick = function(delta) {
	var tmpSongPosition = Math.min(song.songDuration, Math.max(0, piano.songPosition));

	this.progressText.text = timeToString(tmpSongPosition) + " / " + timeToString(song.songDuration);

	// var width = Math.floor(120 * tmpSongPosition / songDuration);
	// this.backGroundGraphics.beginFill(Graphics.getRGB(140, 200, 60));
	// this.backGroundGraphics.rect(70, 25, width, 15);
	// this.backGroundGraphics.endFill();
	// this.backGroundGraphics.beginFill(Graphics.getRGB(80, 80, 80));
	// this.backGroundGraphics.rect(70 + width, 25, 120 - width, 15);
	// this.backGroundGraphics.endFill();

	this.fpsText.text = Math.floor(piano.actualFPS * 10) / 10 + " FPS";

	this.speedText.text = "x " + Math.floor(piano.speed * 100) + "% Speed";
};