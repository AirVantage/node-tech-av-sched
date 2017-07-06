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
      return http.post(ruuid, {
        url: options.url + '/sched/api/job-def',
        body: requestBody,
        headers: {
          'X-Sched-secret': options.secret
        }
      });
    },

    /**
         * Acknowledge a job
         *
         * @param  {int}     jobId      The uid of the job to acknowledge
         */
    ackJob: function(ruuid, jobId) {
      return http.post(ruuid, {
        url: options.url + '/sched/api/job-action/ack',
        body: {
          id: jobId
        },
        headers: {
          'X-Sched-secret': options.secret
        }
      });
    },

    /**
         * Delete a job
         *
         * @param  {int}     jobId      The uid of the job to acknowledge
         */
    deleteJob: function(ruuid, jobId) {
      return http.delete(ruuid, {
        url: options.url + '/sched/api/job-def',
        body: {
          id: jobId
        },
        headers: {
          'X-Sched-secret': options.secret
        }
      });
    }
  };
};
