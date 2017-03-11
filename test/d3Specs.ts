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
    let dataCourses = fs.readFileSync("./courses.zip");

    before(function () {
        if (fs.existsSync("./cache.json")) {
            fs.unlinkSync("./cache.json");
        }
    });

    beforeEach(function () {
        insightFacade = new InsightFacade();
    });


//TODO: Working on transformation
    it("Dataset didn't exist; added courses successfully", function (done) {
        insightFacade.addDataset("courses", dataCourses.toString('base64'))
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

    // Failing Tests
    it("courses_ID", function (done) {
        let qr: QueryRequest ={
            WHERE:{
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_id"
                ],
                ORDER:{
                    "dir": "DOWN",
                    "keys": ["courses_id"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["courses_id"],
                APPLY: []
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"courses_id":"724"},{"courses_id":"722"},{"courses_id":"721"},{"courses_id":"699"},{"courses_id":"698"},{"courses_id":"695"},{"courses_id":"693"},{"courses_id":"684"},{"courses_id":"683"},{"courses_id":"682"},{"courses_id":"672"},{"courses_id":"671"},{"courses_id":"662"},{"courses_id":"660"},{"courses_id":"657"},{"courses_id":"654"},{"courses_id":"640"},{"courses_id":"635"},{"courses_id":"634"},{"courses_id":"632"},{"courses_id":"628"},{"courses_id":"627"},{"courses_id":"626"},{"courses_id":"621"},{"courses_id":"620"},{"courses_id":"607"},{"courses_id":"606"},{"courses_id":"603"},{"courses_id":"602"},{"courses_id":"601"},{"courses_id":"600"},{"courses_id":"599"},{"courses_id":"598"},{"courses_id":"597"},{"courses_id":"596"},{"courses_id":"595"},{"courses_id":"594"},{"courses_id":"593"},{"courses_id":"592"},{"courses_id":"591"},{"courses_id":"590"},{"courses_id":"589"},{"courses_id":"588"},{"courses_id":"587"},{"courses_id":"586"},{"courses_id":"585"},{"courses_id":"584"},{"courses_id":"583"},{"courses_id":"582"},{"courses_id":"581"},{"courses_id":"580"},{"courses_id":"579"},{"courses_id":"578"},{"courses_id":"577"},{"courses_id":"576"},{"courses_id":"575"},{"courses_id":"574"},{"courses_id":"573"},{"courses_id":"572"},{"courses_id":"571"},{"courses_id":"570"},{"courses_id":"569"},{"courses_id":"568"},{"courses_id":"567"},{"courses_id":"566"},{"courses_id":"565"},{"courses_id":"564"},{"courses_id":"563"},{"courses_id":"562"},{"courses_id":"561"},{"courses_id":"560"},{"courses_id":"559"},{"courses_id":"558"},{"courses_id":"557"},{"courses_id":"556"},{"courses_id":"555"},{"courses_id":"554"},{"courses_id":"553"},{"courses_id":"552"},{"courses_id":"551"},{"courses_id":"550"},{"courses_id":"549"},{"courses_id":"548"},{"courses_id":"547"},{"courses_id":"546"},{"courses_id":"545"},{"courses_id":"544"},{"courses_id":"543"},{"courses_id":"542"},{"courses_id":"541"},{"courses_id":"540"},{"courses_id":"539"},{"courses_id":"538"},{"courses_id":"537"},{"courses_id":"536"},{"courses_id":"535"},{"courses_id":"534"},{"courses_id":"533"},{"courses_id":"532"},{"courses_id":"531"},{"courses_id":"530"},{"courses_id":"529"},{"courses_id":"528"},{"courses_id":"527"},{"courses_id":"526"},{"courses_id":"525"},{"courses_id":"524"},{"courses_id":"523"},{"courses_id":"522"},{"courses_id":"521"},{"courses_id":"520"},{"courses_id":"519"},{"courses_id":"518"},{"courses_id":"517"},{"courses_id":"516"},{"courses_id":"515"},{"courses_id":"514"},{"courses_id":"513"},{"courses_id":"512"},{"courses_id":"511"},{"courses_id":"510"},{"courses_id":"509"},{"courses_id":"508"},{"courses_id":"507"},{"courses_id":"506"},{"courses_id":"505"},{"courses_id":"504"},{"courses_id":"503"},{"courses_id":"502"},{"courses_id":"501"},{"courses_id":"500"},{"courses_id":"499"},{"courses_id":"498"},{"courses_id":"497"},{"courses_id":"496"},{"courses_id":"495"},{"courses_id":"494"},{"courses_id":"493"},{"courses_id":"492"},{"courses_id":"491"},{"courses_id":"490"},{"courses_id":"489"},{"courses_id":"488"},{"courses_id":"487"},{"courses_id":"486"},{"courses_id":"485"},{"courses_id":"484"},{"courses_id":"483"},{"courses_id":"482"},{"courses_id":"481"},{"courses_id":"480"},{"courses_id":"479"},{"courses_id":"478"},{"courses_id":"477"},{"courses_id":"476"},{"courses_id":"475"},{"courses_id":"474"},{"courses_id":"473"},{"courses_id":"472"},{"courses_id":"471"},{"courses_id":"470"},{"courses_id":"469"},{"courses_id":"468"},{"courses_id":"467"},{"courses_id":"466"},{"courses_id":"465"},{"courses_id":"464"},{"courses_id":"463"},{"courses_id":"462"},{"courses_id":"461"},{"courses_id":"460"},{"courses_id":"459"},{"courses_id":"458"},{"courses_id":"457"},{"courses_id":"456"},{"courses_id":"455"},{"courses_id":"454"},{"courses_id":"453"},{"courses_id":"452"},{"courses_id":"451"},{"courses_id":"450"},{"courses_id":"449"},{"courses_id":"448"},{"courses_id":"447"},{"courses_id":"446"},{"courses_id":"445"},{"courses_id":"444"},{"courses_id":"443"},{"courses_id":"442"},{"courses_id":"441"},{"courses_id":"440"},{"courses_id":"439"},{"courses_id":"438"},{"courses_id":"437"},{"courses_id":"436"},{"courses_id":"435"},{"courses_id":"434"},{"courses_id":"433"},{"courses_id":"432"},{"courses_id":"431"},{"courses_id":"430"},{"courses_id":"429"},{"courses_id":"428"},{"courses_id":"427"},{"courses_id":"426"},{"courses_id":"425"},{"courses_id":"424"},{"courses_id":"423"},{"courses_id":"422"},{"courses_id":"421"},{"courses_id":"420"},{"courses_id":"419"},{"courses_id":"418"},{"courses_id":"417"},{"courses_id":"416"},{"courses_id":"415"},{"courses_id":"414"},{"courses_id":"413"},{"courses_id":"412"},{"courses_id":"411"},{"courses_id":"410"},{"courses_id":"409"},{"courses_id":"408"},{"courses_id":"407"},{"courses_id":"406"},{"courses_id":"405"},{"courses_id":"404"},{"courses_id":"403"},{"courses_id":"402"},{"courses_id":"401"},{"courses_id":"400"},{"courses_id":"399"},{"courses_id":"398"},{"courses_id":"397"},{"courses_id":"396"},{"courses_id":"395"},{"courses_id":"394"},{"courses_id":"393"},{"courses_id":"392"},{"courses_id":"391"},{"courses_id":"390"},{"courses_id":"389"},{"courses_id":"388"},{"courses_id":"387"},{"courses_id":"386"},{"courses_id":"385"},{"courses_id":"384"},{"courses_id":"383"},{"courses_id":"382"},{"courses_id":"381"},{"courses_id":"380"},{"courses_id":"379"},{"courses_id":"378"},{"courses_id":"377"},{"courses_id":"376"},{"courses_id":"375"},{"courses_id":"374"},{"courses_id":"373"},{"courses_id":"372"},{"courses_id":"371"},{"courses_id":"370"},{"courses_id":"369"},{"courses_id":"368"},{"courses_id":"367"},{"courses_id":"366"},{"courses_id":"365"},{"courses_id":"364"},{"courses_id":"363"},{"courses_id":"362"},{"courses_id":"361"},{"courses_id":"360"},{"courses_id":"359"},{"courses_id":"358"},{"courses_id":"357"},{"courses_id":"356"},{"courses_id":"355"},{"courses_id":"354"},{"courses_id":"353"},{"courses_id":"352"},{"courses_id":"351"},{"courses_id":"350"},{"courses_id":"349"},{"courses_id":"348"},{"courses_id":"347"},{"courses_id":"346"},{"courses_id":"345"},{"courses_id":"344"},{"courses_id":"343"},{"courses_id":"342"},{"courses_id":"341"},{"courses_id":"340"},{"courses_id":"339"},{"courses_id":"338"},{"courses_id":"337"},{"courses_id":"336"},{"courses_id":"335"},{"courses_id":"334"},{"courses_id":"333"},{"courses_id":"332"},{"courses_id":"331"},{"courses_id":"330"},{"courses_id":"329"},{"courses_id":"328"},{"courses_id":"327"},{"courses_id":"326"},{"courses_id":"325"},{"courses_id":"324"},{"courses_id":"323"},{"courses_id":"322"},{"courses_id":"321"},{"courses_id":"320"},{"courses_id":"319"},{"courses_id":"318"},{"courses_id":"317"},{"courses_id":"316"},{"courses_id":"315"},{"courses_id":"314"},{"courses_id":"313"},{"courses_id":"312"},{"courses_id":"311"},{"courses_id":"310"},{"courses_id":"309"},{"courses_id":"308"},{"courses_id":"307"},{"courses_id":"306"},{"courses_id":"305"},{"courses_id":"304"},{"courses_id":"303"},{"courses_id":"302"},{"courses_id":"301"},{"courses_id":"300"},{"courses_id":"298"},{"courses_id":"296"},{"courses_id":"295"},{"courses_id":"294"},{"courses_id":"293"},{"courses_id":"292"},{"courses_id":"291"},{"courses_id":"290"},{"courses_id":"285"},{"courses_id":"284"},{"courses_id":"282"},{"courses_id":"281"},{"courses_id":"280"},{"courses_id":"279"},{"courses_id":"278"},{"courses_id":"276"},{"courses_id":"275"},{"courses_id":"274"},{"courses_id":"273"},{"courses_id":"272"},{"courses_id":"271"},{"courses_id":"270"},{"courses_id":"265"},{"courses_id":"264"},{"courses_id":"263"},{"courses_id":"262"},{"courses_id":"261"},{"courses_id":"260"},{"courses_id":"259"},{"courses_id":"257"},{"courses_id":"256"},{"courses_id":"255"},{"courses_id":"254"},{"courses_id":"253"},{"courses_id":"252"},{"courses_id":"251"},{"courses_id":"250"},{"courses_id":"249"},{"courses_id":"245"},{"courses_id":"244"},{"courses_id":"243"},{"courses_id":"241"},{"courses_id":"240"},{"courses_id":"239"},{"courses_id":"238"},{"courses_id":"236"},{"courses_id":"235"},{"courses_id":"234"},{"courses_id":"233"},{"courses_id":"232"},{"courses_id":"231"},{"courses_id":"230"},{"courses_id":"229"},{"courses_id":"228"},{"courses_id":"227"},{"courses_id":"226"},{"courses_id":"225"},{"courses_id":"224"},{"courses_id":"223"},{"courses_id":"222"},{"courses_id":"221"},{"courses_id":"220"},{"courses_id":"219"},{"courses_id":"218"},{"courses_id":"217"},{"courses_id":"216"},{"courses_id":"215"},{"courses_id":"214"},{"courses_id":"213"},{"courses_id":"212"},{"courses_id":"211"},{"courses_id":"210"},{"courses_id":"209"},{"courses_id":"208"},{"courses_id":"207"},{"courses_id":"206"},{"courses_id":"205"},{"courses_id":"204"},{"courses_id":"203"},{"courses_id":"202"},{"courses_id":"201"},{"courses_id":"200"},{"courses_id":"191"},{"courses_id":"190"},{"courses_id":"184"},{"courses_id":"183"},{"courses_id":"182"},{"courses_id":"180"},{"courses_id":"178"},{"courses_id":"173"},{"courses_id":"172"},{"courses_id":"171"},{"courses_id":"170"},{"courses_id":"167"},{"courses_id":"164"},{"courses_id":"163"},{"courses_id":"161"},{"courses_id":"160"},{"courses_id":"159"},{"courses_id":"158"},{"courses_id":"157"},{"courses_id":"155"},{"courses_id":"154"},{"courses_id":"153"},{"courses_id":"152"},{"courses_id":"151"},{"courses_id":"150"},{"courses_id":"149"},{"courses_id":"148"},{"courses_id":"141"},{"courses_id":"140"},{"courses_id":"135"},{"courses_id":"131"},{"courses_id":"130"},{"courses_id":"127"},{"courses_id":"126"},{"courses_id":"125"},{"courses_id":"123"},{"courses_id":"122"},{"courses_id":"121"},{"courses_id":"120"},{"courses_id":"119"},{"courses_id":"118"},{"courses_id":"117"},{"courses_id":"116"},{"courses_id":"115"},{"courses_id":"114"},{"courses_id":"113"},{"courses_id":"112"},{"courses_id":"111"},{"courses_id":"110"},{"courses_id":"109"},{"courses_id":"108"},{"courses_id":"107"},{"courses_id":"106"},{"courses_id":"105"},{"courses_id":"104"},{"courses_id":"103"},{"courses_id":"102"},{"courses_id":"101"},{"courses_id":"100"}]});
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Tie Breaker", function (done) {
        let qr: QueryRequest = {
            WHERE:{
            },
            OPTIONS: {
                COLUMNS: [
                    "rooms_shortname",
                    "maxSeats"
                ],
                ORDER:{
                    "dir": "DOWN",
                    "keys": ["maxSeats","rooms_shortname"]
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
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_shortname":"WOOD","maxSeats":503},{"rooms_shortname":"OSBO","maxSeats":442},{"rooms_shortname":"CIRS","maxSeats":426},{"rooms_shortname":"HEBB","maxSeats":375},{"rooms_shortname":"LSC","maxSeats":350},{"rooms_shortname":"ESB","maxSeats":350},{"rooms_shortname":"WESB","maxSeats":325},{"rooms_shortname":"SRC","maxSeats":299},{"rooms_shortname":"SCRF","maxSeats":280},{"rooms_shortname":"BUCH","maxSeats":275},{"rooms_shortname":"CHEM","maxSeats":265},{"rooms_shortname":"ANGU","maxSeats":260},{"rooms_shortname":"HENN","maxSeats":257},{"rooms_shortname":"FSC","maxSeats":250},{"rooms_shortname":"PHRM","maxSeats":236},{"rooms_shortname":"BIOL","maxSeats":228},{"rooms_shortname":"GEOG","maxSeats":225},{"rooms_shortname":"MATH","maxSeats":224},{"rooms_shortname":"LSK","maxSeats":205},{"rooms_shortname":"MCML","maxSeats":200},{"rooms_shortname":"CHBE","maxSeats":200},{"rooms_shortname":"SWNG","maxSeats":190},{"rooms_shortname":"FRDM","maxSeats":160},{"rooms_shortname":"DMP","maxSeats":160},{"rooms_shortname":"IBLC","maxSeats":154},{"rooms_shortname":"AERL","maxSeats":144},{"rooms_shortname":"MCLD","maxSeats":136},{"rooms_shortname":"MATX","maxSeats":106},{"rooms_shortname":"IONA","maxSeats":100},{"rooms_shortname":"CEME","maxSeats":100},{"rooms_shortname":"FNH","maxSeats":99},{"rooms_shortname":"LASR","maxSeats":94},{"rooms_shortname":"ALRD","maxSeats":94},{"rooms_shortname":"ANSO","maxSeats":90},{"rooms_shortname":"ORCH","maxSeats":72},{"rooms_shortname":"BRKX","maxSeats":70},{"rooms_shortname":"SOWK","maxSeats":68},{"rooms_shortname":"SPPH","maxSeats":66},{"rooms_shortname":"FORW","maxSeats":63},{"rooms_shortname":"UCLL","maxSeats":55},{"rooms_shortname":"EOSM","maxSeats":50},{"rooms_shortname":"PCOH","maxSeats":40},{"rooms_shortname":"MGYM","maxSeats":40},{"rooms_shortname":"AUDX","maxSeats":21}]});
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("PiazzaTest", function (done) {
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
                ORDER:
                    "maxSeats"
                ,
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
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_shortname":"LSC","maxSeats":350},{"rooms_shortname":"HEBB","maxSeats":375},{"rooms_shortname":"OSBO","maxSeats":442}]});
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });

    it("Keys numbers", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_seats"
                ],
                ORDER: {
                    dir: "DOWN",
                    keys: ["rooms_seats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_seats"],
                APPLY: []
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_seats":503},{"rooms_seats":442},{"rooms_seats":426},{"rooms_seats":375},{"rooms_seats":350},{"rooms_seats":325},{"rooms_seats":299},{"rooms_seats":280},{"rooms_seats":275},{"rooms_seats":265},{"rooms_seats":260},{"rooms_seats":257},{"rooms_seats":250},{"rooms_seats":240},{"rooms_seats":236},{"rooms_seats":228},{"rooms_seats":225},{"rooms_seats":224},{"rooms_seats":205},{"rooms_seats":200},{"rooms_seats":190},{"rooms_seats":188},{"rooms_seats":187},{"rooms_seats":183},{"rooms_seats":181},{"rooms_seats":167},{"rooms_seats":160},{"rooms_seats":155},{"rooms_seats":154},{"rooms_seats":150},{"rooms_seats":144},{"rooms_seats":136},{"rooms_seats":131},{"rooms_seats":125},{"rooms_seats":123},{"rooms_seats":120},{"rooms_seats":114},{"rooms_seats":112},{"rooms_seats":108},{"rooms_seats":106},{"rooms_seats":102},{"rooms_seats":100},{"rooms_seats":99},{"rooms_seats":94},{"rooms_seats":90},{"rooms_seats":88},{"rooms_seats":84},{"rooms_seats":80},{"rooms_seats":78},{"rooms_seats":76},{"rooms_seats":75},{"rooms_seats":74},{"rooms_seats":72},{"rooms_seats":70},{"rooms_seats":68},{"rooms_seats":66},{"rooms_seats":65},{"rooms_seats":63},{"rooms_seats":62},{"rooms_seats":60},{"rooms_seats":58},{"rooms_seats":56},{"rooms_seats":55},{"rooms_seats":54},{"rooms_seats":53},{"rooms_seats":51},{"rooms_seats":50},{"rooms_seats":48},{"rooms_seats":47},{"rooms_seats":45},{"rooms_seats":44},{"rooms_seats":43},{"rooms_seats":42},{"rooms_seats":41},{"rooms_seats":40},{"rooms_seats":39},{"rooms_seats":38},{"rooms_seats":37},{"rooms_seats":36},{"rooms_seats":35},{"rooms_seats":34},{"rooms_seats":33},{"rooms_seats":32},{"rooms_seats":31},{"rooms_seats":30},{"rooms_seats":29},{"rooms_seats":28},{"rooms_seats":27},{"rooms_seats":26},{"rooms_seats":25},{"rooms_seats":24},{"rooms_seats":22},{"rooms_seats":21},{"rooms_seats":20},{"rooms_seats":18},{"rooms_seats":16},{"rooms_seats":14},{"rooms_seats":12},{"rooms_seats":10},{"rooms_seats":8},{"rooms_seats":7},{"rooms_seats":6}]});
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            })
    });
    //Passing Tests
    it("Keys not in column", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture"
                ],
                ORDER: {
                    dir: "DOWN",
                    keys: ["ksdfa"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: []
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect.fail();
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_furniture":"Classroom-Moveable Tablets"},{"rooms_furniture":"Classroom-Moveable Tables & Chairs"},{"rooms_furniture":"Classroom-Movable Tablets"},{"rooms_furniture":"Classroom-Movable Tables & Chairs"},{"rooms_furniture":"Classroom-Learn Lab"},{"rooms_furniture":"Classroom-Hybrid Furniture"},{"rooms_furniture":"Classroom-Fixed Tablets"},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs"}]});
                done();
            })
            .catch(function (err) {
                expect(err.code).equal(400);
                done();
            })
    });

    it("Empty apply ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture"
                ],
                ORDER: {
                    dir: "DOWN",
                    keys: ["rooms_furniture"]
                },
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
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_furniture":"Classroom-Moveable Tablets"},{"rooms_furniture":"Classroom-Moveable Tables & Chairs"},{"rooms_furniture":"Classroom-Movable Tablets"},{"rooms_furniture":"Classroom-Movable Tables & Chairs"},{"rooms_furniture":"Classroom-Learn Lab"},{"rooms_furniture":"Classroom-Hybrid Furniture"},{"rooms_furniture":"Classroom-Fixed Tablets"},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs"}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });
    it("Should be able to querty with more than one apply key ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats", "avgSeats"
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
                },
                    {"avgSeats": {
                        AVG: "rooms_seats"
                    }}]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_furniture":"Classroom-Moveable Tables & Chairs","maxSeats":40,"avgSeats":17.45},{"rooms_furniture":"Classroom-Movable Tablets","maxSeats":68,"avgSeats":34.45},{"rooms_furniture":"Classroom-Learn Lab","maxSeats":72,"avgSeats":50},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs","maxSeats":78,"avgSeats":70.67},{"rooms_furniture":"Classroom-Moveable Tablets","maxSeats":90,"avgSeats":90},{"rooms_furniture":"Classroom-Hybrid Furniture","maxSeats":150,"avgSeats":47.63},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","maxSeats":350,"avgSeats":91.63},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","maxSeats":375,"avgSeats":157.2},{"rooms_furniture":"Classroom-Movable Tables & Chairs","maxSeats":442,"avgSeats":39.27},{"rooms_furniture":"Classroom-Fixed Tablets","maxSeats":503,"avgSeats":191.88}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

    it("Should be able to query with more than one apply key, sort by average ", function (done) {
        let qr: QueryRequest = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "rooms_furniture", "maxSeats", "avgSeats"
                ],
                ORDER: {
                    dir: "DOWN",
                    keys: ["avgSeats"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["rooms_furniture"],
                APPLY: [{
                    "maxSeats": {
                        MAX: "rooms_seats"
                    }
                },
                    {"avgSeats": {
                        AVG: "rooms_seats"
                    }}]
            }
        };
        insightFacade.performQuery(qr)
            .then(function (response) {
                expect(response.code).is.equal(200);
                expect(response.body).to.deep.equal({"render":"TABLE","result":[{"rooms_furniture":"Classroom-Fixed Tablets","maxSeats":503,"avgSeats":191.88},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","maxSeats":375,"avgSeats":157.2},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","maxSeats":350,"avgSeats":91.63},{"rooms_furniture":"Classroom-Moveable Tablets","maxSeats":90,"avgSeats":90},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs","maxSeats":78,"avgSeats":70.67},{"rooms_furniture":"Classroom-Learn Lab","maxSeats":72,"avgSeats":50},{"rooms_furniture":"Classroom-Hybrid Furniture","maxSeats":150,"avgSeats":47.63},{"rooms_furniture":"Classroom-Movable Tables & Chairs","maxSeats":442,"avgSeats":39.27},{"rooms_furniture":"Classroom-Movable Tablets","maxSeats":68,"avgSeats":34.45},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","maxSeats":40,"avgSeats":17.45}]});
                done();
            })
            .catch(function () {
                expect.fail();
                done();
            })
    });

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