var ejs = require("ejs");
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/CMPE282_ProjectII";

exports.register_user=function(req,res) {
	var json_responses;
	mongo.connect(mongoURL,function(){
		console.log("Connected to mongo at:"+mongoURL);
		var coll=mongo.collection('userinfo');
		
		coll.insert({cx_firstname:req.param("first_name"),cx_lastname:req.param("last_name"),cx_email:req.param("email"),cx_password:req.param("password"),instances:[]},function(err,user){
			if(user){
				console.log(user);
				req.session.username=user.cx_email;
				req.session.display_name=user.cx_firstname;
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
			else{
				console.log("returned false");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		});
	});
};



exports.check_login = function(req,res){
	var json_responses;
	mongo.connect(mongoURL,function(connection){
		var coll=mongo.collection('userinfo');
		
		process.nextTick(function(){
			coll.findOne({cx_email:req.param("username"),cx_password:req.param("password")},function(err,user){
				if(err) {
					connection.close();
					json_responses={"statusCode":401};
					res.send(json_responses);
	            }
				else if(!user) {
					connection.close();
					json_responses={"statusCode":404};
					res.send(json_responses);
	            }
				else{
					req.session.user=user;
					json_responses={"statusCode":200,"user":user};
					res.send(json_responses);
				}
		});
		});
	});
};





exports.get_user=function(req,res){
	mongo.connect(mongoURL,function(connection){
		var coll=mongo.collection('userinfo');
		process.nextTick(function(){
			coll.findOne({cx_email:req.session.user.cx_email},function(err,user){
				if(err) {
					connection.close();
					json_responses={"statusCode":401};
					res.send(json_responses);
	            }
				else if(!user) {
					connection.close();
					json_responses={"statusCode":404};
					res.send(json_responses);
	            }
				else{
					console.log(user.instances.length);
					req.session.user=user;
					json_responses={"statusCode":200,"user":user};
					res.send(json_responses);
				}
		});
		});
	});
};
