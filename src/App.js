// App.js

import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { Tree } from "react-d3-tree";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [decisionAttribute, setDecisionAttribute] = useState("");
  const [skipAttributes, setSkipAttributes] = useState([]);
  const [maxDepth, setMaxDepth] = useState(5);
  const [entropyThreshold, setEntropyThreshold] = useState(0.1);
  const [treeData, setTreeData] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [availableAttributes, setAvailableAttributes] = useState([]);

  const handleFile = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        if (result.data && result.data.length > 0 && result.data[0]) {
          setAvailableAttributes(Object.keys(result.data[0]));
        }
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
      },
    });
  };

  const convertToNumeric = (value) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? value : numericValue;
  };

  const buildDecisionTree = () => {
    if (data.length === 0 || !decisionAttribute) {
      return;
    }
    shouldRecenterTreeRef.current = true;

    const trainingData = data.map((row) => {
      const item = {};
      availableAttributes.forEach((attribute) => {
        if (!skipAttributes.includes(attribute)) {
          item[attribute] = convertToNumeric(row[attribute]);
        }
      });
      return item;
    });

    const dt = customDecisionTree({
      data: trainingData,
      decisionAttribute,
      skipAttributes,
      maxDepth,
      entropyThreshold,
    });

    try {
      const treeJSON = convertTreeToD3Format(dt);
      setTreeData(treeJSON);
      setConfusionMatrix(getConfusionMatrix(dt, trainingData));
    } catch (error) {
      console.error("Error building decision tree:", error);
    }
  };

  const customDecisionTree = ({
    data,
    decisionAttribute,
    skipAttributes,
    maxDepth,
    entropyThreshold,
  }) => {
    // Implementacja własnego algorytmu klasyfikacji
    // Uwzględnij parametry maxDepth i entropyThreshold
    // Zwróć strukturę drzewa w formacie, który może być użyty do renderowania w komponencie Tree
    // Przykład:
    const rootNode = {
      name: "CEO",
      children: [
        {
          name: "Manager",
          attributes: {
            department: "Production",
          },
          children: [
            {
              name: "Foreman",
              attributes: {
                department: "Fabrication",
              },
              children: [
                {
                  name: "Worker",
                },
              ],
            },
            {
              name: "Foreman",
              attributes: {
                department: "Assembly",
              },
              children: [
                {
                  name: "Manager",
                  attributes: {
                    department: "Production",
                  },
                  children: [
                    {
                      name: "Foreman",
                      attributes: {
                        department: "Fabrication",
                      },
                      children: [
                        {
                          name: "Worker",
                        },
                      ],
                    },
                    {
                      name: "Foreman",
                      attributes: {
                        department: "Assembly",
                      },
                      children: [
                        {
                          name: "Worker",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    return rootNode;
  };

  const convertTreeToD3Format = (node) => {
    // Implementacja funkcji do konwersji struktury drzewa na format używany przez komponent Tree
    // ...
    return node;
  };

  const getConfusionMatrix = (dt, testData) => {
    // Implementacja funkcji do uzyskania macierzy pomyłek
    // ...

    return confusionMatrix;
  };

  useEffect(() => {
    if (data && data.length > 0 && data[0]) {
      setAvailableAttributes(Object.keys(data[0]));
    }
  }, [data]);

  const shouldRecenterTreeRef = useRef(true);
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (treeContainerRef.current && shouldRecenterTreeRef.current) {
      shouldRecenterTreeRef.current = false;
      resetTreeTranslate();
    }
  }, [treeTranslate]);

  function resetTreeTranslate() {
    const dimensions = treeContainerRef.current.getBoundingClientRect();
    setTreeTranslate({
      x: dimensions.width / 2,
      y: 30,
    });
  }

  return (
    <div className="app-container">
      <input type="file" onChange={(e) => handleFile(e.target.files[0])} />
      <button className="build-button" onClick={buildDecisionTree}>
        Build Decision Tree
      </button>

      <div className="select-container">
        <label>Decision Attribute:</label>
        <select
          value={decisionAttribute}
          onChange={(e) => setDecisionAttribute(e.target.value)}
        >
          <option value="">Select Attribute</option>
          {availableAttributes.map((attribute, index) => (
            <option key={index} value={attribute}>
              {attribute}
            </option>
          ))}
        </select>
      </div>

      <div className="select-container">
        <label>Skip Attributes:</label>
        <select
          multiple
          value={skipAttributes}
          onChange={(e) =>
            setSkipAttributes(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {availableAttributes.map((attribute, index) => (
            <option key={index} value={attribute}>
              {attribute}
            </option>
          ))}
        </select>
      </div>

      <div className="input-container">
        <label>Max Depth:</label>
        <input
          type="number"
          value={maxDepth}
          onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="input-container">
        <label>Entropy Threshold:</label>
        <input
          type="number"
          step="0.01"
          value={entropyThreshold}
          onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
        />
      </div>

      <h2>Decision Tree</h2>
      <button onClick={resetTreeTranslate}>Reset</button>
      <div className="tree-container" ref={treeContainerRef}>
        {treeData && treeTranslate && (
          // <div className="abc">
          <Tree
            data={treeData}
            orientation="vertical"
            translate={treeTranslate}
          />
          // </div>
        )}
      </div>

      {confusionMatrix && (
        <div className="matrix-container">
          <h2>Confusion Matrix</h2>
          {/* Render Confusion Matrix here */}
        </div>
      )}
    </div>
  );
};

export default App;
