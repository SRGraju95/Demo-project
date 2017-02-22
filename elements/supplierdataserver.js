/**
 * Created by praba on 2/10/2016.
 */

var express    = require("express");
var mysql      = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
   host     : 'localhost',
  user      : 'root',    /* username*/
  password  : 'admin',   /* password*/
   database : 'supplier'   /* db name*/
 });

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//Lodaing static files like elements from app folder
app.use(express.static('app'));

//Receiving get request from index.html to render the home page of the application
app.get('/' ,function (req, res) {
  res.sendFile( "app/index.html" );
});

//Receiving post request from login card
// Supplier Details Database coding START from
app.post('/saveinfo', urlencodedParser, function (req, res) {

  var response={
  	Id:req.query.sid,
  	Name:req.query.sname,
  	Email:req.query.semail,
    Phone:req.query.sphone,
    location:req.query.slocation
  };
  	connection.query('INSERT INTO supplier_table SET ?',[response],function(err,result){
  	if(result.affectedRows>0)
    //Sending positive response(role name) back to the login card if it is valid user
      res.status(200).json({'datavalue': "Saved!"});
    else
    //Sending error response
      res.status(200).json({'datavalue': "Unable to save!"});
    });
});
app.post('/searchsupplier', urlencodedParser, function (req, res) {

  var response={Id:req.query.srid};
  	connection.query('SELECT * FROM supplier_table WHERE ?',[response],function(err,rows){
    // connection.query('SELECT * FROM supplier_table',function(err,rows){
  	if(rows.length>0)
    //Sending positive response(role name) back to the login card if it is valid user
      res.status(200).json({'searchvalue': rows});
    else{
    //Sending error response
    //console.log(err);
      res.status(200).json({'searchvalue': "Unable to save!"});
    }
    });
});
// Supplier Details Database coding END
// Accont Details database coding START from
app.post('/signininfo', urlencodedParser, function (req, res) {
  var response={
  	Acc_name:req.query.signacc,
  	bank_name:req.query.signbank,
    acc_pin:req.query.signpin,
    acc_ifsc:req.query.signifsc,
    acc_ccv:req.query.signccv
  };
  connection.query('INSERT INTO signin_table SET ?',[response],function(err,result){
  if(result.affectedRows>0)
  //Sending positive response(role name) back to the login card if it is valid user
    res.status(200).json({'signinvalue': "Saved!"});
  else
  //Sending error response
    res.status(200).json({'signinvalue': "Unable to save!"});
  });
});
app.post('/saveiteminfo', urlencodedParser, function (req, res) {

  var response={
  	Id:req.query.id,
  	Name:req.query.name,
  	Type:req.query.type
  };
  	connection.query('INSERT INTO item_table SET ?',[response],function(err,result){
  	if(result.affectedRows>0)
    //Sending positive response(role name) back to the login card if it is valid user
      res.status(200).json({'itemvalue': "Saved!"});
    else
    //Sending error response
      res.status(200).json({'itemvalue': "Unable to save!"});
    });
});
app.post('/searchiteminfo',urlencodedParser,function(req,res){
  var response={Id:req.query.id};
      connection.query('SELECT * FROM item_table WHERE ?',[response],function(err,rows){
        if(rows.length>0)
        {
        res.status(200).json({'itemvalue':rows});
        }
        else{
          res.status(200).json({'itemvalue':"Not Found"});
        }
      });
  });
//Node server running port number
app.listen(4000);
