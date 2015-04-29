var assert = require("assert");
var BPromise = require("bluebird");
var request = BPromise.promisifyAll(require("request"));
var _ = require("lodash");
var logger = require("node-tech-logger");

/**
 * How many facts should we keep in memory before trying to send them to
 * av-data ?
 */
var FACT_BUFFER_SIZE = 5000;

/**
 * How many facts should we send to av-data at a time ?
 */
var FACT_BATCH_SIZE = 1000;

/**
 * Module to send facts to av-data.
 *
 * The 'scheduleFact' function can be called to schedule a fact for sending later.
 *
 * Facts are buffered in memory, before being sent in batch to av-data.
 * If av-data is unavailable, or if sending fails, facts are lost.
 *
 * @param options
 * @param options.environment
 *           {String} to be passed in Facts API (eg 'ENV')
 * @param options.application
 *           {String} to be passed in Facts API (eg 'AV-SERVER')
 * @param options.server.path
 *           {String} host or host:port of the av-data instance
 * @param options.factBufferSize
 *           {Integer} number of facts after which a batch of facts will be sent to av-data
 * @param options.factBatchSize
 *           {Integer} number of facts sent to av-data every time a json request is done
 */
module.exports = function(options) {

    assert.ok(options);
    assert.ok(options.path);
    assert.ok(options.environment);
    assert.ok(options.application);

    // Allow tests to pass a custom request implementaion.
    request = options.request || request;

    var factBuffer = [];

    var factBufferSize = options.factBufferSize || FACT_BUFFER_SIZE;
    var factBatchSize = options.factBatchSize || FACT_BATCH_SIZE;

    function scheduleFact(fact) {
        logger.debug("Scheduling fact ", fact, "to be sent to av-data");
        // Schedule sending a fact to av-data.
        // We do it out of the current response handling to avoir
        // blocking the response.
        // If the fact cannot be sent for any reason, it is simply ignored.
        setTimeout(function () {
            try {
                addFact(fact);
            } catch (e) {
                logger.warn("Unable to post fact to av-data");
                logger.warn(e);
            }
        });

    }

    function addFact(fact) {
        factBuffer.push(fact);
        var res = BPromise.resolve();

        if (factBuffer.length > factBufferSize) {
            // Remove a batch of facts.
            // If sending fails, for any reason, the
            // batch will be lost.
            var facts = factBuffer.splice(0, factBatchSize);

            try {
                res = postFacts(facts);
            } catch (e) {
                logger.warn("Unable to send batch of facts", JSON.stringify(e));
                res = BPromise.reject(e);
            }
        }
        return res;
    }

    function postFacts(facts) {

        var url = ["http:/", options.path, "facts"].join("/");

        _.each(facts, function (fact) {
            // New fact api expects 'tx' as the transaction unique id.
            fact.tx = fact.ruuid;
            delete fact.ruuid;
        });

        //        var body = JSON.stringify({
        var body = {
            environment : options.environment,
            application : options.application,
            facts : facts
        };

        logger.debug("Posting body", body , "to av-data at url", url);

        return request.postAsync(url, {
            json: true,
            body: body
        }).then(function(responseAndBody) {

            var response = responseAndBody[0];
            var responseBody = responseAndBody[1];

            if (response && response.statusCode === 200) {
                return responseBody;
            } else {
                logger.error("Error sending data", response.statusCode, responseBody);

                return BPromise.reject({
                    response: response ? response.statusCode : response,
                    body: responseBody
                });
            }
        });

    }


    return {

        addFact : addFact,
        scheduleFact: scheduleFact,

        factReporter: {
            reportFact: function(fact) {
                logger.debug("[av-data] Reporting fact", fact);
                if (fact.ruuid !== "unknown") {
                    scheduleFact(fact);
                }
            }
        }

    };

};
