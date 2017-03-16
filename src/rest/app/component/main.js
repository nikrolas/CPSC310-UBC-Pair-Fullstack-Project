

var React = require("react");
var ReactDOM = require("react-dom");
var FormData = require("react-form-data");
/*
 * Components
 */

 /*
  * Components
  */

 var ContactItem = React.createClass({
   propTypes: {
     courses_id: React.PropTypes.string,
     courses_dept: React.PropTypes.string,
     courses_size: React.PropTypes.string, //might be number
     courses_instructor: React.PropTypes.string,
     courses_title: React.PropTypes.string,
   },

   render: function() {
     return (
       React.createElement('li', {className: 'ContactItem'},
         React.createElement('h2', {className: 'ContactItem-name'}, this.props.courses_id),
         React.createElement('a', {className: 'ContactItem-email', href: 'mailto:'+this.props.email}, this.props.courses_dept),
         React.createElement('div', {className: 'ContactItem-description'}, this.props.description)
       )
     );
   },
 });

 var ContactForm = React.createClass({
   propTypes: {
     value: React.PropTypes.object.isRequired,
     onChange: React.PropTypes.func.isRequired,
   },

   render: function() {
     var oldQuery = this.props.value;
     var onChange = this.props.onChange;
     var AND_array = [];
     var OR_array = []

     return (
       React.createElement('form', {
         className: 'ContactForm',
     },
         React.createElement('input', {
           type: 'text',
           placeholder: 'Section Size',
           value: this.props.value.courses,
           onSubmit: function(e) {
               onSubmit(AND_array.push({courses_size: e.target.value}));


           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Department',
           value: this.props.value.email,
           onChange: function(e) {
             onChange(Object.assign(oldQuery, {courses_dept: e.target.value}));
           },
         }),
         React.createElement('input', {
           placeholder: 'Course Number',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign(oldQuery, {courses_id: e.target.value}));
           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Instructor',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign(oldQuery, {courses_instructor: e.target.value}));
           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Title',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign(oldQuery, {courses_title: e.target.value}));
           },
         }),
         React.createElement('button', {
           type: 'submit',
           formMethod: 'post',
           formAction: 'http://localhost:4321'

         }, "Submit")
       )
     );
   },
 });

 var ContactView = React.createClass({
   propTypes: {
     newQuery: React.PropTypes.object.isRequired,
   },

   render: function() {

     return (
         React.createElement(ContactForm, {
           value: this.props.newQuery,
           onChange: function(query) { console.log(query); },
         })
       )
   },
 });


 /*
  * Model
  */



 var newQuery = {WHERE: {}, OPTIONS : {COLUMNS:[],FORM:"TABLE"}};


 /*
  * Entry point
  */

 ReactDOM.render(
   React.createElement(ContactView, {
     newQuery: newQuery,
   }),
   document.getElementById('app')
 );
