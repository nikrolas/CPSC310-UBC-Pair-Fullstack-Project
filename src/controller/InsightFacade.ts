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
var http = require("http");

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: any): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            if(!(id == "rooms" || id == "courses")) {
                return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
            }
            if (id == "rooms") {
                let zip = new JSZip();
                zip.loadAsync(content, {base64: true})
                    .then(function (zipContent: any) {
                        zipContent.file("index.htm").async("string")
                            .then(function(data:any) {
                                return hrefLinks(p5.parse(data));
                            })
                            .then(function (arrayofrefs: any[]) {
                                let arrayofrefpromises = [];
                                for (let hrefs of arrayofrefs) {
                                    let file = zipContent.file(hrefs.substring(2));
                                    if (file){
                                        arrayofrefpromises.push(file.async("string"));
                                    }
                                }
                                return arrayofrefpromises;
                            })
                            .then(function (arrayofpromises: any) {
                                Promise.all(arrayofpromises)
                                    .then(function (arrayOfJSONString) {
                                        let arrayOfParsedStrings = [];
                                        for (let json of arrayOfJSONString) {
                                            arrayOfParsedStrings.push(p5.parse(json));
                                        }
                                        // Tests for valid zip, not containing any information
                                        if (arrayOfJSONString[0] == "") {
                                            return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                                        }
                                        let arrayOfPromises = [];
                                        for (let parsedString of arrayOfParsedStrings) {
                                            arrayOfPromises.push(formatHTMLData(parsedString));
                                        }
                                        return arrayOfPromises;
                                    })
                                    .then(function (arrayOfPromises:any) {
                                        return Promise.all(arrayOfPromises)
                                            .then(function (formattedData) {
                                                let finalarray:any =[];
                                                for (let buildings of formattedData) {
                                                    if (typeof buildings != "undefined") {
                                                        finalarray.push(buildings);
                                                    }
                                                }
                                                return fulfill(addDatasetRooms(finalarray));
                                            })
                                            .catch(function (err) {
                                                return reject(err);
                                            })
                                    })
                                    .catch(function () {
                                        return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));

                                    })
                            })
                            .catch(function () {
                                return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                            })
                    })
                    .catch(function () {
                        return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                    });
            }
            else {
                let zip = new JSZip();
                zip.loadAsync(content, {base64: true})
                    .then(function (zipContent: any) {
                        Promise.all(filePromiseCollector(zipContent))
                            .then(function (arrayOfJSONString) {
                                // Tests for valid zip, not containing any information
                                if (arrayOfJSONString[0] == "") {
                                    return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                                }
                                if (!fs.existsSync("./cache.json")) {
                                    addToHashset(id, arrayOfJSONString)
                                        .then(function () {
                                            return fulfill(insightResponseConstructor(204, {}));
                                        })
                                        .catch(function () {
                                            return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                                        })
                                }
                                else {
                                    datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
                                    if (datasetHash[id] == null) {
                                        fs.unlinkSync('./cache.json');
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
                            .catch(function () {
                                return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));

                            })
                    })
                    .catch(function () {
                        return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                    });
            }
        });

    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            if (fs.existsSync("./cache.json")) {
                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            }
            else {
                return reject(insightResponseConstructor(404, {"missing":[id]}));
            }
            if(id in datasetHash){
                delete datasetHash[id];
                if(!isEmptyObject(datasetHash)) {
                    fs.unlinkSync("./cache.json");
                    reWriteJSONFile(datasetHash);
                    return fulfill(insightResponseConstructor(204, {}));
                }
                else {
                    fs.unlinkSync("./cache.json");
                    return fulfill(insightResponseConstructor(204, {}));
                }
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
            let transformations = query.TRANSFORMATIONS;
            let columns = options.COLUMNS;
            let form = options.FORM;
            let order = options.ORDER;

            // Checks if WHERE and OPTIONS are defined
            if(typeof where == "undefined" || typeof options == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "invalid request"}));
            }
            // Checks if ORDER is contained in columns; query invalid if it is not
            if(typeof order != "undefined" && !columns.includes(order)) {                                           //TODO: new exception to consider the fact that order can be object
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
            let setID = columns[0].split('_')[0];

            if (fs.existsSync("./cache.json")) {
                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            }
            else {
                return reject(insightResponseConstructor(424, {"missing":[setID]}));
            }

            // Checks if cached dataset has the given ID, query invalid if it does not exist
            if (typeof datasetHash[setID] == "undefined") {
                return reject(insightResponseConstructor(424, {"missing": [setID]}));
            }


            let dataToFilter = datasetHash[setID];
            let finalFilteredData = {"render": form, "result": <any>[]};
            let storage:any = [];
            let finalArray:any = [];

            for (let eachItem of dataToFilter) {
                    let json = JSON.parse(eachItem);
                    if (json["result"].length != 0) {
                        for (let courseSection of json["result"]) {
                            storage.push(courseSection);
                        }
                    }
            }
            try {
                let filteredData = filterData(storage, where);

                //TODO: Adding in transformations if they exist
                if (typeof transformations != "undefined") {
                    //TODO: check if all columns is in group or apply
                    let combinedGroups: any = groupFilterData(filteredData,transformations,columns);
                    let combinedApply: any = applyFilterData(combinedGroups, transformations.APPLY,columns);

                }

                // Show only desired columns
                for (let eachClass of filteredData) {
                    let row: any = {};
                    for (let column of columns) {
                        if (validNumericKeys(column)) {
                            row[column] = parseFloat(eachClass[correspondingJSONKey(column)]);
                        }
                        else {
                            row[column] = eachClass[correspondingJSONKey(column)];
                        }
                    }
                    finalArray.push(row);
                }
                // Sort by column
                let sortOrder = order;

                if(typeof sortOrder != "undefined") {                                           //TODO Create a new sort function ontop of this
                    if(validSortableKeys(sortOrder)) {
                        finalArray = sortByNum(finalArray, sortOrder);
                    }
                    else {
                        finalArray = sortByChar(finalArray, correspondingJSONKey(sortOrder));
                    }
                }
                finalFilteredData["result"] = finalArray;
                //console.log (finalFilteredData); //Is it different for courses vs rooms?!?!?
                return fulfill(insightResponseConstructor(200, finalFilteredData));
            } catch (e) {
                return reject(insightResponseConstructor(400, {"error": e}))
            }
        });
    }
}

function applyFilterData(dataset:any, request:any, columns:any) :any {
    for (let filterTerms of request) {
        //TODO: Columns equal to name Object.keys(filterTerms)[0] == Columns

        if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "MAX") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].MAX;
            if (validNumericKeys(numerickey)){ //Check if is valid number
                for (let groups in dataset) {
                    let maxValue = 0;

                    for(let rooms of dataset[groups]) {
                        let x = +rooms[numerickey]              //Convert string to number
                        if (x > maxValue) {
                            maxValue = x;
                        }
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = maxValue;
                }
            }
            else {
                //TODO return error
            }
        }
        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "MIN") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].MIN;

            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let minvalue = 10000;

                    for(let rooms of dataset[groups]) {
                        let x = +rooms[numerickey]              //Convert string to number
                        if (x < minvalue) {
                            minvalue = x;
                        }
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = minvalue;
                }
            }
            else {
                //TODO return error
            }
        }
        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "AVG") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].AVG;
            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let avg = 0;
                    for(let rooms of dataset[groups]) {
                        let x = +rooms[numerickey]              //Convert string to number
                        avg += x;
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = avg/dataset[groups].length;
                }
            }
            else {
                //TODO return error
            }
        }
        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "COUNT") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].COUNT;
            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = dataset[groups].length;
                }
            }
            else {
                //TODO return error
            }
        }

        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "SUM") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].SUM;
            if (validNumericKeys(numerickey)){                for (let groups in dataset) {
                let sum = 0;
                for(let rooms of dataset[groups]) {
                    let x = +rooms[numerickey]              //Convert string to number
                    sum += x;
                }
                let variablename:string = Object.keys(filterTerms)[0];
                (dataset[groups][0])[variablename] = sum;
            }
            }
            else {
                //TODO return error
            }
        }
        else {
            //TODO Throw an error
        }
    }
    return dataset;

}

function groupFilterData(dataset: any, request: any, columns:any): any {
    let finalGroups:any = {};
    let finalGroupsStringID: string = "";
    let groupings: any = request.GROUP;
        for (let objects of dataset) {                      //Going through all the objects in the filtered dataset
            for (let groupingsId of groupings) {            //Checking every critera of the group to make sure they are combined properly
                if (groupingsId == "rooms_lat" || groupingsId == "rooms_lon") {         //TODO: temp placeholder, needs to be more robust for all numbers
                    finalGroupsStringID = finalGroupsStringID.concat(objects[groupingsId].toString);
                }
                else {
                    finalGroupsStringID =finalGroupsStringID.concat(objects[groupingsId]);
                }
            }
            if (typeof finalGroups[finalGroupsStringID] == "undefined") {
                finalGroups[finalGroupsStringID] = [];
                finalGroups[finalGroupsStringID].push(objects);
            }
            else {
                finalGroups[finalGroupsStringID].push(objects);
            }
            finalGroupsStringID = "";
        }
    return finalGroups;
}

function addDatasetRooms(formattedData: any) {
    return new Promise(function (fulfill, reject) {
        let result =[];
        for (let rooms = 0; rooms < formattedData.length ; rooms ++) {
            result.push(JSON.stringify({result:formattedData[rooms],rank:0}));
        }

        if (!fs.existsSync("./cache.json")) {
            addToHashset("rooms", result)
                .then(function () {
                    return fulfill(insightResponseConstructor(204, {}));
                })
                .catch(function () {
                    return reject(insightResponseConstructor(400, {"error": "Invalid Dataset"}));
                })
        }
        else {
            datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            if (datasetHash["rooms"] == null) {
                fs.unlinkSync('./cache.json');
                datasetHash["rooms"] = result;
                reWriteJSONFile(datasetHash);
                return fulfill(insightResponseConstructor(204, {}));
            }
            else if ("rooms" in datasetHash) {
                fs.unlinkSync('./cache.json');
                datasetHash["rooms"] = result;
                reWriteJSONFile(datasetHash);
                return fulfill(insightResponseConstructor(201, {}));
            }
        }
    })
}

function filterData(dataset: any, request: any, notflag ?: boolean): any[] {
    // Base cases
    if (isEmptyObject(request)) {
        return dataset;
    }
    else if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        let value = request.LT[key];
        let translatedKey:string = correspondingJSONKey(key);

        if (typeof value != "number") {
            throw new Error("Value for less than must be a number");
        }
        if (translatedKey == "Invalid") {
            throw new Error("Invalid Key");
        }

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
                if (courseSection[translatedKey] < value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else{
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
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
        let translatedKey:string = correspondingJSONKey(key);

        if (typeof value != "number") {
            throw new Error("Value for greater than must be a number");
        }

        if (translatedKey == "Invalid") {
            throw new Error("Invalid Key");
        }
        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
                if (courseSection[translatedKey] > value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
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
        let translatedKey:string = correspondingJSONKey(key);

        if (typeof value != "number") {
            throw new Error("Value for equals must be a number");
        }

        if (translatedKey == "Invalid") {
            throw new Error("Invalid Key");
        }

        if(notflag == false || notflag == null) {
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
                if (courseSection[translatedKey] == value) {
                    filteredData.push(courseSection);
                }
            }
            return filteredData;
        }
        else {
            for (let courseSection of dataset) {
                if (translatedKey == "Year" && courseSection["Section"] == "overall") {
                    courseSection["Year"] = 1900;
                }
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
        let translatedKey:string = correspondingJSONKey(key);

        if (translatedKey == "Invalid") {
            throw new Error("Invalid Key");
        }
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
            if (notflag == null || notflag == false) {
                modifiableDataset = filterData(modifiableDataset, operand, false);

            }
            else {
                modifiableDataset = filterData(modifiableDataset, operand, true);
            }
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
            if (notflag == null || notflag == false) {
                filteredData = filteredData.concat(filterData(dataset, operand, false));
            }
            else {
                filteredData = filteredData.concat(filterData(dataset, operand, true));
            }
        }
        return filteredData;
    }
    else if (Object.keys(request)[0] == "NOT") {
        let value = request.NOT;
        let filteredData :any = [];
        if (notflag == null || notflag == false) {
            filteredData = filteredData.concat(filterData(dataset, value, true));
        }
        else {
            filteredData = filteredData.concat(filterData(dataset, value, false));
        }

        return filteredData;
    }
    else{
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
        if (order == "courses_uuid" || "courses_id") {
            let dataA = parseFloat(a[order]), dataB = parseFloat(b[order]);
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

function numberConverter(string:string) {
    let validNumKeySet = new Set(['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit',
        'courses_year', 'rooms_seats', 'rooms_lat', 'rooms_lon']);
    return validNumKeySet.has(string);
}

function validNumericKeys(string : string) {
    let validNumKeySet = new Set(['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit',
        'courses_year', 'rooms_seats', 'rooms_lat', 'rooms_lon']);
    return validNumKeySet.has(string);
}


function validSortableKeys(string : string) {
    let validNumKeySet = new Set(['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_uuid',
        'courses_year', 'rooms_seats', 'rooms_lat', 'rooms_lon', 'courses_id']);
    return validNumKeySet.has(string);
}

function correspondingJSONKey(given_string: string) {
    let validRoomKeySet = new Set(["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
        "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"]);
    if (given_string == 'courses_dept') {
        return "Subject";
    }
    if (given_string == 'courses_id') {
        return "Course";
    }
    if (given_string == 'courses_avg') { //number
        return "Avg";
    }
    if (given_string == 'courses_instructor') {
        return "Professor";
    }
    if (given_string == 'courses_title') {
        return "Title";
    }
    if (given_string == 'courses_pass') { //number
        return "Pass";
    }
    if (given_string == 'courses_fail') { //number
        return "Fail";
    }
    if (given_string == 'courses_audit') { //number
        return "Audit";
    }
    if (given_string == 'courses_uuid') { //STRING, special case
        return "id";
    }
    if (given_string == 'courses_year') {
        return "Year";
    }
    if (validRoomKeySet.has(given_string)) {
        return given_string;
    }
    return "Invalid";
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
    fs.writeFileSync(("./cache.json"), JSON.stringify(jsonObject));
}

function formatHTMLData(data: any) {
    return new Promise(function (fulfill, reject) {
        let builtHTMLjson:any = [];
        helperRecursion (data)
            .then(function (room_object: any) {
                    if (room_object["rooms_number"] != null) {
                        let roomNumberObject: any = {};
                        for (let i = 0; i < room_object["rooms_number"].length; i++) {
                            roomNumberObject["rooms_fullname"] = room_object["rooms_fullname"];
                            roomNumberObject["rooms_shortname"] = room_object["rooms_shortname"];
                            roomNumberObject["rooms_address"] = room_object["rooms_address"];
                            roomNumberObject["rooms_lat"] = room_object["rooms_lat"];
                            roomNumberObject["rooms_lon"] = room_object["rooms_lon"];
                            roomNumberObject["rooms_name"] = room_object["rooms_name"][i];
                            roomNumberObject["rooms_number"] = room_object["rooms_number"][i];
                            roomNumberObject["rooms_seats"] = room_object["rooms_seats"][i];
                            roomNumberObject["rooms_type"] = room_object["rooms_type"][i];
                            roomNumberObject["rooms_furniture"] = room_object["rooms_furniture"][i];
                            roomNumberObject["rooms_href"] = room_object["rooms_href"][i];
                            builtHTMLjson.push(roomNumberObject);

                            roomNumberObject = {};
                        }
                        fulfill(builtHTMLjson);
                }
                else {
                        fulfill();
                    }
        })
            .catch(function (err) {
                reject(err);
            })
    })
}

function helperRecursion (roomData:any) {
    return new Promise(function (fulfill, reject) {
        let queue: any  =[];
        let fileObject:any ={};
        let rooms_name:string[] = [];
        let rooms_number:string[] =[];
        let rooms_seats:number[] =[];
        let rooms_type: string[] = [];
        let rooms_furniture: string[] =[];
        let rooms_href: string[] = [];
        queue.push(roomData);
        while (queue.length != 0){
            let i = queue.shift();
            //Perform analysis here
            if(i.attrs != null) {
                if (i.attrs.length != 0) {
                    for (let attr of i.attrs) {         //Not sure if should hard cod or not
                        if (attr.value == "building-info") {
                            fileObject["rooms_fullname"] = i.childNodes[1].childNodes[0].childNodes[0].value; //room_name
                            fileObject["rooms_address"] = i.childNodes[3].childNodes[0].childNodes[0].value;//room_address
                        }
                        if (attr.value == "canonical") {
                            fileObject["rooms_shortname"] = i.attrs[1].value;                          //room_shortname
                        }

                        if(i.tagName == "td" && attr.value == "views-field views-field-field-room-number") {
                            rooms_number.push(i.childNodes[1].childNodes[0].value);
                            rooms_href.push(i.childNodes[1].attrs[0].value);
                        }
                        if(i.tagName == "td" && attr.value == "views-field views-field-field-room-capacity") {
                            rooms_seats.push(i.childNodes[0].value.trim());
                        }
                        if(i.tagName == "td" && attr.value == "views-field views-field-field-room-type") {
                            rooms_type.push(i.childNodes[0].value.trim());
                        }
                        if(i.tagName == "td" && attr.value == "views-field views-field-field-room-furniture") {
                            rooms_furniture.push(i.childNodes[0].value.trim());
                        }
                    }
                    //End of analysis
                }
            }

            if (i.childNodes == null) {
                continue;
            }
            else {
                for (let child of i.childNodes) {
                    queue.push(child);
                }
            }

        }
        if(rooms_number.length != 0) {
            for (let i = 0; i < rooms_number.length; i++) {
                rooms_name.push(fileObject["rooms_shortname"] +"_"+ rooms_number[i]);
            }
            fileObject["rooms_name"] = rooms_name;
            fileObject["rooms_number"] = rooms_number;
            fileObject["rooms_seats"] = rooms_seats;
            fileObject["rooms_type"] = rooms_type;
            fileObject["rooms_furniture"] = rooms_furniture;
            fileObject["rooms_href"] = rooms_href;
        }
        // Get lat lon
        // if (typeof fileObject["rooms_address"] == "undefined") {
        //     console.log ("this is where it breaks")
        //     console.log(fileObject);
        //
        // }
        let formattedAddr = fileObject["rooms_address"].split(" ").join("%20").trim();
        let options = {
            host: "skaha.cs.ubc.ca",
            port: 11316,
            path: "/api/v1/team5/" + formattedAddr
        };
        locationRequest(options)
            .then(function (loc: any) {
                return JSON.parse(loc);
            })
            .then(function (jsonLoc) {
                fileObject["rooms_lat"] = jsonLoc["lat"];
                fileObject["rooms_lon"] = jsonLoc["lon"];
            })
            .then(function () {
                fulfill(fileObject);
            })
            .catch(function (err) {
                console.log(err);
                reject(err);
            });
    })
}

function locationRequest(options: any) {
    return new Promise(function (fulfill, reject) {
        let rawData = '';
        http.get(options, (res: any) => {
            let error;
            if (error) {
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            res.on('data', (chunk: any) => rawData += chunk);
            res.on('end', () => {
                fulfill(rawData);
             });
        }).on('error', (e: any) => {
            reject(e);
        });
    });
}

//Allowable rooms from index.html

function hrefLinks (index : any) {
    let queue: any  =[];
    let fileObject:any =[];

    queue.push(index);

    while (queue.length != 0){
        let i = queue.shift();
        //Perform analysis here
        if(i.attrs != null) {
            if (i.attrs.length != 0) {
                for (let attr of i.attrs) {         //Not sure if should hard cod or not
                    if(i.tagName == "td" && attr.value == "views-field views-field-title") {
                        fileObject.push(i.childNodes[1].attrs[0].value);
                    }
                }
                //End of analysis
            }
        }

        if (i.childNodes == null) {
            continue;
        }
        else {
            for (let child of i.childNodes) {
                queue.push(child);
            }
        }

    }
    return fileObject;
}

function isEmptyObject(obj:any) {
    return !Object.keys(obj).length;
};