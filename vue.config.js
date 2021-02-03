const path = require("path");
module.exports = {
    "publicPath": "/sonic/",
    "productionSourceMap": false,
    "configureWebpack": {
        "resolve": {
            "alias": {
                "src": path.resolve(__dirname, "src")
            }
        }
    },
    "transpileDependencies": [
        "vuetify"
    ]
}