var cdm = cdm || {};
cdm.filemanager = cdm.filemanager || {};

cdm.filemanager.NodeListView = function (model, elements) {
    this._model = model;

    var self = this;

    bindEvents();

    this.selectNodeItem = function(index) {
        var node = model.getSelectedNode();
        var nodeItem = elements.nodeItemsContainer.find(elements.nodeItemClass).get(index);

        if ($(nodeItem).hasClass(elements.nodeItemSelectedClassName)) {
            $(nodeItem).removeClass(elements.nodeItemSelectedClassName);
            $(elements.buttons.removeNode).css("visibility", "hidden");
            $(elements.buttons.downloadFile).css("visibility", "hidden");
        } else {
            elements.nodeItemsContainer
                .find(elements.nodeItemClass)
                .removeClass(elements.nodeItemSelectedClassName);

            $(nodeItem).addClass(elements.nodeItemSelectedClassName);
            $(elements.buttons.removeNode).css("visibility", "visible");
            $(elements.buttons.downloadFile).css("visibility", node.type == "folder" ? "hidden" : "visible");
        }
    };

    this.rebuildNodeList = function() {
        elements.nodeItemsContainer.empty();

        self._model.getNodes().forEach(function (node) {
            elements.nodeItemsContainer.append(cdm.filemanager.Templates.nodeTemplate(node));
        });

        rebuildBreadcrumbs();

        verifyIcons();
    };

    function rebuildBreadcrumbs() {
        var path = model.getCurrentFolder();

        var names = path.split(/\//)
            .filter(function(item) {
                return !!item;
            });

        var segments = [];

        for(var i = 0; i < names.length; i++) {
            segments.push({
                name: names[i],
                path: names.slice(0, i + 1).join("/")
            });
        }

        elements.breadcrumbsContainer.html(cdm.filemanager.Templates.breadcrumbsTemplate({segments: segments}));
    }

    // check if specific icon (which is loaded by file extension) is available;
    // if icon is not found, then assign the default one
    //
    // optimization: Analyze of the backgroundImage property BEFORE the html will be appended to the DOM. This would prevent several round trips to server
    function verifyIcons() {
        var mapBgUrlsToIcons = [];

        $(elements.nodeItemIconClass).each(function(index, icon) {
            if (!$(icon).css("backgroundImage"))
                return;

            var url = $(icon).css("backgroundImage")
                .replace("url(", "")
                .replace(")", "");

            if (mapBgUrlsToIcons[url]) {
                mapBgUrlsToIcons[url].push(icon);
            } else {
                mapBgUrlsToIcons[url] = [ icon ];
            }
        });

        for (var url in mapBgUrlsToIcons) {
            (function(url) {
                $.ajax({
                    type: "HEAD",
                    url: url
                }).fail(function () {
                    mapBgUrlsToIcons[url].forEach(function (icon) {
                        $(icon).css("backgroundImage", "");
                    });
                });
            })(url);
        }
    }

    function bindEvents() {
        elements.uploadArea.on("dragenter", function(event) {
            elements.nodeList.hide();
            elements.uploadView.show();
        });

        elements.uploadArea.on("dragleave", function(event) {
            elements.nodeList.show();
            elements.uploadView.hide();
        });

        elements.uploadArea.on("drop", function(event) {
            console.log(event.originalEvent.dataTransfer);
        });

        elements.nodeItemsContainer.on("dragstart", elements.nodeItemClass, function(e) {
            var index = $(this).index();

            model.setSelectedIndex(index);
            model.setDragOverIndex(index);
            self.selectNodeItem(index);

            elements.nodeItemsContainer
                .find(elements.nodeItemClass)
                .css("opacity", 0.3);
        });

        elements.nodeItemsContainer.on("dragend", elements.nodeItemClass, function(e) {
            $(self).trigger(cdm.filemanager.Events.nodeMoving, { srcIndex: model.getSelectedIndex(), dstIndex: model.getDragOverIndex() });

            elements.nodeItemsContainer
                .find(elements.nodeItemClass)
                .css("opacity", 1);
        });

        elements.nodeItemsContainer.on("dragenter", elements.nodeItemClass, function() {
            model.setDragOverIndex($(this).index());
            $(this).css("opacity", 1);
        });

        elements.nodeItemsContainer.on("dragleave", elements.nodeItemClass, function() {
            $(this).css("opacity", 0.3);
        });




        // triggering custom events, these will be used by controller to perform specific actions

        elements.nodeItemsContainer.on("click", elements.nodeItemClass, function() {
            var index = $(this).index();

            model.setSelectedIndex(index);
            self.selectNodeItem(index);
        });

        elements.nodeItemsContainer.on("dblclick", elements.nodeItemClass, function() {
            $(self).trigger(cdm.filemanager.Events.nodeOpened, $(this).index());
            self.selectNodeItem($(this).index());
        });

        elements.buttons.removeNode.on("click", function() {
            $(self).trigger(cdm.filemanager.Events.nodeRemoving);
        });

        elements.buttons.downloadFile.on("click", function() {
            $(self).trigger(cdm.filemanager.Events.fileDownloading);
        });

        elements.searchField.keydown(function(event) {
            if (event.keyCode === 13) {
                $(self).trigger(cdm.filemanager.Events.search, elements.searchField.val());
            }
        });

        // responding to an events of the folder toolbar buttons

        elements.buttons.openUploadFileDialog.click(function() {
            elements.dialogs.uploadFile.modal("show");
        });

        elements.buttons.openCreateFolderDialog.click(function() {
            elements.dialogs.createFolder.modal("show");
        });

        // filling the currentFolder form element just before the form being sent

        elements.buttons.uploadFile.click(function() {
            $(self).trigger(cdm.filemanager.Events.fileUploading);
        });

        elements.buttons.createFolder.click(function() {
            $(self).trigger(cdm.filemanager.Events.folderCreating);
        });

        // todo: place your event listeners here
    }
};
