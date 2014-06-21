var cdm = cdm || {};
cdm.audioplayer = cdm.audioplayer || {};

cdm.audioplayer.PlayListModel = function () {
    this.playlist = [];
    this.playingSongId = -1;

    var self = this;

    this.getSongsCount = function () {
        return self.playlist.length;
    };

    this.getSongs = function() {
        return self.playlist;
    };

    this.getSong = function(index) {
        return self.playlist[index];
    };

    this.setSongs = function(playlist) {
        self.playlist = playlist;
    };

    this.getPlayingSongId = function() {
        return self.playingSongId;
    };

    this.setPlayingSongId = function(index) {
        self.playingSongId = index;
    };

    this.playingSongIdIncrement = function() {
        self.playingSongId = (self.playingSongId + 1 < self.playlist.length) ? self.playingSongId + 1 : 0;
    };

    this.playingSongIdDecrement = function() {
        self.playingSongId = (self.playingSongId - 1 >= 0) ? self.playingSongId - 1 : self.playlist.length - 1;
    };

    this.getPlayingSong = function() {
        return (self.playingSongId !== - 1 ? self.playlist[self.playingSongId] : null);
    };
};
