
var chai = require("chai")
var creds = require('./aws_creds')
var should = chai.should();
var fs = require('fs')
var libxmljs = require("libxmljs")
var util = require('util')

/*
describe('Array', function(){
	before(function(){
	// ...
	});

	describe('#indexOf()', function(){
		it('should return -1 when not present', function(){
			[1,2,3].indexOf(4).should.equal(-1);
		});
	});
});
*/

describe('mturk', function(){

	var mturk  = require("../index")({creds: creds, sandbox: true});
	var _HITTypeId;
	var _HITId;


	// beforeEach(function(){
	// 	mturk = require("../index")({creds: creds, sandbox: true})
	// });




	/**
	* mturk.libxmlToJSON()
	*/
	describe("#libxmlToJSON()", function(){
		it('should successfully convert a getHITResponse to a JSON structure', function(){
			fs.readFile(__dirname+"/GetHITResponse.xml", 'utf8', function(err, xml){
				if(err) throw err;

				var doc = libxmljs.parseXml(xml);
				if(doc.errors.length>0) {
					throw doc.errors[0];
				} else {
					var hit = doc.get("//HIT");
					var json = mturk.libxmlToJSON( hit );
					console.log( util.inspect(json, {depth: 10}) );

					json.should.have.property("HITId");
				}
			});
		})
	});




	/**
	*	Sanity check: mturk object properties
	*/
	describe("properties", function(){

		it("should have credentials set", function(){
			mturk.should.have.property("accessKey");
			mturk.accessKey.should.be.a("String");
			mturk.accessKey.should.have.length(20); //  not sure if it's always 40...
			mturk.should.have.property("secretKey");
			mturk.secretKey.should.be.a("String");
			mturk.secretKey.should.have.length(40); //  not sure if it's always 40...
		});

		it('should have some qualifications defined', function(){
			mturk.should.have.property("QualificationRequirements");
			mturk.QualificationRequirements.should.have.property("Adults");
			mturk.QualificationRequirements.Adults.should.be.a("Object");
		});
	});



	/**
	*	mturk.RegisterHITType()
	*/
	// describe("#RegisterHITType()", function(){
	// 	it('should create a HITType and return the new HITTypeId', function(done){
	// 		var options = { 
	// 			Title: "Mturk Nodejs module RegisterHITType test"
	// 			, Keywords: "keyword1, keyword2, keyword3" 
	// 			, Description: "Test description"
	// 			, Reward: {Amount: 1.0, CurrencyCode: "USD"}
	// 			, AssignmentDurationInSeconds: 3600
	// 			, AutoApprovalDelayInSeconds: 3600
	// 			, QualificationRequirement: [mturk.QualificationRequirements.Adults, mturk.QualificationRequirements.Masters]
	// 		};

	// 		mturk.RegisterHITType(options, function(err, HITTypeId){
	// 			if (err) throw err;
	// 			HITTypeId.should.be.a("String");
	// 			HITTypeId.should.have.length(30);
	// 			_HITTypeId = HITTypeId;
	// 			done();
	// 		});
	// 	});
	// })



	/**
	*	#GetAccountBalance()
	*/
	// describe("#GetAccountBalance()", function(){
	// 	it('should return a number greater than or equal to 0', function(done){
	// 		mturk.GetAccountBalance({}, function(err, AccountBalance){
	// 			if (err) throw err;
	// 			AccountBalance.should.be.a('Number')
	// 			AccountBalance.should.be.at.least(0);
	// 			done();
	// 		});
	// 	})
	// });



	/**
	*	#CreateHIT()
	*/
	/*
	describe("#CreateHIT()", function(){
		it('should create a HITTypeId/ExternalQuestion HIT and return the new HITId', function(done){
			fs.readFile(__dirname+"/externalQuestion.xml", 'utf8', function(err, questionXML) {
				if (err) throw err;
				var options = {
					'HITTypeId': _HITTypeId
					, 'Question': questionXML
					, 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
					, 'MaxAssignments': 1
				};

				mturk.CreateHIT(options, function(err, HITId){
					if (err) throw err;
					HITId.should.be.a("String");
					HITId.should.have.length(30);
					_HITId = HITId;
					done();
				});  // mturk.CreateHIT
			});
		});

	
		it('should create a HITTypeId/QuestionForm HIT and return the new HITId', function(done){
			fs.readFile(__dirname+"/questionForm.xml", 'utf8', function(err, questionXML) {
				if (err) throw err;
				var options = {
					'HITTypeId': _HITTypeId
					, 'Question': questionXML
					, 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
					, 'MaxAssignments': 1
				};
				mturk.CreateHIT(options, function(err, HITId){
					if (err) throw err;
					HITId.should.be.a("String");
					HITId.should.have.length(30);
					_HITId = HITId;
					done();
				});  // mturk.CreateHIT
			});
		});
	
		it('should create a HITTypeId/HTMLQuestion HIT and return the new HITId', function(done){
			fs.readFile(__dirname+"/HTMLQuestion.xml", 'utf8', function(err, questionXML) {
				if (err) throw err;
				var options = {
					'HITTypeId': _HITTypeId
					, 'Question': questionXML
					, 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
					, 'MaxAssignments': 1
				};
				mturk.CreateHIT(options, function(err, HITId){
					if (err) throw err;
					HITId.should.be.a("String");
					HITId.should.have.length(30);
					done();
				});  // mturk.CreateHIT
			});
		});


		// it('should create a common property HIT and return the ID of the new HITId', function(done){
		// 	done();
		// });
	});
	*/

	/**
	*
	*/
	/*
	describe("#GetHIT()", function(){
		it('should get a single hit with all of the associated information', function(done){
			mturk.GetHIT({HITId: "289LFQ0ONNVRH9JPF75GUB760YMKTG"}, function(err, HIT){
				
				HIT.should.have.ownProperty(HITId);
				HIT.HITId[0].should.be.a("String");

				done();
			});
		});
	});
	*/



});