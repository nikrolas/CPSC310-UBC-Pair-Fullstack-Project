/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    before(function () {
        insightFacade = new InsightFacade();
    });

    it("Dataset didn't exist; added successfully", function () {
        var data = fs.readFileSync("./courses.zip");
        return insightFacade.addDataset("courses", data.toString('base64'));
    });
});