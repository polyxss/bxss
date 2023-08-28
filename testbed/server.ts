import express, { Express, Request, Response } from "express";
import { Filters, Policies, config } from "./config";
import path from "path";
import fs from "fs";

function initRoutes(app: Express) {
    const allRoutes: string[] = [];

    for (let test of config.tests) {
        for (let policyName of test.csp) {
            for (let filterName of test.filter) {
                allRoutes.push(buildRoute(app, test.template, policyName, filterName));
            }
        }
    }

    app.get("/", async function(req: Request, res: Response) {
        let content = "";
        for (let route of allRoutes) {
            content += route + "\n";
        }
        return res.render("plain", {content: content});
    });

	/**
	 * Host "remote" xss script.
	 */
	app.get("/xss.js", async function(req: Request, res: Response) {
		var filePath = path.join(__dirname, 'xss.js');
		var stat = fs.statSync(filePath);

		res.writeHead(200, {
			'Content-Type': 'application/javascript',
			'Content-Length': stat.size,
			'Access-Control-Allow-Origin': '*'
		});
        var readStream = fs.createReadStream(filePath);
		readStream.pipe(res);
    });
}

function buildRoute(app: Express, templateName: string, policyName: keyof Policies, filterName: keyof Filters) {
    const url = "/" + templateName + "/" + policyName + "/" + filterName;
    const policy = config.policies[policyName];
    const filter = config.filters[filterName];

    app.get(url, async function(req: Request, res: Response) {
        const payload = filter(req.query.payload as string || "");
        const content = config.templates[templateName].replace("###", payload);
        res.header("Content-Security-Policy", policy);
        return res.render("page", {content: content});
    });
    return url;
}

const app: Express = express();
app.set("view engine", "ejs");
initRoutes(app);

app.listen(config.general.port);
console.log("Listening on " + config.general.port);
