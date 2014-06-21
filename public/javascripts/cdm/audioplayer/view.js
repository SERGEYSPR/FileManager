var cdm = cdm || {};
cdm.audioplayer = cdm.audioplayer || {};

cdm.audioplayer.PLayListView = function(model, elements) {
    this.trianglify = new Trianglify({ noiseIntensity: 0, cellsize: 20 });
    var self = this;

    bindEvents();
    startState();

    this.rebuildPlayList = function() {
        elements.playlist.html(cdm.audioplayer.Templates.playlistTemplate({ songs: model.getSongs() }));
    };

    this.updateBackgroundImage = function() {
        self.trianglify.options.x_gradient = Trianglify.randomColor();
        self.trianglify.options.y_gradient = self.trianglify.options.x_gradient.map(function(c) { return d3.rgb(c).brighter(0.5)});

        var pattern = self.trianglify.generate(400, 200);
        elements.playerHeader.css('background-image', pattern.dataUrl);
    };

    this.updateSongName = function () {
        elements.songTitle.text(model.getPlayingSong().name);
    };

    this.updateProgress = function (value) {
        elements.playerProgressSlider.css("width", (value * 100) + "%");
    };

    // Controls

    this.setPlayIcon = function() {
        cdm.audioplayer.Elements.playPause
            .children(cdm.audioplayer.Elements.controlClass)
            .css("background-image", "url('/public/icons/player/play.png')");
    };

    this.setPauseIcon = function() {
        cdm.audioplayer.Elements.playPause
            .children(cdm.audioplayer.Elements.controlClass)
            .css("background-image", "url('/public/icons/player/pause.png')");
    };

    this.shuffleIconInactive = function() {
        cdm.audioplayer.Elements.shuffle.css("opacity", 0.3);
    };

    this.shuffleIconActive = function() {
        cdm.audioplayer.Elements.shuffle.css("opacity", 1);
    };

    this.repeatIconInactive = function() {
        cdm.audioplayer.Elements.repeat.css("opacity", 0.3);
    };

    this.repeatIconActive = function() {
        cdm.audioplayer.Elements.repeat.css("opacity", 1);
    };



    function startState() {
        // self.shuffleIconInactive();
        // self.repeatIconInactive();
    }

    function bindEvents() {

        elements.minimizePlayer.mouseenter(function() {
            elements.playerWrap.show();
            elements.playerWrap.animate({ opacity: 1, marginTop: '50px' }, 200);
        });

        elements.playerWrap.mouseleave(function() {
            elements.playerWrap.animate({ opacity: 0, marginTop: '60px' }, 200,
                function() {
                    elements.playerWrap.hide();
                });
        });

        elements.playlist.on("click", elements.songClass, function() {
            var index = $(this).index();

            if (model.getPlayingSongId() === index) {
                $(self).trigger(cdm.audioplayer.Events.playPause);
            }
            else {
                model.setPlayingSongId(index);
                $(self).trigger(cdm.audioplayer.Events.startSong);
            }
        });

        elements.playerProgressBar.click(function(event) {
            var x = event.pageX - elements.playerProgressBar.offset().left;
            x /= elements.playerProgressBar.width();

            $(self).trigger(cdm.audioplayer.Events.rewind, x);
        });

        elements.prev.on("click", function() {
            $(self).trigger(cdm.audioplayer.Events.prev);
        });

        elements.next.on("click", function () {
            $(self).trigger(cdm.audioplayer.Events.next);
        });

        elements.playPause.on("click", function () {
            $(self).trigger(cdm.audioplayer.Events.playPause);
        });
    }
};