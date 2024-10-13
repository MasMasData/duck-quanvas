import React, { useState } from 'react';
import GenericNode from './GenericNode';

const FileUploadNode = ({ data }) => {
  const [tableSample, setTableSample] = useState(null);
  const [rowUsage, setRowUsage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setError(null);
        await data.onFileUpload(file);
        
        if (!data.conn) {
          throw new Error("Database connection not available");
        }

        // Fetch table sample
        const sampleQuery = "SELECT * FROM csv_data LIMIT 5";
        const sampleResult = await data.conn.query(sampleQuery);
        setTableSample(sampleResult.toArray());

        // Fetch memory usage
        const row_query = "SELECT COUNT(*) AS row_count FROM csv_data";
        const rowResult = await data.conn.query(row_query);
        console.log(rowResult)
        setRowUsage(rowResult.toArray()[0].row_count);

      } catch (error) {
        console.error("Error processing file:", error);
        setError(error.message);
        setTableSample(null);
        setRowUsage(null);
      }
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
    <GenericNode data={{ ...data, hasInput: false, hasOutput: true }}>
      <input type="file" onChange={handleFileChange} accept=".csv" className="node-button" />
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      {tableSample && (
        <div>
          <h4 className="node-title">Table Sample:</h4>
          {renderTable(tableSample)}
        </div>
      )}
    </GenericNode>
  );
};

export default FileUploadNode;
