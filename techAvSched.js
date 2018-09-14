const got = require('got');

class AvSched {
  /**
   * @param setup.url
   * @param setup.secret
   */
  constructor(setup) {
    this.got = got.extend({
      baseUrl: setup.url,
      json: true,
      headers: {
        'X-Sched-secret': setup.secret
      }
    });
  }

  /**
   * Schedule a job
   *
   * @param  {Object}     requestBody     The job definition
   */
  scheduleJob(body) {
    this.got.post('/sched/api/job-def', { body });
  }

  /**
   * Acknowledge a job
   *
   * @param  {int}     jobId      The uid of the job to acknowledge
   */
  ackJob(jobId) {
    this.got.post('/sched/api/job-action/ack', { body: { id: jobId } });
  }

  /**
   * Delete a job
   *
   * @param  {int}     jobId      The uid of the job to acknowledge
   */
  deleteJob(jobId) {
    this.got.delete('/sched/api/job-def', { body: { id: jobId } });
  }
}

module.exports = AvSched;
