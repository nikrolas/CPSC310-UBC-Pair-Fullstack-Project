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

    addDataset(id: string, content: any): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent: any) {
                    Promise.all(filePromiseCollector(zipContent))
                        .then(function(arrayOfJSONString) {
                            if (!fs.existsSync("./cache.json")) {
                                console.log("not exists");
                                    addToHashset(id, arrayOfJSONString)
                                        .then(function () {
                                            fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                                        })
                                        .catch(function (err) {
                                            reject(insightResponseConstructor(400, {"Error": "Invalid Dataset"}));
                                        })
                                }
                            else {
                                console.log("exist");
                                var datastring = fs.readFileSync("./cache.json");
                                datasetHash = JSON.parse(datastring);
                                if (datasetHash[id] == null) {
                                        console.log("Inside new id conditional with a dataset previously");
                                        datasetHash[id] = arrayOfJSONString
                                        console.log(datasetHash[id]);
                                        reWriteJSONFile(datasetHash);
                                        fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                                    }
                                    else if (id in datasetHash) {
                                        console.log("Inside existing id conditional with a dataset previously");
                                        delete datasetHash[id];                             //TODO: Need to replace value
                                        datasetHash[id] = arrayOfJSONString;
                                        reWriteJSONFile(datasetHash);
                                        fulfill(insightResponseConstructor(201, {"Success": "Dataset added"}));
                                    }
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
            if(id in datasetHash){
                delete datasetHash[id];
                reWriteJSONFile(datasetHash);
                fulfill(insightResponseConstructor(200, {"Success": "Dataset removed "}));
            }
            else {
                reject(insightResponseConstructor(424,{"missing": [id] }));
            }
        });

    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function(fulfill,reject) {
            JSON.parse(datasetHash);

        });
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
    console.log("In promise collector");
    let allPromises: any = [];
    let files = zip.files;
    for (let filename in files) {
        let file = zip.file(filename);
        if(file) {
            allPromises.push(file.async("string"));
        }
    }
    return allPromises;
}

function addToHashset(id: string, jsonStrings: any) {
    return new Promise(function (fulfill, reject) {
        console.log("In addToHashset");
        datasetHash[id] = jsonStrings;
        writeJSONFile(id, jsonStrings)
            .then(function () {
                fulfill();
            })
            .catch(function (err: any) {
                reject(err);
            });
    })
}

function writeJSONFile(id: string, jsonStrings: any) {
    return new Promise(function (fulfill, reject) {
        console.log("In writeFile");
        let jsons: any = {};
        jsons[id] = [];
        for (let string of jsonStrings) {
            jsons[id].push(string);
        }
        fs.writeFile("./cache.json", JSON.stringify(jsons), function (err: any) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log("json created");
                fulfill();
            }
        })
    })
}

function reWriteJSONFile(jsonObject: any) {
    return new Promise(function (fulfill, reject) {
        console.log("Rewriting JsonFile");
        fs.writeFile("./cache".concat(".json"), JSON.stringify(jsonObject), function (err: any) {
            if (err) {
                console.log(err);
                reject(err);            }
            else {
                console.log("json created");
                fulfill();
            }
        })
    })
}

function isEmptyObject(obj:Object) {
    return !Object.keys(obj).length;
}