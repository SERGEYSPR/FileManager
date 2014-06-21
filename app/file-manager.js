var fs = require("fs.extra");
var ncp = require("ncp").ncp;
var path = require("path");
var finder = require("fs-finder");

var sanitizer = require("./sanitizer");
var config = require("../config");
var File = require("./domain/filesystem").File;
var Folder = require("./domain/filesystem").Folder;

var FileManager = new function() {
    this.saveUploadedFile = function(uploadedFile, inFolder) {
        inFolder = _normalizePath(inFolder);

        fs.mkdirRecursiveSync(inFolder);

        var fileName = sanitizer.filename(uploadedFile.originalFilename);

        var fullPath = path.join(inFolder, fileName);

        fs.createReadStream(uploadedFile.path)
            .pipe(fs.createWriteStream(fullPath));
    };

    this.listNodes = function(folderPath) {
        folderPath = _normalizePath(folderPath);

        var nodes = fs.readdirSync(folderPath);

        nodes = nodes.map(function(nodeName) {
            var fullPath = path.join(folderPath, nodeName);
            var stats = fs.statSync(fullPath);

            var relativePath = "/" + path.relative(config.rootFolder, fullPath).replace(/\\/g, "/");

            var node = {};

            if (stats.isFile()) {
                node = new File(relativePath, stats.size);
            } else if (stats.isDirectory()) {
                node = new Folder(relativePath);
            }

            node.createdAt = stats.ctime;
            node.modifiedAt = stats.mtime;

            return node;
        });

        nodes.sort(function(node) {
            return !(node instanceof Folder);
        });

        return nodes;
    };

    this.search = function(searchLine) {
        if (searchLine === undefined)
            return [];

        searchLine = sanitizer.searchQuery(searchLine);
        if (searchLine === "")
            return [];

        var matches = finder.from(config.rootFolder).find('*' + searchLine + '*');
        var nodes = [];

        matches.forEach(function(match) {
            var nodeName = match.replace(/^.*?([^\/\\]+)$/, "$1");
            if (nodeName.search(searchLine) === -1)
                return;

            var stats = fs.statSync(match);
            var relativePath = "/" + path.relative(config.rootFolder, match).replace(/\\/g, "/");

            var node = {};

            if (stats.isFile()) {
                node = new File(relativePath, stats.size);
            } else if (stats.isDirectory()) {
                node = new Folder(relativePath);
            }

            node.createdAt = stats.ctime;
            node.modifiedAt = stats.mtime;

            nodes.push(node);
        });

        nodes.sort(function(node) {
            return !(node instanceof Folder);
        });

        return nodes;
    };

    this.createFolder = function(folderName, inFolder) {
        var fullPath = path.join(inFolder, folderName);

        fullPath = _normalizePath(fullPath);

        fs.mkdirRecursiveSync(fullPath);
    };

    this.move = function(nodeSrc, nodeDst, callback) {
        nodeSrc = sanitizer.nodepath(nodeSrc);
        nodeDst = sanitizer.nodepath(nodeDst);

        nodeSrc = _normalizePath(nodeSrc);
        nodeDst = _normalizePath(nodeDst);

        if (fs.statSync(nodeDst).isDirectory()) {
            nodeDst = path.join(nodeDst, path.basename(nodeSrc));
        }

        ncp(nodeSrc, nodeDst, function(err) {
            if (!err) {
                fs.removeSync(nodeSrc);
            }

            if (callback) {
                callback(err);
            }
        });
    };

    this.remove = function(nodePath) {
        nodePath = sanitizer.nodepath(nodePath);

        nodePath = _normalizePath(nodePath);

        var stats = fs.statSync(nodePath);

        if (stats.isFile()) {
            fs.unlinkSync(nodePath);
        } else if (stats.isDirectory()) {
            fs.removeSync(nodePath);
        }
    };

    function _normalizePath(nodePath) {
        if (!nodePath) {
            nodePath = "";
        }

        nodePath = sanitizer.nodepath(nodePath);
        nodePath = path.join(config.rootFolder, nodePath);

        return nodePath;
    }
};

module.exports = FileManager;