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

            let filteredData = filterData(dataToFilter, query.WHERE);

            // Show only desired columns
            for (let eachClass of filteredData) {
                let row: any = {};
                for (let column of query.OPTIONS.COLUMNS) {
                    row[column] = eachClass[correspondingJSON(column)];
                }
                finalFilteredData["result"].push(row);
            }

            console.log(finalFilteredData);
            // Sort by column
            let order = query.OPTIONS.ORDER;
            if(typeof order != "undefined") {
                if(typeof order == "number") {
                    sortByNum(filteredData, correspondingJSON(order));
                }
                else {
                    sortByChar(filteredData, correspondingJSON(order));
                }
            }
            fulfill(insightResponseConstructor(200, finalFilteredData));

            // let covertedArray:string[] = [];
            // let arrayOfValueArray: any = [];
            // let queryInfo: any = {render: query.OPTIONS.FORM, result: null};        //Final Output/Object
            //
            //
            //
            // for (var i = 0; i < query.OPTIONS.COLUMNS.length; i++) {                         //Checking Columns for wanted values
            //     covertedArray[i] = correspondingJSON(query.OPTIONS.COLUMNS[i]);
            // }

            //FILTER AND OR NOT


            //arrayOfValueArray = filterInfo(covertedArray,query);

            //FILTER ORDER
            // queryInfo['result'] = arrayOfValueArray;
            // console.log(queryInfo);
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

            for (let eachCourse of dataset) {
                let json = JSON.parse(eachCourse);
                if (json["result"].length != 0) {
                    for (let courseSection of json["result"]) {
                        if (courseSection[translatedKey] < value) {
                            filteredData.push(courseSection);
                        }
                    }
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

            for (let eachCourse of dataset) {
                let json = JSON.parse(eachCourse);
                if (json["result"].length != 0) {
                    for (let courseSection of json["result"]) {
                        if (courseSection[translatedKey] > value) {
                            filteredData.push(courseSection);
                        }
                    }
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

            for (let eachCourse of dataset) {
                let json = JSON.parse(eachCourse);
                if (json["result"].length != 0) {
                    for (let courseSection of json["result"]) {
                        if (courseSection[translatedKey] == value) {
                            filteredData.push(courseSection);
                        }
                    }
                }
            }
            return filteredData;
        }
        // Other recursive cases
            // TODO Implementation
        else {
            if (Object.keys(request)[0] == "AND") {
                let filteredData: any = [];
                for (let operand of request.AND) {
                    filteredData.push(filterData(dataset, operand));
                }
            }
            else if (Object.keys(request)[0] == "OR") {
                let filteredData = [];
                for (let operand of request.OR) {
                    filteredData.push(filterData(dataset, operand));
                }
                return filteredData.reduce(function (a, b) {
                    return a.concat(b);
                }, []);
            }
            else if (Object.keys(request)[0] == "NOT") {
                // TODO
                return filterData(dataset, request.NOT);
            }
        }
}

function sortByNum(data: any, order: string) {
    // TODO
    return;
}

function sortByChar(data: any, order: string) {
    // TODO
    return;
}

// function filterInfo(convertedArray: string[], query:QueryRequest, filterinterface ?: FilterInterface) {
//     let valueArray:any = {};
//     let arrayOfValueArray: any = [];                                        //Filted info added to result key in queryinfo
//     //FILTERANDOR
//     if (query.WHERE.AND == null && query.WHERE.OR == null && query.WHERE.NOT == null) {
//         for (var key in datasetHash) {                                          //number of keys in datasethash
//             for (var j = 0; j < datasetHash[key].length; j++) {                 //number of objects in array of key
//                 var covertedToObj = JSON.parse(datasetHash[key][j])
//                 for (var k=0; k<covertedToObj['result'].length; k++) {
//                     for (var i = 0; i < convertedArray.length; i++) {
//
//                         //FILTER IS
//                         if (convertedArray[i] in covertedToObj["result"][k]) {              //Finding each object in array of dictionary
//
//                             //FILTER GT,EQ,LT
//                             valueArray[query.OPTIONS.COLUMNS[i]] = covertedToObj["result"][k][convertedArray[i]];    //adding query columns into valueArray
//                             //TODO: Attempted GT
//
//                         }
//                     }
//                     //TODO: Attempted GT
//                     if (query.WHERE.GT != null){
//                         if (numberHelper(query.WHERE.GT, valueArray)) {
//
//                         }
//                     }
//                     else {
//                         arrayOfValueArray.push(valueArray);                                 //Pushes the object into the array
//                         valueArray = {};                                                    //Resets the Object to add in the next file info
//                     }
//                 }
//             }
//         }
//         return arrayOfValueArray;
//     }
//     else if(query.WHERE.OR!= null){
//         for(var i =0; i < query.WHERE.OR.length; i++) {
//             arrayOfValueArray.push(filterInfo(convertedArray, query, query.WHERE.OR[i]));
//         }
//     }
//     else if(query.WHERE.AND!= null){
//         for(var i =0; i < query.WHERE.OR.length; i++) {
//             arrayOfValueArray.push(filterInfo(convertedArray, query, query.WHERE.OR[i]));
//         }
//     }
//     //TODO Not is a bit different
//     // else if(query.WHERE.NOT != null){
//     //     for(var i =0; i < query.WHERE.OR.length; i++) {
//     //         arrayOfValueArray.push(filterInfo(convertedArray, query, query.WHERE.OR[i]));
//     //     }
//     // }
// }
// function numberHelper( numberobject: NumberFilter, compareObj: Object) {
//     for (var i = 0; Object.keys(compareObj); i++ ){
//         if(Object.keys(numberobject)[0]== Object.keys(compareObj)[i]){
//             if(numberobject[0] < compareObj[i]) {                           //TODO should we define type object?
//                 return true;
//             }
//             else {
//                 return false;
//             }
//         }
//         else{
//            return false;
//         }
//     }
//
// }
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
    if (string == 'courses_uuid') { //number
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