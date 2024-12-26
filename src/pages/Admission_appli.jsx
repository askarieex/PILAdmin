// ./src/pages/Admission_appli.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Card,
  Avatar,
  Spin,
  message,
  Input,
  Tag,
  Select,
  Tooltip,
  Modal,
  Switch,
} from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import debounce from "lodash.debounce";

import DownloadPDFButton from "../components/DownloadPDFButton";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

/**
 * Component to display and manage admission applications.
 */
function AdmissionAppli() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'light'
    const storedTheme = localStorage.getItem("app-theme");
    return storedTheme ? storedTheme : "light";
  });

  const [admissionData, setAdmissionData] = useState([]); // Full data
  const [filteredData, setFilteredData] = useState([]); // Filtered data for display
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // For status-based filtering
  const [readFilter, setReadFilter] = useState(null); // For read/unread filtering
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To track if more data is available

  // Backend Base URL where the images are hosted
  const baseURL = "https://api-pil.site/";

  // Retrieve token from localStorage and clean it
  let token = localStorage.getItem("x-auth-token");
  if (token) {
    token = token.replace(/^"|"$/g, ""); // Remove any surrounding quotes
  }

  useEffect(() => {
    fetchData(1, 100, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Fetch admission applications from the backend.
   * @param {number} page - Current page number.
   * @param {number} pageSize - Number of items per page.
   * @param {boolean} initialLoad - Flag to determine if it's the initial load.
   */
  const fetchData = async (page, pageSize, initialLoad = false) => {
    if (!hasMore && !initialLoad) return;

    initialLoad ? setLoading(true) : setIsLoadingMore(true);

    try {
      if (!token) {
        console.error("No token found in localStorage.");
        message.error("You are not authorized. Please log in first.");
        setLoading(false);
        setIsLoadingMore(false);
        return;
      }

      // Fetch data from backend with pagination parameters
      const response = await axios.get(
        `https://api-pil.site/api/admin/admissionApplications?page=${page}&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure response contains an array under 'data' and total count
      const fetchedData = response.data?.data || [];
      const totalCount = response.data?.total || 0;

      // Sort by newest first based on createdAt
      const sortedData = fetchedData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Add serial numbers dynamically to the data
      const dataWithSerial = sortedData.map((item, index) => ({
        ...item,
        serialNo: (page - 1) * pageSize + index + 1,
      }));

      if (initialLoad) {
        setAdmissionData(dataWithSerial);
        setFilteredData(dataWithSerial);
      } else {
        setAdmissionData((prev) => [...prev, ...dataWithSerial]);
        setFilteredData((prev) => [...prev, ...dataWithSerial]);
      }

      // Check if there's more data to load
      if (page * pageSize >= totalCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Optionally, remove the success message to avoid clutter
      // message.success("Admission applications loaded successfully.");
    } catch (error) {
      console.error("Error fetching admission data:", error);
      message.error("Failed to load admission applications.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Debounced search handler to optimize performance
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Live Search and Filter Functionality
  useEffect(() => {
    let filtered = admissionData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (item) =>
          item.applicationStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply read/unread filter
    if (readFilter) {
      if (readFilter === "read") {
        filtered = filtered.filter((item) => item.isRead === true);
      } else if (readFilter === "unread") {
        filtered = filtered.filter((item) => item.isRead === false);
      }
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, readFilter, admissionData]);

  /**
   * Handler for downloading important files.
   * @param {Object} record - The application record.
   */
  const handleDownloadFiles = (record) => {
    if (!record._id) {
      message.error("Invalid application ID.");
      return;
    }

    // Redirect to the backend endpoint to download files
    window.location.href = `${baseURL}api/admin/admissionApplication/${record._id}/downloadFiles`;
  };

  /**
   * Handler for marking an application as read with confirmation.
   * @param {string} id - Application ID.
   */
  const markAsRead = (id) => {
    confirm({
      title: "Mark as Read",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to mark this application as read?",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk() {
        // Proceed to mark as read
        proceedMarkAsRead(id);
      },
      onCancel() {
        // Do nothing
      },
    });
  };

  /**
   * Proceed with marking the application as read.
   * @param {string} id - Application ID.
   */
  const proceedMarkAsRead = async (id) => {
    try {
      await axios.put(
        `https://api-pil.site/api/admin/admissionApplication/${id}/markAsRead`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAdmissionData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      message.success("Application marked as read.");
    } catch (error) {
      console.error("Error marking application as read:", error);
      message.error("Failed to mark application as read.");
    }
  };

  /**
   * Toggle between light and dark themes.
   */
  const toggleTheme = (checked) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  // Table columns configuration
  const columns = [
    {
      title: "Profile",
      dataIndex: "student_photo_path",
      key: "student_photo_path",
      render: (text, record) => {
        const imagePath = record.student_photo_path
          ? `${baseURL}${record.student_photo_path.replace(/\\/g, "/")}`
          : null;

        return (
          <Avatar
            src={imagePath}
            icon={!imagePath && <UserOutlined />}
            size={64} // Increased size for better visibility
            alt="Student Photo"
            style={{
              border: "2px solid #1890ff",
            }}
          />
        );
      },
      width: 100,
      align: "center",
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
      sorter: (a, b) => a.student_name.localeCompare(b.student_name),
      render: (text, record) => (
        <span
          style={{
            fontWeight: record.isRead ? "normal" : "bold",
            color: theme === "light" ? "#1890ff" : "#91d5ff",
            fontSize: "14px", // Reduced font size
          }}
        >
          {text}
        </span>
      ),
      ellipsis: true,
      width: 200,
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text) => (
        <span
          style={{
            color: theme === "light" ? "#1890ff" : "#91d5ff",
            fontSize: "13px", // Reduced font size
          }}
        >
          {text}
        </span>
      ),
      filters: [
        { text: "10", value: "10" },
        { text: "12", value: "12" },
        { text: "Other", value: "Other" },
      ],
      onFilter: (value, record) => record.class === value,
      ellipsis: true,
      width: 100,
    },
    {
      title: "Father's Name",
      dataIndex: "father_name",
      key: "father_name",
      sorter: (a, b) => a.father_name.localeCompare(b.father_name),
      render: (text, record) => (
        <span
          style={{
            fontWeight: record.isRead ? "normal" : "bold",
            fontSize: "13px", // Reduced font size
            color: theme === "light" ? "#000" : "#fff",
          }}
        >
          {text}
        </span>
      ),
      ellipsis: true,
      width: 200,
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => a.district.localeCompare(b.district),
      filters: [
        { text: "District A", value: "District A" },
        { text: "District B", value: "District B" },
        { text: "District C", value: "District C" },
        // Add more districts as needed
      ],
      onFilter: (value, record) => record.district === value,
      ellipsis: true,
      width: 150,
    },
    {
      title: "Date Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (text) => new Date(text).toLocaleDateString(),
      ellipsis: true,
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "applicationStatus",
      key: "applicationStatus",
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) =>
        record.applicationStatus.toLowerCase() === value.toLowerCase(),
      sorter: (a, b) =>
        a.applicationStatus.localeCompare(b.applicationStatus),
      render: (status) => {
        let color;
        let icon;
        switch (status.toLowerCase()) {
          case "approved":
            color = "green";
            icon = <CheckCircleOutlined />;
            break;
          case "pending":
            color = "orange";
            icon = <ClockCircleOutlined />;
            break;
          case "rejected":
            color = "red";
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = "blue";
            icon = <UserOutlined />;
        }
        return (
          <Tag color={color} icon={icon} key={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
      ellipsis: true,
      width: 130,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="View Details">
            <Link to={`/admission/${record._id}`}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small" // Adjusted size
                onClick={() => {
                  if (!record.isRead) {
                    markAsRead(record._id);
                  }
                }}
                aria-label={`View details of ${record.student_name}`}
              >
                View
              </Button>
            </Link>
          </Tooltip>

          {/* Download PDF Button with Tooltip */}
          <Tooltip title="Download PDF">
            <DownloadPDFButton applicationId={record._id} />
          </Tooltip>
        </div>
      ),
      ellipsis: true,
      width: 150,
    },
  ];

  /**
   * Handler for loading more data.
   */
  const handleLoadMore = () => {
    const nextPage = Math.ceil(admissionData.length / 100) + 1;
    fetchData(nextPage, 100);
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: theme === "light" ? "#f0f2f5" : "#121212",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
          color: theme === "light" ? "#000000" : "#ffffff",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              flex: "1 1 100%",
              fontWeight: "bold",
              color: theme === "light" ? "#1890ff" : "#91d5ff",
              fontSize: "28px",
              textTransform: "uppercase",
              margin: "0",
            }}
          >
            Admission Applications
          </h1>

          {/* Theme Toggle Switch */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                color: theme === "light" ? "#000" : "#fff",
                fontWeight: "500",
              }}
            >
              {theme === "light" ? "Light" : "Dark"} Mode
            </span>
            <Switch
              checked={theme === "dark"}
              onChange={toggleTheme}
              checkedChildren="🌙"
              unCheckedChildren="🔆"
              aria-label="Toggle theme"
            />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <Search
            placeholder="Search by Student Name, Father's Name, or District"
            allowClear
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ width: "60%", minWidth: "250px" }}
            size="large"
            enterButton
            suffix={<MailOutlined />}
            aria-label="Search applications"
          />

          <Select
            allowClear
            placeholder="Filter by Status"
            onChange={(value) => setStatusFilter(value)}
            style={{ width: "25%", minWidth: "200px" }}
            size="large"
            suffixIcon={<MailOutlined />}
            aria-label="Filter by application status"
          >
            <Option value="approved">Approved</Option>
            <Option value="pending">Pending</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          <Select
            allowClear
            placeholder="Filter by Read Status"
            onChange={(value) => setReadFilter(value)}
            style={{ width: "25%", minWidth: "200px" }}
            size="large"
            suffixIcon={<MailOutlined />}
            aria-label="Filter by read status"
          >
            <Option value="read">Read</Option>
            <Option value="unread">Unread</Option>
          </Select>

          {/* Newest Applications Filter */}
          <Select
            allowClear
            placeholder="Sort by"
            onChange={(value) => {
              if (value === "newest") {
                setAdmissionData((prevData) =>
                  [...prevData].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )
                );
              } else if (value === "oldest") {
                setAdmissionData((prevData) =>
                  [...prevData].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                  )
                );
              }
            }}
            style={{ width: "25%", minWidth: "200px" }}
            size="large"
            suffixIcon={<MailOutlined />}
            aria-label="Sort applications"
          >
            <Option value="newest">Newest First</Option>
            <Option value="oldest">Oldest First</Option>
          </Select>
        </div>

        {/* Table Section */}
        {loading && admissionData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" tip="Loading applications..." />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="_id"
              pagination={false} // Disable built-in pagination
              bordered
              size="middle"
              // Removed scroll prop to eliminate fixed height
              rowClassName={(record) =>
                record.isRead
                  ? record.applicationStatus.toLowerCase() === "approved"
                    ? "table-row-approved"
                    : record.applicationStatus.toLowerCase() === "rejected"
                    ? "table-row-rejected"
                    : "table-row-pending"
                  : "table-row-unread"
              }
              // Fixed Header for better navigation
              sticky
              // Adjust table layout
              style={{
                fontSize: "14px", // Reduced font size
                overflowX: "auto", // Allow horizontal scroll if needed
              }}
            />

            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Button
                  type="primary"
                  onClick={handleLoadMore}
                  loading={isLoadingMore}
                  size="large"
                  aria-label="Load more applications"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Custom Styles */}
      <style jsx="true">{`
        .table-row-approved {
          background-color: #ffffff !important;
        }

        .table-row-pending {
          background-color: #fffbe6 !important;
        }

        .table-row-rejected {
          background-color: #fff1f0 !important;
        }

        .table-row-unread {
          background-color: ${theme === "light" ? "#f2f6fc" : "#1f1f1f"} !important;
          position: relative;
        }

        /* Hover Effect */
        .ant-table-tbody > tr:hover > td {
          background: ${theme === "light" ? "#f5f5f5" : "#333333"} !important;
        }

        /* Pulse Animation for Unread Indicator */
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        /* Apply pulse animation */
        .table-row-unread div span {
          animation: pulse 2s infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            font-size: 12px;
          }

          .ant-table-tbody > tr > td {
            font-size: 12px;
          }

          .ant-input-search {
            width: 100% !important;
          }

          .ant-select {
            width: 100% !important;
          }

          h1 {
            font-size: 22px !important;
          }

          /* Adjust Load More button on small screens */
          .ant-btn {
            width: 100%;
          }
        }

        /* Enhance the Load More button style */
        .ant-btn-primary {
          background-color: #1890ff;
          border-color: #1890ff;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .ant-btn-primary:hover {
          background-color: #40a9ff;
          border-color: #40a9ff;
        }

        /* Remove fixed height and allow table to expand */
        .ant-table-container {
          max-height: none !important;
        }

        /* Ensure the Card and Table take full height as needed */
        .ant-card {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default AdmissionAppli;
