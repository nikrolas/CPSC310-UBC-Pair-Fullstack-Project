/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util";

var JSZip = require("jszip");
var zip = new JSZip();
var fs = require("fs");
let datasetHash: any = {};


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
                                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
                                if (datasetHash[id] == null) {
                                    console.log("Inside new id conditional with a dataset previously");
                                    datasetHash[id] = arrayOfJSONString;
                                    reWriteJSONFile(datasetHash);
                                    fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                                }
                                else if (id in datasetHash) {
                                    console.log("Inside existing id conditional with a dataset previously");
                                    fs.unlinkSync('./cache.json');
                                    console.log("deleted");
                                    datasetHash[id] = arrayOfJSONString;
                                    reWriteJSONFile(datasetHash);
                                    console.log("sofargood");
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
            datasetHash = JSON.parse(fs.readFileSync('./cache.json'));
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
            datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            let covertedArray:string[] = [];
            for (var i = 0; i < query.COLUMNS.length; i++) {                    //Checking Columns for wanted values
                covertedArray[i] = correspondingJSON(query.COLUMNS[i]);
            }
            for (var i = 0; i < covertedArray.length; i++) {
                for (var key in datasetHash) {                   //number of keys in datasethash
                    for (var j = 0; j < datasetHash[key].length; j++) {                 //number of objects in array of key
                        var covertedToObj = JSON.parse(datasetHash[key][j]);
                        for (var k=0; k<covertedToObj['result'].length; k++) {
                            if (covertedArray[i] in covertedToObj["result"][k]) {              //Finding each object in array of dictionary
                                console.log(covertedToObj["result"][k][covertedArray[i]]);
                            }
                        }
                    }
                }
            }

        });
    }
}

function correspondingJSON(string : String) {
    if (string == 'courses_dept') {
        return "Subject";
    }
    if (string == 'courses_id') {
        return "Course";
    }
    if (string == 'courses_avg') { //number
        return "Avg";
    }
    if (string == 'courses_instructor') {
        return "Professor";
    }
    if (string == 'courses_title') {
        return "Title";
    }
    if (string == 'course_pass') { //number
        return "Pass";
    }
    if (string == 'courses_fail') { //number
        return "Fail";
    }
    if (string == 'courses_audit') { //number
        return "Audit";
    }
    if (string == 'courses_uuid') { //number
        return "Section";
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
    console.log("Rewriting JsonFile");
    fs.writeFile("./cache".concat(".json"), JSON.stringify(jsonObject));
}
