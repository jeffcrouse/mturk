# Mechanical Turk Node API

The Mechanical Node API is composed of:

### Models:

* HITType - create, setNotification
* HIT - create, get, getReviewable, getAssignments
* Assignment - approve, reject

### Auxiliary models (just data structures, really):

* Price - new
* Notification - build

### Notification

Listen to events: assignmentAccepted, assignmentAbandoned, assignmentReturned, assignmentSubmitted, HITReviewable or hITExpired.

## Configuration

	var config = {
	    url: "https://mechanicalturk.sandbox.amazonaws.com",
	    receptor: { port: 8080, host: undefined },
	    poller: { frequency_ms: 10000 },
	    accessKeyId: "YOUR_ACCESS_KEY_ID",
	    secretAccessKey: "YOUR_SECRET_KEY" 
	};
	var mturk = require('mturk')(config);

- **url**: The base URL for all API calls.  Should be either 
  - https://mechanicalturk.sandbox.amazonaws.com
      - For testing
      - posts HITs to [worker sandbox](https://requestersandbox.mturk.com/)
      - manage HITs at [requester sandbox](https://requestersandbox.mturk.com/)
  - https://mechanicalturk.amazonaws.com
    - Posts HITs to [Mechanical Turk](https://www.mturk.com/mturk/)
- **receptor**: Configure the express instance that will wait for notifications set up using *hitType.setNotification*
- **poller**: set up the timed event that actively asks MT for reviewable hits
  - frequency_ms defaults to 60000
- **accessKeyId and secretAccessKey**: You can find your acessKeyID and secretAccessKey in your AWS account under [security credentials](https://portal.aws.amazon.com/gp/aws/securityCredentials).

For more information about the MT API, check out the [Developer Guide](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/Welcome.html) and the [API Reference](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/Welcome.html).


## HITType

    var HITType = require('mturk').HITType;

### HITType.create(title, description, reward, assignmentDurationInSeconds, options, callback)

Creates a HITType. This is the starting point. When creating a HIT you need a HITTypeId (hitType.id).

* title - The title for HITs of this type
* description - A general description of HITs of this type
* reward - The reward. Should be of type model/Price
* assignmentDurationInSeconds - The amount of time a Worker has to complete a HIT of this type after accepting it. integer. in seconds. between 30 (30 seconds) and 3153600 (365 days)
* options.keywords - One or more words or phrases that describe a HIT of this type, separated by commas. string < 1000 chars. Optional.
* options.autoApprovalDelayInSeconds - An amount of time, in seconds, after an assignment for a HIT of this type has been submitted, that the assignment becomes Approved automatically, unless the Requester explicitly rejects it. integer. Optional. Default is 2592000 (30 days)
* callback - function with signature (Array errors || null, HITType hitType)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RegisterHITTypeOperation.html)


### hitType.setNotification(notification, active, callback)

Sets the notification for a HITType. Essential when you want to be informed in "real time" by Amazon of the changes in assignment state.

* notification - the Notification structure
* active - (the lifetime, in seconds (int))bookean
* callback - function with signature (error)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html)

## HIT

    var HIT = require('mturk').HIT;


### HIT.create(hitTypeId, questionXML, lifeTimeInSeconds, options, callback)

Creates a HIT

* hitTypeId - the HIT type id (string)
* questionXML - the question (string)
* lifeTimeInSeconds - the lifetime, in seconds (int)
* options.maxAssignments - the maximum number of assignments. defaults to 1 (int). Optional.
* options.requesterAnnotation - annotations only viewable by the requester (you). (string with max 255 chars). Optional.
* callback - function with signature (Array errors || null, HIT hit)

[API documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateHITOperation.html)

#### Note about *question*

The question must be a well-formed XML string; either a [QuestionForm](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QuestionFormDataStructureArticle.html) file or an [ExternalQuestion](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExternalQuestionArticle.html).  You can find the appropriate Schema URLs in the [WsdlLocationArticle](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_WsdlLocationArticle.html).


### HIT.get(hitId, callback)

Retrieves the details of the specified HIT.

* hitId - The ID of the HIT to retrieve (String)
* callback - function with signature (Error error || null, HIT hit)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetHITOperation.html)

### HIT.dispose(hitId, callback)

dispose of a HIT

* hitId - The ID of the HIT to retrieve (String)
* callback - function with signature (Error error || null)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeHITOperation.html)

### HIT.disable(hitId, calback)

Disables specified HIT.

* hitId - The ID of the HIT to retrieve (String)
* callback - function with signature (Error error || null)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisableHITOperation.html)


### HIT.getReviewable(options, callback)

Retrieves the reviewable HITs.

* options.hitTypeId - the HIT type id (string), not required
* options.status - the status of the HITs to retrieve  (string). Can be "Reviewable" or "Reviewing" Default: "Reviewable"
* options.sortProperty - can sort by title | reward | expiration | creationTime. Defaults to "expiration"
* options.sortDirection - can sort by Title | Reward | Expiration | CreationTime. Defaults to "Expiration"
* options.pageSize - The number of HITs to include in a page of results (int). Defaults to 10. Maximum is 100
* options.pageNumber - The page of results to return (int). Defaults to 1
* callback - function with signature (error, int numResults, int totalNumResults, int pageNumber, Array hITs)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetReviewableHITsOperation.html)

### hit.getAssignments(options, callback)

Gets the assigments for a HIT

* options.assignmentStatus - The status of the assignments to return (string). Valid Values: Submitted | Approved | Rejected. Default: None
* options.sortProperty - The field on which to sort the results returned by the operation (String). Valid Values: AcceptTime | SubmitTime | AssignmentStatus. Default: SubmitTime
* options.sortDirection - The direction of the sort used with the field specified by the SortProperty parameter (string). Valid Values: Ascending | Descending. Default: Ascending
* options.pageSize - The number of assignments to include in a page of results (int). Default: 10
* options.pageNumber - The page of results to return (int). Default: 1
* callback - function with signature (error, int numResults, int totalNumResults, int pageNumber, Array assignments)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentsForHITOperation.html)


## Assignment

    HIT.getAssignments({}, function(err, numResults, totalNumResults, pageNumber, assignments) {
      assignments.forEach(function(assignment) {
        console.log(assignment);
      });
    });

### assignment.approve(requesterFeedback, callback)

* requesterFeedback - A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
* callback - function with signature (error)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveAssignmentOperation.html)

### assignment.reject(requesterFeedback, callback)

* requesterFeedback - A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
* callback - function with signature (error)

[API Documentation](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RejectAssignmentOperation.html)


## Price

    var Price = require('mturk').Price;
    var amount = 0.15;
    var currencyCode = 'USD';
    var price = new Price(amount, currencyCode);

### new Price(amount, currencyCode)

Creates a new Price structure.


## Example HIT Creation


Here is an example of creating a HITType, then rendering a question XML string using EJS, and finally creating a HIT.
	
	// 1. Create the HITType
	var price = new Price("2.50", "USD");
	var title = "Touch Your Toes";
	var description = "Exercise is good for you!";
	var duration = 60 * 10; // #seconds Worker has to complete after accepting
	var options = { keywords: "fitness, health", autoApprovalDelayInSeconds: 3600 };
	HITType.create(title, description, price, duration, options, function(err, hitType) {
		console.log("Created HITType "+hitType.id);
		
		// 2. Render the Question XML
		var options = {'question': "What's your favorite color?"};
		var templateFile = __dirname+"/views/questionForm.xml.ejs";
		ejs.renderFile(templateFile, options, function(err, questionXML) {
			console.log("Rendered XML: "+questionXML);
			
			// 3. Create a HIT
			var options = {maxAssignments: 5}
			var lifeTimeInSeconds = 3600; // 1 hour
			HIT.create(hitType.id, questionXML, lifeTimeInSeconds, {}, function(err, hit){
				console.log("Created HIT "+hit.id);
			});
		});
	});

Then, somewhere else:

	mturk.on('HITReviewable', function(hitId) {
	  console.log('HIT with ID ' + hitId + ' HITReviewable');
	  HIT.getAssignments(hitId, {}, function(err, numResults, totalNumResults, pageNumber, assignments) {
	    assignments.forEach(function(assignment) {
	      // review, then approve or decline
	    });
	  });
	});

## Notification

The notification mechanism sets up:

1. **Receptor** a web server to serve as an endpoint to Amazon notifications. This is done with the [SetHITTypeNotification](http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html) API call.  Note that this 
2. **Poller** A poller that actively polls Amazon MTurk API every X milliseconds. (Note: This value can be changed in the config) 

Both of these mechanisms fire events as described below.

### Notification.build(destination, transport, eventTypes)

Creates a Notification structure to be used on the hitType.setNotification API call.

* destination - The destination for notification messages (string)
* transport - The method Amazon Mechanical Turk uses to send the notification (string). Valid values are: Email | SOAP | REST
* eventTypes - The events that should cause notifications to be sent. Array of strings. Valid Values: AssignmentAccepted | AssignmentAbandoned | AssignmentReturned | AssignmentSubmitted | HITReviewable | HITExpired

#### Important note:

Amazon can inform us of the changed to the assignments in real time.
To setup automatic notifications every time you create a HIT Type, you should call the hitType.setNotification method with the following arguments:

* transport: "REST" (we only support REST)
* destination: the URL of the endpoint to be called by Amazon. Amazon only accepts ports 80 and 443. This should be the public address that reaches config/mturk.js -> receptor.host

## Notification


The main "mturk" module is an EventEmitter that you can set up to listen to the following events:

* assignmentAccepted
* assignmentAbandoned
* assignmentReturned
* assignmentSubmitted
* HITReviewable
* HITExpired
* any - any of the events above

Example:

    var mturk = require('mturk');
    mturk.on('HITReviewable', function(hitId) {
      console.log('HIT with ID ' + hitId + ' is now reviewable.');
    });
