module.exports = {
    buildEmailSubjectPrompt: (query, subject, template) => {
    return `
        You are an AI assistant that generates professional and concise email subject lines.
        Given a query: ${query}, subject line: ${subject} and an email template description in HTML format: ${template}

        If a subject line is provided, rewrite it to be grammatically correct, polite, and professional with reference to the query.
        If no subject is provided, generate a suitable subject line based on the content of the email template with reference to the query.
        If the template is not provided, use the query to generate the subject line.

        Requirements:
        The output should only include the email subject line — no body content and no reference to the template itself.
        Return the result as a array of at least 5 subject line options, all limited to a single line.
        Each subject should be suitable for professional communication and clearly convey the purpose of the email.
        `;
    }
}