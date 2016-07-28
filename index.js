/*!
 * Interface to the Mechanical Turk API
 *
 * Original Copyright(c) 2013 Jeff Crouse <jeff@jeffcrouse.info>
 * MIT Licensed
 */

if( typeof Npm !== 'undefined' ) {
    // Allow this to be pulled directly into a Meteor smart package in development
    // i.e. https://github.com/HarvardEconCS/turkserver-meteor
    require = Npm.require;
    mturkModule = {};
    var module = mturkModule;
}

var crypto = require('crypto')
  , request = require('request')
  , xml2js = require('xml2js').Parser()
  , util = require('util')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , querystring = require('querystring')
  , async = require('async')
  ;


/**
* An interface to the Mechanical Turk API 
*
* @see http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_OperationsArticle.html
*/
module.exports = function(settings) {

  var mturk = {};
  mturk.accessKey = settings.creds.accessKey;
  mturk.secretKey = settings.creds.secretKey;
  mturk.sandbox = settings.sandbox || false;
  mturk.version = "2013-11-15";
  mturk.service = "AWSMechanicalTurkRequester";

  /**
  * Qualification Requirements
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html#ApiReference_QualificationType-IDs
  * @todo If a user changes mturk.sandbox after the object is created, these will be incorrect
  */
  mturk.QualificationRequirements = {};
  mturk.QualificationRequirements.Adults = {
    QualificationTypeId: "00000000000000000060",
    Comparator: "EqualTo",
    IntegerValue: 1,
    RequiredToPreview: true
  };
    mturk.QualificationRequirements.Masters = {
    QualificationTypeId: mturk.sandbox ? "2ARFPLSP75KLA8M8DH1HTEQVJT3SY6" : "2F1QJWKUDD8XADTFD2Q0G6UTO95ALH",
    Comparator: "EqualTo",
    IntegerValue: 1,
    RequiredToPreview: true
    };
  mturk.QualificationRequirements.CategorizationMasters = {
    QualificationTypeId: mturk.sandbox ? "2F1KVCNHMVHV8E9PBUB2A4J79LU20F" : "2NDP2L92HECWY8NS8H3CK0CP5L9GHO",
    Comparator: "EqualTo",
    IntegerValue: 1,
    RequiredToPreview: true
  };
  mturk.QualificationRequirements.PhotoModerationMasters = {
    QualificationTypeId: mturk.sandbox ? "2TGBB6BFMFFOM08IBMAFGGESC1UWJX" : "21VZU98JHSTLZ5BPP4A9NOBJEK3DPG",
    Comparator: "EqualTo",
    IntegerValue: 1,
    RequiredToPreview: true
  };



/**********************************************************
              _                  _   _               _
   __ _ _ __ (_)  _ __ ___   ___| |_| |__   ___   __| |___ 
  / _` | '_ \| | | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
 | (_| | |_) | | | | | | | |  __/ |_| | | | (_) | (_| \__ \
  \__,_| .__/|_| |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
       |_|
**********************************************************/



  /**
  * The ApproveAssignment operation approves the results of a completed assignment.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveAssignmentOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.AssinmentId The ID of the assignment. This parameter must correspond to a HIT created by the Requester.
  * @param {String} [params.RequesterFeedback] A message for the Worker, which the Worker can see in the Status section of the web site.
  * @param {function()} callback A callback function
  * @throws {TypeError} if a AssignmentId isn't provided
  */
  mturk.ApproveAssignment = function(params, callback){
    var defaults = {
      "Operation": "ApproveAssignment"
      , "AssignmentId": null
      , "RequesterFeedback": null
    };
    params = merge(defaults, params);
    check(params.AssignmentId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.AssignmentId);
      }
    });
  }


  /**
  * The ApproveRejectedAssignment operation approves an assignment that was previously rejected.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveRejectedAssignmentOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.AssinmentId The ID of the assignment. This parameter must correspond to a HIT created by the Requester.
  * @param {String} [params.RequesterFeedback] A message for the Worker, which the Worker can see in the Status section of the web site.
  * @param {function()} callback A callback function
  * @throws {TypeError} if a AssignmentId isn't provided
  */
  mturk.ApproveRejectedAssignment = function(params, callback) {
    var defaults = {
      "Operation": "ApproveRejectedAssignment"
      , "AssignmentId": null
      , "RequesterFeedback": null
    };
    params = merge(defaults, params);
    check(params.AssignmentId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.AssignmentId);
      }
    });
  }

  /**
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_AssignQualificationOperation.html
   */
  mturk.AssignQualification = function(params, callback) {
    var defaults = {
      "Operation": "AssignQualification",
      "QualificationTypeId": null,
      "WorkerId": null,
      "IntegerValue": 1,
      "SendNotification": true
    };

    params = merge(defaults, params);

    check(params.QualificationTypeId).notNull();
    check(params.WorkerId).notNull();

    this.doRequest(params, function(err, doc){
      if (err) {
        callback(err, null);
      } else {
        callback(null);
      }
    });
  };

  /**
  * The BlockWorker operation allows you to prevent a Worker from working on your HITs. For example, you can block a Worker who is producing poor quality work. You can block up to 100,000 Workers.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_BlockWorkerOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.WorkerId The ID of the Worker to block.
  * @param {String} [params.Reason] A message explaining the reason for blocking the Worker. This parameter enables you to keep track of your Workers. The Worker does not see this message.
  * @param {function()} callback A callback function
  * @throws {TypeError} if a WorkerId isn't provided
  */
  mturk.BlockWorker = function(params, callback) {
    var defaults = {
      "Operation": "BlockWorker"
      , "WorkerId": null
      , "Reason": null
    };

    params = merge(defaults, params);
    check(params.WorkerId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.WorkerId);
      }
    });
  }



  /**
  * The ChangeHITTypeOfHIT operation allows you to change the HITType properties of a HIT. This operation disassociates the HIT from its old HITType properties and associates it with the new HITType properties. The HIT takes on the properties of the new HITType in place of the old ones.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ChangeHITTypeOfHITOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT to change
  * @param {String} params.HITTypeId The ID of the new HIT type
  * @param {function(HITId)} callback A callback function
  * @throws {TypeError} if a HITTypeId or LifetimeInSeconds isn't provided
  */
  mturk.ChangeHITTypeOfHIT = function(params, callback){
    var defaults = {
      "Operation": "ChangeHITTypeOfHIT"
      , "HITId": null
      , "HITTypeId": null
    };

    params = merge(defaults, params);
    check(params.HITId).notNull();
    check(params.HITTypeId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.HITId);
      }
    });
  }



  /**
  * Creates a new HIT
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateHITOperation.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QuestionFormDataStructureArticle.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExternalQuestionArticle.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HTMLQuestionArticle.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HITLayoutParameterArticle.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HITReviewPolicyDataStructureArticle.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITTypeId The HIT type ID
  * @param {String} [params.Question] The data the person completing the HIT uses to produce the results. Must be a QuestionForm data structure, an ExternalQuestion data structure, or an HTMLQuestion data structure. The XML question data must not be larger than 64 kilobytes (65,535 bytes) in size, including whitespace
  * @param {String} [params.HITLayoutId] The HITLayoutId allows you to use a pre-existing HIT design with placeholder values and create an additional HIT by providing those values as HITLayoutParameters.
  * @param {String} [params.HITLayoutParameters] If the HITLayoutId is provided, the HITLayoutParameter structure is generated out of a JSON object of representing the parameters.
  * @param {String} params.LifetimeInSeconds The number of seconds after which the HIT is no longer available for users to accept. After the lifetime of the HIT has elapsed, the HIT no longer appears in HIT searches, even if not all of the HIT's assignments have been accepted.
  * @param {String} [params.MaxAssignments=1] The number of times the HIT can be accepted and completed before the HIT becomes unavailable.
  * @param {String} [params.AssignmentReviewPolicy] The Assignment-level Review Policy applies to the assignments under the HIT. You can specify for Mechanical Turk to take various actions based on the policy.
  * @param {String} [params.HITReviewPolicy] The HIT-level Review Policy applies to the HIT. You can specify for Mechanical Turk to take various actions based on the policy.
  * @param {String} [params.RequesterAnnotation] An arbitrary data field. The RequesterAnnotation parameter lets your application attach arbitrary data to the HIT for tracking purposes. For example, this parameter could be an identifier internal to the Requester's application that corresponds with the HIT.
  * @param {String} [params.UniqueRequestToken] A unique identifier for this request. Allows you to retry the call on error without creating duplicate HITs.
  * @param {function(HITId)} callback A callback function
  * @throws {TypeError} if a HITTypeId or LifetimeInSeconds isn't provided
  */
  mturk.CreateHIT = function(params, callback) {
    var defaults = {
      "Operation": "CreateHIT"
      , "HITTypeId": null
      , "MaxAssignments": 1
      , "LifetimeInSeconds": null
    };
    params = merge(defaults, params);

    if('HITLayoutId' in params && 'HITLayoutParameters' in params)
      layoutParams(params);

    check(params.HITTypeId || params.HITLayoutId).notNull();
    check(params.LifetimeInSeconds).notNull().isInt().min(30).max(31536000);

    if(!(!params.hasOwnProperty("Question") ^ !params.hasOwnProperty("HITLayoutId")))
      throw new Error("You must provide Either a Question parameter or a HITLayoutId parameter");

    //if(params.hasOwnProperty("Question"))
      // TO DO: Validate QuestionForm, ExternalQuestion, or HTMLQuestion data

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var HITId = get(doc, "CreateHITResponse.HIT.HITId");
        if(HITId) {
          callback(null, HITId);
        } else {
          callback("Couldn't find HITId in response", null);
        }
      }
    });
  }




  /**
  * The DisableHIT operation removes a HIT from the Amazon Mechanical Turk marketplace,
  * approves any submitted assignments pending approval or rejection, and disposes of the HIT
  * and all assignment data. Assignment results data cannot be retrieved for a HIT that has been disposed.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisableHITOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT you want to disable
  * @param {function(HITId)} callback A callback function
  * @throws {TypeError} if a HITId isn't provided
  */
  mturk.DisableHIT = function(params, callback) {
    var defaults = {
      "Operation": "DisableHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.HITId);
      }
    });
  }


  /**
  * The DisposeHIT operation disposes of a HIT that is no longer needed. Only the Requester who
  * created the HIT can dispose of it.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeHITOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT you want to dispose of
  * @param {function(HITId)} callback A callback function
  * @throws {TypeError} if a HITId isn't provided
  */
  mturk.DisposeHIT = function(params, callback) {
    var defaults = {
      "Operation": "DisposeHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.HITId);
      }
    });
  }

  /**
   * Extend the assignments or expiration of a HIT
   *
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExtendHITOperation.html
   *
   */
  mturk.ExtendHIT = function(params, callback) {
    var defaults = {
      "Operation": "ExtendHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();
    // TODO other checks

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, true);
      }
    });
  }

  /**
   * Force Expire a HIT
   *
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ForceExpireHITOperation.html
   *
   */
  mturk.ForceExpireHIT = function(params, callback) {
    var defaults = {
      "Operation": "ForceExpireHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();
    // TODO other checks

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, true);
      }
    });
  }

  /**
  * Gets the account balance for the account
  *
  * @see http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAccountBalanceOperation.html
  * @param {function()} callback A callback function
  */
  mturk.GetAccountBalance = function(params, callback) {
    var defaults = {"Operation": "GetAccountBalance"};
    params = merge(defaults, params);

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var balance = get(doc, "GetAccountBalanceResponse.GetAccountBalanceResult.AvailableBalance.Amount");
        if(balance) {
          callback(null, parseFloat(balance));
        }
      }
    });
  }

  /**
   * Get the details for a particular assignment.
   *
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentOperation.html
   */
  mturk.GetAssignment = function(params, callback) {
    var defaults = {
      "Operation": "GetAssignment",
      "AssignmentId": null
    };
    params = merge(defaults, params);

    check(params.AssignmentId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var assignment = get(doc, "GetAssignmentResponse.GetAssignmentResult.Assignment");
        var hit = get(doc, "GetAssignmentResponse.GetAssignmentResult.HIT");
        callback(null, assignment, hit);
      }
    });
  };

  /**
  * The GetAssignmentsForHIT operation retrieves completed assignments for a HIT. You can use this operation to retrieve the results for a HIT.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentsForHITOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT
  * @param {String} [params.SortProperty=SubmitTime] Valid Values: AcceptTime | SubmitTime | AssignmentStatus
  * @param {String} [params.SortDirection=Ascending] Valid Values: Ascending | Descending
  * @param {Number} [params.PageSize=10] The number of assignments to include in a page of results. The complete sorted result set is divided into pages of this many assignments.
  * @param {Number} [params.PageNumber=1] The page of results to return. Once the assignments have been filtered, sorted, and divided into pages of size PageSize, the page corresponding to PageNumber is returned as the results of the operation.
  * @param {function(Array(assignments))} callback
  */
  mturk.GetAssignmentsForHIT = function(params, callback){
    var defaults = {
      "Operation": "GetAssignmentsForHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();

    if(params.hasOwnProperty("AssignmentStatus") &&
      ["Submitted", "Approved", "Rejected"].indexOf(params.AssignmentStatus)==-1)
      throw new TypeError("AssignmentStatus not valid")

    if(params.hasOwnProperty("SortProperty") &&
      ["AcceptTime", "SubmitTime", "AssignmentStatus"].indexOf(params.AssignmentStatus)==-1)
      throw new TypeError("SortProperty not valid")

    if(params.hasOwnProperty("SortDirection") &&
      ["Ascending", "Descending"].indexOf(params.SortDirection)==-1)
      throw new TypeError("SortDirection not valid")

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var result = get(doc, "GetAssignmentsForHITResponse.GetAssignmentsForHITResult");
        callback(null, result);
      }
    });
  }


  /**
  * Fetches information about a particular HIT
  *
  * @see http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetHITOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT you want information about
  * @param {function(err, hit)} callback A callback function
  * @throws {TypeError} if a HITId isn't provided
  */
  mturk.GetHIT = function(params, callback){
    var defaults = {
      "Operation": "GetHIT"
      , "HITId": null
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        try {
          var hit = get(doc, "GetHITResponse.HIT");
          callback(null, hit);
        } catch(err) {
          callback(err, null);
        }
      }
    });
  }


  /**
  * The GetReviewableHITs operation retrieves the HITs with Status equal to Reviewable or Status equal to Reviewing that belong to the Requester calling the operation.
  *
  * @see http://docs.amazonwebservices.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetReviewableHITsOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} [params.Status="Reviewable"] either "Reviewable" or "Reviewing"
  * @param {Number} [params.PageSize=10] The number of reviewable hits per page
  * @param {Number} [params.PageNumber=1] Which page of results to fetch
  * @param {String} [params.SortProperty=Expiration] "Title", "Reward", "Expiration", "CreationTime", "Enumeration"
  * @param {String} [params.SortDirection=Descending] "Ascending", "Descending"
  * @param {function(Array)} callback An array of the reviewable HITIds
  * @throws {TypeError} If a parameter isn't valid, TypeError is thrown.
  */
  mturk.GetReviewableHITs = function(params, callback){
    var defaults = {
      "Operation": "GetReviewableHITs",
      "Status": "Reviewable",
      "PageSize": 10,
      "PageNumber": 1,
      "SortProperty": "Expiration",
      "SortDirection": "Descending"
    };
    params = merge(defaults, params);

    if(params.hasOwnProperty("Status") &&
      ["Reviewable", "Reviewing"].indexOf(params.Status)==-1)
      throw new TypeError("Status not valid")

    if(params.hasOwnProperty("SortProperty") &&
      ["Title", "Reward", "Expiration", "CreationTime", "Enumeration"].indexOf(params.SortProperty)==-1)
      throw new TypeError("SortProperty not valid")

    if(params.hasOwnProperty("SortDirection") &&
      ["Ascending", "Descending"].indexOf(params.SortDirection)==-1)
      throw new TypeError("SortDirection not valid")

    if(params.hasOwnProperty("PageSize"))
      check(params.PageSize).isInt().min(1).max(100);

    if(typeof(params.PageNumber)!="undefined")
      check(params.PageNumber).notNull().isInt().min(1);

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var result = get(doc, "GetReviewableHITsResponse.GetReviewableHITsResult");
        callback(null, result);
      }
    });
  }

  /**
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GrantBonusOperation.html
   */
  mturk.GrantBonus = function(params, callback) {
    var defaults = {
      "Operation": "GrantBonus",
      "WorkerId": null,
      "AssignmentId": null,
      "BonusAmount": null,
      "Reason": null
    };

    params = merge(defaults, params);

    check(params.WorkerId).notNull();
    check(params.AssignmentId).notNull();
    check(params.BonusAmount).notNull();
    // BonusAmount needs to be array-ified, just like reward
    if(params.hasOwnProperty("BonusAmount")) {
      if( !Array.isArray(params.BonusAmount) )
        params.BonusAmount = [ params.BonusAmount ];

      params.BonusAmount.forEach( function(bonus){
        check(bonus.Amount).notNull().isFloat();
        check(bonus.CurrencyCode).is("USD");
      });
    }
    check(params.Reason).notNull();

    this.doRequest(params, function(err, doc) {
      if(err) {
        callback(err, null);
      } else {
        callback(null);
      }
    });
  }

  /**
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_NotifyWorkersOperation.html
   */
  mturk.NotifyWorkers = function(params, callback) {
    var defaults = {
      "Operation": "NotifyWorkers",
      "Subject": null,
      "MessageText": null,
      "WorkerId": null
    };

    params = merge(defaults, params);

    check(params.Subject).notNull();
    check(params.MessageText).notNull();
    // Can be String (one worker) or Array (up to 100 workers)
    check(params.WorkerId).notNull();

    if( Array.isArray(params.WorkerId) ) {
      check(params.WorkerId.length).isInt().max(100);
    }

    this.doRequest(params, function(err, doc) {
      if(err) {
        callback(err, null);
      } else {
        callback(null);
      }
    });
  };

  /**
  * Create a new HitType
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RegisterHITTypeOperation.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_PriceDataStructureArticle.html
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.Title The title for HITs of this type.
  * @param {String} params.Description A general description of HITs of this type
  * @param {Object} params.Reward The amount of money the Requester will pay a user for successfully completing a HIT of this type
  * @param {Number} params.Reward.Amount The amount of money, as a number. The amount is in the currency specified by the CurrencyCode. For example, if CurrencyCode is USD, the amount will be in United States dollars (e.g. 12.75 is $12.75 US).
  * @param {Number} params.Reward.CurrencyCode A code that represents the country and units of the currency. Its value is
  * @param {Number} [params.Reward.FormattedPrice]
  * @param {String} params.AssignmentDurationInSeconds The amount of time a Worker has to complete a HIT of this type after accepting it.
  * @param {String} [params.Keywords] One or more words or phrases that describe a HIT of this type, separated by commas. Searches for words similar to the keywords are more likely to return the HIT in the search results.
  * @param {String} [params.AutoApprovalDelayInSeconds=2592000] An amount of time, in seconds, after an assignment for a HIT of this type has been submitted, that the assignment becomes Approved automatically, unless the Requester explicitly rejects it.
  * @param {Array} [params.QualificationRequirement] A condition that a Worker's Qualifications must meet before the Worker is allowed to accept and complete a HIT of this type.
  * @param {Function(HITTypeId)} callback
  */
  mturk.RegisterHITType = function(params, callback) {
    var defaults = {
       "Operation": "RegisterHITType"
      , "Title" : "HitType "+Math.floor(Math.random()*9999)
      , "Description" : "no description"
      , "Reward" : null
      , "AssignmentDurationInSeconds": 0
    };
    params = merge(defaults, params);

    // Make sure that Reward is an array of reward objects
    if(params.hasOwnProperty("Reward")) {
      if(!Array.isArray(params.Reward))
        params.Reward = [params.Reward]

      params.Reward.forEach(function(reward){
        check(reward.Amount).notNull().isFloat();
        check(reward.CurrencyCode).is("USD");
      });
    }

    // Checks if a qualification requirement has been assigned
    if(params.hasOwnProperty("QualificationRequirement")) {
      if(!Array.isArray(params.QualificationRequirement))
        params.QualificationRequirement = [params.QualificationRequirement];

      params.QualificationRequirement.forEach(function(qual){
        // check(qual.QualificationTypeId).notNull().isInt();
        check(qual.Comparator).notNull().isIn([
          "LessThan", "LessThanOrEqualTo",
          "GreaterThan", "GreaterThanOrEqualTo",
          "EqualTo", "NotEqualTo",
          "Exists", "DoesNotExist",
          "In", "NotIn"]);

        // TODO: add more checks, such as for qual details
      });
    }

    check(params.AssignmentDurationInSeconds).notNull().isInt().min(30).max(31536000);

    if(params.hasOwnProperty("AutoApprovalDelayInSeconds"))
      check(params.AutoApprovalDelayInSeconds).isInt().min(0).max(2592000);

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var HITTypeId = get(doc, "RegisterHITTypeResponse.RegisterHITTypeResult.HITTypeId");
        if(HITTypeId) {
          callback(null, HITTypeId);
        } else {
          callback("Couldn't find HITTypeId in response", null);
        }
      }
    });
  }


  /**
  * The RejectAssignment operation rejects the results of a completed assignment.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RejectAssignmentOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.AssignmentId The ID of the assignment. This parameter must correspond to a HIT created by the Requester.
  * @param {String} [params.RequesterFeedback] A message for the Worker, which the Worker can see in the Status section of the web site.
  * @param {function()} callback A callback function
  * @throws {TypeError} if a AssignmentId isn't provided
  */
  mturk.RejectAssignment = function(params, callback){
    var defaults = {
      "Operation": "RejectAssignment"
      , "AssignmentId": null
      , "RequesterFeedback": null
    };
    params = merge(defaults, params);
    check(params.AssignmentId).notNull();

    this.doRequest(params, function(err, doc) {
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.AssignmentId);
      }
    });
  }

  /**
   * The RevokeQualification operation revokes a previously granted Qualification from a user.
   *
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RevokeQualificationOperation.html
   */
  mturk.RevokeQualification = function(params, callback) {
    var defaults = {
      "Operation": "RevokeQualification",
      "SubjectId": null,
      "QualificationTypeId": null,
      "Reason": null
    };

    params = merge(defaults, params);

    check(params.SubjectId).notNull();
    check(params.QualificationTypeId).notNull();

    this.doRequest(params, function(err, doc) {
      if(err) {
        callback(err, null);
      } else {
        callback(null, true);
      }
    });
  };

  /**
  * The The SearchHITs operation returns all of a Requester's HITs, on behalf of the Requester.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SearchHITsOperation.html
  * @param {Object} params Parameters for the API call
  *
  */
  mturk.SearchHITs = function(params, callback){
    var defaults = {
      "Operation": "SearchHITs"
      , "SortProperty": "CreationTime"
      , "SortDirection": "Ascending"
      , "PageSize": 10
      , "PageNumber": 1
    };
    params = merge(defaults, params);

    check(params.SortProperty).notNull().isIn(["Title", "Reward", "Expiration", "CreationTime", "Enumeration"]);
    check(params.PageSize).min(1).max(100);
    check(params.SortDirection).notNull().isIn(["Ascending", "Descending"]);

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        var result = get(doc, "SearchHITsResponse.SearchHITsResult");
        callback(null, result);
      }
    });
  }

  /**
   * The SendTestEventNotification operation causes Amazon Mechanical Turk to send a notification message as if a HIT event occurred, according to the provided notification specification. This allows you to test notifications without setting up notifications for a real HIT type and trying to trigger them using the website.
   *
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SendTestEventNotificationOperation.html
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_NotificationDataStructureArticle.html
   * @param {Object} params Parameters for the API call
   * @param {Object} params.Notification The Notification data structure to test. (See the documentation, e.g. {"Destination": "REST", "EventType": ['HITReviewable'], "Version": "2006-05-05", "Destination": "http://api.poutsch.com/turk/ping"})
   * @param {String} params.TestEventType The name of the event type of test, one of [AssignmentAccepted, AssignmentAbandoned, AssignmentReturned, AssignmentSubmitted, HITReviewable, HITExpired, Ping] (Ping only valid for testing).
   * @throws {TypeError} if Notification or TestEventType isn't provided
   */
  mturk.SendTestEventNotification = function(params, callback){
    var defaults = {
      "Operation": "SendTestEventNotification"
      , "Notification": null
      , "TestEventType": null
    };
    params = merge(defaults, params);

    check(params.Notification).notNull();
    check(params.TestEventType).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err);
      } else {
        callback(null, doc);    // return actual doc for testing!!
      }
    });
  }

  /**
  * The SetHITAsReviewing operation updates the status of a HIT. If the status is Reviewable, this operation updates the status to Reviewing, or reverts a Reviewing HIT back to the Reviewable status.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITAsReviewingOperation.html
  * @param {Object} params Parameters for the API call
  * @param {String} params.HITId The ID of the HIT whose status is to be updated.
  * @param {Boolean} [params.Revert="false"] Specifies whether to update the HIT Status from Reviewing to Reviewable.
  * @param {function(err)} callback A callback function
  * @throws {TypeError} if a HITId isn't provided
  */
  mturk.SetHITAsReviewing = function(params, callback){
    var defaults = {
      "Operation": "SetHITAsReviewing"
      , "HITId": null
      , "Revert": "false"
    };
    params = merge(defaults, params);

    check(params.HITId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }


  /**
  * The SetHITTypeNotification operation creates, updates, disables or re-enables notifications for a HIT type.
  *
  * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html
  * @param {Object} params Parameters for the API call
  * @param {Boolean} params.Active Set on or off
  * @param {String} params.HITTypeId The ID of the new HIT type
  * @param {Object} params.Notification See the documentation eg {"Destination": "REST", "EventType": ['HITReviewable'], "Version": "2006-05-05", "Destination": "http://api.poutsch.com/turk/ping"}
  * @param {function(HITId)} callback A callback function
  * @throws {TypeError} if a HITTypeId or Notification isn't provided
  */
  mturk.SetHITTypeNotification = function(params, callback){
    var defaults = {
      "Operation": "SetHITTypeNotification"
      , "Notification": null
      , "HITTypeId": null
      , "Active": true
    };

    params = merge(defaults, params);
    check(params.Notification).notNull();
    check(params.HITTypeId).notNull();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err, null);
      } else {
        callback(null, params.HITId);
      }
    });
  };

  /**
   * @see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UpdateQualificationScoreOperation.html
   */
  mturk.UpdateQualificationScore = function(params, callback) {
    var defaults = {
      "Operation": "UpdateQualificationScore"
      , "QualificationTypeId": null
      , "SubjectId": null
      , "IntegerValue": null
    };

    params = merge(defaults, params);

    check(params.QualificationTypeId).notNull();
    check(params.SubjectId).notNull();
    check(params.IntegerValue).notNull().isInt();

    this.doRequest(params, function(err, doc){
      if(err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  };

/**************************************************************************
  _                _                            _   _               _     
 | |__   ___ _ __ | | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ 
 | '_ \ / _ \ '_ \| |/ _ \ '__| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
 | | | |  __/ |_) | |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \__ \
 |_| |_|\___| .__/|_|\___|_|    |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
            |_|
**************************************************************************/


  /**
  *
  */
  mturk.disableHITs = function(num, callback) {
    mturk.SearchHITs({"PageSize": num}, function(err, SearchHITsResult){
      if(err) callback(err);
      else {
        //var IDs = SearchHITsResult.HIT.map(function(HIT){ return { "HITId": HIT.HITId}; });
        //async.each(IDs, mturk.DisableHIT, callback);
        async.each(SearchHITsResult.HIT, function(item, done){
          mturk.DisableHIT({ "HITId": item.HITId}, done);
        }, callback);
      }
    });
  }



/**************************************************************************
        _   _ _ _ _                          _   _               _
  _   _| |_(_) (_) |_ _   _   _ __ ___   ___| |_| |__   ___   __| |___ 
 | | | | __| | | | __| | | | | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
 | |_| | |_| | | | |_| |_| | | | | | | |  __/ |_| | | | (_) | (_| \__ \
  \__,_|\__|_|_|_|\__|\__, | |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
                      |___/
**************************************************************************/

  /**
  * Takes an object of parameters and translates it into a REST query string that AWS will like.
  * NOTE:  All objects must be passed in as
  */
  function makeQuery(params) {
    var pairs = [];
    function encodeParam(name, value) {
      if(Array.isArray(value)) {
        for(var i=0; i<value.length; i++) {
          encodeParam(util.format("%s.%s", name, i+1), value[i]);
        }
      } else if(typeof(value)=="object"){
        for(key in value) {
          encodeParam(util.format("%s.%s", name, key), value[key]);
        }
      } else {
        pairs.push( util.format("%s=%s", name, encodeURIComponent(value)) );
      }
    }

    for(key in params) {
      var value = params[key];
      // Make sure all objects are wrapped in an Array
      if(typeof(value)=="object" && !Array.isArray(value))
        value = [value];
      encodeParam(key, value);
    }

    return pairs.join("&");
  }

  function get(doc, path) {
    if (doc && path != '') {
      var nodes = path.split('.');
      var key = nodes.shift();
      var node = doc[key];
      if (node == undefined) {
        Object.getOwnPropertyNames(doc).some(function(param_name) {
          if ((new RegExp(key)).test(param_name)) {
            node = doc[param_name];
            return true;
          } else {
            return false;
          }
        });
      }
      return get(node, nodes.join('.'));
    } else {
      return doc;
    }
  }

  function trim1(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  mturk.xml2js2JSON = function(elem) {
    if (typeof elem === 'string' || elem instanceof String) {
      return elem;
    } else if (elem && elem.length && elem.length <= 1) {
      return mturk.xml2js2JSON(elem[0]);
    } else if (elem && elem.length) {
      var converted = [];
      for (var i = 0; i < elem.length; i++) {
        converted.push(mturk.xml2js2JSON(elem[i]));
      };
      return converted;
    } else {
      var converted = {};
      Object.getOwnPropertyNames(elem).forEach(function(key) {
        converted[key] = mturk.xml2js2JSON(elem[key]);
      });
      return converted;
    }
  }

  /**
  * Executes a call to the Mechanical Turk API
  */
  mturk.doRequest = function(params, callback) {

    var timestamp = new Date().toISOString();
    var hmac = crypto.createHmac('sha1', this.secretKey);
    hmac.update(this.service + params.Operation + timestamp);
    var signature = hmac.digest('base64');
    var base = {
      "Service": this.service,
      "AWSAccessKeyId": this.accessKey,
      "Version": this.version,
      "Signature": signature,
      "Timestamp": timestamp
    };
    params = merge(base, params);

    var url = util.format("%s/?%s", this.getEndpoint(), makeQuery(params));
    request(url, function(error, response, xml) {
      //console.log( xml );
      if (error) {
        callback(error, null);
      } else if(response.statusCode != 200) {
        xml2js.parseString(xml, function(err, doc) {
          doc = mturk.xml2js2JSON(doc);
          var errMsg = get(doc, "Response.Request.Errors.Error.Message") || get(doc, "Response.HIT.Request.Errors.Error.Message") || err;
          callback(params.Operation+": "+response.statusCode+" "+errMsg);
        });
      } else {
        xml2js.parseString(xml, function(err, doc) {
          if(err) {
            callback(params.Operation+": "+err, null);
          } else {
            doc = mturk.xml2js2JSON(doc);
            var error = get(doc, "Response.Request.Errors.Error.Message") || get(doc, "Response.HIT.Request.Errors.Error.Message");
            var valid = get(doc, "Response.Request.IsValid") || get(doc, "Response.HIT.Request.IsValid");//=="True";
            if(error || valid == "False" ) {
              callback(params.Operation+": "+error, null);
            } else {
              callback(null, doc);
            }
          }
        });
      }
    });
  }


  /**
  *
  */
  mturk.getEndpoint = function(){
    return this.sandbox
      ? "https://mechanicalturk.sandbox.amazonaws.com"
      : "https://mechanicalturk.amazonaws.com";
  }


  /**
  *
  */
  function merge(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }


  /**
  *
  */
  function layoutParams(params){
    var i = 1
      , str;
    for (var name in params.HITLayoutParameters) {
      str = 'HITLayoutParameter.'+(i++);
      params[str+'.Name'] = name;
      params[str+'.Value'] = params.HITLayoutParameters[name];
    }
    return params;
  }

  return mturk;
}

