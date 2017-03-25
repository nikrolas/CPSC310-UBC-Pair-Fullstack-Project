

let React = require("react");
let ReactDOM = require("react-dom");
let bs = require('react-bootstrap');
let fetch = require('node-fetch');

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
            GT: false,
            EQ:false,
            LT:false,
            AND: true,
            OR: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleBooleanParam = this.handleBooleanParam.bind(this);
        this.organizeObject = this.organizeObject.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        console.log(target);

        const name = target.name;
        const value = target.value;
        this.setState({
            [name]: value
        });
    }

    handleBooleanParam(event) {
        const target = event.target;
        const value = target.value;
        console.log(target);
        console.log(value);
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
        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS:["courses_size","courses_instructor", "courses_dept","courses_id","courses_uuid"],
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
        for (let i in oldObject) {
            if (typeof oldObject[i] == "string" && oldObject[i].length != 0) {
                if(i != "courses_size") {
                    newIS["IS"] = {[i]:oldObject[i].toLowerCase()};
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
                newAND["AND"] = objectHolder
                newQuery.WHERE = newAND;

            }
            else if(this.state.OR){
                newOR["OR"] = objectHolder
                newQuery.WHERE = newOR;

            }
        }
        else {
            newQuery.WHERE = objectHolder[0];

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
                console.log(json);
                return json;
            })
            .catch((error) => {
                console.error(error);
            });

        console.log(this.state);

    }
    render() {
        return (
            <form>
                <label>
                    courses_id:
                    <br />

                    <input
                        name ="courses_id"
                        type="text"
                        value ={this.state.courses_id}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    courses_dept:
                    <br />

                    <input
                        name ="courses_dept"
                        type="text"
                        value={this.state.courses_dept}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    courses_instructor:
                    <br />

                    <input
                        name ="courses_instructor"
                        type="text"
                        value ={this.state.courses_instructor}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    courses_size:
                    <br />
                    <input
                        name ="courses_size"
                        type="text"
                        value ={this.state.courses_size}
                        onChange={this.handleInputChange} />
                </label>
                //TODO: Display on fill
                    <select onChange={this.handleBooleanParam} >
                        <option value="GT">Greater Than</option>
                        <option value="LT">Less Than</option>
                        <option value="EQ">Equal To</option>
                    </select>
                <br />
                <label>
                    courses_title:
                    <br />

                    <input
                        name ="courses_title"
                        type="text"
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
                <button type="button" onClick={this.organizeObject}> Compile </button>
            </form>
        );
    }
}


 /*
  * Entry point
  */

 ReactDOM.render(
     <Form/>,
   document.getElementById('app')
 );
