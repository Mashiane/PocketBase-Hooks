routerAdd("POST", "/api/deleteall", (c) => {
    try {
        const data = $apis.requestInfo(c).data
        const tablename = data.tablename
        if (tablename.length > 0) {
            $app.dao().db()
                .newQuery("DELETE FROM " + tablename)
                .execute()
            return c.json(200, { "deleteall": "Success" })
        } throw new BadRequestError("The tablename has not been specified!")
    } catch (err) {
        return c.json(400, { "deleteall": "Failure", "error": err })
    }
}, $apis.activityLogger($app))

routerAdd("POST", "/api/deleteallauth", (c) => {
    try {
        const data = $apis.requestInfo(c).data
        const tablename = data.tablename
        if (tablename.length > 0) {
            $app.dao().db()
                .newQuery("DELETE FROM " + tablename)
                .execute()
            return c.json(200, { "deleteall": "Success" })
        } throw new BadRequestError("The tablename has not been specified!")
    } catch (err) {
        return c.json(400, { "deleteall": "Failure", "error": err })
    }
}, $apis.activityLogger($app), $apis.requireAdminAuth())