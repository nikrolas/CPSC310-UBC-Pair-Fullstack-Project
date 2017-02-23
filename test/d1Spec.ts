/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("d1Spec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

    var data = fs.readFileSync("./courses.zip");
    var data1 = fs.readFileSync("./test3.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });

    it("Dataset didn't exist; added successfully", function (done) {
        fs.unlinkSync("./cache.json");
       insightFacade.addDataset("courses", data.toString( 'base64'))
           .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Adding invalid dataset", function (done) {
        var data = fs.readFileSync("./README.md");
        insightFacade.addDataset("invalidData", data.toString('base64'))
            .then(function (response) {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

    it("Adding valid zip, no real data", function (done) {
        var data = fs.readFileSync("./emptyText.zip");
        insightFacade.addDataset("noData", data.toString('base64'))
            .then(function (response) {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
                done();
            })
    });

    it("remove dataset that is not in the set, error thrown", function (done) {
        insightFacade.removeDataset("blah")
            .then(function (response) {
                expect.fail();
                done();
            })
            .catch(function (err) {
                expect(err.code).is.equal(404);
                done();
            })
    });

    it("remove dataset that is in the set", function (done) {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset does not exist, cache does; added successfully again", function (done) {
        insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset exist; replaced successfully ", function (done) {
        insightFacade.addDataset("courses", data1.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Dataset does not exist in cache; added successfully", function (done) {
        insightFacade.addDataset("pow", data1.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("remove dataset that is in the set again", function (done) {
        insightFacade.removeDataset("pow")
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

/*    it("remove second dataset that is in the set", function (done) {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                expect(response.code).is.equal(204);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });*/

    it("Dataset does not exist; added successfully for filter tests ", function (done) {
        insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("LT test: <65 and order: CoursesAvg, should have 6 classes", function (done) {
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
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("LT invalid test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                LT: {
                    "courses_avg": "INVALID"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_avg",
                FORM:"TABLE"
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

    it("GT Test: >99.77 and ORDER: courses_avg, should be 2 math courses", function (done) {
        let qr : QueryRequest = {
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

    it("GT invalid test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                GT: {
                    "courses_avg": "INVALID"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_avg",
                FORM:"TABLE"
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

    it("EQ Test =0, should be 3 classes", function (done) {
        let qr : QueryRequest = {
            WHERE: {
                EQ: {
                    "courses_avg":0
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("EQ invalid test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                EQ: {
                    "courses_avg": "INVALID"
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_avg",
                FORM:"TABLE"
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

    it("IS AND Sorting String test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        IS:{
                            "courses_dept":"apsc"
                        }
                    },
                    {
                        GT:{
                            "courses_avg":91
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],

                ORDER: "courses_avg",
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

    it("IS courses_uuid test", function (done) {
        let qr: QueryRequest = {
            WHERE:{
                IS:{
                    "courses_uuid":"88924"
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

    it("AND test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                {
                    GT:{
                        "courses_avg":61
                    }
                },
                {
                    LT:{
                        "courses_avg":62
                    }
                }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("OR test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                OR: [
                    {
                        GT:{
                            "courses_avg":90
                        }
                    },
                    {
                        EQ:{
                            "courses_avg":70
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("AND SORTING NUMBER test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":62
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],

                ORDER: "courses_avg",
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

    it("AND Mulitple Cases test", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":65
                        }
                    },
                    {
                        IS:{
                            "courses_dept":"math"
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],

                ORDER: "courses_avg",
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

    it("AND SORTING STRING test", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":62
                        }
                    }
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("NESTED OR SORTING STRING test", function () {
        let qr: QueryRequest = {
            WHERE: {
                OR: [
                    {
                        OR: [
                            {
                                GT:{
                                    "courses_avg":90
                                }
                            },
                            {
                                GT:{
                                    "courses_avg":70
                                }
                            }
                        ]
                    },
                    {
                        OR: [
                            {
                                EQ:{
                                    "courses_avg":70
                                }
                            },
                            {
                                EQ:{
                                    "courses_avg":73
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("NESTED AND SORTING STRING test", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        AND: [
                            {
                                GT:{
                                    "courses_avg":70
                                }
                            },
                            {
                                LT:{
                                    "courses_avg":80
                                }
                            }
                        ]
                    },
                    {
                        AND: [
                            {
                                GT:{
                                    "courses_avg":74
                                }
                            },
                            {
                                LT:{
                                    "courses_avg":76
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("AND SORTING NUMBER test", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":62
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],

                ORDER: "courses_avg",
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

    it("AND SORTING STRING test", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":62
                        }
                    }
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("OR Empty Error", function () {
        let qr: QueryRequest = {
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("AND Empty Error", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("SORT by courses_uuid, special case", function () {
        let qr: QueryRequest = {
            WHERE:{
                GT:{
                    "courses_pass":70
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_avg",
                    "courses_uuid"
                ],
                FORM:"TABLE",
                ORDER:"courses_uuid"
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

    it("Invalid dataset ID to be queried", function () {
        let qr: QueryRequest = {
            WHERE:{
                GT:{
                    "invalid1_avg":97
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "invalid2_dept",
                    "invalid3_avg"
                ],
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(424);
            })
    });

    it("ORDER invalid test", function () {
        let qr: QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":90
                        }
                    },
                    {
                        EQ:{
                            "courses_avg":90
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_instructor",
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("COLUMNS empty test", function () {
        let qr: QueryRequest = {
            WHERE:{
                GT:{
                    "courses_avg":97
                }
            },
            OPTIONS:{
                COLUMNS:[
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("COLUMNS missing test", function () {
        let qr: QueryRequest = {
            WHERE:{
                GT:{
                    "courses_avg":97
                }
            },
            OPTIONS:{
                ORDER:"courses_avg",
                FORM:"TABLE"
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("FORM invalid test", function () {
        let qr: QueryRequest = {
                WHERE:{
                    GT:{
                        "courses_avg":97
                    }
                },
                OPTIONS:{
                    COLUMNS:[
                        "courses_dept",
                        "courses_avg"
                    ],
                    ORDER:"courses_avg",
                    FORM:"INVALID"
                }
            };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("WHERE missing test", function () {
        let qr: QueryRequest = {
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

/*    it("WHERE valid empty test", function () {
        let qr: QueryRequest = {
            WHERE:{
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });*/

    it("OR test", function () {
        let qr: QueryRequest = {
            WHERE: {
                OR: [
                    {
                        GT:{
                            "courses_avg":90
                        }
                    },
                    {
                        EQ:{
                            "courses_avg":70
                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("NOT test", function () {
        let qr : QueryRequest = {
            WHERE: {



                        NOT:{

                                IS: {
                                    "courses_dept":"aanb"
                                }

                        }

            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("Double NOT test", function () {
        let qr : QueryRequest = {
            WHERE: {
                AND: [
                    {
                        GT:{
                            "courses_avg":61
                        }
                    },
                    {
                        LT:{
                            "courses_avg":62
                        }
                    },
                    {
                        NOT:{
                            NOT: {
                                IS: {
                                    "courses_dept":"apbi"
                                }
                            }

                        }
                    }
                ]
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
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

    it("IS end wildcard test", function () {
        let qr : QueryRequest =     {
            WHERE:{
                IS:{
                    "courses_uuid":"8892*"
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("IS beginning wildcard test", function () {
        let qr : QueryRequest =     {
            WHERE:{
                IS:{
                    "courses_uuid":"*8892"
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("IS double wildcard test", function () {
        let qr : QueryRequest =  {
            WHERE:{
                IS:{
                    "courses_uuid":"*000*"
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
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("Courses_year test, should be 4 courses starting from 90511", function (done) {
        let qr: QueryRequest = {
            WHERE:{
            AND:[
                {
                    EQ:{
                        "courses_year":2007
                    }
                },
                {
                    IS:{
                        "courses_dept":"cpsc"
                    }
                },
                {
                    IS:{
                        "courses_id":"121"
                    }
                }
            ]
        },
            OPTIONS:{
            COLUMNS:[
                "courses_uuid"
            ],
                ORDER:"courses_uuid",
                FORM:"TABLE"
        }};
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

    it("Courses_year test, should be 1 SPPH class with year 1900", function (done) {
        let qr: QueryRequest = {
            WHERE:{
                AND: [
                    {
                        EQ:{
                            "courses_avg":98.98
                        }
                    },
                    {
                        EQ:{
                            "courses_year": 1900
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_year",
                    "courses_avg",
                    "courses_dept"
                ],
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

    it("Finding all sections of AANB", function (done) {
        let qr : QueryRequest =  {
            WHERE:{
                IS:{
                    "courses_dept": "aanb"
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

    it("Simple invalid key", function (done) {
        let qr : QueryRequest =  {
            WHERE:{
                IS:{
                    "invalid": "aanb"
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

    it("Nested invalid key", function (done) {
        let qr : QueryRequest =  {
            WHERE:{
                OR:[
                    {
                        AND:[
                            {
                                GT:{
                                    "courses_avg":90
                                }
                            },
                            {
                                IS:{
                                    "invalid":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        EQ:{
                            "courses_avg":95
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
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