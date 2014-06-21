module.exports = {
    filename: function(name) {
        return name.replace(/[\\\/:"*?<>|#]/g, "_");
    },

    nodepath: function(name) {
        return name
            .replace("..", ".")
            .replace(/^\\+/, "")
            .replace(/^\/+/, "")
            .replace(/[:"*?<>|#]/g, "_");
    },

    searchQuery: function(query) {
        return query
            .replace("..", ".")
            .replace(/^\\+/, "")
            .replace(/^\/+/, "")
            .replace(/[:"*?<>|#]/g, "");
    }
};