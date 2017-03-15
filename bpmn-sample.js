var bpmn = require("bpmn");
var express    = require("express");
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static('app'));

app.get('/' ,function (req, res) {
  res.sendFile( "app/index.html" );
});
bpmn.createUnmanagedProcess(__dirname + "/bpmn/exclusivegate.bpmn", function(err, myProcess) {

    // we start the process
    console.log("enter");
    myProcess.triggerEvent("MyStart");
      // myProcess.triggerEvent("MyStart");
    // myProcess.triggerEvent("Has payment been made");
});
app.listen(4000);
