const fs = require('fs');

const getFiles = require('../scripts/getFiles');

const form = document.forms.downloader;
form.addEventListener('submit', err => {
    err.preventDefault();
    handleSubmission(form);
});

let credentials = {
    domain: "",
    username: "",
    password: ""
};
setCredentials(form, credentials);

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
 * [setCredentials description]
 * @param {[type]} form         [description]
 * @param {[type]} credentials  [description]
 */
function setCredentials(form, credentials) {
    form.domain.value = credentials.domain;
    form.username.value = credentials.username;
    form.password.value = credentials.password;
}
