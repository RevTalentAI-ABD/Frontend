import { useState } from "react";
import axios from "axios";

export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:8080/api/resume/analyze",
      formData
    );

    setResult(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resume Analyzer</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload}>Upload</button>

      {result && (
        <div>
          <h3>Score: {result.score}</h3>
          <p>Status: {result.status}</p>
        </div>
      )}
    </div>
  );
}