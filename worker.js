var _ = require('lodash');
var moment = require('moment');

function CronJob(schedule, job, handler) {
    var CronJob = require('cron').CronJob;
    var inProgress = false;
    new CronJob(schedule, function () {
        if (!inProgress) {
            inProgress = true;

            handler(job, function (err) {

                if (err) {
                    console.log('[ERROR]', job, err, err.stack);
                    console.error(err);
                }

                inProgress = false;
            });
        } else {
            console.log('[CRON] waiting...');
        }

    }, null, true, 'America/Los_Angeles');
}

function MailJetMailer(config) {
    var Mailjet = require('node-mailjet').connect(
        config.API_KEY,
        config.API_KEY_PRIVATE
    );

    var sendEmail = Mailjet.post('send');

    this.send = function (mail, next) {
        var emailData = {
            "FromEmail": config.FromEmail,
            'FromName': config.FromName,
            'Subject': mail.subject,
            'Text-part': mail.text,
            'Recipients': [{'Email': mail.to}],
            'Attachments': []
        };

        sendEmail
            .request(emailData)
            .then(function (result) {
                next(null, result);
            })
            .catch(next);
    }
}

function JobMailer(mailer, recipient) {
    this.send = function (job, text, next) {
        var mail = {
            to: recipient,
            subject: job.title,
            text: text
        };

        mailer.send(mail, next);
    }
}


function CronJobsHandler(workerConfig, handler) {
    this.jobs = _.map(workerConfig.jobs, function (job) {
        return new CronJob(job.period || workerConfig.notification.defaultJobPeriod, job, handler);
    });
}

var workerConfig = require('./worker.config.json');
var mailer = new MailJetMailer(workerConfig.notification.credentials.MailJet);

var jobMailer = new JobMailer(mailer, workerConfig.notification.recipient);

new CronJobsHandler(workerConfig, function (job, next) {
    var exec = require('child_process').exec;
    var maxBuffer = 1024 * 1024 * 1024;

    var startDate = moment(new Date(job.start)).startOf('day');
    var endDate = moment(new Date(job.end)).endOf('day');

    if (moment() > endDate) {
        console.log('[SKIPPED JOB]', '`' + job.title + '`', 'reason: out of date range');
        return next();
    }

    if (startDate < moment()) {
        var fromStart = job.start;
        job.start = moment().format('M/DD/YYYY');
        console.log('[FIXED DATE]', '`' + job.title + '`', 'reason: start date out of range', 'FROM: ' + fromStart, 'TO: ' + job.start);
    }

    // console.log('[JOB]', '`' + job.title + '`');
    var command = 'node ./united.js ' + job.origin + ' ' + job.destination + ' ' + job.start + ' ' + job.end;
    command += ' --worker-request';

    if (job.directOnly) {
        command += ' --direct-only'
    }

    console.log('[JOB] > ' + command);

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


var app = require('express')();

app.get('/', function (req, res) {
    res.send('OK');
});

app.listen(process.env.PORT || 8080, function () {
    console.log('Health is OK');
});