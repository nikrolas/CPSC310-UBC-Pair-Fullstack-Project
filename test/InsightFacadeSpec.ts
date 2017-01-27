/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

   /* it.only("Dataset didn't exist; added successfully", function (done) {
        var data = fs.readFileSync("./test.zip");
        insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                fs.writeFileSync('./cache.txt','');
                done();
            })
            .catch(function (err) {
                expect.fail();
            })
    });*/

    it.only("Adding two data set; added successfully", function (done) {
        var data = fs.readFileSync("./test.zip");
        insightFacade.addDataset("apples", data.toString('base64'))
        insightFacade.addDataset("pears", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
                done();
            })
            .catch(function (err) {
                expect.fail();
            })
    });

  /*  it.only("Adding invalid dataset", function (done) {
        var data = fs.readFileSync("./README.md");
        insightFacade.addDataset("invalidData", data.toString('base64'))
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    }); */
});