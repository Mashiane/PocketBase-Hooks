routerAdd("POST", "/api/createhook", (c) => {
    try {
        //get the data from the request
        const data = $apis.requestInfo(c).data
        //get the account
        const account = data.account
        //get the file name to create
        const fileName =  'greenapi_' + account + '.pb.js'
        //access the hooks directory
        const hooksDir = __hooks
        //build the path to write to
        const hooksPath = hooksDir + '/' + fileName
        //read the contents of the template
        const content = $os.readFile(hooksDir + '/greenapi.txt')
        //convert the content to string
        const scontent = toString(content)
        //replace some text
        let scontent1 = scontent.replace('greenapi_account', 'greenapi_' + account)
        let scontent2 = scontent1.replace('pablo_incoming', 'incoming_' + account)
        //write content to hooksDir file
        $os.writeFile(hooksPath, scontent2, '0644')
        return c.json(200, { "createhook": "Success"})
    } catch (err) {
        return c.json(400, { "createhook": "Failure", "error": JSON.stringify(err) })
    }
}, $apis.activityLogger($app))