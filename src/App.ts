/**
 * Starts the server. It is unlikely you will have to change anything here.
 */
import Server from './rest/Server';
import Log from './Util';
import InsightFacade from "./controller/InsightFacade";

/**
 * Starts the server; doesn't listen to whether the start was successful.
 */
export class App {
    public initServer(port: number) {
        Log.info('App::initServer( ' + port + ' ) - start');

        let s = new Server(port);
        s.start().then(function (val: boolean) {
            Log.info("App::initServer() - started: " + val);
        }).catch(function (err: Error) {
            Log.error("App::initServer() - ERROR: " + err.message);
        });
    }
}

// This ends up starting the whole system and listens on a hardcoded port (4321)
Log.info('App - starting');
let is = new InsightFacade();
let fs = require('fs');
let app = new App();
app.initServer(4321);
is.addDataset("courses", fs.readFileSync("./courses.zip").toString('base64'))
    .then(function () {
        Log.info('Courses added')
    })
    .catch(function () {
        Log.info('Courses failed');
    });
is.addDataset("rooms", fs.readFileSync("./rooms.zip").toString('base64'))
    .then(function () {
        Log.info('Rooms added')
    })
    .catch(function () {
        Log.info('Rooms failed');
    });