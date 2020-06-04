const express = require("express");

const config = {
    host: "127.0.0.1",
    port: 8080,
};

const routes = {
    html: {
        body: "###",
        comment: "<!-- ### -->",
        textarea: "<textarea> ### </textarea>",
    },
};

const filters = {
    none: text => { return text; },
    noAngleBrackets: text => { return text.replace(/<|>/gi, ""); },
}

function initRoutes(app) {
    let allRoutes = [];

    for (let language in routes) {
        for (let context in routes[language]) {
            let name = "/" + language + "/" + context;
            buildRoute(app, name, routes[language][context]);
            allRoutes.push(name);
        }
    }

    //TODO: List them all for each filter combination?
    app.get("/", async function(req, res) {
        let content = "";
        for (let route of allRoutes) {
            content += "<a href=" + route + ">" + route + "</a></br>";
        }
        return res.render("page", {content: content}); 
    });
};

function buildRoute(app, name, content) {
    app.get(name, async function(req, res) {
        let payload = req.query.payload;

        //Optionally apply filter
        let filter = req.query.filter;
        if (filter && filters[filter]) {
            payload = filters[filter](payload);
        }

        content = content.replace("###", payload);
        return res.render("page", {content: content}); 
    });
}

var app = express();
app.set("view engine", "ejs");
initRoutes(app);

app.listen(config.port, config.host);
console.log("Listening on " + config.port);
