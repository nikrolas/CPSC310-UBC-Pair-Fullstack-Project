/**
 * Created by Raymond on 2017-01-17.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("InsightFacadeSpec", function () {

    var insightFacade: InsightFacade = null;
    var fs = require("fs");

     var data = fs.readFileSync("./test.zip");
     var data1 = fs.readFileSync("./test3.zip");



    beforeEach(function () {
        insightFacade = new InsightFacade();
    });


    it.only("Dataset didn't exist; added successfully", function () {
        fs.unlinkSync('./cache.json');
       return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it.only("Adding invalid dataset", function (done) {
        var data = fs.readFileSync("./README.md");
        insightFacade.addDataset("invalidData", data.toString('base64'))
            .then(function (response) {
                console.log("fail 3");
                expect.fail();
                done();
            })
            .catch(function (err) {
                console.log("In third test");
                expect(err.code).is.equal(400);
                done();
            })
    });

    it.only("remove dataset that is not in the set, error thrown", function () {
        insightFacade.removeDataset("blah")
            .then(function (response) {
                console.log("In remove test");
                expect.fail();
            })
            .catch(function (err) {
                console.log("In remove test");
                expect(err.code).is.equal(424);
            })
    });

    it.only("remove dataset that is in the set", function () {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                console.log("In remove test");
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                console.log("In remove test");
                expect.fail();
            })
    });

    it.only("Dataset does not exist, cache does; added successfully again", function () {
        return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it.only("Dataset exist; replaced successfully ", function () {
        return insightFacade.addDataset("courses", data1.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(201);
            })
            .catch(function (err) {
                expect.fail();
            })
    });


    it.only("Dataset does not exist in cache; added successfully", function () {
        return insightFacade.addDataset("pow", data1.toString('base64'))
            .then(function (response) {
                console.log("First test complete");
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                console.log("fail 1");
                expect.fail();
            })
    });

    it.only("remove dataset that is in the set again", function () {
        insightFacade.removeDataset("pow")
            .then(function (response) {
                console.log("In remove test");
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                console.log("In remove test");
                expect.fail();
            })
    });
    it.only("remove dataset that is in the set again", function () {
        insightFacade.removeDataset("courses")
            .then(function (response) {
                console.log("In remove test");
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                console.log("In remove test");
                expect.fail();
            })
    });

    it.only("Dataset does not exist; added successfully for filter tests ", function () {
        return insightFacade.addDataset("courses", data.toString('base64'))
            .then(function (response) {
                expect(response.code).is.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });


    it.only("LT test: > 65 and order: CoursesAvg", function () {
        let qr: QueryRequest = {
            WHERE: {
                LT: {
                    "courses_avg": 65
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
                expect(response.code).is.equal(200);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it.only("GT Test: <80 and ORDER: courses_avg ", function () {
        let qr : QueryRequest = {
            WHERE: {
                GT: {
                    "courses_avg":80
                }
            },
            OPTIONS: {
                COLUMNS: [
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

    it.only("EQ Test", function () {
        let qr : QueryRequest = {
            WHERE: {
                EQ: {
                    "courses_avg":90
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
            })
    });

    it.only("IS AND Sorting String test", function () {
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


    it.only("AND test", function () {
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

    it.only("OR test", function () {
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

    it.only("AND SORTING NUMBER test", function () {
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

    it.only("AND SORTING STRING test", function () {
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


    it.only("SORT by courses_uuid, special case", function () {
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

    it("Invalid order test", function () {
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