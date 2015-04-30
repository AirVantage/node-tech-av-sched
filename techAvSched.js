/**
 *
 * @param options.url
 * @param options.secret
 */
module.exports = function(options, http) {
    return {

        /**
         * Schedule a job
         *
         * @param  {Object}     requestBody     The job definition
         */
        scheduleJob: function(ruuid, requestBody) {
            return http.post(ruuid, options.url + "/sched/api/job-def", requestBody, null, null, null, {
                headers: {
                    "X-Sched-secret": options.secret
                }
            });
        },

        /**
         * Acknowledge a job
         *
         * @param  {int}     jobId      The uid of the job to acknowledge
         */
        ackJob: function(ruuid, jobId) {
            return http.post(ruuid, options.url + "/sched/api/job-action/ack", {
                id: jobId
            }, null, null, null, {
                headers: {
                    "X-Sched-secret": options.secret
                }
            });
        },

        /**
         * Delete a job
         *
         * @param  {int}     jobId      The uid of the job to acknowledge
         */
        deleteJob: function(ruuid, jobId) {
            return http.delete(ruuid, options.url + "/sched/api/job-def", {
                id: jobId
            }, null, null, null, {
                headers: {
                    "X-Sched-secret": options.secret
                }
            });
        }
    };
};
