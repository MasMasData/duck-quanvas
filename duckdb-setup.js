const getDb = async () => {
    const duckdb = window.duckdbduckdbWasm;
    if (window._db) return window._db;
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );
  
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);
    window._db = db;
    return db;
  };
  