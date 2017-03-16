
var React = require("react");
var ReactDOM = require("react-dom");

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
     var oldContact = this.props.value;
     var onChange = this.props.onChange;

     return (
       React.createElement('form', {className: 'ContactForm'},
         React.createElement('input', {
           type: 'text',
           placeholder: 'Section Size',
           value: this.props.value.courses,
           onChange: function(e) {
             onChange(Object.assign({}, oldContact, {courses_size: e.target.value}));  //TODO: not sure what section size is
           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Department',
           value: this.props.value.email,
           onChange: function(e) {
             onChange(Object.assign({}, oldContact, {courses_dept: e.target.value}));
           },
         }),
         React.createElement('input', {
           placeholder: 'Course Number',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign({}, oldContact, {courses_id: e.target.value}));
           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Instructor',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign({}, oldContact, {courses_instructor: e.target.value}));
           },
         }),
         React.createElement('input', {
           type: 'text',
           placeholder: 'Title',
           value: this.props.value.description,
           onChange: function(e) {
             onChange(Object.assign({}, oldContact, {courses_title: e.target.value}));
           },
         }),
         React.createElement('button', {type: 'submit'}, "Submit")
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



 var newQuery = { WHERE: {courses_id: "", courses_dept: ""}};


 /*
  * Entry point
  */

 ReactDOM.render(
   React.createElement(ContactView, {
     newQuery: newQuery,
   }),
   document.getElementById('app')
 );
