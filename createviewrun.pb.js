routerAdd(
  "POST",
  "/api/createviewrun",
  async (c) => {
    let perPage = 50;
    let totalPages = 0;
    let totalItems = 0;
    try {
      const body = $apis.requestInfo(c).data || {};
      perPage = parseInt(body.perPage) || 50;
      const query = body.query?.trim();
      const collectionName = body.collection?.trim() || generateUniqueCollectionName("view");
      const replaceExisting = !!body.replace;
      const runAfter = !!body.run;
      const sort = body.sort?.trim()
        ? body.sort.split(",").map(s => s.trim()).join(",")
        : "id"; // default

      // Rules (use provided or defaults)
      const rules = {
        listRule: body.listRule ?? "",
        viewRule: body.viewRule ?? "",
        createRule: body.createRule ?? null,
        updateRule: body.updateRule ?? null,
        deleteRule: body.deleteRule ?? null
      };

      if (!query) {
        return c.json(400, { items: [], status: "Failure", error: "createviewrun: query is required" });
      }

      // === SECURITY CHECKS ===
      const forbidden = /\b(DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE|REPLACE|CREATE)\b/i;
      if (!/^select\s+/i.test(query)) {
        return c.json(400, { items: [], status: "Failure", error: "createviewrun: Only SELECT statements are allowed" });
      }
      if (forbidden.test(query)) {
        return c.json(400, { items: [], status: "Failure", error: "createviewrun: Dangerous SQL keyword detected" });
      }
      if (query.includes(";")) {
        return c.json(400, { items: [], status: "Failure", error: "createviewrun: Multiple statements are not allowed" });
      }

      // === Helper: Generate Unique Name ===
      function generateUniqueCollectionName(prefix = "tmp") {
        const randomStr = Math.random().toString(36).substring(2, 7);
        const timestamp = Date.now();
        return `${prefix}_${randomStr}_${timestamp}`;
      }

      // === Handle existing collection ===
      let existingCollection = null;
      try {
        existingCollection = $app.dao().findCollectionByNameOrId(collectionName);
      } catch (_) {
        existingCollection = null;
      }

      if (existingCollection) {
        // Update existing view
        if (existingCollection.type !== "view") {
          return c.json(400, { items: [], status: "Failure", error: `createviewrun: Existing collection '${collectionName}' is not a view.` });
        }
        if (replaceExisting) {
          existingCollection.options = { query };
          Object.assign(existingCollection, rules);
          await $app.dao().saveCollection(existingCollection);
        }
      } else {
        // Create new view
        const newCollection = new Collection();
        newCollection.name = collectionName;
        newCollection.type = "view";
        newCollection.options = { query };
        Object.assign(newCollection, rules);
        await $app.dao().saveCollection(newCollection);
      }

      // === If runAfter is true, fetch records in batches ===
      let records = [];
      totalPages = 0;
      totalItems = 0;
      if (runAfter) {
        let offset = 0;
        let batch;

        do {
          batch = await $app.dao().findRecordsByFilter(
            collectionName,
            "id!=''",
            sort,         // now using provided sort
            perPage,
            offset
          );
          records.push(...batch);
          offset += batch.length;
        } while (batch.length === perPage);
      }
      // --- Total count ---
      let rowcount = records.length;
      totalPages = Math.ceil(rowcount / perPage);     
      
      return c.json(200, {
        items: runAfter ? records : [],
        totalItems: runAfter ? records.length : 0,
        perPage,
        totalPages
      });

    } catch (err) {
      return c.json(400, { items: [], error: err.message, totalItems, perPage, totalPages });
    }
  },
  $apis.activityLogger($app)
);
