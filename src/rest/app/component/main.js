

let React = require("react");
let ReactDOM = require("react-dom");
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
            data: "temp",
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
        console.log(this.state);
    }

    organizeObject() {
        let newQuery = {
            WHERE: {},
            OPTIONS: {
                COLUMNS:[],
                FORM:"TABLE"
            }
        }
        let oldObject = this.state;
        let newColumn = [];
        for (let i in oldObject) {
            if(oldObject[i] === "") {
                delete oldObject[i];
            }
            else {
                newColumn.push("courses_id")
                console.log ("hit");
            }
        }
        newQuery.OPTIONS.COLUMNS = newColumn;
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
