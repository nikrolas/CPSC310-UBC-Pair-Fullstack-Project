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
    var data1 = fs.readFileSync("./test3.zip");


    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

    it("Dataset didn't exist; added successfully", function (done) {
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

    // it("Courses_year test, should be 4 courses starting from 90511", function (done) {
    //     let qr: QueryRequest = {
    //         WHERE:{
    //         AND:[
    //             {
    //                 EQ:{
    //                     "courses_year":2007
    //                 }
    //             },
    //             {
    //                 IS:{
    //                     "courses_dept":"cpsc"
    //                 }
    //             },
    //             {
    //                 IS:{
    //                     "courses_id":"121"
    //                 }
    //             }
    //         ]
    //     },
    //         OPTIONS:{
    //         COLUMNS:[
    //             "courses_uuid"
    //         ],
    //             ORDER:"courses_uuid",
    //             FORM:"TABLE"
    //     }};
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             expect(response.code).is.equal(200);
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect.fail();
    //             done();
    //         })
    // });
    //
    // it("Courses_year test, should be 1 SPPH class with year 1900", function (done) {
    //     let qr: QueryRequest = {
    //         WHERE:{
    //             AND: [
    //                 {
    //                     EQ:{
    //                         "courses_avg":98.98
    //                     }
    //                 },
    //                 {
    //                     EQ:{
    //                         "courses_year": 1900
    //                     }
    //                 }
    //             ]
    //         },
    //         OPTIONS:{
    //             COLUMNS:[
    //                 "courses_year",
    //                 "courses_avg",
    //                 "courses_dept"
    //             ],
    //             FORM:"TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             expect(response.code).is.equal(200);
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect.fail();
    //             done();
    //         })
    // });
    //
    // it("Finding all sections of AANB", function (done) {
    //     let qr : QueryRequest =  {
    //         WHERE:{
    //             IS:{
    //                 "courses_dept": "aanb"
    //             }
    //         },
    //         OPTIONS:{
    //             COLUMNS:[
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             ORDER:"courses_avg",
    //             FORM:"TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             expect(response.code).is.equal(200);
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect.fail();
    //             done();
    //         })
    // });
    //
    // it("Simple invalid key", function (done) {
    //     let qr : QueryRequest =  {
    //         WHERE:{
    //             IS:{
    //                 "invalid": "aanb"
    //             }
    //         },
    //         OPTIONS:{
    //             COLUMNS:[
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             ORDER:"courses_avg",
    //             FORM:"TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             expect.fail();
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect(err.code).is.equal(400);
    //             done();
    //         })
    // });
    //
    // it("Nested invalid key", function (done) {
    //     let qr : QueryRequest =  {
    //         WHERE:{
    //             OR:[
    //                 {
    //                     AND:[
    //                         {
    //                             GT:{
    //                                 "courses_avg":90
    //                             }
    //                         },
    //                         {
    //                             IS:{
    //                                 "invalid":"adhe"
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     EQ:{
    //                         "courses_avg":95
    //                     }
    //                 }
    //             ]
    //         },
    //         OPTIONS:{
    //             COLUMNS:[
    //                 "courses_dept",
    //                 "courses_id",
    //                 "courses_avg"
    //             ],
    //             ORDER:"courses_avg",
    //             FORM:"TABLE"
    //         }
    //     };
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             expect.fail();
    //             done();
    //         })
    //         .catch(function (err) {
    //             expect(err.code).is.equal(400);
    //             done();
    //         })
    // });

    it.only("Dataset didn't exist; added successfully", function (done) {
        fs.unlinkSync('./cache.json');

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

    it.only("Rooms test", function (done) {
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

    it.only("Rooms test2", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                GT: {
                    "rooms_seats": 20
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats"
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

    it.only("Rooms test3", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                IS: {
                    "rooms_address": "*Agrono*"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_address","rooms_name"
                ],
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

    it.only("Rooms test4", function (done) {
        let qr : QueryRequest =  {
            WHERE: {
                            AND: [
                                {
                                    IS:{
                                        "rooms_name": "ORCH_1001"
                                    }
                                },
                                {
                                    IS:{
                                        "rooms_address": "6363 Agronomy Road"
                                    }
                                }
                            ]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_address","rooms_name"
                ],
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


});
