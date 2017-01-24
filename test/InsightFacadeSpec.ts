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
        Log.test("In before")
        insightFacade = new InsightFacade();
    });

    it("Dataset didn't exist; added successfully", function (done) {
        fs.readFile("courses.zip", function(err: any, data: string) {
                return insightFacade.addDataset("courses", data)
                .then(function (value: InsightResponse) {
                    Log.test('Code:' + value);
                    expect(value.code).to.equal(204);
                    done();
                }).catch(function (err) {
                    Log.test('Error: Should not be here');
                    expect.fail();
                    done(err);
                })
            })
            .catch (function (err: any) {
                Log.test('Error: Should not be here');
                expect.fail();
                done(err);
            });
    });
});