// ./src/pages/admission/AdmissionDetails.js

import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Row,
  Col,
  Typography,
  Spin,
  Divider,
  Tag,
  Modal,
  Image,
  Alert,
  notification,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

// Function to fetch application data by ID
const fetchApplicationById = async (id, token) => {
  try {
    const response = await axios.get(
      `https://api-pil.site/api/admin/admissionApplication/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { password, _id, __v, ...filteredData } = response.data?.data;
    return filteredData;
  } catch (error) {
    console.error("Error fetching application data:", error);
    return null;
  }
};

// Function to update application status
const updateApplicationStatus = async (id, status, token) => {
  try {
    const response = await axios.put(
      `https://api-pil.site/api/admin/admissionApplication/${id}/status`,
      { applicationStatus: status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data?.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

function AdmissionDetails() {
  const { id } = useParams(); // Ensure that the route includes the `id` parameter
  const history = useHistory();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const token = localStorage.getItem("x-auth-token")?.replace(/^"|"$/g, "");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloading, setDownloading] = useState(false); // State for download
  const [downloadError, setDownloadError] = useState(null); // State for download error
  const [idError, setIdError] = useState(null); // State for missing ID error

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setIdError("Missing application ID. Unable to fetch application details.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchApplicationById(id, token);
      if (!data) {
        setIdError("Application not found or failed to fetch application details.");
      } else {
        setApplication(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id, token]);

  const handleBack = () => history.goBack();

  const renderFilePreview = (label, filePath) => {
    if (!filePath) return null;

    const fullPath = `https://api-pil.site/${filePath.replace(/\\/g, "/")}`;
    return (
      <Col xs={24} sm={12} lg={8} style={{ marginBottom: "20px" }} key={label}>
        <Card
          hoverable
          style={{
            textAlign: "center",
            borderRadius: "8px",
            transition: "all 0.3s ease-in-out",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e6f7ff";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f9f9f9";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() => setImagePreview(fullPath)}
        >
          {filePath.toLowerCase().endsWith(".pdf") ? (
            <FilePdfOutlined style={{ fontSize: "64px", color: "#ff4d4f" }} />
          ) : (
            <Image
              src={fullPath}
              alt={label}
              style={{ maxHeight: "150px", objectFit: "contain", borderRadius: "8px" }}
              preview={false}
            />
          )}
          <div style={{ marginTop: "10px", fontWeight: "bold", color: "#1890ff" }}>
            {label}
          </div>
        </Card>
      </Col>
    );
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case "pending":
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
      case "rejected":
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // Function to render status alert
  const renderStatusAlert = (status) => {
    switch (status) {
      case "approved":
        return (
          <Alert
            message="Application Approved"
            description="This application has been approved."
            type="success"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        );
      case "pending":
        return (
          <Alert
            message="Application Pending"
            description="This application is currently pending."
            type="warning"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        );
      case "rejected":
        return (
          <Alert
            message="Application Rejected"
            description="This application has been rejected."
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        );
      default:
        return null;
    }
  };

  // Handlers for approving and rejecting the application
  const handleApprove = async () => {
    if (!id) {
      setDownloadError("Application ID is missing. Cannot approve the application.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const updatedApplication = await updateApplicationStatus(id, "approved", token);
      setApplication(updatedApplication);
      notification.success({
        message: "Success",
        description: "Application has been approved.",
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to approve the application. Please try again.",
        placement: "topRight",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReject = async () => {
    if (!id) {
      setDownloadError("Application ID is missing. Cannot reject the application.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const updatedApplication = await updateApplicationStatus(id, "rejected", token);
      setApplication(updatedApplication);
      notification.success({
        message: "Success",
        description: "Application has been rejected.",
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to reject the application. Please try again.",
        placement: "topRight",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handlers for downloading admit card
  const handleDownloadAdmitCard = async () => {
    if (!id) {
      setDownloadError("Application ID is missing. Cannot download the admit card.");
      notification.error({
        message: "Download Failed",
        description: "Application ID is missing. Please contact support.",
        placement: "topRight",
      });
      return;
    }

    setDownloading(true);
    setDownloadError(null);
    const downloadUrl = `https://api-pil.site/api/admin/admitCard?id=${id}`;

    try {
      const response = await axios.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for handling binary data
      });

      // Check if response is a PDF
      if (response.headers['content-type'] !== 'application/pdf') {
        throw new Error("Received file is not a PDF");
      }

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Admit_Card_${application.student_name}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Download Successful",
        description: "Admit card has been downloaded successfully.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error downloading admit card:", error);
      setDownloadError("Failed to download the admit card. Please try again.");
      notification.error({
        message: "Download Failed",
        description: "There was an issue downloading the admit card. Please try again.",
        placement: "topRight",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Render approval/rejection buttons based on current status
  const renderActionButtons = (status) => {
    if (status === "pending") {
      return (
        <Row gutter={[16, 16]} justify="center" style={{ marginTop: "20px" }}>
          <Col>
            <Popconfirm
              title="Are you sure you want to approve this application?"
              onConfirm={handleApprove}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={updatingStatus}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                aria-label="Approve application"
              >
                Approve
              </Button>
            </Popconfirm>
          </Col>
          <Col>
            <Popconfirm
              title="Are you sure you want to reject this application?"
              onConfirm={handleReject}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                icon={<CloseCircleOutlined />}
                loading={updatingStatus}
                danger
                aria-label="Reject application"
              >
                Reject
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      );
    } else if (status === "approved") {
      return (
        <Row gutter={[16, 16]} justify="center" style={{ marginTop: "20px" }}>
          <Col>
            <Tooltip title="Download Admit Card">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={downloading}
                onClick={handleDownloadAdmitCard}
                className="download-button"
                style={{
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
                aria-label="Download admit card"
              >
                {downloading ? "Downloading..." : "Download Admit Card"}
              </Button>
            </Tooltip>
          </Col>
        </Row>
      );
    } else {
      return null;
    }
  };

  // Function to render status-specific actions
  // Currently, 'pending' can be approved/rejected, 'approved' can download admit card
  const renderStatusActions = () => {
    if (!application) return null;

    return renderActionButtons(application.applicationStatus);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
        <p>Loading Application Details...</p>
      </div>
    );
  }

  if (idError) {
    return (
      <div style={{ padding: "40px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        {/* Back Button */}
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          size="large"
          style={{ marginBottom: "20px" }}
          onClick={handleBack}
          aria-label="Go back to previous page"
        >
          Back
        </Button>

        {/* Error Alert */}
        <Alert
          message="Error"
          description={idError}
          type="error"
          showIcon
          style={{ marginBottom: "20px", maxWidth: "600px", margin: "0 auto" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Back Button */}
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        size="large"
        style={{ marginBottom: "20px" }}
        onClick={handleBack}
        aria-label="Go back to previous page"
      >
        Back
      </Button>

      {/* Status Alert */}
      {renderStatusAlert(application.applicationStatus)}

      {/* Action Buttons */}
      {renderStatusActions()}

      {/* Download Error Alert */}
      {downloadError && (
        <Alert
          message="Download Error"
          description={downloadError}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}

      {/* Main Card */}
      <Card
        style={{
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        bordered={false}
      >
        {/* Header */}
        <Row justify="center" align="middle" style={{ marginBottom: "20px" }}>
          <Col style={{ textAlign: "center" }}>
            {/* Avatar */}
            <Avatar
              size={120}
              src={
                application.student_photo_path
                  ? `https://api-pil.site/${application.student_photo_path?.replace(/\\/g, "/")}`
                  : undefined
              }
              icon={<UserOutlined />}
              style={{
                marginBottom: "15px", // Space below the image
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for emphasis
              }}
            />
            {/* Name */}
            <div
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "#333",
                marginBottom: "5px", // Space between name and email
              }}
            >
              {application.student_name || "N/A"} {/* Fallback to "N/A" if name is missing */}
            </div>
            {/* Email */}
            <div
              style={{
                fontSize: "14px",
                color: "#555",
              }}
            >
              {application.email || "N/A"} {/* Fallback to "N/A" if email is missing */}
            </div>
          </Col>
        </Row>

        {/* Application Status */}
        <Row justify="center" style={{ marginBottom: "20px" }}>
          <Col>
            <Title level={4}>Application Status: {getStatusBadge(application.applicationStatus)}</Title>
          </Col>
        </Row>

        {/* Personal Information */}
        <Divider style={{ borderColor: "#1890ff" }}>Personal Information</Divider>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Class">{application.class || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {application.dob
              ? `${application.dob.day}-${application.dob.month}-${application.dob.year}`
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Blood Group">
            <Tag color="blue">{application.blood_group || "N/A"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="PEN No">{application.pen_no || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Residence">{application.residence || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Village">{application.village || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Tehsil">{application.tehsil || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="District">{application.district || "N/A"}</Descriptions.Item>
        </Descriptions>

        {/* Guardian Details */}
        <Divider style={{ borderColor: "#1890ff" }}>Parent/Guardian Details</Divider>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Father's Name">{application.father_name || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Father's Profession">
            {application.father_profession || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Father's Contact">
            {application.father_contact || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Mother's Name">{application.mother_name || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Mother's Profession">
            {application.mother_profession || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Mother's Contact">
            {application.mother_contact || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Guardian's Name">{application.guardian_name || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Guardian's Profession">
            {application.guardian_profession || "N/A"}
          </Descriptions.Item>
        </Descriptions>

        {/* Documents */}
        <Divider style={{ borderColor: "#1890ff" }}>Uploaded Documents</Divider>
        <Row gutter={[16, 16]} justify="center">
          {renderFilePreview("DOB Certificate", application.dob_certificate_path)}
          {renderFilePreview("Blood Report", application.blood_report_path)}
          {renderFilePreview("Aadhar Card", application.aadhar_card_path)}
          {renderFilePreview("Passport Photos", application.passport_photos_path)}
          {renderFilePreview("Marks Certificate", application.marks_certificate_path)}
          {renderFilePreview("School Leaving Certificate", application.school_leaving_cert_path)}
        </Row>
      </Card>

      {/* Full Image Preview */}
      <Modal
        visible={!!imagePreview}
        footer={null}
        onCancel={() => setImagePreview(null)}
        centered
        aria-label="Image preview modal"
      >
        <Image src={imagePreview} alt="Document Preview" style={{ width: "100%" }} />
      </Modal>
    </div>
  );
}

export default AdmissionDetails;
