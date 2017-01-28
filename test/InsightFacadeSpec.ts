/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });



    it.only("Dataset didn't exist; added successfully", function (done) {
        console.log("In first test");
        var data = fs.readFileSync("./test.zip");
        insightFacade.addDataset("meow", data.toString('base64'))
            .then(function (response) {
                console.log("In first test");
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                console.log("fail 1");
                expect.fail();
            })
    });

    it.only("remove dataset that is not in the set, error thrown", function (done) {
        insightFacade.removeDataset("blah")
            .then(function (response) {
                console.log("In remove test");
                expect.fail();
                done();
            })
            .catch(function (err) {
                console.log("In remove test");
                expect(err.code).is.equal(424);
                done();
            })
    });

    it.only("remove dataset that is in the set", function (done) {
        insightFacade.removeDataset("meow")
            .then(function (response) {
                console.log("In remove test");
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function (err) {
                console.log("In remove test");
                expect.fail();
                done();
            })
    });

    it.only("Dataset didn't exist; added successfully", function (done) {
        var data = fs.readFileSync("./test.zip");
        insightFacade.addDataset("meow", data.toString('base64'))
            .then(function (response) {
                console.log("First test complete");
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                console.log("fail 1");
                expect.fail();
                done();
            })
    });

    it.only("Overwriting existing dataset; added successfully", function (done) {
        console.log("In second test");
        var data = fs.readFileSync("./test2.zip").toString('base64');
        insightFacade.addDataset("courses2", data)
            .then(function (response) {
                expect(response.code).is.equal(201);
                console.log("Second test complete");
                done();
            })
            .catch(function (err) {
                console.log("fail 2-2");
                expect.fail();
                done();
            })
    });

    it.only("Adding invalid dataset", function (done) {
        var data = fs.readFileSync("./README.md");
        insightFacade.addDataset("invalidData", data.toString('base64'))
            .then(function (response) {
                console.log("fail 3");
                expect.fail();
                done();
            })
            .catch(function (err) {
                console.log("In third test");
                expect(err.code).is.equal(400);
                done();
            })
    });
    //
    // it.only("Adding invalid dataset", function (done) {
    //     var data = fs.readFileSync("./README.md");
    //     insightFacade.addDataset("invalidData", data.toString('base64'))
    //         .then(function (response) {
    //             console.log("fail 3");
    //             expect.fail();
    //         })
    //         .catch(function (err) {
    //             console.log("In third test");
    //             expect(err.code).is.equal(400);
    //             done();
    //         })
    // });
});