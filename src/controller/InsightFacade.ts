/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";

var dataSetHash = {};

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');

    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            try {
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

function InsightResponseInput (code : number, body: Object) {
    var ir : InsightResponse;
    ir.body = body;
    ir.code = code;
    return ir;
}
