var cdm = cdm || {};
cdm.filemanager = cdm.filemanager || {};

cdm.filemanager.NodeListController = function(model, view) {
    var self = this;

    this.loadNodes = function(path) {
        $.post("/listNodes", {path: path})
            .done(function (nodes) {
                model.setNodes(nodes);
                view.rebuildNodeList();
            });
    };

    this.search = function(q) {
        $.post("/search", {q: q})
            .done(function (nodes) {
                model.setNodes(nodes);
                view.rebuildNodeList();


            });
    };

    this.removeNode = function(path) {
        $.post("/remove", {path: path})
            .done(function() {
                self.reload();
            });
    };

    this.moveNode = function(source, destination) {
        $.post("/move", { source: source, destination: destination })
            .done(function() {
                self.reload();
            });
    };

    this.reload = function() {
        self.loadNodes(model.getCurrentFolder());
    };

    // responding to a custom events from the view

    $(view).on(cdm.filemanager.Events.nodeOpened, function(event, index) {
        var node = model.getNode(index);
        if (node.type == "folder") {
            window.location.hash = "#" + node.path;
        } else {
            var node = model.getNode(index);
            var $element;

            if (node.type === "jpg" || node.type === "png" || node.type === "tga") {
                $element = $("<img />", {
                    'width': "100%",
                    'src': "/upload" + node.path
                });
            }
            else if (isAudio(node)) {
                var playlist = {};
                playlist.songs = model
                    .getNodes()
                    .filter(function(element) { return isAudio(element); })
                    .map(function(element) { return { src: "/upload" + element.path, name: element.name }; });

                var fullPath = "/upload" + node.path;

                playlist.requiredSongId = -1;
                for (var i = 0; i < playlist.songs.length; i++) {
                    if (playlist.songs[i].src === fullPath) {
                        playlist.requiredSongId = i;
                        break;
                    }
                }

                $(window).trigger(cdm.audioplayer.Events.startSong, playlist);
            }
            else {
                $element = $("<div>")
                    .css({
                        'color': '#666',
                        'font-size': '26px',
                        'padding': '40px 0',
                        'text-align': 'center'})
                    .text("Предварительный просмотр для данного файла не поддерживается");
            }

            cdm.filemanager.Elements.dataViewer.empty();
            cdm.filemanager.Elements.dataViewer.append($element);
        }
    });

    $(view).on(cdm.filemanager.Events.nodeMoving, function(e, indices) {
        var srcNode = model.getNode(indices.srcIndex);
        var dstNode = model.getNode(indices.dstIndex);

        if (dstNode.type === "folder" && indices.srcIndex !== indices.dstIndex)
            self.moveNode(srcNode.path, dstNode.path);
    });

    $(view).on(cdm.filemanager.Events.nodeRemoving, function() {
        var node = model.getSelectedNode();
        self.removeNode(node.path);
    });

    $(view).on(cdm.filemanager.Events.fileDownloading, function() {
        var node = model.getSelectedNode();
        window.open("/upload/" + node.path);
    });

    $(view).on(cdm.filemanager.Events.fileUploading, function() {
        var form = new FormData();
        var files = cdm.filemanager.Elements.inputs.filesToUpload.prop("files");

        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                form.append("files", files[i]);
            }

            form.append("currentFolder", model.getCurrentFolder());

            $.ajax({
                url: "/uploadFile",
                type: "POST",
                data: form,
                processData: false,
                contentType: false,
                success: function(response) {
                    cdm.filemanager.Elements.dialogs.uploadFile.modal("hide");
                    self.reload();
                },
                error: function(jqXHR, textStatus, errorMessage) {
                    console.log(errorMessage); // Optional
                }
            });
        }

        cdm.filemanager.Elements.inputs.filesToUpload.val("");
    });

    $(view).on(cdm.filemanager.Events.folderCreating, function() {
        var path = cdm.filemanager.Elements.inputs.newFolderName.val();

        $.post("/createFolder", { path: path, currentFolder: model.getCurrentFolder() })
            .done(function () {
                cdm.filemanager.Elements.dialogs.createFolder.modal("hide");
                self.reload();
            });

        cdm.filemanager.Elements.inputs.newFolderName.val("");
    });

    $(view).on(cdm.filemanager.Events.search, function(event, searchQuery) {
        if (searchQuery === undefined)
            return;

        searchQuery = searchQuery
            .replace("..", ".")
            .replace(/^\\+/, "")
            .replace(/^\/+/, "")
            .replace(/[:"*?<>|#]/g, "");

        if (searchQuery !== "") {
            self.search(searchQuery);
            cdm.filemanager.Elements.navigationBar.css("display", "none");
        }
        else {
            self.reload();
            cdm.filemanager.Elements.navigationBar.css("display", "block");
        }
    });

    function isAudio(node) {
        return node.type === "mp3" || node.type === "ogg" || node.type === "wav";
    }

    // url hash change listener
    $(window).on("hashchange", function () {
        var path = "/";

        if (window.location.hash) {
            path = window.location.hash.replace("#", "");
        }

        self.loadNodes(path);
        model.setCurrentFolder(path);
        cdm.filemanager.Elements.navigationBar.css("display", "block");
    });
};