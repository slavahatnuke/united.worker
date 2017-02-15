United Upgrades
======
 A tool to find upgrade availability on United Airlines. Includes web front-end implementation.


## How to deploy on Google App Engine
1. Open [https://console.cloud.google.com](https://console.cloud.google.com)
1. Create project for example `united-worker-production`
1. Install google cloud tool `gcloud` [https://cloud.google.com/sdk/](https://cloud.google.com/sdk/)
1. Open Terminal
1. `gcloud init` it will ask you to login and select your project
1. Install [Node.js](https://nodejs.org)
1. Extract app from ZIP
1. `npm install` - setup app dependencies
1. `cp worker.config.json.dist worker.config.json` copy default config
1. open `worker.config.json` in the editor
1. setup your credentials for notification in the `worker.config.json`  
    - recipient all reports will be sent to this email
    - google account and password to have access for sending emails
        * if you don't want to place your google account just make new google account for these goals.
        * Please check this article to Enable IMAP [https://support.google.com/mail/answer/7126229?hl=en](https://support.google.com/mail/answer/7126229?hl=en)
1. setup your jobs by example in the `worker.config.json` jobs section, its array
    - please pay your attention on `"period": "0 */10 * * * *"` 
    - its cron schedule by default it will check updates every `10 mins` more info about schedule [https://www.npmjs.com/package/cron](https://www.npmjs.com/package/cron) or unix/linux cron schedule 
1. `npm start` it will start app locally and you can debug your configuration
    - you can setup `"period": "*/30 * * * * *"` it will grab updates every `30 secs` its good option to setup app
    - please revert this back for production to `"period": "0 */10 * * * *"`
1. `npm run deploy` - when you setup all jobs and notifications just deploy this.

    
## united.js tool

The main component is a node.js script that goes through the United.com search process.

Follow these steps to get started:

1. Install [Node.js](https://nodejs.org)
1. [Download this repository](https://github.com/polastre/united/archive/master.zip)
1. Extract the zip file
1. Open up a command shell and switch to the extracted directory
1. Install node dependencies by typing `npm install`

Run the tool with:

    node united.js ORIGIN DESTINATION START END

Example

    node united.js SFO TPE 5/18/2016 5/20/2016

## FAQ

The relevant sections of the FAQ in [2014/www/templates/index.html](2014/www/templates/index.html) are copied here.

### Why can you only search one-way?

The best way to put together a successful upgrade plan for a round trip ticket is to be flexible on your dates.  By searching both directions separately, you can pick which dates in each direction are most convenient for you to travel.  Then you can combine the results for the final ticket that you intend to book.

### Why do I get no results?

Airlines are funny companies.  The "fare classes" available determines whether there's an upgrade or not.  This changes by time of day, day of week, how many other customers are booked in for the flight, number of days until the flight, and probably the phase of the moon.  The **best days to look for upgrades** are in the middle of the week when fewer people are buying airline tickets.

Keep in mind that upgrades are rarely available for peak travel periods, such as summer school vacation, unless booked exactly one year in advance.

### Who Is This For?

United Premier 1K members, Global Services, anyone holding an upgrade certificate (Global Premier Upgrade or Regional Upgrade), or anyone that wants to use miles and cash to upgrade can find flights and dates that have **immediate upgrade availability**.  If you book a flight with immediate upgrade availability, the agent on the phone can confirm you in the next class of service immediately after booking.  You can also book online and choose to the flights that have a green "instant upgrade" arrow (be sure to use [Advanced Search](https://www.united.com/ual/en/us/flight-search/book-a-flight) and select the upgrade option you want).

### How Do I Use This?

This tool searches for **one-way** availability between the two specified airports.  It looks at every date, and determines whether immediately upgradable seats are available.  You should put your outbound flight in a one query, and then your potential return flight (and date range) as another.  When you find both outbound and return flights with upgrade availability, then go to [united.com](https://www.united.com/ual/en/us/flight-search/book-a-flight) and search with those specific dates.
