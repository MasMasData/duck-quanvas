import * as duckdbduckdbWasm from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.1-dev106.0/+esm";
window.duckdbduckdbWasm = duckdbduckdbWasm;

let db, conn;
let editor;

async function initializeDB() {
  db = await getDb();
  conn = await db.connect();
}

function initializeCodeMirror() {
  editor = CodeMirror(document.getElementById("editor"), {
    mode: "text/x-sql",
    theme: "monokai",
    lineNumbers: true,
    extraKeys: {"Ctrl-Space": "autocomplete"}
  });
  editor.setValue("SELECT * FROM csv_data LIMIT 10;");
}

async function loadCSV(file) {
  try {
    await db.registerFileHandle(file.name, file, duckdbduckdbWasm.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    await conn.query(`CREATE TABLE csv_data AS SELECT * FROM read_csv_auto('${file.name}')`);
    console.log("CSV data loaded into 'csv_data' table");
    document.getElementById("result").textContent = "CSV file loaded successfully. You can now run queries on the 'csv_data' table.";
  } catch (error) {
    console.error("Error loading CSV:", error);
    document.getElementById("result").textContent = `Error loading CSV: ${error.message}`;
  }
}

async function runQuery() {
  const query = editor.getValue();
  try {
    const result = await conn.query(query);
    const rows = result.toArray();
    
    const convertToSerializable = (value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (ArrayBuffer.isView(value)) {
        return Array.from(value);
      } else if (value === null || value === undefined) {
        return null;
      }
      return value;
    };

    const serializableRows = rows.map(row => 
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, convertToSerializable(value)])
      )
    );

    document.getElementById("result").textContent = JSON.stringify(serializableRows, null, 2);
  } catch (error) {
    document.getElementById("result").textContent = `Error: ${error.message}`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initializeDB();
  initializeCodeMirror();

  document.getElementById("csvFile").addEventListener("change", (e) => {
    loadCSV(e.target.files[0]);
  });

  document.getElementById("runQuery").addEventListener("click", runQuery);
});
