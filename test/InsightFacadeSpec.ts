/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");
    var qr : QueryRequest = {

        WHERE: {
            IS: {
                "courses_dept":"apsc"
            }
        },
        OPTIONS: {
            COLUMNS: [
                "courses_dept",
                "courses_avg"
            ],
            FORM:"TABLE"

        },

    };
    var data = fs.readFileSync("./test.zip");
    var data1 = fs.readFileSync("./test3.zip");



    beforeEach(function () {
        insightFacade = new InsightFacade();
    });


    it.only("Dataset didn't exist; added successfully", function () {
        fs.unlinkSync('./cache.json');
        console.log("In first test");
       return insightFacade.addDataset("meow", data.toString('base64'))
            .then(function (response) {
                console.log("Success");
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                console.log("fail 1");
                expect.fail();
            })
    });

    // it.only("Dataset does not exist in cache; added successfully", function () {
    //     return insightFacade.addDataset("pow", data1.toString('base64'))
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(204);
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //         })
    // });

    // it.only("Dataset exists in cache; added successfully", function (done) {
    //     var data2 = fs.readFileSync("./test3.zip");
    //     insightFacade.addDataset("meow", data2.toString('base64'))
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(201);
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //         })
    // });

    // it.only("Query Data Simple", function (done) {
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(201);
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //         })
    // });

    // it.only("remove dataset that is not in the set, error thrown", function () {
    //     insightFacade.removeDataset("blah")
    //         .then(function (response) {
    //             console.log("In remove test");
    //             expect.fail();
    //         })
    //         .catch(function (err) {
    //             console.log("In remove test");
    //             expect(err.code).is.equal(424);
    //         })
    // });
    //
    // it.only("remove dataset that is in the set", function () {
    //     insightFacade.removeDataset("meow")
    //         .then(function (response) {
    //             console.log("In remove test");
    //             expect(response.code).is.equal(200);
    //         })
    //         .catch(function (err) {
    //             console.log("In remove test");
    //             expect.fail();
    //         })
    // });
    //
    // it.only("Dataset didn't exist; added successfully", function () {
    //     var data = fs.readFileSync("./test.zip");
    //     insightFacade.addDataset("meow", data.toString('base64'))
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(204);
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //         })
    // });


    // it.only("Perform Query; added successfully", function (done) {
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(204);
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //             done();
    //         })
    // });

    // it.only("Adding second dataset; added successfully", function (done) {
    //     console.log("In second test");
    //     var data = fs.readFileSync("./test2.zip").toString('base64');
    //     insightFacade.addDataset("courses2", data)
    //         .then(function (response) {
    //             expect(response.code).is.equal(201);
    //             console.log("Second test complete");
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 2-2");
    //             expect.fail();
    //             done();
    //         })
    // });

    // it.only("Adding overriding dataset; added successfully", function () {
    //     console.log("In second test");
    //     var data = fs.readFileSync("./test3.zip").toString('base64');
    //     return insightFacade.addDataset("meow", data)
    //         .then(function (response) {
    //             expect(response.code).is.equal(201);
    //             console.log("Second test complete");
    //         })
    //         .catch(function (err) {
    //             console.log(err);
    //             expect.fail();
    //         })
    // });

    // it.only("Adding invalid dataset", function (done) {
    //     var data = fs.readFileSync("./README.md");
    //     insightFacade.addDataset("invalidData", data.toString('base64'))
    //         .then(function (response) {
    //             console.log("fail 3");
    //             expect.fail();
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("In third test");
    //             expect(err.code).is.equal(400);
    //             done();
    //         })
    // });

});