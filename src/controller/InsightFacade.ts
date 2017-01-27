/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";
import {isNullOrUndefined} from "util";

var JSZip = require("jszip");
var zip = new JSZip();
var fs = require("fs");
var datasetHash:any = {};

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent: any) {
                    Promise.all(filePromiseCollector(zipContent))
                        .then(function(arrayOfPromises) {
                            //console.log(arrayOfPromises);
                            if(isNullOrUndefined(datasetHash[id])) {
                                datasetHash[id] = arrayOfPromises;
                                fs.writeFile(id.concat(".txt"), JSON.stringify(datasetHash),'w');
                                console.log("Inside 204");
                                fulfill(insightResponseConstructor(204,{}));
                            }
                            else{
                                datasetHash[id] = arrayOfPromises;
                                fs.writeFile(id.concat(".txt"), JSON.stringify(datasetHash),'w');
                                console.log("Inside 201");
                                fulfill(insightResponseConstructor(201,{}));
                            }
                        })
                        .catch(function (err) {
                          console.log("Inside inside 400");
                          reject(insightResponseConstructor(400, {"Error": "Invalid Dataset"}));

                        })
                })
                .catch(function (err: any) {
                    console.log("Inside outside 400")
                    reject(insightResponseConstructor(400,{"Error": "Invalid Dataset"}));
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        var data = fs.readFileSync("./cache.txt");
        datasetHash = JSON.parse(data);
        if (datasetHash[id] == id) {
            delete datasetHash[id];
        }
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
        if(file) {
            allPromises.push(zip.file(filename).async("string"));
        }
    }
    return allPromises;
}