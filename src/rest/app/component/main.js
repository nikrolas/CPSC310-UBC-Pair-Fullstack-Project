

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
            newQuery.WHERE = {IS:{courses_dept:this.state.courses_dept.toLowerCase()}};
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
                            newGT["GT"] = {[i]:parseInt(oldObject[i])};
                            objectHolder.push(newGT);
                        }
                        else if(this.state.EQ){
                            newEQ["EQ"] = {[i]:parseInt(oldObject[i])};
                            objectHolder.push(newEQ);
                        }
                        else if(this.state.LT){
                            newLT["LT"] = {[i]:parseInt(oldObject[i])};
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
        let newIS = {};
        let newGT = {};
        let newLT = {};
        let newEQ = {};
        let newORQuery= {};
        let oldObject = this.state;
        let ORObjectHolder = [];
        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS:[],
                FORM:"TABLE"
            }
        };

        if(this.state.Distance != "" && this.state.rooms_shortname != "") {
            let newDistanceQuery = [];
            newDistanceQuery.push(this.state.rooms_shortname);
            newDistanceQuery.push(parseInt(this.state.Distance));
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
                    console.log(json.nearbyBuildings);
                    this.setState({
                        DistanceQuery: json.nearbyBuildings
                    });
                    for(let i in this.state.DistanceQuery) {
                        let objectHolder = [];
                        let newAND = {};
                        let newOR = {};
                        newIS = {IS: {rooms_shortname:this.state.DistanceQuery[i]}};
                        objectHolder.push(newIS);
                        for (let j in oldObject) {
                            if (typeof oldObject[j] == "string" && oldObject[j].length != 0 && j != "Distance" && j!= "rooms_shortname") {
                                if(j != "rooms_seats") {
                                    newIS = {IS:{[j]:oldObject[j]}};
                                    objectHolder.push(newIS);
                                }
                                else {
                                    if(this.state.GT){
                                        newGT["GT"] = {[j]:parseInt(oldObject[j])};
                                        objectHolder.push(newGT);
                                    }
                                    else if(this.state.EQ){
                                        newEQ["EQ"] = {[j]:parseInt(oldObject[j])};
                                        objectHolder.push(newEQ);
                                    }
                                    else if(this.state.LT){
                                        newLT["LT"] = {[j]:parseInt(oldObject[j])};
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
                            ORObjectHolder.push(objectHolder[0]);
                        }
                        console.log(ORObjectHolder);
                    }
                    newORQuery["OR"] = ORObjectHolder;
                    newQuery.WHERE = newORQuery;
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
                            console.log(newQuery);
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
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        else {
            let objectHolder = [];
            let newAND = {};
            let newOR = {};
            for (let i in oldObject) {
                if (typeof oldObject[i] == "string" && oldObject[i].length != 0 && i != "Distance") {
                    console.log(i);
                    if (i != "rooms_seats") {
                        newIS = {IS: {[i]: oldObject[i]}};
                        objectHolder.push(newIS);
                    }
                    else {
                        if (this.state.GT) {
                            newGT["GT"] = {[i]: parseInt(oldObject[i])};
                            objectHolder.push(newGT);
                        }
                        else if (this.state.EQ) {
                            newEQ["EQ"] = {[i]: parseInt(oldObject[i])};
                            objectHolder.push(newEQ);
                        }
                        else if (this.state.LT) {
                            newLT["LT"] = {[i]: parseInt(oldObject[i])};
                            objectHolder.push(newLT);
                        }
                    }
                }
            }
            if (objectHolder.length > 1) {
                if (this.state.AND) {
                    newAND["AND"] = objectHolder;
                    newQuery.WHERE = newAND;

                }
                else if (this.state.OR) {
                    newOR["OR"] = objectHolder;
                    newQuery.WHERE = newOR;
                }
            }
            else if (objectHolder.length = 1) {
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
                    console.log(newQuery);
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
                            placeholder="ex: Classroom-Movable Tables & Chairs"
                            value ={this.state.rooms_furniture}
                            onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <select onChange={this.handleBooleanParam}>
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                    </select>
                    <br/>
                    <button type="button" onClick={this.organizeObject}> Compile </button>
                </form>
                {Table}
            </div>

        );
    }
}
class Schedule extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            courses_id: "",
            courses_dept: "",
            rooms_shortname:"",
            rooms_shortname_query:"",
            Distance:"",
            DistanceQuery:[],
            EITHER_courses:true,
            AND_courses: false,
            EITHER_rooms:true,
            AND_rooms: false,
            Current:[],
            Current_list:[],
            Columns:[{
                header:'Department',
                accessor: 'dept'
            },{
                header:'ID',
                accessor: 'id'
            },{
                header:'Section',
                accessor: 'section'
            },{
                header:'Time',
                accessor: 'time'
            }],
            Columns_list:[{
                header:'Course Name',
                accessor: 'courseName'
            },{
                header:'Max Seats',
                accessor: 'maxSeats'
            },{
                header:'Number of Sections',
                accessor: 'numSections'
            }],
            DisplayTable: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleBooleanParam = this.handleBooleanParam.bind(this);
        this.organizeObject = this.organizeObject.bind(this);
        this.onDropdownSelected = this.onDropdownSelected.bind(this);
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
        if (value == "AND_courses") {
            this.setState({
                [value]: true,
                EITHER_courses:false

            });
        }
        else if (value == "AND_rooms") {
            this.setState({
                [value]: true,
                EITHER_rooms:false

            });
        }

        else if (value == "EITHER_courses") {
            this.setState({
                [value]: true,
                AND_courses: false,
            });
        }
        else if (value == "EITHER_rooms") {
            this.setState({
                [value]: true,
                AND_rooms: false,
            });
        }
        console.log(this.state);
    }

    createSelectItems() {
        let items = [];
        if(this.state.Schedule == null) {
            return;
        }
        else {
            for (let i = 0; i < Object.keys(this.state.Schedule).length; i++) {
                items.push(<option key={Object.keys(this.state.Schedule)[i]} value={Object.keys(this.state.Schedule)[i]}>{Object.keys(this.state.Schedule)[i]}</option>);
                //here I will be creating my options dynamically based on
                //what props are currently passed to the parent component
            }
            return items;
        }
    }

    onDropdownSelected(e) {
        const target = e.target;
        const value = target.value;
        console.log(this.state);
        this.setState ({
            Current: value
        });
        //here you will see the current selected value of the select input
    }

    organizeObject() {
        let newQuery_courses = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "courses_dept","courses_id", "courses_section", "courseSize"
                ],
                ORDER: {
                    dir:"DOWN",
                    keys: ["courses_dept","courses_id", "courseSize"]
                },
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["courses_dept","courses_id", "courses_section"],
                APPLY: [{
                    "courseSize": {
                        MAX: "courses_size"
                    }
                }]
            }
        };

        let newQuery_rooms = {
            WHERE: {},
            OPTIONS:{
                COLUMNS:[
                    "rooms_shortname", "rooms_number", "rooms_seats"
                ],
                ORDER: {
                    dir: "UP",
                    keys: ["rooms_seats"]
                },
                FORM:"TABLE"
            }
        };
        //Format object according to state

        //Creating and adding options for where

        let newAND1 = {};
        let newOR1 = {};
        let newAND2 = {};
        let newOR2 = {};
        let oldObject = this.state;
        let objectHolder =[];


        // let oldObject = this.state;
        //All things to do with courses
        if(oldObject.EITHER_courses) {
            if(oldObject.courses_id == "" && oldObject.courses_dept != "" ) {
                newQuery_courses.WHERE = {AND:[{IS: {courses_dept:oldObject.courses_dept}},{EQ:{"courses_year":2014}}]};
            }
            else if (oldObject.courses_id != "" && oldObject.courses_dept == "" ) {
                newQuery_courses.WHERE = {AND:[{IS: {courses_id:oldObject.courses_id}},{EQ:{"courses_year":2014}}]};
            }
            else {
                objectHolder.push({IS:{courses_id:oldObject.courses_id}});
                objectHolder.push({IS:{courses_dept:oldObject.courses_dept}});
                newOR1["OR"] = objectHolder;
                newQuery_courses.WHERE = {AND:[newOR1,{EQ:{courses_year:2014}}]};;
            }
        }
        else if(oldObject.AND_courses){
            console.log("hit");
            objectHolder.push({IS:{courses_dept:oldObject.courses_dept}});
            objectHolder.push({IS:{courses_id:oldObject.courses_id}});
            newAND1["AND"] = objectHolder;
            newQuery_courses.WHERE = {AND:[newAND1,{EQ:{courses_year:2014}}]};;
        }
        //All things to do with rooms
        if(oldObject.rooms_shortname_query != "" && oldObject.Distance != "") {
            fetch('http://localhost:4321/distance',
                { method: "POST",
                    headers: {
                        'Accept' : 'application/json',
                        'Content-type': 'application/json'
                    },
                    mode:'no-cors',
                    body: JSON.stringify([oldObject.rooms_shortname_query,parseInt(oldObject.Distance)])})
                .then((response) => response.json())
                .then((json) => {
                    let objectHolder1 = [];
                    let ORObjectHolder =[];
                    this.setState({
                        DistanceQuery: json.nearbyBuildings
                    });
                    for(let i in this.state.DistanceQuery) {
                        let newIS = {};
                        newIS = {IS: {rooms_shortname:this.state.DistanceQuery[i]}};
                        ORObjectHolder.push(newIS);
                    }
                    if (oldObject.AND_rooms) {
                        objectHolder1.push({IS:{rooms_shortname:oldObject.rooms_shortname}});
                        objectHolder1.push({OR: ORObjectHolder});
                        newAND2["AND"] = objectHolder1;
                        newQuery_rooms.WHERE = newAND2;
                    }
                    else if(oldObject.EITHER_rooms) {
                        if (oldObject.rooms_shortname == "" && oldObject.rooms_shortname_query != "" && oldObject.Distance != "") {
                            newQuery_rooms.WHERE = {OR:ORObjectHolder};
                        }
                        else {
                            objectHolder1.push({IS:{rooms_shortname:oldObject.rooms_shortname}});
                            objectHolder1.push({OR: ORObjectHolder});
                            newOR2["OR"] = objectHolder1;
                            newQuery_rooms.WHERE = newOR2;
                        }
                    }
                    console.log(newQuery_rooms);
                    console.log(newQuery_courses);
                    let queryArray=[];
                    queryArray.push(newQuery_courses);
                    queryArray.push(newQuery_rooms);
                    console.log(queryArray);
                    console.log("through first");

                    //     Adding all to new query
                    fetch('http://localhost:4321/schedule',
                        { method: "POST",
                            headers: {
                                'Accept' : 'application/json',
                                'Content-type': 'application/json'
                            },
                            mode:'no-cors',
                            body: JSON.stringify(queryArray)})
                        .then((response) => response.json())
                        .then((json) => {
                            let convertArray = [];
                            for(let i = 0; i < Object.keys(json.finalReturnArray[2]).length; i++) {
                                json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]] = {courseName:Object.keys(json.finalReturnArray[2])[i], maxSeats:json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]].maxSeats, numSections:json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]].numSections}
                                convertArray.push(json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]]);
                            }
                            this.setState({
                                Schedule: json.finalReturnArray[0],
                                Quality: json.finalReturnArray[1],
                                List: convertArray,
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

                })
                .catch((error) => {
                    console.error(error);
                });

        }
        else if(oldObject.rooms_shortname != "") {
            newQuery_rooms.WHERE = {IS: {rooms_shortname: oldObject.rooms_shortname}};
            console.log(newQuery_rooms);
            console.log(newQuery_courses);
            let queryArray=[];
            queryArray.push(newQuery_courses);
            queryArray.push(newQuery_rooms);
            console.log(queryArray);
            console.log("through second");


            //     Adding all to new query
            fetch('http://localhost:4321/schedule',
                { method: "POST",
                    headers: {
                        'Accept' : 'application/json',
                        'Content-type': 'application/json'
                    },
                    mode:'no-cors',
                    body: JSON.stringify(queryArray)})
                .then((response) => response.json())
                .then((json) => {
                let convertArray = [];
                for(let i = 0; i < Object.keys(json.finalReturnArray[2]).length; i++) {
                    json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]] = {courseName:Object.keys(json.finalReturnArray[2])[i], maxSeats:json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]].maxSeats, numSections:json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]].numSections}
                    convertArray.push(json.finalReturnArray[2][Object.keys(json.finalReturnArray[2])[i]]);
                }
                    this.setState({
                        Schedule: json.finalReturnArray[0],
                        Quality: json.finalReturnArray[1],
                        List: convertArray,
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
        }

    }
    render() {

        const isTable = this.state.DisplayTable;

        let coursesDropdown = null;
        let quality = null;
        if(isTable) {
            coursesDropdown =
                <select onChange={this.onDropdownSelected}>
                    {this.createSelectItems()}
                </select>
            quality = <p> Quality Measure: {this.state.Quality}
            </p>
        };


        const isDropdown = this.state.Current;
        let Table = null;
        let ListTable = null;
        if(typeof isDropdown == "string") {
            Table =
                <ReactTable data={this.state.Schedule[this.state.Current]} columns={this.state.Columns} defaultPageSize={10}/>;
            ListTable =
                <ReactTable data={this.state.List} columns={this.state.Columns_list} defaultPageSize={10}/>;
        }


        return (

            <div>
                <form>
                    <label>
                        Courses to slot:
                        <br />
                        <input
                            name ="courses_dept"
                            type="text"
                            placeholder="Course Department"
                            value ={this.state.courses_dept}
                            onChange={this.handleInputChange} />
                        <input
                            name ="courses_id"
                            type="text"
                            placeholder="Course Number"
                            value={this.state.courses_id}
                            onChange={this.handleInputChange} />
                    </label>
                    <select onChange={this.handleBooleanParam}>
                        <option value="EITHER_courses">Either</option>
                        <option value="AND_courses">AND</option>
                    </select>
                    <br />
                    <label>
                        Avaliable Rooms:
                        <br />
                        <input
                            name ="rooms_shortname"
                            type="text"
                            placeholder="Building Shortname"
                            value ={this.state.rooms_shortname}
                            onChange={this.handleInputChange} />
                        Closeby Buildings:
                        <input
                            name ="rooms_shortname_query"
                            type="text"
                            placeholder="Building Shortname"
                            value ={this.state.rooms_shortname_query}
                            onChange={this.handleInputChange} />
                        <input
                            name ="Distance"
                            type="text"
                            placeholder="Distance"
                            value ={this.state.Distance}
                            onChange={this.handleInputChange} />
                    </label>
                    <select onChange={this.handleBooleanParam}>
                        <option value="EITHER_rooms">Either</option>
                        <option value="AND_rooms">AND</option>
                    </select>
                    <br/>
                    <button type="button" onClick={this.organizeObject}> Compile </button>
                </form>
                {coursesDropdown}
                {quality}
                {Table}
                {ListTable}
            </div>

        );
    }
}
class Novel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            courses_id: "",
            courses_dept: "",
            Data:[],
            Columns:[{
            header:'Department',
            accessor: 'courses_dept'
        },{
            header:'Course Number',
            accessor: 'courses_id'
        },{
            header:'Instructor',
            accessor: 'courses_instructor'
        },{
                header:'Overall Avg',
                accessor: 'overallAvg'
            }],
            DisplayTable: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);

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






    organizeObject() {
        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS: [
                    "courses_dept","courses_id", "courses_instructor", "overallAvg"
                ],
                FORM: "TABLE"
            },
            TRANSFORMATIONS: {
                GROUP: ["courses_dept","courses_id", "courses_instructor"],
                APPLY: [{"overallAvg":{AVG: "courses_avg"}}]
            }
        };
        //Format object according to state

        //Creating and adding options for where


        let newIS = {};

        // let oldObject = this.state;
        let objectHolder = [];
        //Format object according to state


        if ( this.state.courses_id != "" && this.state.courses_dept != "" ) {
                console.log("hello");
                newIS = {IS:{courses_id:this.state.courses_id}};
                objectHolder.push(newIS);
                newIS = {IS:{courses_dept:this.state.courses_dept.toLowerCase()}};
                objectHolder.push(newIS);
                newQuery.WHERE = {AND: objectHolder};
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

                // let callback = function(professor) {
                //     if (professor === null) {
                //         console.log("No professor found.");
                //         return;
                //     }
                //     console.log("Name: " + professor.fname + " " + professor.lname);
                //     console.log("University: "+ professor.university);
                //     console.log("Quality: " + professor.quality);
                //     console.log("Easiness: " + professor.easiness);
                //     console.log("Helpfulness: " + professor.help);
                //     console.log("Average Grade: " + professor.grade);
                //     console.log("Chili: " + professor.chili);
                //     console.log("URL: " + professor.url);
                //     console.log("First comment: " + professor.comments[0]);
                // };
                //
                // rmp.get("Paul Lynch", callback);

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
        <h2> Scheduler </h2>
        <Schedule/>
        <h2>Enhanced Rate My Prof</h2>
        <Novel/>
    </div>
);

/*
 * Entry point
 */

ReactDOM.render(
    complete,
    document.getElementById('app')
);
