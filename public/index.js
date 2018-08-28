const settings = require('electron-settings');
const fs = require('fs');

const getFiles = require('../scripts/getFiles');

const form = document.forms.downloader;
let credentials;

if (settings.has('credentials')) {
    credentials = settings.get('credentials');
} else {
    credentials = {
        domain: '',
        username: '',
        password: ''
    };
}

showCredentials(form, credentials);

form.addEventListener('submit', err => {
    err.preventDefault();
    handleSubmission(form);
});

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
 * [showCredentials description]
 * @param {[type]} form         [description]
 * @param {[type]} credentials  [description]
 */
function showCredentials(form, credentials) {
    form.domain.value = credentials.domain;
    form.username.value = credentials.username;
    form.password.value = credentials.password;
}
