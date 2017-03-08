/**
 * Created by Nicky on 2017-03-07.
 */

import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/IInsightFacade";

describe("d3Spec", function () {

    let insightFacade: InsightFacade = null;
    let fs = require("fs");

    let dataRooms = fs.readFileSync("./rooms.zip");

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });


//TODO: Working on transformation
    it("Dataset didn't exist; added rooms successfully", function (done) {
        fs.unlinkSync("./cache.json");
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

    //Passing Tests

    it("Transformation Grouping MAX", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        MAX: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                        "maxSeats": 40
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets",
                        "maxSeats": 68
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab",
                        "maxSeats": 72
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                        "maxSeats": 78
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tablets",
                        "maxSeats": 90
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture",
                        "maxSeats": 150
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                        "maxSeats": 350
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                        "maxSeats": 375
                    }, {
                        "rooms_furniture": "Classroom-Movable Tables & Chairs",
                        "maxSeats": 442
                    }, {"rooms_furniture": "Classroom-Fixed Tablets", "maxSeats": 503}]
                });
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });


    it("Transformation Grouping MIN ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        MIN: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                        "maxSeats": 6
                    }, {
                        "rooms_furniture": "Classroom-Movable Tables & Chairs",
                        "maxSeats": 7
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets",
                        "maxSeats": 12
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture",
                        "maxSeats": 16
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                        "maxSeats": 25
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab",
                        "maxSeats": 30
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                        "maxSeats": 56
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tablets",
                        "maxSeats": 60
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                        "maxSeats": 80
                    }, {"rooms_furniture": "Classroom-Moveable Tablets", "maxSeats": 90}]
                });
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Transformation Grouping AVG ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        AVG: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                        "maxSeats": 17.45
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets",
                        "maxSeats": 34.45
                    }, {
                        "rooms_furniture": "Classroom-Movable Tables & Chairs",
                        "maxSeats": 39.27
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture",
                        "maxSeats": 47.63
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab",
                        "maxSeats": 50
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                        "maxSeats": 70.67
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tablets",
                        "maxSeats": 90
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                        "maxSeats": 91.63
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                        "maxSeats": 157.2
                    }, {"rooms_furniture": "Classroom-Fixed Tablets", "maxSeats": 191.88}]
                });
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Transformation Grouping SUM ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        SUM: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Moveable Tablets",
                        "maxSeats": 90
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab",
                        "maxSeats": 150
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                        "maxSeats": 212
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture",
                        "maxSeats": 381
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                        "maxSeats": 506
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets",
                        "maxSeats": 1516
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                        "maxSeats": 1572
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                        "maxSeats": 6231
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tablets",
                        "maxSeats": 6332
                    }, {"rooms_furniture": "Classroom-Movable Tables & Chairs", "maxSeats": 6479}]
                });
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Transformation Grouping COUNT ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: {
                    dir: "DOWN",
                    keys: ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        COUNT: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Movable Tables & Chairs",
                        "maxSeats": 40
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                        "maxSeats": 37
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tablets",
                        "maxSeats": 27
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets",
                        "maxSeats": 18
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                        "maxSeats": 10
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                        "maxSeats": 9
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture",
                        "maxSeats": 6
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab",
                        "maxSeats": 3
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                        "maxSeats": 2
                    }, {"rooms_furniture": "Classroom-Moveable Tablets", "maxSeats": 1}]
                });
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });
    it("Max test with numbers", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats", "maxSeats"
                ],
                ORDER: "rooms_seats",
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_seats"],
                APPLY: [{
                    "maxSeats": {
                        MAX: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_seats":6,"maxSeats":6},{"rooms_seats":7,"maxSeats":7},{"rooms_seats":8,"maxSeats":8},{"rooms_seats":10,"maxSeats":10},{"rooms_seats":12,"maxSeats":12},{"rooms_seats":14,"maxSeats":14},{"rooms_seats":16,"maxSeats":16},{"rooms_seats":18,"maxSeats":18},{"rooms_seats":20,"maxSeats":20},{"rooms_seats":21,"maxSeats":21},{"rooms_seats":22,"maxSeats":22},{"rooms_seats":24,"maxSeats":24},{"rooms_seats":25,"maxSeats":25},{"rooms_seats":26,"maxSeats":26},{"rooms_seats":27,"maxSeats":27},{"rooms_seats":28,"maxSeats":28},{"rooms_seats":29,"maxSeats":29},{"rooms_seats":30,"maxSeats":30},{"rooms_seats":31,"maxSeats":31},{"rooms_seats":32,"maxSeats":32},{"rooms_seats":33,"maxSeats":33},{"rooms_seats":34,"maxSeats":34},{"rooms_seats":35,"maxSeats":35},{"rooms_seats":36,"maxSeats":36},{"rooms_seats":37,"maxSeats":37},{"rooms_seats":38,"maxSeats":38},{"rooms_seats":39,"maxSeats":39},{"rooms_seats":40,"maxSeats":40},{"rooms_seats":41,"maxSeats":41},{"rooms_seats":42,"maxSeats":42},{"rooms_seats":43,"maxSeats":43},{"rooms_seats":44,"maxSeats":44},{"rooms_seats":45,"maxSeats":45},{"rooms_seats":47,"maxSeats":47},{"rooms_seats":48,"maxSeats":48},{"rooms_seats":50,"maxSeats":50},{"rooms_seats":51,"maxSeats":51},{"rooms_seats":53,"maxSeats":53},{"rooms_seats":54,"maxSeats":54},{"rooms_seats":55,"maxSeats":55},{"rooms_seats":56,"maxSeats":56},{"rooms_seats":58,"maxSeats":58},{"rooms_seats":60,"maxSeats":60},{"rooms_seats":62,"maxSeats":62},{"rooms_seats":63,"maxSeats":63},{"rooms_seats":65,"maxSeats":65},{"rooms_seats":66,"maxSeats":66},{"rooms_seats":68,"maxSeats":68},{"rooms_seats":70,"maxSeats":70},{"rooms_seats":72,"maxSeats":72},{"rooms_seats":74,"maxSeats":74},{"rooms_seats":75,"maxSeats":75},{"rooms_seats":76,"maxSeats":76},{"rooms_seats":78,"maxSeats":78},{"rooms_seats":80,"maxSeats":80},{"rooms_seats":84,"maxSeats":84},{"rooms_seats":88,"maxSeats":88},{"rooms_seats":90,"maxSeats":90},{"rooms_seats":94,"maxSeats":94},{"rooms_seats":99,"maxSeats":99},{"rooms_seats":100,"maxSeats":100},{"rooms_seats":102,"maxSeats":102},{"rooms_seats":106,"maxSeats":106},{"rooms_seats":108,"maxSeats":108},{"rooms_seats":112,"maxSeats":112},{"rooms_seats":114,"maxSeats":114},{"rooms_seats":120,"maxSeats":120},{"rooms_seats":123,"maxSeats":123},{"rooms_seats":125,"maxSeats":125},{"rooms_seats":131,"maxSeats":131},{"rooms_seats":136,"maxSeats":136},{"rooms_seats":144,"maxSeats":144},{"rooms_seats":150,"maxSeats":150},{"rooms_seats":154,"maxSeats":154},{"rooms_seats":155,"maxSeats":155},{"rooms_seats":160,"maxSeats":160},{"rooms_seats":167,"maxSeats":167},{"rooms_seats":181,"maxSeats":181},{"rooms_seats":183,"maxSeats":183},{"rooms_seats":187,"maxSeats":187},{"rooms_seats":188,"maxSeats":188},{"rooms_seats":190,"maxSeats":190},{"rooms_seats":200,"maxSeats":200},{"rooms_seats":205,"maxSeats":205},{"rooms_seats":224,"maxSeats":224},{"rooms_seats":225,"maxSeats":225},{"rooms_seats":228,"maxSeats":228},{"rooms_seats":236,"maxSeats":236},{"rooms_seats":240,"maxSeats":240},{"rooms_seats":250,"maxSeats":250},{"rooms_seats":257,"maxSeats":257},{"rooms_seats":260,"maxSeats":260},{"rooms_seats":265,"maxSeats":265},{"rooms_seats":275,"maxSeats":275},{"rooms_seats":280,"maxSeats":280},{"rooms_seats":299,"maxSeats":299},{"rooms_seats":325,"maxSeats":325},{"rooms_seats":350,"maxSeats":350},{"rooms_seats":375,"maxSeats":375},{"rooms_seats":426,"maxSeats":426},{"rooms_seats":442,"maxSeats":442},{"rooms_seats":503,"maxSeats":503}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("GithubTest1", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [{
                    IS: {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    GT: {
                        "rooms_seats": 300
                    }
                }]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname",
                    "maxSeats"
                ],
                ORDER: {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_shortname"],
                APPLY: [{
                    "maxSeats": {
                        MAX: "rooms_seats"
                    }
                }]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_shortname":"OSBO","maxSeats":442},{"rooms_shortname":"HEBB","maxSeats":375},{"rooms_shortname":"LSC","maxSeats":350}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("GithubTest2", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture"
                ],
                ORDER: "rooms_furniture",
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: []
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs"},{"rooms_furniture":"Classroom-Fixed Tablets"},{"rooms_furniture":"Classroom-Hybrid Furniture"},{"rooms_furniture":"Classroom-Learn Lab"},{"rooms_furniture":"Classroom-Movable Tables & Chairs"},{"rooms_furniture":"Classroom-Movable Tablets"},{"rooms_furniture":"Classroom-Moveable Tables & Chairs"},{"rooms_furniture":"Classroom-Moveable Tablets"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    //Failing Tests
    //NEW APPLY keys are not allowed to contain the _ character.

    it("Invalid Apply key in Group", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: "rooms_furniture",
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture", "maxSeats"],
                APPLY: []
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
    it("Invalid empty apply and group", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats"
                ],
                ORDER: "rooms_furniture",
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: [],
                APPLY: []
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
    it("invalid apply not found in columns", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [{
                    IS: {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    GT: {
                        "rooms_seats": 300
                    }
                }]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname",
                    "maxSeats"
                ],
                ORDER: {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_shortname"],
                APPLY: [{
                    "maxeats": {
                        MAX: "rooms_seats"
                    }
                }]
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

    it("invalid columns missing", function (done) {
        let qr: QueryRequest = {
            WHERE: {
                AND: [{
                    IS: {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    GT: {
                        "rooms_seats": 300
                    }
                }]
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname",
                    "maxSeats"
                ],
                ORDER: {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_shortname","rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        MAX: "rooms_seats"
                    }
                }]
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