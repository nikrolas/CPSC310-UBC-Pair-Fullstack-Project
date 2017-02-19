/**
 * Created by Skyline on 2017-02-19.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("d2Spec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    var data = fs.readFileSync("./rooms.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

    it("Dataset didn't exist; added successfully", function (done) {
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

    it("LT test: <65 and order: CoursesAvg, should have 6 classes", function () {
        let qr: QueryRequest = {
            WHERE: {
                LT: {
                    "courses_avg": 4.5
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_dept",
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });
});
