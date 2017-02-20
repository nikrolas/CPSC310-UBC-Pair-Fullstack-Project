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
var p5 = require("parse5");

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
                            // Tests for valid zip, not containing any information
                            if (arrayOfJSONString[0] == "") {
                                return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                            }
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
                return reject(insightResponseConstructor(404, {"missing": id}));                 //POTENTIAL ERROR?
            }
        });
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function(fulfill,reject) {
            let where = query.WHERE;
            let options = query.OPTIONS;
            let columns = options.COLUMNS;
            let form = options.FORM;
            let order = options.ORDER;

            // Checks if WHERE and OPTIONS are defined
            if(typeof where == "undefined" || typeof options == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "invalid request"}));
            }
            // Checks if ORDER is contained in columns; query invalid if it is not
            if(typeof order != "undefined" && !columns.includes(order)) {
                return reject(insightResponseConstructor(400, {"error": "Order is not contained in columns"}));
            }
            // Checks for empty COLUMNS array or missing COLUMNS array
            if(columns.length == 0 || typeof columns == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "Columns missing or empty"}));
            }
            // Checks for invalid OPTIONS
            if(form == "undefined" || form != "TABLE") {
                return reject(insightResponseConstructor(400, {"error": "Options is invalid"}));
            }

            datasetHash = JSON.parse(fs.readFileSync("./cache.json"));

            let setID = columns[0].split('_')[0];

            // Checks if cached dataset has the given ID, query invalid if it does not exist
            if (typeof datasetHash[setID] == "undefined") {
                return reject(insightResponseConstructor(424, {"missing": [setID]}));
            }

            let dataToFilter = datasetHash[setID];
            let finalFilteredData = {render: form, result: <any>[]};
            let storage:any = [];
            let finalArray:any = [];
            //
            for (let eachItem of dataToFilter) {
                if (setID == "courses") {
                    let json = JSON.parse(eachItem);
                    if (json["result"].length != 0) {
                        for (let courseSection of json["result"]) {
                            storage.push(courseSection);
                        }
                    }
                }
                else if (setID == "rooms") {
                    storage.push(p5.parse(eachItem));
                }
            }
            try {
                let filteredData = null;
                // Checks if WHERE is an empty object
                if(where == {}) {
                    filteredData = storage;
                }
                else {
                    if (setID == "rooms") {
                        filteredData = filterDataRooms(storage, where);
                    }
                    else {
                        filteredData = filterDataCourses(storage, where);
                    }
                }

                // Show only desired columns
                for (let eachClass of filteredData) {
                    let row: any = {};
                    for (let column of columns) {
                        row[column] = eachClass[correspondingJSON(column)];
                    }
                    finalArray.push(row);
                }

                // Sort by column
                let sortOrder = order;

                if(typeof sortOrder != "undefined") {
                    if(correspondingNumber(sortOrder)) {
                        finalArray = sortByNum(finalArray, sortOrder);
                    }
                    else {
                        finalArray = sortByChar(finalArray, correspondingJSON(sortOrder));
                    }
                }
                console.log (finalArray);
                finalFilteredData["result"] = finalArray;

                return fulfill(insightResponseConstructor(200, finalFilteredData));
            } catch (e) {
                return reject(insightResponseConstructor(400, {"error": e}))
            }
        });
    }
}

function filterDataRooms(dataset: any, request: any, notflag ?: boolean): any[] {
    for (let building of dataset) {

    }

    // Base cases
    if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        let value = request.LT[key];
        if (typeof value != "number") {
            throw new Error("Value for less than must be a number");
        }
        let translatedKey = correspondingJSON(key);
        if(notflag == false || notflag == null) {
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
    else if (Object.keys(request)[0] == "GT") {
        let filteredData = [];
        let key = Object.keys(request.GT)[0];
        let value = request.GT[key];
        if (typeof value != "number") {
            throw new Error("Value for greater than must be a number");
        }
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] > value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] < value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;

        }
    }
    else if (Object.keys(request)[0] == "EQ") {
        let filteredData = [];
        let key = Object.keys(request.EQ)[0];
        let value = request.EQ[key];
        if (typeof value != "number") {
            throw new Error("Value for equals must be a number");
        }
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] == value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] != value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
    }
    else if (Object.keys(request)[0] == "IS") {
        let filteredData = [];
        let key = Object.keys(request.IS)[0];
        let value = request.IS[key];
        let regexFlag = value.includes("*");
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
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

    else if (Object.keys(request)[0] == "AND") {
        if(request.AND.length == 0) {
            throw new Error("AND cannot be empty");
        }
        let filteredData: any = [];
        let modifiableDataset: any = dataset;
        for (let operand of request.AND) {
            modifiableDataset = filterDataCourses(modifiableDataset, operand);
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
            filteredData = filteredData.concat(filterDataCourses(dataset, operand));
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "NOT") {
        let value = request.NOT;
        let filteredData :any = [];
        if (notflag == null || notflag == false) {
            filteredData = filteredData.concat(filterDataCourses(dataset, value, true));
        }
        else {
            filteredData = filteredData.concat(filterDataCourses(dataset, value, false));
        }

        return filteredData;
    }
    else {
        throw new Error("Invalid key");
    }
}

function filterDataCourses(dataset: any, request: any, notflag ?: boolean): any[] {
    // Base cases
    if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        let value = request.LT[key];
        if (typeof value != "number") {
            throw new Error("Value for less than must be a number");
        }
        let translatedKey = correspondingJSON(key);
        if(notflag == false || notflag == null) {
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
    else if (Object.keys(request)[0] == "GT") {
        let filteredData = [];
        let key = Object.keys(request.GT)[0];
        let value = request.GT[key];
        if (typeof value != "number") {
            throw new Error("Value for greater than must be a number");
        }
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] > value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] < value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;

        }
    }
    else if (Object.keys(request)[0] == "EQ") {
        let filteredData = [];
        let key = Object.keys(request.EQ)[0];
        let value = request.EQ[key];
        if (typeof value != "number") {
            throw new Error("Value for equals must be a number");
        }
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] == value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (courseSection[translatedKey] != value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
    }
    else if (Object.keys(request)[0] == "IS") {
        let filteredData = [];
        let key = Object.keys(request.IS)[0];
        let value = request.IS[key];
        let regexFlag = value.includes("*");
        let translatedKey = correspondingJSON(key);

        if(notflag == false || notflag == null) {
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

    else if (Object.keys(request)[0] == "AND") {
        if(request.AND.length == 0) {
            throw new Error("AND cannot be empty");
        }
        let filteredData: any = [];
        let modifiableDataset: any = dataset;
        for (let operand of request.AND) {
            modifiableDataset = filterDataCourses(modifiableDataset, operand);
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
            filteredData = filteredData.concat(filterDataCourses(dataset, operand));
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "NOT") {
        let value = request.NOT;
        let filteredData :any = [];
        if (notflag == null || notflag == false) {
            filteredData = filteredData.concat(filterDataCourses(dataset, value, true));
        }
        else {
            filteredData = filteredData.concat(filterDataCourses(dataset, value, false));
        }

        return filteredData;
    }
    else {
        throw new Error("Invalid key");
    }
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
        var dataA = a[order], dataB = b[order];
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