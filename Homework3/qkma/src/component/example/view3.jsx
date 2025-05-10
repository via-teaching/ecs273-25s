import { useEffect, useState, useRef } from "react";

export function ReadNews({ selectedStock }) {
  const [fileList, setFileList] = useState([]);
  const [fileContent, setFileContent] = useState({});
  const [clickedFile, setClickedFile] = useState(null);

  // Store the position of each file
  const fileRefs = useRef({});

  useEffect(() => {
    if (!selectedStock) return;

    fetch("/data/stocknews/all_file_names.json")
      .then((res) => res.json())
      .then((data) => {
        const found = data.filenamedata.find((d) => d.stock === selectedStock);
        if (found) {
          setFileList(found.filenames);
        } else {
          setFileList([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching file list:", err);
        setFileList([]); 
      });
  }, [selectedStock]);


  const handleFileClick = (file) => {
    if (clickedFile === file) {
      setClickedFile(null);
      setFileContent({});
      return;
    }

    setClickedFile(file); 
    const filePath = `/data/stocknews/${selectedStock}/${file}`;
    console.log(filePath)

    
    fetch(filePath)
      .then((res) => res.text()) 
      .then((data) => {
        setFileContent((prevContent) => ({
          ...prevContent,
          [file]: data, 
        }));
      })
      .catch((err) => {
        console.error("Error fetching file content:", err);
        setFileContent((prevContent) => ({
          ...prevContent,
          [file]: "Failed to load content.",
        }));
      });
  };

  return (
    <div>
      <ul className="space-y-2">
        {fileList.length > 0 ? (
          fileList.map((file, index) => (
            <li
              key={index}
              ref={(el) => (fileRefs.current[file] = el)} 
              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 cursor-pointer"
              onClick={() => handleFileClick(file)} 
            >
              <span className="font-medium text-gray-700">{file}</span>

              {clickedFile === file && fileContent[file] && (
                <div
                  className="mt-4 p-4 border rounded-lg bg-gray-50 w-full"
                  style={{
                    position: "absolute", 
                    top: `${fileRefs.current[file]?.getBoundingClientRect().bottom + window.scrollY}px`, 
                    left: `${fileRefs.current[file]?.getBoundingClientRect().left}px`,
                    width: `${fileRefs.current[file]?.offsetWidth}px`,
                    zIndex: 100,
                  }}
                >
                  <h4 className="text-xl font-semibold mb-2">Content of {file}:</h4>
                  <pre className="whitespace-pre-wrap">{fileContent[file]}</pre>
                </div>
              )}
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">No files available for the selected stock</li>
        )}
      </ul>
    </div>
  );
}
