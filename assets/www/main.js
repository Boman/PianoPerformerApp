function loadSongs() {
	$('#songList').empty();
	$.getJSON(songsURL + "songs.json", function(data) {
		$.each(data, function(key, val) {
			$('#songList').append(
					"<li><a href='javascript:loadSong(\"" + songsURL + key + "\")'><h3 class=\"ui-li-heading\">"
							+ val['name'] + "</h3><p class=\"ui-li-desc\">" + val['composer'] + "</p></a></li>");
		});
		$('#songList').listview('refresh');
	});
}

var song = null;
var piano = null;

function loadSong(songFileName) {
	song = new Song();
	song.load(songFileName, function() {
		$('#songSettingsSongDuration').html(timeToString(song.songDuration));
		$.mobile.changePage($('#songSettings'));
	});
}

function playPiano() {
	piano = new Piano();
	$('#jqMobile').hide();
	$('#mainCanvas').show();
}

function backPressed() {
	if (piano != null) {
		$('#jqMobile').show();
		$('#mainCanvas').hide();
		$.mobile.changePage($('#songSettings'));
	} else {
		switch ($.mobile.activePage.attr('id')) {
		case 'piano':
			song === null ? $.mobile.changePage($('#mainMenu')) : $.mobile.changePage($('#songSettings'));
			break;
		case 'songSettings':
			song = null;
			$.mobile.changePage($('#mainMenu'));
			break;
		default:
			break;
		}
	}
}

function pauseApp() {
	if ($.mobile.activePage.attr('id') == 'piano') {
		piano.playPause(false);
		piano.pauseUI();
	}
}

function resumeApp() {
	if ($.mobile.activePage.attr('id') == 'piano') {
		piano.resumeUI();
	}
}