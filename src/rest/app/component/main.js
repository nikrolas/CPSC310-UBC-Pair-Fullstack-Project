

let React = require("react");
let ReactDOM = require("react-dom");
let fetch = require('node-fetch');
let ReactBoot = require('react-bootstrap');
let Nav = require('react-bootstrap').Nav;
let ReactTable = require('react-table').default;
import 'react-table/react-table.css';
import './main.css';

 /*
  * Components
  */




class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            courses_id: "",
            courses_dept: "",
            courses_size: "",
            courses_instructor: "",
            courses_title: "",
            GT: true,
            EQ:false,
            LT:false,
            AND: true,
            OR: false,
            Data:[],
            Columns: [],
            Transform: false,
            TRANSFORMATIONS: {},
            NewColumn: "",
            DisplayTable: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleBooleanParam = this.handleBooleanParam.bind(this);
        this.handleTransform = this.handleTransform.bind(this);
        this.organizeObject = this.organizeObject.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({
            [name]: value
        });
    }

    handleBooleanParam(event) {
        const target = event.target;
        const value = target.value;
        if (value == "LT") {
            this.setState({
                [value]: true,
                GT: false,
                EQ: false
            });
        }
        else if (value == "GT") {
            this.setState({
                [value]: true,
                LT: false,
                EQ: false
            })
        }
        else if (value == "EQ") {
            this.setState({
                [value]: true,
                LT: false,
                GT: false
            });
        }
        else if (value == "AND") {
            this.setState({
                [value]: true,
                OR: false

            });
        }
        else if (value == "OR") {
            this.setState({
                [value]: true,
                AND: false
            });
        }
    }
    handleTransform(event) {
        const target = event.target;
        const value = target.value;
        if(value =="None"){
            this.setState({
                Transform:false
            });
        }
        if (value == "Fail") {
            this.setState({
                Transform:true,
                TRANSFORMATIONS:{
                    GROUP: ["courses_id", "courses_dept"],
                    APPLY: [{
                        "maxfail": {
                            "MAX": "courses_fail"
                        }
                    }]
                },
                NewColumn: "maxfail"
            });
        }
        else if (value == "Pass") {
            this.setState({
                Transform:true,
                TRANSFORMATIONS:{
                    GROUP: ["courses_id", "courses_dept"],
                    APPLY: [{
                        "maxpass": {
                            "MAX": "courses_pass"
                        }
                    }]
                },
                NewColumn: "maxpass"
            });
        }
        else if (value == "Avg") {
            this.setState({
                Transform:true,
                TRANSFORMATIONS:{
                    GROUP: ["courses_id", "courses_dept"],
                    APPLY: [{
                        "avggrade": {
                            "AVG": "courses_avg"
                        }
                    }]
                },
                NewColumn: "avggrade"
            });
        }
    }



    organizeObject() {
        //TODO: Order not specified for now - can add when we get around to it. Delete if not active
        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS:[],
                FORM:"TABLE"
            }
        };
        //Format object according to state

        //Creating and adding options for where

        let newAND = {};
        let newOR = {};
        let newIS = {};
        let newGT = {};
        let newLT = {};
        let newEQ = {};
        let oldObject = this.state;

       // let oldObject = this.state;
        let objectHolder = [];
        //Format object according to state
        if(this.state.Transform) {
            newQuery.WHERE = {IS:{courses_dept:this.state.courses_dept}};
            newQuery["TRANSFORMATIONS"] = this.state.TRANSFORMATIONS;
            newQuery.OPTIONS.COLUMNS = ["courses_dept","courses_id",this.state.NewColumn]; //Setting columns for table
            this.setState({
                Columns:[{
                    header:'Department',
                    accessor: 'courses_dept'
                },{
                    header:'Course Number',
                    accessor: 'courses_id'
                },{
                    header: this.state.NewColumn,
                    accessor: this.state.NewColumn
                }]
            });
        }
        else {
            for (let i in oldObject) {
                if (typeof oldObject[i] == "string" && oldObject[i].length != 0 && i != "NewColumn") {
                    if(i != "courses_size") {
                        newIS = {IS:{[i]:oldObject[i].toLowerCase()}};
                        objectHolder.push(newIS);
                    }
                    else {
                        if(this.state.GT){
                            newGT["GT"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newGT);
                        }
                        else if(this.state.EQ){
                            newEQ["EQ"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newEQ);
                        }
                        else if(this.state.LT){
                            newLT["LT"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newLT);
                        }
                    }
                }
            }
            if (objectHolder.length > 1) {
                if(this.state.AND) {
                    newAND["AND"] = objectHolder;
                    newQuery.WHERE = newAND;

                }
                else if(this.state.OR){
                    newOR["OR"] = objectHolder;
                    newQuery.WHERE = newOR;
                }
            }
            else if(objectHolder.length = 1){
                newQuery.WHERE = objectHolder[0];
                if (typeof newQuery.WHERE == "undefined") {
                    newQuery.WHERE = {};
                }
            }
            newQuery.OPTIONS.COLUMNS = ["courses_size","courses_instructor", "courses_dept","courses_id","courses_title"]; //Setting columns for table
            this.setState({
                Columns:[{
                    header:'Title',
                    accessor: 'courses_title'
                },{
                    header:'Instructor',
                    accessor: 'courses_instructor'
                },{
                    header:'Department',
                    accessor: 'courses_dept'
                },{
                    header:'Course Number',
                    accessor: 'courses_id'
                },{
                    header:'Section Size',
                    accessor: 'courses_size'
                }]
            });
        }
        console.log(newQuery);

        //Adding all to new query
        fetch('http://localhost:4321/query',
            { method: "POST",
                headers: {
                    'Accept' : 'application/json',
                    'Content-type': 'application/json'
                },
                mode:'no-cors',
                body: JSON.stringify(newQuery)})
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    Data: json.result
                });
                console.log(json);
            })
            .catch((error) => {
                console.error(error);
            });
        this.setState({
           Transform:false,
            DisplayTable:true
        });
        console.log(this.state);

    }
    render() {
        const isSizeFilled = this.state.courses_size;
        let sizeDropdown = null;
        if(isSizeFilled) {
            sizeDropdown =
                <select onChange={this.handleBooleanParam} >
                <option value="GT">Greater Than</option>
                <option value="LT">Less Than</option>
                <option value="EQ">Equal To</option>
            </select>
        }
        const isDept = this.state.courses_dept;
        const isNum = this.state.courses_id;
        const isInstruct = this.state.courses_instructor;
        const isTitle = this.state.courses_title;
        let numberDepartmentDropdown = null;
        if(isDept && !isNum && !isInstruct && !isTitle && !isSizeFilled) {
            numberDepartmentDropdown =
                <div>Select Ordering Option:
                    <select onChange={this.handleTransform} >
                        <option value="None">None</option>
                        <option value="Fail">Most Failing Students</option>
                        <option value="Pass">Most Passing Students</option>
                        <option value="Avg">Average Grade</option>
                    </select>
                </div>
        }

        const isTable = this.state.DisplayTable;
        let Table = null;
        if(isTable) {
            Table =
                <ReactTable data={this.state.Data} columns={this.state.Columns} defaultPageSize={10}/>
        }


        return (

            <div>
            <form>
                <label>
                    Course Number:
                    <br />

                    <input
                        name ="courses_id"
                        type="text"
                        placeholder="ex: 210"
                        value ={this.state.courses_id}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    Department:
                    <br />

                    <input
                        name ="courses_dept"
                        type="text"
                        placeholder="ex: CPSC"
                        value={this.state.courses_dept}
                        onChange={this.handleInputChange} />
                </label>
                {numberDepartmentDropdown}
                <br />
                <label>
                    Instructor:
                    <br />

                    <input
                        name ="courses_instructor"
                        type="text"
                        placeholder="ex: young, robin"
                        value ={this.state.courses_instructor}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    Section Size:
                    <br />
                    <input
                        name ="courses_size"
                        type="text"
                        placeholder="ex: 100"
                        value ={this.state.courses_size}
                        onChange={this.handleInputChange} />
                </label>
                {sizeDropdown}
                <br />
                <label>
                    Title:
                    <br />

                    <input
                        name ="courses_title"
                        type="text"
                        placeholder="ex: sftwr constructn"
                        value ={this.state.courses_title}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <select onChange={this.handleBooleanParam}>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
                <br/>
                //TODO: Potential sort by button populated by filled in form w/ Ascending/Descending options
                <br/>
                //TODO: Returning Errors
                <br/>
                //TODO: Transform state for constant ordering option but different department and probably section size as well
                <br/>
                <button type="button" onClick={this.organizeObject}> Compile </button>
            </form>
                {Table}
            </div>

        );
    }
}

class Rooms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms_shortname: "",
            rooms_number: "",
            rooms_seats: "",
            rooms_type: "",
            rooms_furniture: "",
            Distance: "",
            DistanceQuery:[],
            GT: true,
            EQ:false,
            LT:false,
            AND: true,
            OR: false,
            Data:[],
            Columns: [],
            DisplayTable: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleBooleanParam = this.handleBooleanParam.bind(this);
        this.organizeObject = this.organizeObject.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({
            [name]: value
        });
    }

    handleBooleanParam(event) {
        const target = event.target;
        const value = target.value;
        if (value == "LT") {
            this.setState({
                [value]: true,
                GT: false,
                EQ: false
            });
        }
        else if (value == "GT") {
            this.setState({
                [value]: true,
                LT: false,
                EQ: false
            })
        }
        else if (value == "EQ") {
            this.setState({
                [value]: true,
                LT: false,
                GT: false
            });
        }
        else if (value == "AND") {
            this.setState({
                [value]: true,
                OR: false

            });
        }
        else if (value == "OR") {
            this.setState({
                [value]: true,
                AND: false
            });
        }
    }



    organizeObject() {
        //TODO: Order not specified for now - can add when we get around to it. Delete if not active
        if(this.state.Distance != "" && this.state.rooms_shortname != "") {
            let newDistanceQuery = [];
            newDistanceQuery.push(this.state.rooms_shortname);
            newDistanceQuery.push(Number(this.state.Distance));
            fetch('http://localhost:4321/distance',
                { method: "POST",
                    headers: {
                        'Accept' : 'application/json',
                        'Content-type': 'application/json'
                    },
                    mode:'no-cors',
                    body: JSON.stringify(newDistanceQuery)})
                .then((response) => response.json())
                .then((json) => {
                    this.setState({
                        DistanceQuery: json.nearbyBuildings
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }


        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS:[],
                FORM:"TABLE"
            }
        };
        //Format object according to state

        //Creating and adding options for where

        let newAND = {};
        let newOR = {};
        let newIS = {};
        let newGT = {};
        let newLT = {};
        let newEQ = {};
        let oldObject = this.state;

        // let oldObject = this.state;
        let objectHolder = [];
        let ORObjectHolder = [];
        // Checking if optional distance field is filled
        if(this.state.DistanceQuery.length >1) {
            for(let i in this.state.DistanceQuery) {
                for (let j in oldObject) {
                    newIS = {IS:{rooms_shortname:i}};
                    objectHolder.push(newIS);
                    if (typeof oldObject[j] == "string" && oldObject[j].length != 0 && j != "Distance" && j!= "rooms_shortname") {
                        if(j != "rooms_seats") {
                            newIS = {IS:{[j]:oldObject[i].toUpperCase()}};
                            objectHolder.push(newIS);
                        }
                        else {
                            if(this.state.GT){
                                newGT["GT"] = {[j]:Number(oldObject[j])};
                                objectHolder.push(newGT);
                            }
                            else if(this.state.EQ){
                                newEQ["EQ"] = {[j]:Number(oldObject[j])};
                                objectHolder.push(newEQ);
                            }
                            else if(this.state.LT){
                                newLT["LT"] = {[j]:Number(oldObject[j])};
                                objectHolder.push(newLT);
                            }
                        }
                    }
                }
                if (objectHolder.length > 1) {
                    if(this.state.AND) {
                        newAND["AND"] = objectHolder;
                        ORObjectHolder.push(newAND);
                    }
                    else if(this.state.OR){
                        newOR["OR"] = objectHolder;
                        ORObjectHolder.push(newOR);
                    }
                }
                else if(objectHolder.length = 1){
                    ORObjectHolder.push(objectHolder);
                }
            }
            console.log(ORObjectHolder);
            newOR["OR"] = ORObjectHolder;
            newQuery.WHERE = newOR;
        }
        //Format object according to state
            for (let i in oldObject) {
                if (typeof oldObject[i] == "string" && oldObject[i].length != 0 && i != "Distance") {
                    if(i != "rooms_seats") {
                        newIS = {IS:{[i]:oldObject[i].toUpperCase()}};
                        objectHolder.push(newIS);
                    }
                    else {
                        if(this.state.GT){
                            newGT["GT"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newGT);
                        }
                        else if(this.state.EQ){
                            newEQ["EQ"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newEQ);
                        }
                        else if(this.state.LT){
                            newLT["LT"] = {[i]:Number(oldObject[i])};
                            objectHolder.push(newLT);
                        }
                    }
                }
            }
            if (objectHolder.length > 1) {
                if(this.state.AND) {
                    newAND["AND"] = objectHolder;
                    newQuery.WHERE = newAND;

                }
                else if(this.state.OR){
                    newOR["OR"] = objectHolder;
                    newQuery.WHERE = newOR;
                }
            }
            else if(objectHolder.length = 1){
                newQuery.WHERE = objectHolder[0];
                if (typeof newQuery.WHERE == "undefined") {
                    newQuery.WHERE = {};
                }
            }
            newQuery.OPTIONS.COLUMNS = ["rooms_shortname","rooms_number", "rooms_seats","rooms_type","rooms_furniture"]; //Setting columns for table
            this.setState({
                Columns:[{
                    header:'Building Name',
                    accessor: 'rooms_shortname'
                },{
                    header:'Number',
                    accessor: 'rooms_number'
                },{
                    header:'Size',
                    accessor: 'rooms_seats'
                },{
                    header:'Type',
                    accessor: 'rooms_type'
                },{
                    header:'Furniture',
                    accessor: 'rooms_furniture'
                }]
            });
        console.log(newQuery);

        //Adding all to new query
        fetch('http://localhost:4321/query',
            { method: "POST",
                headers: {
                    'Accept' : 'application/json',
                    'Content-type': 'application/json'
                },
                mode:'no-cors',
                body: JSON.stringify(newQuery)})
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    Data: json.result
                });
                console.log(json);
            })
            .catch((error) => {
                console.error(error);
            });
        this.setState({
            DisplayTable:true,
            DistanceQuery:[]
        });
        console.log(this.state);

    }
    render() {
        const isSizeFilled = this.state.rooms_seats;
        let sizeDropdown = null;
        if(isSizeFilled) {
            sizeDropdown =
                <select onChange={this.handleBooleanParam} >
                    <option value="GT">Greater Than</option>
                    <option value="LT">Less Than</option>
                    <option value="EQ">Equal To</option>
                </select>
        }

        const isTable = this.state.DisplayTable;
        let Table = null;
        if(isTable) {
            Table =
                <ReactTable data={this.state.Data} columns={this.state.Columns} defaultPageSize={10}/>
        }
        const isBuilding = this.state.rooms_shortname;
        let closeby = null;
        if(isBuilding) {
            closeby =

                <label>
                    <br/>
                    Optional - Distance of closest rooms in meters:
                    <br />
                    <input
                        name ="Distance"
                        type="text"
                        placeholder="200"
                        value ={this.state.Distance}
                        onChange={this.handleInputChange} />
                </label>
        }

        return (

            <div>
                <form>
                    <label>
                        Building Name:
                        <br />

                        <input
                            name ="rooms_shortname"
                            type="text"
                            placeholder="ex: DMP"
                            value ={this.state.rooms_shortname}
                            onChange={this.handleInputChange} />
                    </label>
                    {closeby}
                    <br />
                    <label>
                        Number:
                        <br />

                        <input
                            name ="rooms_number"
                            type="text"
                            placeholder="ex: 210"
                            value={this.state.rooms_number}
                            onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label>
                        Size:
                        <br />

                        <input
                            name ="rooms_seats"
                            type="text"
                            placeholder="ex: 100"
                            value ={this.state.rooms_seats}
                            onChange={this.handleInputChange} />
                    </label>
                    {sizeDropdown}
                    <br />
                    <label>
                        Type:
                        <br />
                        <input
                            name ="rooms_type"
                            type="text"
                            placeholder="ex: Small Group "
                            value ={this.state.rooms_type}
                            onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label>
                        Furniture:
                        <br />
                        <input
                            name ="rooms_furniture"
                            type="text"
                            placeholder="ex: sftwr constructn"
                            value ={this.state.rooms_furniture}
                            onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <select onChange={this.handleBooleanParam}>
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                    </select>
                    <br/>
                    //TODO: Location
                    <br/>
                    <br/>
                    //TODO: Make everything a dropdown except for number and size?
                    <br/>
                    <button type="button" onClick={this.organizeObject}> Compile </button>
                </form>
                {Table}
            </div>

        );
    }
}

let complete = (
    <div>
        <h1> UBC Insight Query </h1>
        <h2> Courses Query </h2>
        <Form/>
        <h2> Rooms Query </h2>
        <Rooms/>
    </div>
);

 /*
  * Entry point
  */

 ReactDOM.render(
     complete,
   document.getElementById('app')
 );
