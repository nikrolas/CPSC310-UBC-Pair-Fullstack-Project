/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

     var data = fs.readFileSync("./courses.zip");
     var data1 = fs.readFileSync("./test3.zip");



    beforeEach(function () {
        insightFacade = new InsightFacade();
    });


    it("Dataset didn't exist; added successfully", function () {
        fs.unlinkSync('./cache.json');
       return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
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

    it("remove dataset that is not in the set, error thrown", function () {
        insightFacade.removeDataset("blah")
            .then(function (response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).is.equal(404);
            })
    });

    it("remove dataset that is in the set", function () {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("Dataset does not exist, cache does; added successfully again", function () {
        return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("Dataset exist; replaced successfully ", function () {
        return insightFacade.addDataset("courses", data1.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
            })
            .catch(function (err) {
                expect.fail();
            })
    });


    it("Dataset does not exist in cache; added successfully", function () {
        return insightFacade.addDataset("pow", data1.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("remove dataset that is in the set again", function () {
        insightFacade.removeDataset("pow")
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });
    it("remove dataset that is in the set again", function () {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("Dataset does not exist; added successfully for filter tests ", function () {
        return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
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

    it("LT invalid test", function () {
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
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("GT Test: >99.77 and ORDER: courses_avg, should be 2 math courses", function () {
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
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("GT invalid test", function () {
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
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("EQ Test =0, should be 3 classes", function () {
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
                console.log(response.body);
            })
            .catch(function (err) {
            })
    });

    it("EQ invalid test", function () {
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
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });

    it("IS AND Sorting String test", function () {
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
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it("AND test", function () {
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
            })
            .catch(function (err) {
                expect.fail();
            })
    });

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

    it("AND Mulitple Cases  test", function () {
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
                EQ:{
                    "invalid_pass": 9
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "invalid_dept"
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

    it("WHERE empty test", function () {
        let qr: QueryRequest = {
            WHERE:{
            },
            OPTIONS:{
                "COLUMNS":[
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
            })
            .catch(function (err) {
                expect(err.code).is.equal(400);
            })
    });
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

                                IS: {
                                    "courses_dept":"apbi"
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

    // it.only("remove dataset that is not in the set, error thrown", function () {
    //     insightFacade.removeDataset("blah")
    //         .then(function (response) {
    //             console.log("In remove test");
    //             expect.fail();
    //         })
    //         .catch(function (err) {
    //             console.log("In remove test");
    //             expect(err.code).is.equal(424);
    //         })
    // });
    //
    // it.only("remove dataset that is in the set", function () {
    //     insightFacade.removeDataset("meow")
    //         .then(function (response) {
    //             console.log("In remove test");
    //             expect(response.code).is.equal(200);
    //         })
    //         .catch(function (err) {
    //             console.log("In remove test");
    //             expect.fail();
    //         })
    // });
    //
    // it.only("Dataset didn't exist; added successfully", function () {
    //     var data = fs.readFileSync("./test.zip");
    //     insightFacade.addDataset("meow", data.toString('base64'))
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(204);
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //         })
    // });


    // it.only("Perform Query; added successfully", function (done) {
    //     insightFacade.performQuery(qr)
    //         .then(function (response) {
    //             console.log("First test complete");
    //             expect(response.code).is.equal(204);
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 1");
    //             expect.fail();
    //             done();
    //         })
    // });

    // it.only("Adding second dataset; added successfully", function (done) {
    //     console.log("In second test");
    //     var data = fs.readFileSync("./test2.zip").toString('base64');
    //     insightFacade.addDataset("courses2", data)
    //         .then(function (response) {
    //             expect(response.code).is.equal(201);
    //             console.log("Second test complete");
    //             done();
    //         })
    //         .catch(function (err) {
    //             console.log("fail 2-2");
    //             expect.fail();
    //             done();
    //         })
    // });

    // it.only("Adding overriding dataset; added successfully", function () {
    //     console.log("In second test");
    //     var data = fs.readFileSync("./test3.zip").toString('base64');
    //     return insightFacade.addDataset("meow", data)
    //         .then(function (response) {
    //             expect(response.code).is.equal(201);
    //             console.log("Second test complete");
    //         })
    //         .catch(function (err) {
    //             console.log(err);
    //             expect.fail();
    //         })
    // });


});