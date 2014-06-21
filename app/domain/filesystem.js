var Node = (function () {
    function Node(path) {
        this.path = path;
        this.modifiedAt = null;
        this.createdAt = null;

        this.name = path;

        if (path) {
            this.name = path.replace(/^.*?([^\/\\]+)$/, "$1");
        }
    }

    return Node;
})();

var File = (function(parent) {
    File.prototype = new Node();
    File.prototype.constructor = File;

    function File(path, size) {
        parent.call(this, path);

        this.size = size || 0;
        this.type = "file";
        this.mimeType = "application/octet-stream";

        if (path) {
            if (this.name.indexOf(".") !== -1) {
                this.type = this.name.replace(/^.*?([^\.]+)$/, "$1");
            }
        }
    }

    return File;
})(Node);

var Folder = (function(parent) {
    Folder.prototype = new Node();
    Folder.prototype.constructor = Folder;

    function Folder(path) {
        parent.call(this, path);

        this.children = [];
        this.type = "folder";
    }

    return Folder;
})(Node);

exports.File = File;
exports.Folder = Folder;