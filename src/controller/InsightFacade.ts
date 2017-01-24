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
        var dataSetHash = {};
        var JSZip = require("jszip");
        var zip = new JSZip();

        return new Promise(function(fulfill, reject) {
            try {
                //TODO: Finish implementation
                //TODO: Create helper function to read all files
                zip.loadAsync(content);
                JSON.parse(content);
            } catch (SyntaxError) {
                reject (InsightResponseInput(400, {"error": "my text"}))
            }
            if (id in dataSetHash){
                fulfill (InsightResponseInput(201, content));
            }
            if (!(id in dataSetHash)) {
                fulfill (InsightResponseInput(204, content));
            }
        })
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}

function InsightResponseInput (c : number, b: Object) {
    var ir : InsightResponse = {
        code: c,
        body: b
    };
    return ir;
}
