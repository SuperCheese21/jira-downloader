// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');

const defaultCredentials = require('../config/credentials.json');
const getFiles = require('../scripts/getFiles');

const form = document.forms.downloader;
form.addEventListener('submit', err => {
    err.preventDefault();
    handleSubmission(form);
});

setDefaultCredentials(form, defaultCredentials);

/**
 * [handleSubmission description]
 * @param  {[type]} data [description]
 */
function handleSubmission(data) {
    const credentials = {
        domain: form.domain.value,
        username: form.username.value,
        password: form.password.value
    };
    const jql = form.jql.value;
    getFiles(credentials, jql);
}

/**
 * [setDefaultCredentials description]
 * @param {[type]} form               [description]
 * @param {[type]} defaultCredentials [description]
 */
function setDefaultCredentials(form, defaultCredentials) {
    form.domain.value = defaultCredentials.domain;
    form.username.value = defaultCredentials.username;
    form.password.value = defaultCredentials.password;
}
