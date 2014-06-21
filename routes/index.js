var express = require("express");
var multiparty = require("multiparty");

var router = express.Router();

var FileManager = require("../app/file-manager");

/* GET home page. */
router.get("/", function(req, res) {
    res.render("index.html");
});

router.post("/uploadFile", function(req, res) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        console.log(files);
        for (var i = 0; i < files.files.length; i++) {
            var uploadedFile = files.files[i];
            FileManager.saveUploadedFile(uploadedFile, fields.currentFolder[0]);
        }

        res.send("ok");
    });
});

router.post("/listNodes", function(req, res) {
    res.json(FileManager.listNodes(req.body.path));
});

router.post("/createFolder", function(req, res) {
    FileManager.createFolder(req.body.path, req.body.currentFolder);
    res.send("ok");
});

router.post("/move", function(req, res) {
    FileManager.move(req.body.source, req.body.destination, function(err) {
        res.send("done");
    });
});

router.post("/remove", function(req, res) {
    FileManager.remove(req.body.path);
    res.send("done");
});

router.post("/search", function(req, res) {
    res.json(FileManager.search(req.body.q));
});

module.exports = router;