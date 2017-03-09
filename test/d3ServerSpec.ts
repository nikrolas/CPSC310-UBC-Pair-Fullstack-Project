/**
 * Created by Skyline on 2017-03-07.
 */
import {expect} from 'chai';
import Log from "../src/Util";
import {Response} from "restify";
import Server from "../src/rest/Server";

var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

describe.only("d3ServerSpec", function () {

    let fs = require("fs");
    let server: Server;

    before("Start server", function (done) {
        fs.unlinkSync("./cache.json");
        server = new Server(4321);
        server.start()
            .then(function (status) {
                if (status) {
                    console.log("Server started");
                    done();
                }
                else {
                    console.log("Server not started");
                }
            })
            .catch(function (err) {
                console.log(err);
            })
    });

    after("Close server", function (done) {
        server.stop()
            .then(function (status: any) {
                if (status) {
                    console.log("Server closed");
                    done();
                }
                else {
                    console.log("Server not closed");
                }
            })
            .catch(function (err: any) {
                console.log(err);
            })
    });

    it("PUT rooms.zip", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("PUT rooms.zip again", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.be.equal(201);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("Remove rooms.zip", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("Try to remove rooms.zip again", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function () {
                Log.trace('then:');
                expect.fail();
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                expect(err.status).to.be.equal(404);
            });
    });

    it.only("PUT invalid", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/invalid')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function () {
                Log.trace('then:');
                expect.fail();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                expect(err.status).to.be.equal(400);
            });
    });

    it("PUT courses.zip", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("POST courses test", function () {
        let queryJSONObject = {
            WHERE:{
                GT:{
                    "courses_avg":99.77
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }
        };
        return chai.request("http://localhost:4321")
            .post('/query')
            .send(queryJSONObject)
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });
});