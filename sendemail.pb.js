routerAdd("POST", "/api/sendemail", (c) => {
    try {
        // read the body via the cached request object
        const data = $apis.requestInfo(c).data
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress,
                name: $app.settings().meta.senderName,
            },
            to: [{ address: data.to }],
            subject: data.subject,
            html: data.message
        })
        $app.newMailClient().send(message)
        return c.json(200, { "email": "Success" })
    } catch (err) {
        return c.json(200, { "email": "Failure", "error": err })
    }
}, $apis.activityLogger($app))