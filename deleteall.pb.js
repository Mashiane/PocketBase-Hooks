routerAdd(
  "POST",
  "/api/deleteall",
  (c) => {
    try {
      const data = $apis.requestInfo(c).data;
      const tablename = data.tablename;
      const exists = $app.findCollectionByNameOrId(tablename);
      if (!exists) {
        throw new BadRequestError("The specified table does not exist!");
      }
      if (tablename.length > 0) {
        $app
          .dao()
          .db()
          .newQuery("DELETE FROM " + tablename)
          .execute();
        return c.json(200, { deleteall: "Success" });
      }
      throw new BadRequestError("The tablename has not been specified!");
    } catch (err) {
      return c.json(400, { deleteall: "Failure", error: err });
    }
  },
  $apis.activityLogger($app)
);

routerAdd(
  "POST",
  "/api/deleteallauth",
  (c) => {
    try {
      const data = $apis.requestInfo(c).data;
      const tablename = data.tablename;
      const exists = $app.findCollectionByNameOrId(tablename);
      if (!exists) {
        throw new BadRequestError("The specified table does not exist!");
      }
      if (tablename.length > 0) {
        $app
          .dao()
          .db()
          .newQuery("DELETE FROM " + tablename)
          .execute();
        return c.json(200, { deleteall: "Success" });
      }
      throw new BadRequestError("The tablename has not been specified!");
    } catch (err) {
      return c.json(400, { deleteall: "Failure", error: err });
    }
  },
  $apis.activityLogger($app),
  $apis.requireAdminAuth()
);

// Endpoint that allows superusers to query the database
routerAdd("POST", "/api/query", (e) => {
  console.log("Query received");
  if (!e.hasSuperuserAuth()) return e.json(401, { message: "Unauthorized" });
  let { query, type, obj } = JSON.parse(JSON.stringify(e.requestInfo().body));

  if (type == "all") {
    console.log("Query all");
    const result = arrayOf(new DynamicModel(obj));
    $app.db().newQuery(query).all(result);
    return e.json(200, { result });
  } else if (type == "one") {
    const result = new DynamicModel(obj);
    $app.db().newQuery(query).one(result);
    return e.json(200, { result });
  }

  $app.db().newQuery(query).execute();
  e.json(200, { message: "Query executed" });
});

onRecordAfterCreateRequest(async (user) => {
  try {
    // Generate SHA256 hash of the user's email for Gravatar URL
    const emailHash = $security.sha256(user.record.email());
    const gravatarUrl = "https://gravatar.com/avatar/" + emailHash + "?d=404";

    // Retrieve the image
    const file = await $filesystem.fileFromUrl(gravatarUrl);
    const fileKey = user.record.baseFilesPath() + "/" + file.name;

    // Upload the file
    const fs = $app.newFilesystem();
    fs.uploadFile(file, fileKey);

    // Update the record
    user.record.set("avatar", file.name);

    // Save the record since we're in the `AfterCreate` hook
    $app.dao().saveRecord(user.record);
  } catch (error) {
    console.error("Error fetching or updating user Gravatar:", error);
  }
}, "users");

