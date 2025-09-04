routerAdd("POST", "/api/rawdelete/:collection", async (c) => {
  // 👉 Step 1: Get the collection name from the URL
  const collection = c.pathParam("collection");
  if (!collection) {
    return c.json(400, {
      error: "You must tell me which collection to delete from",
    });
  }

  // 👉 Step 2: Get the request body (the data sent to us)
  const reqInfo = $apis.requestInfo(c);
  const body = reqInfo.data;

  // 👉 Step 3: Get the filter rules (like id='123')
  let filter = body.filter
    ? body.filter
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)
    : [];

  if (filter.length === 0) {
    return c.json(400, {
      error: "You must tell me which record(s) to delete with a filter",
    });
  }

  // 👉 Step 4: Look at the collection schema (all field names)
  const dao = $app.dao();
  const coll = dao.findCollectionByNameOrId(collection);
  if (!coll) {
    return c.json(404, { error: "Collection not found" });
  }

  // Get the schema fields
  const schemaText = JSON.stringify(coll.schema);
  const fldList = JSON.parse(schemaText);
  const schemaFields = fldList.map((f) => f.name);

  // ✅ Add system fields based on collection type
  if (coll.type === "auth") {
    schemaFields.push(
      "id",
      "username",
      "email",
      "emailVisibility",
      "verified",
      "lastResetSentAt",
      "lastVerificationSentAt",
      "lastLogin",
      "created",
      "updated"
    );
  } else {
    // Base collection: add standard system fields
    schemaFields.push("id", "created", "updated");
  }

  // 👉 Step 5: Build WHERE clause from the filter rules
  const whereClauses = [];
  const bindings = {};

  filter.forEach((f, idx) => {
    // Match patterns like: name='Anele' or age>30
    const match = f.match(
      /^(\w+)\s*(=|!=|<>|>|>|<|>=|<=|~)\s*['"]?(.*?)['"]?$/
    );
    if (!match) return;

    const [, field, op, value] = match;
    if (!schemaFields.includes(field)) return;

    // Fix operators: != becomes <> ; ~ becomes LIKE
    let sqlOp = op;
    if (sqlOp === "!=") sqlOp = "<>";
    if (sqlOp === "~") sqlOp = "LIKE";

    // Give each filter its own name (to avoid mix-ups)
    const paramName = `filter_${field}_${idx}`;
    whereClauses.push(`${field} ${sqlOp} {:${paramName}}`);
    bindings[paramName] = value;
  });

  if (whereClauses.length === 0) {
    return c.json(400, { error: "No valid filters provided" });
  }

  // 👉 Step 6: Build the SQL queries
  const whereSQL = whereClauses.join(" AND ");
  const deleteSQL = `DELETE FROM ${collection} WHERE ${whereSQL}`;
  const countSQL = `SELECT COUNT(*) as count FROM ${collection} WHERE ${whereSQL}`;

  try {
    // 👉 Step 7: Run the DELETE query
    await $app.db().newQuery(deleteSQL).bind(bindings).execute();

    // 👉 Step 8: Count how many still match after delete
    const postCountResult = new DynamicModel({ count: 0 });
    await $app.db().newQuery(countSQL).bind(bindings).one(postCountResult);

    const remaining = postCountResult.count;

    // 👉 Step 9: deleted = true if no rows remain
    const deleted = remaining === 0;

    // 👉 Step 10: Send back results
    return c.json(200, {
      success: true,
      deleted: deleted,
      affected: remaining,
    });
  } catch (err) {
    // 👉 Step 11: If something breaks, show the error
    return c.json(500, { success: false, error: err.message, deleted:false, affected: 0 });
  }
});
