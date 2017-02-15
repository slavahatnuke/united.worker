var _ = require('lodash');

function CronJob(schedule, job, handler) {
    var CronJob = require('cron').CronJob;
    var inProgress = false;
    new CronJob(schedule, function () {
        if (!inProgress) {
            inProgress = true;

            handler(job, function () {
                inProgress = false;
            });
        } else {
            console.log('waiting ...');
        }

    }, null, true, 'America/Los_Angeles');
}

function JobMailer(settings) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: settings.credentials.googleAccount,
            pass: settings.credentials.googlePassword
        }
    });

// setup email data with unicode symbols
    this.send = function (job, text, next) {
        var mail = {
            from: settings.credentials.googleAccount, // sender address
            to: settings.recipient, // list of receivers
            subject: job.title, // Subject line
            text: text
        };

        // console.log('mail', mail);
        // next();

        transporter.sendMail(mail, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);

            next(error);
        });
    }
}


function CronJobsHandler(jobsConfig, handler) {
    this.jobs = _.map(jobsConfig, function (job) {
        return new CronJob(job.period, job, handler);
    });
}

var workerConfig = require('./worker.config.json');
var jobMailer = new JobMailer(workerConfig.notification);

new CronJobsHandler(workerConfig.jobs, function (job, next) {
    var exec = require('child_process').exec;
    var maxBuffer = 1024 * 1024 * 1024;

    var command = 'node ./united.js ' + job.origin + ' ' + job.destination + ' ' + job.start + ' ' + job.end;
    command += ' --worker-request';

    if(job.directOnly) {
      command += ' --direct-only'
    }

    console.log('> ' + command);

    exec(command, {maxBuffer: maxBuffer}, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }

        var result = _.trim(stdout || '');

        if (result.length) {
            jobMailer.send(job, result, next);
        } else {
            console.log('nothing to send');
            next();
        }
    });
});
