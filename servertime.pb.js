routerAdd("POST", "/api/servertime", (c) => {
    try {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`
        return c.json(200, { "servertime": formattedDateTime })
    } catch (err) {
        return c.json(400, { "servertime": "Failure", "error": err })
    }
}, $apis.activityLogger($app))