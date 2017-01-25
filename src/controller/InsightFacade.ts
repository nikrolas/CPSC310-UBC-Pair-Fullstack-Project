/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        var datasetHash = {};
        var JSZip = require("jszip");
        var zip = new JSZip();

        return new Promise(function(fulfill, reject) {
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent) {
                    zipContent.folder(id).forEach(function (relativePath: string, file) {
                        //console.log("Path " + relativePath);
                        //console.log("Filename" + file);
                    });
                    //console.log(datasetHash);
                })
                .catch(function (err: any) {
                    reject(InsightResponseInput(400, {}));
                });
            fulfill(InsightResponseInput(0, {}));
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}

function InsightResponseInput(c : number, b: Object) {
    var ir : InsightResponse = {
        code: c,
        body: b
    };
    return ir;
}