/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";

var JSZip = require("jszip");
var zip = new JSZip();

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        var datasetHash = {};

        return new Promise(function(fulfill, reject) {
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent: any) {
                    //console.log("first then");
                    Promise.all(filePromiseCollector(zipContent))
                        .then(function(arrayOfPromises) {
                            console.log("here we are");
                            console.log(arrayOfPromises);
                            fulfill(insightResponseConstructor(0, {}));
                        })
                        .catch(function (err) {
                          console.log(err);
                        })
                })
                .catch(function (err: any) {
                    reject(insightResponseConstructor(400, "Error: Invalid Dataset"));
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}

function insightResponseConstructor(c : number, b: Object) {
    var ir : InsightResponse = {
        code: c,
        body: b
    };
    return ir;
}

function filePromiseCollector(zip: any) {
    let allPromises: Promise<String>[] = [];
    let files = zip.files;
    for (let filename in files) {
        let file = zip.file(filename);
        //console.log("inside for");
        if(file) {
            allPromises.push(zip.file(filename).async("string"));
        }
    }
    return allPromises;
}