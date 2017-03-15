/**
 * Created by Nicky on 2017-03-14.
 */
var React = require("react");
var ReactDOM = require("react-dom");


var Main = React.createClass({
    render:function(){
        return (
            <div> Hello World </div>
        )

    }
});

ReactDOM.render(<Main />,document.getElementById('app'));