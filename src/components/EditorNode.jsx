import React, { useEffect, useRef } from 'react';
import { Handle } from 'reactflow';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';

const EditorNode = ({ data }) => {
  const editorRef = useRef(null);
  const cmRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !cmRef.current) {
      cmRef.current = CodeMirror(editorRef.current, {
        mode: "text/x-sql",
        theme: "monokai",
        lineNumbers: true,
        extraKeys: {"Ctrl-Space": "autocomplete"}
      });
      cmRef.current.setValue("SELECT * FROM csv_data LIMIT 10;");
    }
  }, []);

  const handleRunQuery = () => {
    const query = cmRef.current.getValue();
    data.onRunQuery(query);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: 'white' }}>
      <Handle type="target" position="top" id="a" />
      <div>{data.label}</div>
      <div ref={editorRef} style={{ marginBottom: '10px' }}></div>
      <button onClick={handleRunQuery}>Run Query</button>
      <div style={{ marginTop: '10px', maxHeight: '100px', overflowY: 'auto' }}>{data.result}</div>
      <Handle type="source" position="bottom" id="b" />
    </div>
  );
};

export default EditorNode;
