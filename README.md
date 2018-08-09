# JIRA Downloader

Bulk attachment downloader for JIRA issues.

## Description

This NodeJS command line interface downloads all attachments for JIRA issues that match a given JQL string. Attachments are placed in separate directories (named after the issue key).


## Installation

1. Navigate to the folder in terminal/cmd
2. Run `npm install` to install dependencies
3. Open /config/credentials.json and populate the "domain" field with the domain where the JIRA server is running. Then, populate the "username" and "password" fields with your own credentials.


## Usage

Run one of the following commands inside the home folder:
* `npm run clean` to delete all downloaded attachments inside the /output/attachments folder.
* `npm start` to start the download script. This command will also run the clean script; the attachments folder must be empty before the download starts.
    * Paste the JQL string into the terminal when prompted and press enter.
    * Files will then be downloaded into the /output/attachments folder.
    * A log.txt file showing download statistics is located in the /output folder.
