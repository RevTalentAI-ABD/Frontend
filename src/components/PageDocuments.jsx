import React, { useEffect, useState } from "react";
import {
  FileText,
  Upload
} from "lucide-react";
import axios from "axios";
import "./HRDashboard.css";

export default function PageDocuments() {

  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8080/api/documents";

  // Fetch documents
  const fetchDocuments = async () => {
    try {

      const res = await axios.get(API);

      setDocuments(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Upload document
  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      await axios.post(`${API}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);

      fetchDocuments();

      alert("File uploaded successfully");

    } catch (err) {

      console.error(err);

      alert("Upload failed");

    } finally {

      setLoading(false);
    }
  };

  // Toggle include/exclude
  const toggleDocument = async (id) => {

    try {

      await axios.put(`${API}/${id}/toggle`);

      fetchDocuments();

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="hr-page">

      {/* Header */}

      <div className="hr-page-header-row">

        <h1 className="hr-page-heading">
          Documents
        </h1>

      </div>

      {/* Upload Panel */}

      <div className="hr-panel">

        <div className="hr-filter-row">

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="hr-primary-btn"
            onClick={handleUpload}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >

            <Upload size={16} />

            {loading ? "Uploading..." : "Upload"}

          </button>

        </div>

      </div>

      {/* Documents Table */}

      <div className="hr-panel">

        <div className="hr-panel-title">
          Uploaded Documents
        </div>

        <div className="hr-table-wrap">

          <table className="hr-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>Type</th>
                <th>AI Access</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {documents.length === 0 ? (

                <tr>
                  <td colSpan="6">
                    <div className="hr-empty-state">
                      No documents uploaded
                    </div>
                  </td>
                </tr>

              ) : (

                documents.map((doc) => (

                  <tr key={doc.id}>

                    <td>{doc.id}</td>

                    <td>

                      <div className="hr-table-emp">

                        <div>
                          <FileText size={18} />
                        </div>

                        <div>
                          {doc.fileName}
                        </div>

                      </div>

                    </td>

                    <td>
                      {doc.fileType}
                    </td>

                    <td>

                      {doc.included ? (

                        <span className="hr-badge b-green">
                          Included
                        </span>

                      ) : (

                        <span className="hr-badge b-red">
                          Excluded
                        </span>

                      )}

                    </td>

                    <td>

                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleString()
                        : "-"}

                    </td>

                    <td>

                      <button
                        className={
                          doc.included
                            ? "hr-reject-btn"
                            : "hr-approve-btn"
                        }
                        onClick={() => toggleDocument(doc.id)}
                      >
                        {doc.included ? "Exclude" : "Include"}
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}