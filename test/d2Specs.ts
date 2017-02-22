/**
 * Created by Skyline on 2017-02-19.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe.only("d2Spec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    var dataRooms = fs.readFileSync("./rooms.zip");
    var dataCourses = fs.readFileSync("./courses.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

//Before anything exists in cache

    it("Remove Data , not found in cache", function (done) {
        insightFacade.removeDataset("rooms")
            .then(function (response) {
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
            .then(function (response) {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);

                expect.fail();
                done();
            })
    });

    //Testing addDataset functions

    it("Dataset didn't exist; added courses successfully", function (done) {
        fs.unlinkSync('./cache.json');
        insightFacade.addDataset("courses", dataCourses.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset didn't exist; added rooms successfully", function (done) {
        insightFacade.addDataset("rooms", dataRooms.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    //Remove dataset from  existing cache
    it("Remove Data , not found in cache", function (done) {
        insightFacade.removeDataset("roomssata")
            .then(function (response) {
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
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset did exist; added courses successfully", function (done) {
        insightFacade.addDataset("courses", dataCourses.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset didn't exist; added rooms successfully", function (done) {
        insightFacade.addDataset("rooms", dataRooms.toString( 'base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Rooms_lat Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_lat": "filler"//TODO
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
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Rooms_lon Test", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_lon": "filler"//TODO
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .catch(function (err) {
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
            .then(function (response) {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

    it("Two data set call failure", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":90
                        }
                    },
                    {
                        EQ:{
                            "rooms_seats":70
                        }
                    }
                ]
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
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

});
