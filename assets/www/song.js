function Song() {
	var that = this;
	this.notes = [];
	this.midiFileName = '';
	this.songDuration = 0;

	this.load = function(fileName, onLoadHandler) {
		this.loaded = false;
		this.midiFileName = fileName;
		if (fileName.indexOf(".mid", fileName.length - 4) !== -1) {
			this.loadMidi(this.midiFileName, onLoadHandler);
		}
	};

	this.loadMidi = function(fileName, onLoadHandler) {
		loadRemote(fileName, function(data) {
			that.midiFileData = MidiFile(data);
			that.readMidiNotes();
			onLoadHandler();
		});
	};

	this.readMidiNotes = function() {
		var trackStates = [];
		var beatsPerMinute = 120;
		var ticksPerBeat = this.midiFileData.header.ticksPerBeat;

		for ( var i = 0; i < this.midiFileData.tracks.length; i++) {
			trackStates[i] = {
				'nextEventIndex' : 0,
				'ticksToNextEvent' : (this.midiFileData.tracks[i].length ? this.midiFileData.tracks[i][0].deltaTime
						: null)
			};
		}

		var finished = false;
		var eventPosition = 0;
		var secondsToNextEvent = 0;

		var nextEventInfo;

		function getNextEvent(midiFileData) {
			var ticksToNextEvent = null;
			var nextEventTrack = null;
			var nextEventIndex = null;

			for ( var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null
						&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)) {
					ticksToNextEvent = trackStates[i].ticksToNextEvent;
					nextEventTrack = i;
					nextEventIndex = trackStates[i].nextEventIndex;
				}
			}
			if (nextEventTrack != null) {
				/* consume event from that track */
				var nextEvent = midiFileData.tracks[nextEventTrack][nextEventIndex];
				if (midiFileData.tracks[nextEventTrack][nextEventIndex + 1]) {
					trackStates[nextEventTrack].ticksToNextEvent += midiFileData.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
				} else {
					trackStates[nextEventTrack].ticksToNextEvent = null;
				}
				trackStates[nextEventTrack].nextEventIndex += 1;
				/* advance timings on all tracks by ticksToNextEvent */
				for ( var i = 0; i < trackStates.length; i++) {
					if (trackStates[i].ticksToNextEvent != null) {
						trackStates[i].ticksToNextEvent -= ticksToNextEvent;
					}
				}
				nextEventInfo = {
					'ticksToEvent' : ticksToNextEvent,
					'event' : nextEvent,
					'track' : nextEventTrack
				};
				var beatsToNextEvent = ticksToNextEvent / ticksPerBeat;
				secondsToNextEvent = beatsToNextEvent / (beatsPerMinute / 60);
			} else {
				nextEventInfo = null;
				finished = true;
			}
		}

		getNextEvent(this.midiFileData);

		function handleEvent() {
			var event = nextEventInfo.event;
			eventPosition += secondsToNextEvent;
			switch (event.type) {
			case 'meta':
				switch (event.subtype) {
				case 'setTempo':
					beatsPerMinute = 60000000 / event.microsecondsPerBeat;
				}
				break;
			case 'channel':
				switch (event.subtype) {
				case 'noteOn':
					// look if note is already pressed
					for ( var i = 0; i < that.notes.length; ++i) {
						if (that.notes[i].noteNumber == event.noteNumber && that.notes[i].noteDuration == 0) {
							that.notes[i].noteDuration = eventPosition - that.notes[i].notePosition;
						}
					}
					that.notes.push({
						notePosition : eventPosition,
						noteNumber : event.noteNumber,
						noteVelocity : event.velocity,
						noteTrack : nextEventInfo.track,
						noteDuration : 0
					});
					break;
				case 'noteOff':
					for ( var i = 0; i < that.notes.length; ++i) {
						if (that.notes[i].noteNumber == event.noteNumber && that.notes[i].noteDuration == 0) {
							that.notes[i].noteDuration = eventPosition - that.notes[i].notePosition;
						}
					}
					break;
				}
				break;
			}
		}

		while (!finished) {
			handleEvent();
			getNextEvent(this.midiFileData);
			this.songDuration = eventPosition;
		}
	};
}