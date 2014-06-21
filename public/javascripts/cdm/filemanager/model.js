var cdm = cdm || {};
cdm.filemanager = cdm.filemanager || {};

cdm.filemanager.NodeListModel = function () {
    this._nodes = [];
    this._selectedIndex = -1;
    this._dragOverIndex = -1;
    this._currentFolder = "";

    var self = this;

    this.getNodes = function() {
        return self._nodes;
    };

    this.getNode = function(index) {
        return self._nodes[index];
    };

    this.setNodes = function(nodes) {
        self._nodes = nodes;
    };

    this.getSelectedIndex = function() {
        return self._selectedIndex;
    };

    this.setSelectedIndex = function(index) {
        self._selectedIndex = index;
    };

    this.getDragOverIndex = function() {
        return self._dragOverIndex;
    };

    this.setDragOverIndex = function(index) {
        self._dragOverIndex = index;
    };

    this.setCurrentFolder = function(path) {
        self._currentFolder = path;
    };

    this.getCurrentFolder = function() {
        return self._currentFolder;
    };

    this.getSelectedNode = function() {
        return self._nodes[self._selectedIndex];
    };
};
