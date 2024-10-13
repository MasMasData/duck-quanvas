import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/NodeStyles.css';
import FileUploadNode from './components/FileUploadNode';
import EditorNode from './components/EditorNode';
import ChartNode from './components/ChartNode';
import * as duckdb from '@duckdb/duckdb-wasm';


let db;

function getBasePath() {
  return import.meta.env.BASE_URL;
}

async function initializeDB() {
  const basePath = getBasePath();
  const MANUAL_BUNDLES = {
    mvp: {
      mainModule: `${basePath}duckdb-mvp.wasm`,
      mainWorker: `${basePath}duckdb-browser-mvp.worker.js`,
    },
    eh: {
      mainModule: `${basePath}duckdb-eh.wasm`,
      mainWorker: `${basePath}duckdb-browser-eh.worker.js`,
    },
  };

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);
}

const nodeTypes = {
  fileUpload: FileUploadNode,
  editor: EditorNode,
  chart: ChartNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [conn, setConn] = useState(null);

  const defaultEdgeOptions = {
    animated: true,
    type: 'smoothstep', // You can change this to 'default', 'straight', 'step', etc.
    style: { stroke: '#888' }, // Optional: set a default color
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888',
    },
  };

  useEffect(() => {
    initializeDB().then(() => {
      db.connect().then(setConn);
    });
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    if (!conn) {
      throw new Error("Database connection not available");
    }
    try {
      await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
      await conn.query(`CREATE TABLE csv_data AS SELECT * FROM read_csv_auto('${file.name}')`);
      return true;
    } catch (error) {
      console.error("Error loading CSV:", error);
      throw error;
    }
  }, [conn]);

  const handleRunQuery = useCallback(async (query, nodeId) => {
    if (!conn) {
      throw new Error("Database connection not available");
    }
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
  
      const labels = serializableRows.map(row => Object.values(row)[0]);
      const dataValues = serializableRows.map(row => Object.values(row)[1]);
  
      const chartData = {
        labels: labels,
        datasets: [{
          label: 'Query Result',
          data: dataValues,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
  
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, result: serializableRows } };
          }
          if (node.id === `chart-${nodeId}`) {
            return { ...node, data: { ...node.data, chartData: chartData } };
          }
          return node;
        })
      );
    } catch (error) {
      console.error("Error running query:", error);
      setNodes((nds) => 
        nds.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, result: `Error: ${error.message}` } }
            : node
        )
      );
    }
  }, [conn, setNodes]);
  

  useEffect(() => {
    if (conn) {
      setNodes([
        { 
          id: '1', 
          type: 'fileUpload', 
          data: { 
            label: 'File Upload', 
            onFileUpload: handleFileUpload,
            conn: conn
          }, 
          position: { x: 250, y: -500 },
        },
        { 
          id: '2', 
          type: 'editor',
          data: { 
            label: 'SQL Editor 1', 
            onRunQuery: (query) => handleRunQuery(query, '2'),
            result: '',
            editorRef: React.createRef()
          }, 
          position: { x: 50, y: 200 },
        },
        { 
          id: 'chart-2', 
          type: 'chart',
          data: { 
            label: 'Chart 1', 
            chartData: null 
          }, 
          position: { x: 20, y: 500 },
        },
        { 
          id: '3', 
          type: 'editor',
          data: { 
            label: 'SQL Editor 2', 
            onRunQuery: (query) => handleRunQuery(query, '3'),
            result: '',
            editorRef: React.createRef()
          }, 
          position: { x: 800, y: 150 },
        },
        { 
          id: 'chart-3', 
          type: 'chart',
          data: { 
            label: 'Chart 2', 
            chartData: null 
          }, 
          position: { x: 600, y: 500 },
        }
      ]);

      setEdges([
        { id: 'e1-2', source: '1', target: '2', animated:true },
        { id: 'e2-chart2', source: '2', target: 'chart-2', animated:true },
      ]);
    }
  }, [conn, handleFileUpload, handleRunQuery]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
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
