/**
 * This is the main programmatic entry point for the project.
 */
import {
    IInsightFacade, InsightResponse, QueryRequest, FilterInterface, NumberFilter,
    OptionInterface
} from "./IInsightFacade";

import Log from "../Util";

var JSZip = require("jszip");
var fs = require("fs");
var datasetHash: any = {};


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: any): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true})
                .then(function(zipContent: any) {
                    Promise.all(filePromiseCollector(zipContent))
                        .then(function(arrayOfJSONString) {
                            if (!fs.existsSync("./cache.json")) {
                                addToHashset(id, arrayOfJSONString)
                                    .then(function () {
                                        fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                                    })
                                    .catch(function (err) {
                                        reject(insightResponseConstructor(400, {"Error": "Invalid Dataset"}));
                                    })
                            }
                            else {
                                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
                                if (datasetHash[id] == null) {
                                    datasetHash[id] = arrayOfJSONString;
                                    reWriteJSONFile(datasetHash);
                                    fulfill(insightResponseConstructor(204, {"Success": "Dataset added"}));
                                }
                                else if (id in datasetHash) {
                                    fs.unlinkSync('./cache.json');
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
            // Checks if order is contained in columns; query invalid if it is not
            if(!query.OPTIONS.COLUMNS.includes(query.OPTIONS.ORDER)) {
                reject(insightResponseConstructor(400, {"Error": "Order is not contained in columns"}))
            }

            datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            let setID = query.OPTIONS.COLUMNS[0].split('_')[0];
            let dataToFilter = datasetHash[setID];
            let finalFilteredData = {render: query.OPTIONS.FORM, result: []};
            let storage:any = [];
            let finalArray:any = [];
            for (let eachCourse of dataToFilter) {
                let json = JSON.parse(eachCourse);
                if (json["result"].length != 0) {
                    for (let courseSection of json["result"]) {
                        storage.push(courseSection);
                    }
                }
            }
            let filteredData = filterData(storage, query.WHERE);

            // Show only desired columns
            for (let eachClass of filteredData) {
                let row: any = {};
                if (query.WHERE.OR != null || query.WHERE.AND != null) {                        //TODO implementation to handle filtereddata being an array of objects for OR
                    for(let filteredKeys in eachClass) {
                        for (let column of query.OPTIONS.COLUMNS) {
                            row[column] = eachClass[filteredKeys][correspondingJSON(column)];
                        }
                        finalArray.push(row);
                        row = {};
                    }
                }
                else {
                    for (let column of query.OPTIONS.COLUMNS) {
                        row[column] = eachClass[correspondingJSON(column)];
                    }
                    finalArray.push(row);
                }
            }

            // Sort by column
            let order = query.OPTIONS.ORDER;

            if(typeof order != "undefined") {
                if(correspondingNumber(order)) {
                    finalArray = sortByNum(finalArray, order);
                }
                else {
                    finalArray = sortByChar(finalArray, correspondingJSON(order));
                }
            }
            console.log(finalArray);
            finalFilteredData["result"] = finalArray;
            fulfill(insightResponseConstructor(200, finalFilteredData));

        });
    }
}

function filterData(dataset: any, request: any): any[] {
    // Base cases
    if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        let value = request.LT[key];
        if (typeof value != "number") {
            // TODO Must reject
        }
        let translatedKey = correspondingJSON(key);

        for (let courseSection of dataset) {
            if (courseSection[translatedKey] < value) {
                filteredData.push(courseSection);
            }
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "GT") {
        let filteredData = [];
        let key = Object.keys(request.GT)[0];
        let value = request.GT[key];
        if (typeof value != "number") {
            // TODO must reject
        }
        let translatedKey = correspondingJSON(key);


        for (let courseSection of dataset) {
            if (courseSection[translatedKey] > value) {
                filteredData.push(courseSection);
            }
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "EQ") {
        let filteredData = [];
        let key = Object.keys(request.EQ)[0];
        let value = request.EQ[key];
        if (typeof value != "number") {
            // TODO must reject
        }
        let translatedKey = correspondingJSON(key);

        for (let courseSection of dataset) {
            if (courseSection[translatedKey] == value) {
                filteredData.push(courseSection);
            }
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "IS") {             //TODO:SAME AS EQ but WITH STRING?!
        let filteredData = [];
        let key = Object.keys(request.IS)[0];
        let value = request.IS[key];
        if (typeof value != "number") {
            // TODO must reject
        }
        let translatedKey = correspondingJSON(key);

        for (let courseSection of dataset) {
            if (courseSection[translatedKey] == value) {
                filteredData.push(courseSection);
            }
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "NOT") {             //TODO:NOT Case
        let filteredData = [];
        let key = Object.keys(request.IS)[0];
        let value = request.IS[key];
        if (typeof value != "number") {
            // TODO must reject
        }
        let translatedKey = correspondingJSON(key);

        for (let courseSection of dataset) {
            if (courseSection[translatedKey] == value) {
                filteredData.push(courseSection);
            }
        }
        return filteredData;
    }
    // Other recursive cases
    // TODO Implementation
    else {
        if (Object.keys(request)[0] == "AND") {
            let filteredData: any = [];
            let modifiableDataset: any = dataset;
            for (let operand of request.AND) {
                modifiableDataset = filterData(modifiableDataset, operand);
            }
            filteredData.push(modifiableDataset);
            return filteredData;
        }
        else if (Object.keys(request)[0] == "OR") {                     //TODO: Requires an array of 2 filter interfaces or reject
            let filteredData = [];
            for (let operand of request.OR) {
                filteredData.push(filterData(dataset, operand));
            }
            return filteredData;


        }
        // else if (Object.keys(request)[0] == "NOT") {
        //     // TODO
        //     return filterData(dataset, request.NOT);
        // }
    }
}

function sortByNum(data: any, order: string) {
    data.sort(function (a, b) {
        var dataA = a[order], dataB = b[order];
        return dataA-dataB;
    });
    return data;
}

function sortByChar(data: any, order: string) {
    data.sort(function (a, b) {
        var dataA = a[order], dataB = b[order];
        if (dataA < dataB) return -1;
        if (dataA > dataB) return -1;
        return 0;
    });
    return data;
}
function correspondingNumber(string : String) {

    if (string == 'courses_avg') { //number
        return true;
    }
    if (string == 'courses_pass') { //number
        return true;
    }
    if (string == 'courses_fail') { //number
        return true;
    }
    if (string == 'courses_audit') { //number
        return true;
    }
    if (string == 'courses_uuid') { //number                    // TODO: not sure if this is correct
        return true;
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
    if (string == 'courses_pass') { //number
        return "Pass";
    }
    if (string == 'courses_fail') { //number
        return "Fail";
    }
    if (string == 'courses_audit') { //number
        return "Audit";
    }
    if (string == 'courses_uuid') { //number                    // TODO: not sure if this is correct
        return "Section";
    }
}

function insightResponseConstructor(c : number, b: Object) {
    let ir : InsightResponse = {
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
            allPromises.push(file.async("string"));
        }
    }
    return allPromises;
}

function addToHashset(id: string, jsonStrings: any) {
    return new Promise(function (fulfill, reject) {
        datasetHash[id] = jsonStrings;
        writeJSONFile(id, jsonStrings)
            .then(function () {
                return fulfill();
            })
            .catch(function (err: any) {
                return reject(err);
            });
    })
}

function writeJSONFile(id: string, jsonStrings: any) {
    return new Promise(function (fulfill, reject) {
        let jsons: any = {};
        jsons[id] = [];
        for (let string of jsonStrings) {
            jsons[id].push(string);
        }
        fs.writeFile("./cache.json", JSON.stringify(jsons), function (err: any) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            else {
                return fulfill();
            }
        })
    })
}

function reWriteJSONFile(jsonObject: any) {
    fs.writeFile("./cache".concat(".json"), JSON.stringify(jsonObject));
}