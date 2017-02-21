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
                        let formatedRoomData:any = formatHTMLData(storage);
                        filteredData = filterData(formatedRoomData, where);
                    }
                    else {
                        filteredData = filterData(storage, where);
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

function filterData(dataset: any, request: any, notflag ?: boolean): any[] {
    // Base cases
    if (Object.keys(request)[0] == "LT") {
        let filteredData = [];
        let key = Object.keys(request.LT)[0];
        let value = request.LT[key];
        if (typeof value != "number") {
            throw new Error("Value for less than must be a number");
        }
        let translatedKey = correspondingJSON(key);
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
        if (typeof value != "number") {
            throw new Error("Value for greater than must be a number");
        }
        let translatedKey = correspondingJSON(key);
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
        if (typeof value != "number") {
            throw new Error("Value for equals must be a number");
        }
        let translatedKey = correspondingJSON(key);
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
        let translatedKey = correspondingJSON(key);
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
            modifiableDataset = filterData(modifiableDataset, operand);
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
            filteredData = filteredData.concat(filterData(dataset, operand));
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
    if (string == 'courses_year') {
        return true;
    }
    return false;
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
    if (string == 'courses_year') {
        return "Year";
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
    fs.writeFile("./cache".concat(".json"), JSON.stringify(jsonObject));
}

function formatHTMLData(data: any) {
    var builtHTMLjson:any = [];
    for (let rooms = 0; rooms < data.length - 1; rooms ++) {               //Ignoring Index.html
        //tbody html tagname childrennode number represents the amount of objects needed to be created by the file
        var room_object:any = helperRecursion (data[rooms])
        if (room_object["rooms_number"] != null) {
            var roomNumberObject:any ={};
            for (var i = 0; i<room_object["rooms_number"].length; i++) {
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
        }
        else {
            builtHTMLjson.push (room_object);
        }
        return builtHTMLjson;
    }

}

function helperRecursion (roomData:any) {
    var queue: any  =[];
    var fileObject:any ={};
    var rooms_name:string[] = [];
    var rooms_number:string[] =[];
    var rooms_seats:number[] =[];
    var rooms_type: string[] = [];
    var rooms_furniture: string[] =[];
    var rooms_href: string[] = [];
    queue.push(roomData);
    while (queue.length != 0){
        var i = queue.shift();
        //Perform analysis here
        if(i.attrs != null) {
            if (i.attrs.length != 0) {
                for (var attr of i.attrs) {         //Not sure if should hard cod or not
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
            for (var child of i.childNodes) {
                queue.push(child);
            }
        }
        fileObject["rooms_name"] = rooms_name ;
        fileObject["rooms_number"] = rooms_number;
        fileObject["rooms_seats"] = rooms_seats;
        fileObject["rooms_type"] = rooms_type;
        fileObject["rooms_furniture"] = rooms_furniture;
        fileObject["rooms_href"] = rooms_href;
    }
    for (let i = 0; i < rooms_number.length; i++) {
        rooms_name.push(fileObject["rooms_shortname"] +"_"+ fileObject["rooms_number"][i]);
    }
    // Get lat lon
    let formattedAddr = fileObject["rooms_address"].split(" ").join("%");
    latLonRequester(formattedAddr);

    return fileObject;
}

function latLonRequester(addr: string): Promise<string> {
    return new Promise(function (fulfill, reject) {
        var baseURL: string =  "http://skaha.cs.ubc.ca:11316/api/v1/team5/";
        http.get(baseURL + addr).then(function (res: string) {
                console.log(res);
                fulfill();
        })
            .catch(function (err: any) {
                reject("Broken");
            });
    });
}
