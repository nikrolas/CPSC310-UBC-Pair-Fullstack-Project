/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";

var JSZip = require("jszip");
var zip = new JSZip();
var fs = require("fs");
var datasetHash: any = {};

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent: any) {
                    Promise.all(filePromiseCollector(zipContent))
                        .then(function(arrayOfJSONString) {
                            if(datasetHash[id] == null) {
                                addToHashset(id, arrayOfJSONString);
                                fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                            }
                            else{
                                addToHashset(id, arrayOfJSONString);
                                fulfill(insightResponseConstructor(201, {"Success": "Dataset updated"}));
                            }
                        })
                        .catch(function(err: any) {
                            reject(insightResponseConstructor(400, {"Error": "Invalid Dataset"}));

                        })
                })
                .catch(function(err: any) {
                    reject(insightResponseConstructor(400,{"Error": "Invalid Dataset"}));
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            var data = fs.readFileSync("./cache.txt");
            datasetHash = JSON.parse(data);
            if (datasetHash[id] == id) {
                delete datasetHash[id];
            }
        });
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
    let allPromises: any = [];
    let files = zip.files;
    for (let filename in files) {
        let file = zip.file(filename);
        if(file) {
            allPromises.push(zip.file(filename).async("string"));
        }
    }
    return allPromises;
}

function addToHashset(id: string, jsonStrings: any) {
    datasetHash[id] = jsonStrings;
    writeJSONFile(id, jsonStrings);
}

function writeJSONFile(id: string, jsonStrings: any) {
    let jsons: any = {};
    jsons["courses"] = [];
    for (let string of jsonStrings) {
        jsons["courses"].push(string);
    }
    fs.writeFile(id.concat(".json"), JSON.stringify(jsons), function (err: any) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("json created");
        }
    })
}