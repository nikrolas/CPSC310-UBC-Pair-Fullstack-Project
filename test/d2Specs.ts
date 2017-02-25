/**
 * Created by Skyline on 2017-02-19.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe.only("d2Spec", function () {

    let insightFacade: InsightFacade = null;
    let fs = require("fs");

    let dataRooms = fs.readFileSync("./rooms.zip");
    let dataCourses = fs.readFileSync("./courses.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

//Before anything exists in cache

  it("Remove Data , not found in cache", function (done) {
      //fs.unlinkSync("./cache.json");
      insightFacade.removeDataset("rooms")
            .then(function () {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(404);
                done();
            })
    });

    it("Perform query on an empty cache", function (done) {
        let qr : QueryRequest =  {
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
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function () {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(424);
                done();
            })
    });

    it("Add invalid dataset", function (done) {
        insightFacade.addDataset("cdrses", dataCourses.toString( 'base64'))
            .then(function () {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

    //Testing addDataset functions

    it("Dataset didn't exist; added courses successfully", function (done) {
        //fs.unlinkSync("./cache.json");
        insightFacade.addDataset("courses", dataCourses.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Dataset didn't exist; added rooms successfully", function (done) {
        //fs.unlinkSync("./cache.json");
        insightFacade.addDataset("rooms", dataRooms.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    //Remove dataset from  existing cache
    it("Remove Data , not found in cache", function (done) {
        insightFacade.removeDataset("roomssata")
            .then(function () {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(404);
                done();
            })
    });

    it("Remove Rooms Data successfully", function (done) {
        insightFacade.removeDataset("rooms")
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    // it("Check non existent id in cache", function (done) {
    //     let qr : QueryRequest =  {
    //         WHERE: {
    //             IS: {
    //                 "rooms_name": "DMP_*"
    //             }
    //         },
    //         OPTIONS: {
    //             COLUMNS: [
    //                 "rooms_name"
    //             ],
    //             ORDER: "rooms_name",
    //             FORM: "TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function () {
    //             expect.fail();
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect(err.code).is.equal(424);
    //             done();
    //         })
    // });


    it("Dataset did exist; added courses successfully", function (done) {
        insightFacade.addDataset("courses", dataCourses.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Dataset didn't exist; added rooms successfully", function (done) {
        insightFacade.addDataset("rooms", dataRooms.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    //Perform Query Test valid
    it("Room_name WildCard Test", function (done) {
        let qr : QueryRequest =  {
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
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_fullname WildCard Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_fullname": "*ugh*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_shortname WildCard Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_shortname": "*IOL"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_number WildCard Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_number": "200"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_number","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_address Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_address": "6*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_address","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_lat Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                EQ: {
                    "rooms_lat": 49.26826
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_lat","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_lon Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                EQ: {
                    "rooms_lon": -123.2531
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_lon","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_Seats LT Test, Order Char", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                LT: {
                    "rooms_seats": 50
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });


    it("Rooms_Seats LT Test, Order Num", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                LT: {
                    "rooms_seats": 50
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats","rooms_name"
                ],
                ORDER: "rooms_seats",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_Seats GT Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                GT: {
                    "rooms_seats": 200
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_Seats EQ Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                EQ: {
                    "rooms_seats": 20
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Rooms_type Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_type": "*mall*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_type","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });


    it("Rooms_furniture Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_furniture": "*Movable*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });


    it("Rooms_href Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_href": "*DMP*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_href","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("AND test, show all columns ", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                AND: [
                    {
                        LT:{
                            "rooms_seats": 200
                        }
                    },
                    {
                        IS:{
                            "rooms_shortname":"BUCH"
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
                    "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("OR test, show all columns ", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                OR: [
                    {
                        EQ:{
                            "rooms_seats": 200
                        }
                    },
                    {
                        IS:{
                            "rooms_shortname":"BUCH"
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
                    "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Complex OR nested AND, show all columns ", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                OR: [
                    {
                        AND: [
                            {
                                GT:{
                                    "rooms_seats": 19
                                }
                            },
                            {
                                LT:{
                                    "rooms_seats": 21
                                }
                            }
                        ]
                    },
                    {
                        AND: [
                            {
                                GT:{
                                    "rooms_seats": 60
                                }
                            },
                            {
                                LT:{
                                    "rooms_seats": 80
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
                    "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Complex AND nested AND, show all columns ", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                AND: [
                    {
                        AND: [
                            {
                                GT:{
                                    "rooms_seats": 10
                                }
                            },
                            {
                                LT:{
                                    "rooms_seats": 60
                                }
                            }
                        ]
                    },
                    {
                        AND: [
                            {
                                GT:{
                                    "rooms_seats": 20
                                }
                            },
                            {
                                LT:{
                                    "rooms_seats": 40
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
                    "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Helper for piazzatest 1", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_name": "DMP_*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_lat","rooms_lon","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Not test Piazza Test 1", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                NOT: {
                    AND: [{
                      GT: {
                        "rooms_lat": 49.2612
                    }
                     },
                      {
                          LT: {
                                "rooms_lat": 49.26129
                        }
                    },
                    {
                        LT: {
                            "rooms_lon": -123.2480
                        }
                    },
                    {
                        GT: {
                            "rooms_lon": -123.24809
                        }
                    }
                ]
            }
        },
            OPTIONS: {
                COLUMNS: [
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }

        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });
    //Perform query invalid tests

    it("Rooms failing Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_asdfkm": "BIOL"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname","rooms_name"
                ],
                ORDER: "rooms_name",
                FORM: "TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function () {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

    it("Filter by courses year; 1 math, 1 nurs", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    AND:[
                        {
                            EQ: {
                                "courses_year": 2016
                            }
                        },
                        {
                            GT: {
                                "courses_avg": 96
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept",
                        "courses_id"
                    ],
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"courses_dept":"math","courses_id":"525"},{"courses_dept":"nurs","courses_id":"591"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("GT Filter by courses year", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    AND:[
                        {
                            GT: {
                                "courses_year": 2014
                            }
                        },
                        {
                            GT: {
                                "courses_avg": 98
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept",
                        "courses_id"
                    ],
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"courses_dept":"nurs","courses_id":"509"},{"courses_dept":"spph","courses_id":"300"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Filter by courses year 1900; 4 courses", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    AND:[
                        {
                            EQ: {
                                "courses_year": 1900
                            }
                        },
                        {
                            GT: {
                                "courses_avg": 98.7
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept",
                        "courses_id"
                    ],
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Finding years a specific course was offered; 1 class", function (done) {
        let qr : QueryRequest =
            {
                WHERE:
                    {
                        IS: {
                            "courses_uuid": "25461"
                        }
                    },
                OPTIONS: {
                    COLUMNS: [
                        "courses_year"
                    ],
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"courses_year":2015}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Find room with lots of seats in BUCH; 2 rooms", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    AND:[
                        {
                            GT: {
                                "rooms_seats": 150
                            }
                        },
                        {
                            IS: {
                                "rooms_shortname": "BUCH"
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "rooms_name"
                    ],
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_name":"BUCH_A101"},{"rooms_name":"BUCH_A201"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Sort rooms in OSBO by href", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    IS: {
                        "rooms_shortname": "OSBO"
                    }
                },
                OPTIONS: {
                    COLUMNS: [
                        "rooms_name",
                        "rooms_href"
                    ],
                    ORDER: "rooms_href",
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_name":"OSBO_203A","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-203A"},{"rooms_name":"OSBO_203B","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-203B"},{"rooms_name":"OSBO_A","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-A"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Find rooms with Movable Tables + Chairs; 2 DMP rooms", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    AND: [
                        {
                            IS: {
                                "rooms_shortname": "DMP"
                            }
                    },
                        {
                            IS: {
                                "rooms_furniture": "Classroom-Movable Tables & Chairs"
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "rooms_name",
                        "rooms_href"
                    ],
                    ORDER: "rooms_href",
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_name":"DMP_101","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-101"},{"rooms_name":"DMP_201","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Small rooms on campus; 2 MCML and rest PHRMs", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    LT: {
                        "rooms_seats": 8
                    }
                },
                OPTIONS: {
                    COLUMNS: [
                        "rooms_name"
                    ],
                    ORDER: "rooms_name",
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_name":"MCML_360A"},{"rooms_name":"MCML_360B"},{"rooms_name":"PHRM_3112"},{"rooms_name":"PHRM_3114"},{"rooms_name":"PHRM_3115"},{"rooms_name":"PHRM_3118"},{"rooms_name":"PHRM_3120"},{"rooms_name":"PHRM_3122"},{"rooms_name":"PHRM_3124"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Small group rooms only", function (done) {
        let qr : QueryRequest =
            {
                WHERE: {
                    IS: {
                        "rooms_type": "Small Group"
                    }
                },
                OPTIONS: {
                    COLUMNS: [
                        "rooms_name"
                    ],
                    ORDER: "rooms_name",
                    FORM: "TABLE"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_name":"ANGU_232"},{"rooms_name":"ANGU_292"},{"rooms_name":"ANGU_332"},{"rooms_name":"ANGU_339"},{"rooms_name":"ANSO_202"},{"rooms_name":"ANSO_203"},{"rooms_name":"ANSO_205"},{"rooms_name":"AUDX_142"},{"rooms_name":"AUDX_157"},{"rooms_name":"BIOL_1503"},{"rooms_name":"BIOL_2519"},{"rooms_name":"BUCH_B216"},{"rooms_name":"BUCH_B302"},{"rooms_name":"BUCH_B304"},{"rooms_name":"BUCH_B306"},{"rooms_name":"BUCH_B307"},{"rooms_name":"BUCH_B308"},{"rooms_name":"BUCH_B310"},{"rooms_name":"BUCH_B312"},{"rooms_name":"BUCH_B316"},{"rooms_name":"BUCH_B319"},{"rooms_name":"BUCH_D205"},{"rooms_name":"BUCH_D207"},{"rooms_name":"BUCH_D209"},{"rooms_name":"BUCH_D213"},{"rooms_name":"BUCH_D214"},{"rooms_name":"BUCH_D216"},{"rooms_name":"BUCH_D221"},{"rooms_name":"BUCH_D228"},{"rooms_name":"BUCH_D229"},{"rooms_name":"BUCH_D304"},{"rooms_name":"BUCH_D306"},{"rooms_name":"BUCH_D307"},{"rooms_name":"BUCH_D313"},{"rooms_name":"BUCH_D315"},{"rooms_name":"BUCH_D319"},{"rooms_name":"BUCH_D323"},{"rooms_name":"BUCH_D325"},{"rooms_name":"CEME_1206"},{"rooms_name":"CEME_1210"},{"rooms_name":"DMP_101"},{"rooms_name":"DMP_201"},{"rooms_name":"FNH_20"},{"rooms_name":"FNH_30"},{"rooms_name":"FNH_320"},{"rooms_name":"FORW_317"},{"rooms_name":"FORW_519"},{"rooms_name":"FSC_1002"},{"rooms_name":"FSC_1402"},{"rooms_name":"FSC_1611"},{"rooms_name":"FSC_1613"},{"rooms_name":"FSC_1615"},{"rooms_name":"FSC_1617"},{"rooms_name":"GEOG_214"},{"rooms_name":"GEOG_242"},{"rooms_name":"HENN_301"},{"rooms_name":"HENN_302"},{"rooms_name":"HENN_304"},{"rooms_name":"IBLC_156"},{"rooms_name":"IBLC_157"},{"rooms_name":"IBLC_158"},{"rooms_name":"IBLC_185"},{"rooms_name":"IBLC_191"},{"rooms_name":"IBLC_192"},{"rooms_name":"IBLC_193"},{"rooms_name":"IBLC_194"},{"rooms_name":"IBLC_195"},{"rooms_name":"IBLC_263"},{"rooms_name":"IBLC_264"},{"rooms_name":"IBLC_265"},{"rooms_name":"IBLC_266"},{"rooms_name":"IBLC_460"},{"rooms_name":"IBLC_461"},{"rooms_name":"LASR_211"},{"rooms_name":"LASR_5C"},{"rooms_name":"MATH_102"},{"rooms_name":"MATH_202"},{"rooms_name":"MATH_225"},{"rooms_name":"MCLD_220"},{"rooms_name":"MCML_256"},{"rooms_name":"MCML_260"},{"rooms_name":"MCML_358"},{"rooms_name":"MCML_360A"},{"rooms_name":"MCML_360B"},{"rooms_name":"MCML_360C"},{"rooms_name":"MCML_360D"},{"rooms_name":"MCML_360E"},{"rooms_name":"MCML_360F"},{"rooms_name":"MCML_360G"},{"rooms_name":"MCML_360H"},{"rooms_name":"MCML_360J"},{"rooms_name":"MCML_360K"},{"rooms_name":"MCML_360L"},{"rooms_name":"MCML_360M"},{"rooms_name":"OSBO_203A"},{"rooms_name":"OSBO_203B"},{"rooms_name":"PCOH_1008"},{"rooms_name":"PCOH_1009"},{"rooms_name":"PCOH_1011"},{"rooms_name":"PCOH_1215"},{"rooms_name":"PCOH_1302"},{"rooms_name":"PHRM_3112"},{"rooms_name":"PHRM_3114"},{"rooms_name":"PHRM_3115"},{"rooms_name":"PHRM_3116"},{"rooms_name":"PHRM_3118"},{"rooms_name":"PHRM_3120"},{"rooms_name":"PHRM_3122"},{"rooms_name":"PHRM_3124"},{"rooms_name":"SCRF_1003"},{"rooms_name":"SCRF_1004"},{"rooms_name":"SCRF_1005"},{"rooms_name":"SCRF_1020"},{"rooms_name":"SCRF_1021"},{"rooms_name":"SCRF_1022"},{"rooms_name":"SCRF_1023"},{"rooms_name":"SCRF_1024"},{"rooms_name":"SCRF_1328"},{"rooms_name":"SCRF_200"},{"rooms_name":"SCRF_201"},{"rooms_name":"SCRF_202"},{"rooms_name":"SCRF_203"},{"rooms_name":"SCRF_204"},{"rooms_name":"SCRF_204A"},{"rooms_name":"SCRF_205"},{"rooms_name":"SCRF_206"},{"rooms_name":"SCRF_207"},{"rooms_name":"SCRF_208"},{"rooms_name":"SCRF_209"},{"rooms_name":"SCRF_210"},{"rooms_name":"SOWK_122"},{"rooms_name":"SOWK_324"},{"rooms_name":"SOWK_326"},{"rooms_name":"SPPH_143"},{"rooms_name":"SPPH_B108"},{"rooms_name":"SPPH_B112"},{"rooms_name":"SPPH_B136"},{"rooms_name":"SPPH_B138"},{"rooms_name":"SWNG_106"},{"rooms_name":"SWNG_108"},{"rooms_name":"SWNG_110"},{"rooms_name":"SWNG_306"},{"rooms_name":"SWNG_308"},{"rooms_name":"SWNG_310"},{"rooms_name":"SWNG_406"},{"rooms_name":"SWNG_408"},{"rooms_name":"SWNG_410"},{"rooms_name":"UCLL_101"},{"rooms_name":"WOOD_B75"},{"rooms_name":"WOOD_B79"},{"rooms_name":"WOOD_G41"},{"rooms_name":"WOOD_G44"},{"rooms_name":"WOOD_G53"},{"rooms_name":"WOOD_G55"},{"rooms_name":"WOOD_G57"},{"rooms_name":"WOOD_G59"},{"rooms_name":"WOOD_G65"},{"rooms_name":"WOOD_G66"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    // it("Two data set call failure", function (done) {
    //     let qr : QueryRequest =  {
    //         WHERE: {
    //             AND: [
    //                 {
    //                     GT:{
    //                         "courses_avg":90
    //                     }
    //                 },
    //                 {
    //                     EQ:{
    //                         "rooms_seats":70
    //                     }
    //                 }
    //             ]
    //         },
    //         OPTIONS: {
    //             COLUMNS: [
    //                 "rooms_name"
    //             ],
    //             ORDER: "rooms_name",
    //             FORM: "TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function () {
    //             expect.fail();
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect(err.code).is.equal(400);
    //             done();
    //         })
    // });

});