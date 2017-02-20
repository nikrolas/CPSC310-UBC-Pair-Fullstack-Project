/**
 * Created by Skyline on 2017-02-19.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("d2Spec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    var data = fs.readFileSync("./rooms_small.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

    it.only("Dataset didn't exist; added successfully", function (done) {
        fs.unlinkSync('./cache.json');
        insightFacade.addDataset("rooms", data.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it.only("First test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                IS: {
                    "rooms_name": "DMP_*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_name"
                ],
                ORDER: "rooms_name",
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });
});
