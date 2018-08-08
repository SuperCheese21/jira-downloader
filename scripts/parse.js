/**
 * Creates a json object containing attachments for each issue and download links
 * @param  {Array} data Raw search results API response
 * @return {Array}      Array of issues each with an array of attachments
 */
function parseResponse(data) {
    let attachments = [];
    data.forEach(issue => {
        const attachment = issue.fields.attachment;
        if (attachment && attachment.length > 0) {
            let list = [];
            attachment.forEach(file => {
                list.push({
                    id: file.id,
                    size: file.size,
                    filename: file.filename,
                    content: file.content
                });
            });
            attachments.push({
                id: issue.id,
                key: issue.key,
                list: list
            });
        }
    });
    return attachments;
}

module.exports = parseResponse;
