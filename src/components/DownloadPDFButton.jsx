// src/components/DownloadPDFButton.jsx
import React, { useState } from "react";
import { Button, Tooltip, message, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

/**
 * Button component to download admission application as a PDF.
 *
 * @param {Object} props
 * @param {string} props.applicationId - The ID of the admission application.
 */
function DownloadPDFButton({ applicationId }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("x-auth-token");
      if (token) {
        token = token.replace(/^"|"$/g, ""); // Clean the token
      } else {
        message.error("Authorization token not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/admin/admissionApplication/${applicationId}/downloadPDF`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `application_${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success("PDF downloaded successfully.");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      message.error("Failed to download PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Download Application as PDF">
      <Button
        type="default"
        icon={loading ? <Spin size="small" /> : <DownloadOutlined />}
        onClick={handleDownload}
        disabled={loading}
        style={{ marginLeft: "8px" }}
      >
        {loading ? "Downloading..." : "Download PDF"}
      </Button>
    </Tooltip>
  );
}

export default DownloadPDFButton;
