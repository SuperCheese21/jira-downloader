/**
 * Creates a json object containing attachments for each issue and download links
 * @param  {Array} data Raw search results API response
 * @return {Array}      Array of issues each with an array of attachments
 */
function parseResponse(data) {
    return data.reduce((attachments, issue) => {
        const attachment = issue.fields.attachment;
        if (attachment && attachment.length > 0) {
            attachments.push({
                id: issue.id,
                key: issue.key,
                list: attachment.map(file => ({
                    id: file.id,
                    key: issue.key,
                    filename: file.filename,
                    content: file.content
                }))
            });
        }
        return attachments;
    }, []);
}

module.exports = parseResponse;
