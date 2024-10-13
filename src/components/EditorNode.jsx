import React from 'react';
import GenericNode from './GenericNode';
import Editor from "@monaco-editor/react";

const EditorNode = ({ data }) => {
  const handleEditorDidMount = (editor, monaco) => {
    // You can customize the editor here
  };

  const handleRunQuery = () => {
    if (data.editorRef.current) {
      const query = data.editorRef.current.getValue();
      data.onRunQuery(query);
    }
  };

  const renderTable = (result) => {
    if (!result || result.length === 0) return null;

    const headers = Object.keys(result[0]);

    return (
      <div className="node-table-container">
        <table className="node-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <GenericNode data={{ ...data, hasInput: true, hasOutput: true }}>
      <div style={{ width: '100%', height: '200px' }}>
        <Editor
          height="200px"
          defaultLanguage="sql"
          defaultValue="SELECT * FROM csv_data LIMIT 10;"
          onMount={(editor) => {
            data.editorRef.current = editor;
            handleEditorDidMount(editor);
          }}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
          }}
        />
      </div>
      <button className="node-button" onClick={handleRunQuery}>Run Query</button>
      {data.result && renderTable(data.result)}
    </GenericNode>
  );
};

export default EditorNode;
