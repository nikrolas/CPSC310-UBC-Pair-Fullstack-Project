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

    before(function () {
        insightFacade = new InsightFacade();
    });

    it.only("Dataset didn't exist; added successfully", function (done) {
        var data = fs.readFileSync("./testing.zip");
        insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
            })
    });
});