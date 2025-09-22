module.exports = {
    buildEmailPrompt: (query, template) => {
        return `
        You are an AI email template assistant.
        Write an email template for the following query: ${query} and template: ${template}.
        If template is not provided, then write an email template for the following query: ${query}.
        Make sure it is grammatically correct, polite, and professional.
        Do not include the subject line.
        Do not wrap the response in any markdown or code blocks.
        Only return the final email template.
        `;
    },
}