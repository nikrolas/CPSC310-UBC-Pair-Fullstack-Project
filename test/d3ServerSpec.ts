/**
 * Created by Skyline on 2017-03-07.
 */
import {expect} from 'chai';
import Log from "../src/Util";
import Server from "../src/rest/Server";

var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

describe("d3ServerSpec", function () {

    let fs = require("fs");
    let server: Server;

    before("Start server", function (done) {
        if (fs.existsSync("./cache.json")) {
            fs.unlinkSync("./cache.json");
        }
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

    it.only("PUT rooms.zip", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                expect.fail();
            });
    });

    it("PUT rooms.zip again", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                expect(res.status).to.be.equal(201);
            })
            .catch(function () {
                expect.fail();
            });
    });

    it("Remove rooms.zip", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function (res: any) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                expect.fail();
            });
    });

    it("Remove rooms.zip again", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function () {
                expect.fail();
            })
            .catch(function (err:any) {
                expect(err.status).to.be.equal(404);
            });
    });

    it("PUT invalid", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/invalid')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function () {
                expect.fail();
            })
            .catch(function (err: any) {
                expect(err.status).to.be.equal(400);
            });
    });

    it.only("PUT courses.zip", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res: any) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                expect.fail();
            });
    });

    it("POST courses 200 test", function () {
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
            .then(function (res: any) {
                expect(res.body).to.deep.equal({"render":"TABLE","result":[{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":99.78}]});
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("POST courses 400 test", function () {
        let queryJSONObject: any = {
            WHERE: {
                OR: [
                ]
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
        return chai.request("http://localhost:4321")
            .post('/query')
            .send(queryJSONObject)
            .then(function () {
                Log.trace('then:');
                expect.fail();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                expect(err.status).to.be.equal(400);
            });
    });

    it("Distance test from DMP; 21 buildings", function () {
        let distObject: any = ["DMP", 500];
        return chai.request("http://localhost:4321")
            .post('/distance')
            .send(distObject)
            .then(function (res: any) {
                Log.trace('then:');
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("Distance test from DMP", function () {
        let distObject: any = ["DMP", 200];
        return chai.request("http://localhost:4321")
            .post('/distance')
            .send(distObject)
            .then(function (res: any) {
                Log.trace('then:');
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it.only("Schedule CPSC310 in DMP", function () {
        let courseQuery =
            {
                WHERE: {
                    AND:[
                        {
                            IS: {
                                "courses_dept": "psyc"
                            }
                        },
                        {
                            EQ: {
                                "courses_year": 2014
                            }
                        }/*,
                        {
                            IS: {
                                "courses_id": "310"
                            }
                        }*/
                        ]

                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept","courses_id", "courses_section", "courseSize"
                    ],
                    ORDER: {
                        dir:"DOWN",
                        keys: ["courses_dept","courses_id", "courseSize"]
                    },
                    FORM: "TABLE"
                },
                TRANSFORMATIONS: {
                    GROUP: ["courses_dept","courses_id", "courses_section"],
                    APPLY: [{
                        "courseSize": {
                            MAX: "courses_size"
                        }
                    }]
                }
            };

        let roomQuery = {
            WHERE:{
                IS:{
                    "rooms_shortname":"DMP"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "rooms_shortname", "rooms_number", "rooms_seats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["rooms_seats"]
                },
                FORM:"TABLE"
            }
        };

        let queryArray = [];
        queryArray.push(courseQuery);
        queryArray.push(roomQuery);

        return chai.request("http://localhost:4321")
            .post('/schedule')
            .send(queryArray)
            .then(function (res: any) {
                Log.trace('then:');
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("Schedule CPSC in DMP and BUCH", function () {
        let courseQuery =
            {
                WHERE: {
                    AND:[
                        {
                            IS: {
                                "courses_dept": "cpsc"
                            }
                        },
                        {
                            EQ: {
                                "courses_year": 2014
                            }
                        }
                    ]

                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept","courses_id", "courses_section", "courseSize"
                    ],
                    ORDER: {
                        dir:"DOWN",
                        keys: ["courses_dept","courses_id", "courseSize"]
                    },
                    FORM: "TABLE"
                },
                TRANSFORMATIONS: {
                    GROUP: ["courses_dept","courses_id", "courses_section"],
                    APPLY: [{
                        "courseSize": {
                            MAX: "courses_size"
                        }
                    }]
                }
            };

        let roomQuery = {
            WHERE:{
                OR:[
                    {
                        IS:{
                            "rooms_shortname":"DMP"
                        }
                    },
                    {
                        IS:{
                            "rooms_shortname":"BUCH"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "rooms_shortname", "rooms_number", "rooms_seats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["rooms_seats"]
                },
                FORM:"TABLE"
            }
        };

        let queryArray = [];
        queryArray.push(courseQuery);
        queryArray.push(roomQuery);

        return chai.request("http://localhost:4321")
            .post('/schedule')
            .send(queryArray)
            .then(function (res: any) {
                Log.trace('then:');
                expect(res.status).to.be.equal(200);
            })
            .catch(function () {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("Remove courses.zip", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/courses')
            .then(function (res: any) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function () {
                expect.fail();
            });
    });
});