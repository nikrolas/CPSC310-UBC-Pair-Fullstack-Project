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

var buildings: any = {
    "ALRD": [49.2699, -123.25318],
    "ANSO": [49.26958, -123.25741],
    "AERL": [49.26372, -123.25099],
    "AUDX": [49.2666, -123.25655],
    "BIOL": [49.26479, -123.25249],
    "BRKX": [49.26862, -123.25237],
    "BUCH": [49.26826, -123.25468],
    "CIRS": [49.26207, -123.25314],
    "CHBE": [49.26228, -123.24718],
    "CHEM": [49.2659, 	-123.25308],
    "CEME": [49.26273, -123.24894],
    "EOSM": [49.26228, -123.25198],
    "ESB": [49.26274, -123.25224],
    "FNH": [49.26414, -123.24959],
    "FSC": [49.26044, -123.24886],
    "FORW": [49.26176, -123.25179],
    "LASR": [49.26767, -123.25583],
    "FRDM": [49.26541, -123.24608],
    "GEOG": [49.26605, -123.25623],
    "HEBB": [49.2661, 	-123.25165],
    "HENN": [49.26627, -123.25374],
    "ANGU": [49.26486, -123.25364],
    "DMP": [49.26125, -123.24807],
    "IONA": [49.27106, -123.25042],
    "IBLC": [49.26766, -123.2521],
    "SOWK": [49.2643, -123.25505],
    "LSK": [49.26545, -123.25533],
    "LSC": [49.26236, -123.24494],
    "MCLD": [49.26176, -123.24935],
    "MCML": [49.26114, -123.25027],
    "MATH": [49.266463, -123.255534],
    "SCRF": [49.26398, -123.2531],
    "ORCH": [49.26048, -123.24944],
    "PHRM": [49.26229, -123.24342],
    "PCOH": [49.264, -123.2559],
    "OSBO": [49.26047, -123.24467],
    "SPPH": [49.2642, -123.24842],
    "SRC": [49.2683, -123.24894],
    "UCLL": [49.26867, -123.25692],
    "MGYM": [49.2663, -123.2466],
    "WESB": [49.26517, -123.24937],
    "SWNG": [49.26293, -123.25431],
    "WOOD": [49.26478, -123.24673]
};

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    // getSchedule(conditions: any): Promise<InsightResponse> {
    //     return new Promise(function(fulfill, reject) {
    //         let dept = conditions["courses_dept"];
    //         let id = conditions["courses_id"];
    //         let room = conditions["rooms_shortname"];
    //         let dist = conditions["rooms_dist"];
    //
    //         if (dept != null && id != null) {
    //             let courseQuery = {AND:[{IS:{"courses_dept":dept}},{EQ:}
    //         }
    //     })
    // }

    getNearbyBuildings(fromBuilding: string, maxDistance: number): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject) {
            let nearbyBuildings: any = [];
            let startLat: number = buildings[fromBuilding][0];
            let startLon: number = buildings[fromBuilding][1];

            Object.keys(buildings).forEach(function(key) {
                //if (key != fromBuilding) {
                    let endLat = buildings[key][0];
                    let endLon = buildings[key][1];
                    let distance = getDistanceFromLatLonInM(startLat, startLon, endLat, endLon);

                    if (distance <= maxDistance) {
                        nearbyBuildings.push(key);
                    }
                //}
            });

            return fulfill(insightResponseConstructor(200, {nearbyBuildings}));
        })
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
                if (id in datasetHash) {
                    delete datasetHash[id];
                    fs.unlinkSync("./cache.json");
                    reWriteJSONFile(datasetHash);
                    return fulfill(insightResponseConstructor(204, {}));
                }
                return reject(insightResponseConstructor(404, {"missing":[id]}));
            }
            else {
                return reject(insightResponseConstructor(404, {"missing": id}));
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
            // Checks if ORDER is an object an object or a string. If object, check if it is proper format
            if(typeof order != "undefined") {
                if (typeof order == 'string') {
                    if (!columns.includes(order)) {
                        return reject(insightResponseConstructor(400, {"error": "Order is not contained in columns"}));
                    }
                }
                else if (typeof order == 'object'){
                    if (typeof order['dir'] == "undefined") {
                        return reject(insightResponseConstructor(400, {"error": "Order dir is undefined"}));
                    }
                    if (typeof order['keys'] == "undefined") {
                        return reject(insightResponseConstructor(400, {"error": "Order keys is undefined"}));
                    }
                    if (order['dir'] != "DOWN" && order['dir'] != "UP") {
                        return reject(insightResponseConstructor(400, {"error": "dir: must be either UP or DOWN"}));
                    }
                    for (let keyitems of order['keys']) {
                        if (!columns.includes(keyitems)) {
                            return reject(insightResponseConstructor(400, {"error": "keys must be in columns"}));
                        }
                    }
                }
                else {
                    return reject(insightResponseConstructor(400, {"error": "Order keys must either be a string or object"}));
                }
            }

            // Checks for empty COLUMNS array or missing COLUMNS array
            if(columns.length == 0 || typeof columns == "undefined") {
                return reject(insightResponseConstructor(400, {"error": "Columns missing or empty"}));
            }
            // Checks for invalid OPTIONS
            if(typeof form == "undefined" || form != "TABLE") {
                return reject(insightResponseConstructor(400, {"error": "Options is invalid"}));
            }
            let setID:string;

            if (typeof transformations != "undefined") {
                if (typeof transformations.APPLY == "undefined"){
                    return reject(insightResponseConstructor(400, {"error": "Apply is undefined"}));
                }
                if (typeof transformations.GROUP == "undefined") {
                    return reject(insightResponseConstructor(400, {"error": "Group is undefined"}));
                }
                if (transformations.APPLY.length > 1) {
                    let objectchecker:any = [];
                    for (let applyobject of transformations.APPLY) {
                        let keyname = Object.keys(applyobject)[0];
                        if (objectchecker.includes(keyname) ) {
                            return reject(insightResponseConstructor(400, {"error": "Must be unique name"}));
                        }
                        objectchecker.push(keyname);
                    }
                }

                if (transformations.GROUP.length == 0) {
                    return reject(insightResponseConstructor(400, {"error": "Group cannot be empty"}));
                }
                else {
                    setID = transformations.GROUP[0].split('_')[0];
                }
            } else {
                 setID = columns[0].split('_')[0];
            }

            if (fs.existsSync("./cache.json")) {
                datasetHash = JSON.parse(fs.readFileSync("./cache.json"));
            }
            else {
                return reject(insightResponseConstructor(424, {"missing":[setID]}));
            }

        //    Checks if cached dataset has the given ID, query invalid if it does not exist
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
                            //Adding Size - part of D4
                            courseSection['Size'] = courseSection["Pass"] + courseSection["Fail"];
                            storage.push(courseSection);
                        }
                    }
            }
            try {
                let filteredData = filterData(storage, where);

                if (typeof transformations != "undefined") {
                    let columngroup:string[]=[];
                    let columnapply:string[]=[];
                    let groupcheck: string[]=[];
                    let applycheck:string[]=[];

                    for (let columnstrings of columns) {
                        if(columnstrings.indexOf('_') > -1) {           //http://stackoverflow.com/questions/4444477/how-to-tell-if-a-string-contains-a-certain-character-in-javascript
                            columngroup.push(columnstrings);
                        } else {
                            columnapply.push(columnstrings);
                        }
                    }
                    for (let i = 0; i < transformations.GROUP.length; i++) {
                        groupcheck.push(transformations.GROUP[i]);
                    }
                    for (let objects of transformations.APPLY) {
                        applycheck.push(Object.keys(objects)[0]);
                    }
                    if(!arraysEqual(columnapply,applycheck)) {
                        return reject(insightResponseConstructor(400, {"error": "Everything in Columns must be in either group or apply"}));
                    }

                    if(!arraysEqual(columngroup,groupcheck)) {
                        return reject(insightResponseConstructor(400, {"error": "Everything in Columns must be in either group or apply"}));
                    }

                    let building_storage:any = [];
                    let combinedGroups: any = groupFilterData(filteredData,transformations);
                    let combinedApply: any = applyFilterData(combinedGroups, transformations.APPLY);
                    for (let buildings in combinedApply) {
                        building_storage.push(combinedApply[buildings][0]);
                    }
                    filteredData = building_storage;
                    for (let eachClass of filteredData) {
                        let row: any = {};
                        for (let groupname of groupcheck) {
                            row[groupname] = eachClass[correspondingJSONKeyApply(groupname)];
                        }
                        for (let applyname of applycheck) {
                            row[applyname] = eachClass[correspondingJSONKeyApply(applyname)];
                        }
                        finalArray.push(row);
                    }
                }
                else {
                    for (let eachClass of filteredData) {
                        let row: any = {};
                        for (let column of columns) {
                            if (validNumericKeys(column)) {
                                row[column] = parseFloat(eachClass[correspondingJSONKeyApply(column)]);
                            }
                            else {
                                row[column] = eachClass[correspondingJSONKeyApply(column)];
                            }
                        }
                        finalArray.push(row);
                    }
                }

                // Sort by column
                let sortOrder = order;

                if(typeof sortOrder != "undefined") {
                    if (typeof sortOrder == 'object') {
                        finalArray= sortTransformData(finalArray,sortOrder);
                    }
                    else {
                        if(validSortableKeys(sortOrder)) {
                            finalArray = sortByChar(finalArray, correspondingJSONKey(sortOrder));
                        }
                        else {
                            finalArray = sortByNum(finalArray, sortOrder);
                        }
                    }
                }
                finalFilteredData["result"] = finalArray;
                console.log (finalFilteredData);
                return fulfill(insightResponseConstructor(200, finalFilteredData));
            } catch (e) {
                return reject(insightResponseConstructor(400, {"error": e}))
            }
        });
    }
}

//From http://stackoverflow.com/a/27943
function getDistanceFromLatLonInM(lat1:any, lon1:any, lat2:any, lon2:any) {
    let R = 6371000; // Radius of the earth in m
    let dLat = deg2rad(lat2-lat1);  // deg2rad below
    let dLon = deg2rad(lon2-lon1);
    let a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in m
    return d;
}

function deg2rad(deg:any) {
    return deg * (Math.PI/180)
}

function applyFilterData(dataset:any, request:any) :any {
    for (let filterTerms of request) {
        if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "MAX") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].MAX;
            if (validNumericKeys(numerickey)){ //Check if is valid number
                for (let groups in dataset) {
                    let maxValue = 0;

                    for(let rooms of dataset[groups]) {
                        let x = rooms[correspondingJSONKeyApply(numerickey)]              //Convert string to number
                        if (x > maxValue) {
                            maxValue = x;
                        }
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = maxValue;
                }
            }
            else {
                throw new Error("Must be a numeric key");
            }
        }
        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "MIN") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].MIN;

            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let minvalue = 10000;

                    for(let rooms of dataset[groups]) {
                        let x = rooms[correspondingJSONKeyApply(numerickey)]              //Convert string to number
                        if (x < minvalue) {
                            minvalue = x;
                        }
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = minvalue;
                }
            }
            else {
                throw new Error("Must be a numeric key");
            }
        }
        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "AVG") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].AVG;
            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let avg = 0;
                    for(let rooms of dataset[groups]) {
                        let x = rooms[correspondingJSONKeyApply(numerickey)]              //Convert string to number
                        x = x * 10;
                        x = Number(x.toFixed(0));
                        avg += x;
                    }
                    avg = avg / dataset[groups].length ;
                    avg = avg / 10;
                    avg = Number(avg.toFixed(2))
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = avg;
                }
            }
            else {
                throw new Error("Must be a numeric key");
            }
        }

        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "COUNT") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].COUNT;
                for (let groups in dataset) {
                    let count:any = {}
                    for(let groupobject of dataset[groups]) {
                        count[groupobject[correspondingJSONKeyApply(numerickey)]] = 1 + (count[groupobject[correspondingJSONKeyApply(numerickey)]] || 0);
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = Object.keys(count).length;
                }
        }


        else if (Object.keys(filterTerms[Object.keys(filterTerms)[0]])[0] == "SUM") {
            let numerickey = filterTerms[Object.keys(filterTerms)[0]].SUM;
            if (validNumericKeys(numerickey)){
                for (let groups in dataset) {
                    let sum = 0;
                    for(let rooms of dataset[groups]) {
                        let x = rooms[correspondingJSONKeyApply(numerickey)]              //Convert string to number
                        sum += x;
                    }
                    let variablename:string = Object.keys(filterTerms)[0];
                    (dataset[groups][0])[variablename] = sum;
                }
            }
            else {
                throw new Error("Must be a numeric key");
            }
        }
        else {
            throw new Error("Command must be MIN,MAX,SUM,COUNT, or AVG");
        }
    }
    return dataset;

}

function groupFilterData(dataset: any, request: any): any {
    let finalGroups:any = {};
    let finalGroupsStringID: string = "";
    let groupings: any = request.GROUP;
        for (let objects of dataset) {                      //Going through all the objects in the filtered dataset
            for (let groupingsId of groupings) {            //Checking every critera of the group to make sure they are combined properly
                if (validNumericKeys(groupingsId)) {
                    finalGroupsStringID = finalGroupsStringID.concat(objects[correspondingJSONKeyApply(groupingsId)].toString());
                }
                else {
                    finalGroupsStringID =finalGroupsStringID.concat(objects[correspondingJSONKeyApply(groupingsId)]);
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

function sortTransformData(data: Object[], order: any) {
    data.sort(function (a: any, b: any) {
        let dir: number;
        let keys: string[] = order["keys"];
        if (order.dir == "DOWN") {
            dir = -1;
        }
        else if (order.dir == "UP") {
            dir = 1;
        }
        else{
            throw new Error("Dir needs to be either UP or DOWN");
        }

        let recursion = function (a: any, b: any, keynum: any): number {
            if (a[keys[keynum]] > b [keys[keynum]]) {
                return 1;
            }
            else if (a[keys[keynum]] < b [keys[keynum]]) {
                return -1;
            }

            else
                return (keys[keynum + 1]) ? recursion(a, b, keynum + 1) : 0;
        };

        return dir *recursion(a,b,0)
    });
    return data;
}

function sortByNum(data: any, order: string) {
    data.sort(function (a: any, b: any) {
        if (order == "courses_uuid" || "courses_id" || "rooms_lat" || "rooms_lon"||"courses_size") { //Part of D4
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

function validNumericKeys(string : string) {
    let validNumKeySet = new Set(['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit','courses_uuid',
        'courses_year','courses_size', 'rooms_seats', 'rooms_lat', 'rooms_lon']);//Part of D4
    return validNumKeySet.has(string);
}


function validSortableKeys(string : string) {
    let validNumKeySet = new Set(['courses_dept', 'courses_instructor','courses_title','courses_section','rooms_fullname','rooms_shortname', //part of D4
        'rooms_number','rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture', 'rooms_href','courses_id']);
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
    //Part of D4
    if (given_string == 'courses_size') {
        return "Size";
    }
    if (given_string == 'courses_section') {
        return "Section";
    }
    if (validRoomKeySet.has(given_string)) {
        return given_string;
    }
    return "Invalid";
}

function correspondingJSONKeyApply(given_string: string) {
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
    //Part of D4
    if (given_string == 'courses_size') {
        return "Size";
    }
    if (given_string == 'courses_section') {
        return "Section";
    }
    return given_string;

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
                            roomNumberObject["rooms_seats"] = parseInt(room_object["rooms_seats"][i]);
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
}

//http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a:any, b:any) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    a = a.sort();
    b = b.sort();

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}