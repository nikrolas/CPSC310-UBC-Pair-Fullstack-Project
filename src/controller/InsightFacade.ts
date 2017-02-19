/**
 * This is the main programmatic entry point for the project.
 */
import {
    IInsightFacade, InsightResponse, QueryRequest
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
                                        return fulfill(insightResponseConstructor(204, {}));
                                    })
                                    .catch(function (err) {
                                        return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                                    })
                            }
                            else {
                                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
                                if (datasetHash[id] == null) {
                                    datasetHash[id] = arrayOfJSONString;
                                    reWriteJSONFile(datasetHash);
                                    return fulfill(insightResponseConstructor(204, {}));
                                }
                                else if (id in datasetHash) {
                                    fs.unlinkSync('./cache.json');
                                    datasetHash[id] = arrayOfJSONString;
                                    reWriteJSONFile(datasetHash);
                                    return fulfill(insightResponseConstructor(201, {}));
                                }
                            }
                        })
                        .catch(function(err: any) {
                            return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));

                        })
                })
                .catch(function(err: any) {
                    return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            datasetHash = JSON.parse(fs.readFileSync('./cache.json'));
            if(id in datasetHash){
                delete datasetHash[id];
                reWriteJSONFile(datasetHash);
                return fulfill(insightResponseConstructor(204, {}));
            }
            else {
                return reject(insightResponseConstructor(404, {}));                 //POTENTIAL ERROR?
            }
        });
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function(fulfill,reject) {
            // Checks if WHERE and OPTIONS are defined
            if(typeof query.WHERE == "undefined" || typeof query.OPTIONS == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "invalid request"}));
            }
            // Checks if ORDER is contained in columns; query invalid if it is not
            if(typeof query.OPTIONS.ORDER != "undefined" && !query.OPTIONS.COLUMNS.includes(query.OPTIONS.ORDER)) {
                return reject(insightResponseConstructor(400, {"error": "Order is not contained in columns"}));
            }
            // Checks for empty COLUMNS array or missing COLUMNS array
            if(query.OPTIONS.COLUMNS.length == 0 || typeof query.OPTIONS.COLUMNS == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "Columns missing or empty"}));
            }
            // Checks for invalid OPTIONS
            if(query.OPTIONS.FORM == "undefined" || query.OPTIONS.FORM != "TABLE") {
                return reject(insightResponseConstructor(400, {"error": "Options is invalid"}));
            }

            datasetHash = JSON.parse(fs.readFileSync("./cache.json"));

            let finalFilteredData = {render: query.OPTIONS.FORM, result: <any>[]};
            let finalArray: any = [];
            try {
                let filteredData = null;
                let missingIDArray: any = [];
                // Checks if WHERE is an empty object
                if(Object.keys(query.WHERE).length == 0) {
                    for (let column of query.OPTIONS.COLUMNS) {
                        if (!validIDCheck(column) && !column.includes("_")) {
                            return reject(insightResponseConstructor(400, {"error": "Invalid key"}))
                        }
                        else if (!validIDCheck(column)) {
                            missingIDArray.push(column.split("_")[0]);
                        }
                    }
                    if (missingIDArray.length > 0) {
                        return reject(insightResponseConstructor(424, {"missing": missingIDArray}));
                    }
                    filteredData = datasetHash[query.OPTIONS.COLUMNS[0].split("_")[0]];
                }
                else {
                    filteredData = filterData(query.WHERE, missingIDArray, false);
                }

                if (typeof filteredData == "undefined") {
                    for (let column of query.OPTIONS.COLUMNS) {
                        if (!validIDCheck(column) && !column.includes("_")) {
                            return reject(insightResponseConstructor(400, {"error": "Invalid key"}))
                        }
                        else if (!validIDCheck(column)) {
                            missingIDArray.push(column.split("_")[0]);
                        }
                    }
                    if (missingIDArray.length > 0) {
                        return reject(insightResponseConstructor(424, {"missing": missingIDArray}));
                    }
                }

                // Show only desired columns
                for (let eachClass of filteredData) {
                    let row: any = {};
                    for (let column of query.OPTIONS.COLUMNS) {
                        if (validIDCheck(column)) {
                            row[column] = eachClass[correspondingJSON(column)];
                        }
                        else {
                            missingIDArray.push(column.split("_")[0]);
                        }
                    }
                    finalArray.push(row);
                }
                if (missingIDArray.length > 0) {
                    return reject(insightResponseConstructor(424, {"missing": missingIDArray}));
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
                //console.log (finalArray);
                finalFilteredData["result"] = finalArray;

                return fulfill(insightResponseConstructor(200, finalFilteredData));
            } catch (e) {
                return reject(insightResponseConstructor(400, {"error": e}))
            }
        });
    }
}

function filterData(request: any, missingIDArray: any[], notFlag ?: boolean, dataReceived ?: any[]): any[] {
    if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        if (validIDCheck(key)) {
            let dataset:any;
            if ( dataReceived != null) {
                if (dataReceived.length > 0) {
                    dataset = dataReceived;
                }
                else {
                    dataset = dataAccumulator(key);
                }
            }
            else {
                dataset = dataAccumulator(key);
            }
            let value = request.LT[key];
            if (typeof value != "number") {
                throw new Error("Value for less than must be a number");
            }
            let translatedKey = correspondingJSON(key);
            if(notFlag == false || notFlag == null) {
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] < value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
            else{
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] > value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
        }
        else {
            if(key.includes("_")) {
                missingIDArray.push(key.split("_")[0]);
            }
            else {
                throw new Error("Invalid key");
            }
        }
    }

    else if (Object.keys(request)[0] == "GT") {
        let filteredData = [];
        let key = Object.keys(request.GT)[0];
        if (validIDCheck(key)) {
            let dataset:any;
            if ( dataReceived != null) {
                if (dataReceived.length > 0) {
                    dataset = dataReceived;
                }
                else {
                    dataset = dataAccumulator(key);
                }
            }
            else {
                dataset = dataAccumulator(key);
            }
            let value = request.GT[key];
            if (typeof value != "number") {
                throw new Error("Value for less than must be a number");
            }
            let translatedKey = correspondingJSON(key);
            if(notFlag == false || notFlag == null) {
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] > value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
            else{
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] < value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
        }
        else {
            if(key.includes("_")) {
                missingIDArray.push(key.split("_")[0]);
            }
            else {
                throw new Error("Invalid key");
            }
        }
    }

    else if (Object.keys(request)[0] == "EQ") {
        let filteredData = [];
        let key = Object.keys(request.EQ)[0];
        if (validIDCheck(key)) {
            let dataset:any;
            if ( dataReceived != null) {
                if (dataReceived.length > 0) {
                    dataset = dataReceived;
                }
                else {
                    dataset = dataAccumulator(key);
                }
            }
            else {
                dataset = dataAccumulator(key);
            }
            let value = request.EQ[key];
            if (typeof value != "number") {
                throw new Error("Value for less than must be a number");
            }
            let translatedKey = correspondingJSON(key);
            if(notFlag == false || notFlag == null) {
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] == value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
            else{
                for (let courseSection of dataset) {
                    if (courseSection[translatedKey] != value) {
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
        }
        else {
            if(key.includes("_")) {
                missingIDArray.push(key.split("_")[0]);
            }
            else {
                throw new Error("Invalid key");
            }
        }
    }

    else if (Object.keys(request)[0] == "IS") {
        let filteredData = [];
        let key = Object.keys(request.IS)[0];
        if (validIDCheck(key)) {
            let dataset:any;
            if ( dataReceived != null) {
                if (dataReceived.length > 0) {
                    dataset = dataReceived;
                }
                else {
                    dataset = dataAccumulator(key);
                }
            }
            else {
                dataset = dataAccumulator(key);
            }
            let value = request.IS[key];
            let regexFlag = value.includes("*");
            if (typeof value != "string") {
                throw new Error("Value for less than must be a number");
            }
            let translatedKey = correspondingJSON(key);
            if(notFlag == false || notFlag == null) {
                for (let courseSection of dataset) {
                    if(regexFlag && regexChecker(courseSection[translatedKey], value)) {
                        filteredData.push(courseSection);
                    }
                    else if(!regexFlag && value == courseSection[translatedKey]){
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
            else {
                for (let courseSection of dataset) {
                    if(regexFlag && !regexChecker(courseSection[translatedKey], value)) {
                        filteredData.push(courseSection);
                    }
                    else if(!regexFlag && value != courseSection[translatedKey]){
                        filteredData.push(courseSection);
                    }
                }
                return filteredData;
            }
        }
        else {
            if(key.includes("_")) {
                missingIDArray.push(key.split("_")[0]);
            }
            else {
                throw new Error("Invalid key");
            }
        }
    }

    else if (Object.keys(request)[0] == "AND") {
        if(request.AND.length == 0) {
            throw new Error("AND cannot be empty");
        }
        let filteredData: any = [];
        let modifiableDataset: any = [];
        for (let operand of request.AND) {
            modifiableDataset = filterData(operand, missingIDArray, false, modifiableDataset);
        }
        filteredData = filteredData.concat(modifiableDataset);
        return filteredData;
    }

    else if (Object.keys(request)[0] == "OR") {
        if(request.OR.length == 0) {
            throw new Error("OR cannot be empty");
        }
        let filteredData :any = [];
        for (let operand of request.OR) {
            filteredData = filteredData.concat(filterData(operand, missingIDArray));
        }
        return filteredData;
    }

    else if (Object.keys(request)[0] == "NOT") {
        let value = request.NOT;
        let filteredData :any = [];
        if (notFlag == null || notFlag == false) {
            filteredData = filteredData.concat(filterData(value, missingIDArray, true));
        }
        else {
            filteredData = filteredData.concat(filterData(value, missingIDArray, false));
        }
        return filteredData;
    }

    else {
        throw new Error("Invalid key");
    }
}

function dataAccumulator(key: string) {
    let dataset = datasetHash[key.split("_")[0]];
    let dataToBeFiltered: any = [];
    for (let eachCourse of dataset) {
        let json = JSON.parse(eachCourse);
        if (json["result"].length != 0) {
            for (let courseSection of json["result"]) {
                dataToBeFiltered.push(courseSection);
            }
        }
    }
    return dataToBeFiltered;
}

function validIDCheck(key: string) {
    if (key.includes("_")) {
        let id = key.split("_")[0];
        if (id in datasetHash) {
            return true;
        }
    }
    return false;
}

// regex check from http://stackoverflow.com/a/32402438
function regexChecker(valueToBeChecked: any, rule: string) {
    if (typeof valueToBeChecked == "number") {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(valueToBeChecked.toString());
    }
    else {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(valueToBeChecked);
    }
}

function sortByNum(data: any, order: string) {
    data.sort(function (a: any, b: any) {
        if (order == "courses_uuid") {
            let dataA = parseInt(a[order]), dataB = parseInt(b[order]);
            return dataA-dataB;
        }
        else {
            let dataA = a[order], dataB = b[order];
            return dataA - dataB;
        }
    });
    return data;
}

function sortByChar(data: any, order: string) {
    data.sort(function (a: any, b: any) {
        let dataA = a[order], dataB = b[order];
        if (dataA < dataB) return -1;
        if (dataA > dataB) return 1;
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
    // Special case of courses_uuid, we treat it as number
    if (string == 'courses_uuid') {
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
    if (string == 'courses_uuid') { //STRING, special case
        return "id";
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