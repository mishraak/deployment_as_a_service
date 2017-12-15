var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/CMPE282_ProjectII";
var publicIp;
var instanceId;
var instances;
var http=require('http');
var AWS=require('aws-sdk');
var fs=require('fs');
var sshclient=require('sshclient');
var laeh=require('laeh2').leanStacks(true);
var _x=laeh._x;

												/*
													MODIFY BELOW VARIABLES
												*/

AWS.config.update({accessKeyId:'<YourAccessKeyId>', secretAccessKey:'<YourAccessKey>'});
var PEM_FILE_PATH = '/path/for/.pem file/for/ssh';
var KEY_NAME = 'aws_key_name';


AWS.config.update({region:'us-west-1'});
var login = require("./login");
var ec2=new AWS.EC2({apiVersion:'2016-11-15'});




exports.create_instance=function(req,res){
	req.setTimeout(0);
    console.log("inside create instance method");
    var params={ ImageId:'ami-06510a66',  InstanceType:'t2.micro',  MinCount:1,  MaxCount:1,  KeyName:KEY_NAME };

    ec2.runInstances(params,function(err,data){
        if(err) {
            console.log("Could not create instance",err);
            return;
        }

        data.Instances.forEach(function(p1) {
            if(p1.State.Name=="pending"){
                console.log("STATE IS PENDING, Instance Id is : "+ p1.InstanceId);
                instanceId=p1.InstanceId;
            }
        })

            //publicIp = data.Reservations[0].Instances[0].PublicIpAddress;
            ec2.waitFor('instanceStatusOk',{InstanceIds:[instanceId]},function(err,data){
                var params2 = { Filters:[ { Name:'instance-id', Values:[instanceId] } ] };
                console.log(params2);
                ec2.describeInstances(params2,function(err, data){
                    if(err)
                        console.error(err);
                    else  {
                    	mongo.connect(mongoURL,function(connection){
                    		var coll=mongo.collection('userinfo');
                    		process.nextTick(function(){
                    			process.nextTick(function(){
                    				coll.update({"cx_email":req.param("email")},
                    						{$push:
                    						{instances:
                    						{
                    							"id":data.Reservations[0].Instances[0].InstanceId,
                    							"name":req.param("name"),
                    							"path":req.param("path")
                    					}}})});
                    		});
                    		});
                    	publicIp = data.Reservations[0].Instances[0].PublicIpAddress;
                        console.log(publicIp);
                        var opts={
                            host:publicIp,
                            port:22,
                            username:'ubuntu',
                            privateKey:fs.readFileSync(PEM_FILE_PATH),
                            debug:true,//optional
                            session:[
                                {op:'exec',command:'git clone '+req.param("link")},
                                {op:'exec',command:'npm install '+req.param("name")},
                                {op:'exec',command:'node '+req.param("name")+'/'+req.param("path")}
                            ]
                        };

                        console.log("executing commands");

                        function cb(){
                            console.log("callabck called.");
                        }

                        sshclient.session(opts,_x(cb,true,function(err){
                        	if(err){
                        		console.log(err);
                        	}
                            console.log('Done!');
                            cb();
                        }));
                    }
                });
                json_responses={"statusCode":200,"data":data};
				res.send(json_responses); // print here as describeInstances always returns public ip, runInstances may not!
            })
    });
};






exports.monitor_instance=function(req,res){
	req.setTimeout(0);
	var params = {
			  InstanceIds: [req.param("id")],
			  DryRun: true
	};
	ec2.monitorInstances(params, function(err, data) {
	    if (err && err.code === 'DryRunOperation') {
	      params.DryRun = false;
	      ec2.describeInstances(params, function(err, data) {
	          if (err) {
	            console.log("Error", err);
	            json_responses={"statusCode":401};
	            res.send(json_responses);
	          } else if (data) {
	            console.log("Success", data);
	            json_responses={"statusCode":200,"instances":data.Reservations[0].Instances};
				res.send(json_responses);
				console.log("this executes");
	          }
	      });
	    } else {
	      console.log("You don't have permission to change instance monitoring.");
	    }
	  });
};

exports.start_instance=function(req, res) {
	req.setTimeout(0);
	var params = {
			  InstanceIds: [req.param("id")],
			  DryRun: true
	};
	  ec2.startInstances(params, function(err, data) {
		    if (err && err.code === 'DryRunOperation') {
		      params.DryRun = false;
		      ec2.startInstances(params, function(err, data) {
		          if (err) {
		            console.log("Error", err);
		            json_responses={"statusCode":401};
		            res.send(json_responses);
		          } else if (data) {
		            console.log("Success", data.StartingInstances);
		            json_responses={"statusCode":200,"instances":data.StartingInstances};
		            ec2.waitFor('instanceStatusOk',params,function(err,data){
		            	console.log("in waitFor");
		            	if(err){
		            		console.log(err);
		            	}
		                ec2.describeInstances(params,function(err, data){
		                	console.log("in describe");
		                	if(err)
		                        console.error(err);
		                    else  {
		                    	publicIp = data.Reservations[0].Instances[0].PublicIpAddress;
		                        console.log(publicIp);
		                        var opts={
		                            host:publicIp,
		                            port:22,
		                            username:'ubuntu',
		                            privateKey:fs.readFileSync(PEM_FILE_PATH),
		                            debug:true,//optional
		                            session:[
		                                {op:'exec',command:'node '+req.param("name")+'/'+req.param("path")}
		                            ]
		                        };
		                        console.log("executing commands");

		                        function cb(){
		                            console.log("callabck called.");
		                        }

		                        sshclient.session(opts,_x(cb,true,function(err){
		                        	console.log("in SSH session");
		                        	if(err){
		                        		console.log(err);
		                        	}
		                            console.log('Done!');
		                            cb();
		                        }));
		                    }
		                });
		            });		            
		            res.send(json_responses);
		          }
		      });
		    } else {
		      console.log("You don't have permission to start instances.");
		    }
	  });
}

exports.stop_instance=function(req, res) {
	req.setTimeout(0);
	var params = {
			  InstanceIds: [req.param("id")],
			  DryRun: true
	};
	
	ec2.stopInstances(params, function(err, data) {
	    if (err && err.code === 'DryRunOperation') {
	      params.DryRun = false;
	      ec2.stopInstances(params, function(err, data) {
	          if (err) {
	            console.log("Error", err);
	            json_responses={"statusCode":401};
	            res.send(json_responses);
	          } else if (data) {
	            console.log("Success", data.StoppingInstances);
	            json_responses={"statusCode":200,"instances":data.StoppingInstances};
				res.send(json_responses);
	          }
	      });
	    } else {
	      console.log("You don't have permission to start instances.");
	    }
  });
}




exports.reboot_instance=function(req, res) {
	req.setTimeout(0);
	var params = {
			  InstanceIds: [req.param("id")],
			  DryRun: true
	};
	
	ec2.rebootInstances(params, function(err, data) {
	    if (err && err.code === 'DryRunOperation') {
	      params.DryRun = false;
	      ec2.rebootInstances(params, function(err, data) {
	          if (err) {
	            console.log("Error", err);
	            json_responses={"statusCode":401};
	            res.send(json_responses);
	          } else if (data) {
	            console.log("Success", data);
	            json_responses={"statusCode":200,"instances":data};
	            
	            ec2.waitFor('instanceStopped',params,function(err,data){
	            ec2.waitFor('instanceRunning',params,function(err,data){
	            	console.log("in waitFor");
	            	if(err){
	            		console.log(err);
	            	}
	                ec2.describeInstances(params,function(err, data){
	                	console.log("in describe");
	                	if(err)
	                        console.error(err);
	                    else  {
	                    	publicIp = data.Reservations[0].Instances[0].PublicIpAddress;
	                        console.log(publicIp);
	                        var opts={
	                            host:publicIp,
	                            port:22,
	                            username:'ubuntu',
	                            privateKey:fs.readFileSync(PEM_FILE),
	                            debug:true,//optional
	                            session:[
	                                {op:'exec',command:'node '+req.param("name")+'/'+req.param("path")}
	                            ]
	                        };
	                        console.log("executing commands");

	                        function cb(){
	                            console.log("callabck called.");
	                        }

	                        sshclient.session(opts,_x(cb,true,function(err){
	                        	console.log("in SSH session");
	                        	if(err){
	                        		console.log(err);
	                        	}
	                            console.log('Done!');
	                            cb();
	                        }));
	                    }
	                });
	            });
	            });
	            
	            
				res.send(json_responses);
	          }
	      });
	    } else {
	      console.log("You don't have permission to start instances.");
	    }
  });

}

exports.terminate_instance=function(req, res) {
	req.setTimeout(0);
	var params = {
			  InstanceIds: [req.param("id")]
	};
	ec2.terminateInstances(params, function(err, data) {

        if(err) {
            console.error(err.toString());
            json_responses={"statusCode":401};
            res.send(json_responses);
        } else {
            for(var i in data.TerminatingInstances) {
            	var coll=mongo.collection('userinfo');
        			process.nextTick(function(){
        				coll.update({"cx_email":req.param("email")},{$pull:{instances:{"id":req.param("id")}}},function(err){
        					if(err)
        						console.log(err);
        				});
        		});
                var instance = data.TerminatingInstances[i];
                json_responses={"statusCode":200,"instances":data.TerminatingInstances[i]};
				res.send(json_responses);
            }
        }
    });
}