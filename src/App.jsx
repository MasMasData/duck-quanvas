import React, { useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import FileUploadNode from './components/FileUploadNode';
import EditorNode from './components/EditorNode';
import ChartNode from './components/ChartNode';
import * as duckdb from '@duckdb/duckdb-wasm';

let db, conn;


async function initializeDB() {
  const MANUAL_BUNDLES = {
    mvp: {
      mainModule: '/duckdb-mvp.wasm',
      mainWorker: '/duckdb-browser-mvp.worker.js',
    },
    eh: {
      mainModule: '/duckdb-eh.wasm',
      mainWorker: '/duckdb-browser-eh.worker.js',
    },
  };

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);
  conn = await db.connect();
}
const nodeTypes = {
  fileUpload: FileUploadNode,
  editor: EditorNode,
  chart: ChartNode,
};

const initialNodes = [
  { 
    id: '1', 
    type: 'fileUpload', 
    data: { label: 'File Upload' }, 
    position: { x: 250, y: 5 },
    style: { width: 180, height: 80 }
  },
  { 
    id: '2', 
    type: 'editor',
    data: { label: 'SQL Editor' }, 
    position: { x: 100, y: 100 },
    style: { width: 300, height: 300 }
  },
  { 
    id: '3', 
    type: 'chart',
    data: { label: 'Chart' }, 
    position: { x: 450, y: 100 },
    style: { width: 300, height: 300 }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true }
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    initializeDB();
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    try {
      await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
      await conn.query(`CREATE TABLE csv_data AS SELECT * FROM read_csv_auto('${file.name}')`);
      setNodes((nds) => 
        nds.map((node) => 
          node.id === '2' 
            ? { ...node, data: { ...node.data, result: "CSV file loaded successfully. You can now run queries on the 'csv_data' table." } }
            : node
        )
      );
    } catch (error) {
      console.error("Error loading CSV:", error);
      setNodes((nds) => 
        nds.map((node) => 
          node.id === '2' 
            ? { ...node, data: { ...node.data, result: `Error loading CSV: ${error.message}` } }
            : node
        )
      );
    }
  }, [setNodes]);

  const handleRunQuery = useCallback(async (query) => {
    try {
      const result = await conn.query(query);
      const rows = result.toArray();
      
      const convertToSerializable = (value) => {
        if (typeof value === 'bigint') return value.toString();
        if (value instanceof Date) return value.toISOString();
        if (ArrayBuffer.isView(value)) return Array.from(value);
        if (value === null || value === undefined) return null;
        return value;
      };

      const serializableRows = rows.map(row => 
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, convertToSerializable(value)])
        )
      );

      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, result: JSON.stringify(serializableRows, null, 2) } };
          }
          if (node.id === '3') {
            const labels = serializableRows.map(row => Object.values(row)[0]);
            const data = serializableRows.map(row => Object.values(row)[1]);
            const chartData = {
              labels,
              datasets: [{
                label: 'Query Result',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
              }]
            };
            return { ...node, data: { ...node.data, chartData } };
          }
          return node;
        })
      );
    } catch (error) {
      setNodes((nds) => 
        nds.map((node) => 
          node.id === '2' 
            ? { ...node, data: { ...node.data, result: `Error: ${error.message}` } }
            : node
        )
      );
    }
  }, [setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return { ...node, data: { ...node.data, onFileUpload: handleFileUpload } };
        }
        if (node.id === '2') {
          return { ...node, data: { ...node.data, onRunQuery: handleRunQuery } };
        }
        return node;
      })
    );
  }, [setNodes, handleFileUpload, handleRunQuery]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default App;
