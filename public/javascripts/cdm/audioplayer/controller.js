var cdm = cdm || {};
cdm.audioplayer = cdm.audioplayer || {};

cdm.audioplayer.PlayListController = function(model, view) {
    this.player = new Audio();
    var self = this;

    bindEvents();


    function bindEvents() {
        $(self.player).on("ended", next);

        $(self.player).on("timeupdate", function() {
            view.updateProgress(self.player.currentTime / self.player.duration);
        });
    }

    $(window).on(cdm.audioplayer.Events.startSong, function (event, playlist) {
        model.setSongs(playlist.songs);
        model.setPlayingSongId(playlist.requiredSongId);
        view.rebuildPlayList();

        view.updateBackgroundImage();
        self.player.setAttribute("src", model.getPlayingSong().src);
        self.player.play();
    });

    $(view).on(cdm.audioplayer.Events.startSong, function () {
        view.updateBackgroundImage();
        self.player.setAttribute("src", model.getPlayingSong().src);
        self.player.play();
    });

    $(view).on(cdm.audioplayer.Events.playPause, playPause);
    $(view).on(cdm.audioplayer.Events.prev, prev);
    $(view).on(cdm.audioplayer.Events.next, next);
    $(view).on(cdm.audioplayer.Events.rewind, rewind);

    function rewind(event, x) {
        self.player.currentTime = Math.floor(x * self.player.duration);
    }

    function playPause() {
        if (self.player.paused) {
            self.player.play()
            view.setPauseIcon();
        }
        else {
            self.player.pause();
            view.setPlayIcon();
        }
    }

    function prev() {
        if (model.getSongsCount() !== 0) {
            model.playingSongIdDecrement();

            view.updateBackgroundImage();
            view.updateSongName();
            view.setPauseIcon();

            self.player.setAttribute("src", model.getPlayingSong().src);
            self.player.play();
        }
    }

    function next() {
        if (model.getSongsCount() !== 0) {
            model.playingSongIdIncrement();

            view.updateBackgroundImage();
            view.updateSongName();
            view.setPauseIcon();

            self.player.setAttribute("src", model.getPlayingSong().src);
            self.player.play();
        }
    }
};