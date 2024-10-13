import React from 'react';
import { Handle } from 'reactflow';

const GenericNode = ({ data, children }) => {
  return (
    <div className="generic-node">
      {data.hasInput && <Handle type="target" position="top" id="input" />}
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        {children}
      </div>
      {data.hasOutput && <Handle type="source" position="bottom" id="output" />}
    </div>
  );
};

export default GenericNode;
