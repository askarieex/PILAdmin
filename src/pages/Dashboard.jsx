// Dashboard.js

import React, { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Typography,
  Tooltip,
  Modal,
  Badge,
  Button,
  Alert,
  Divider,
  List,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContacts: 0,
    totalDatesheets: 0,
    totalMessages: 0,
    totalApplications: 0,
    totalSyllabus: 0,
  });
  const [previousStats, setPreviousStats] = useState({ ...stats });
  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = "http://api-pil.site/api/admin"; // API Base URL
  let token = localStorage.getItem("x-auth-token");

  if (token) {
    token = token.replace(/^"|"$/g, ""); // Clean token by removing extra quotes
  }

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Fetch statistics from API
  const fetchStats = async () => {
    if (!token) {
      alert("Token not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const responses = await Promise.all([
        axios.get(`${BASE_URL}/total-users`, config),
        axios.get(`${BASE_URL}/total-contacts`, config),
        axios.get(`${BASE_URL}/total-datesheets`, config),
        axios.get(`${BASE_URL}/total-messages`, config),
        axios.get(`${BASE_URL}/total-applications`, config),
        axios.get(`${BASE_URL}/total-syllabus`, config),
      ]);

      const newStats = {
        totalUsers: responses[0]?.data.count || 0,
        totalContacts: responses[1]?.data.count || 0,
        totalDatesheets: responses[2]?.data.count || 0,
        totalMessages: responses[3]?.data.count || 0,
        totalApplications: responses[4]?.data.count || 0,
        totalSyllabus: responses[5]?.data.count || 0,
      };

      compareStats(newStats);

      setPreviousStats(stats); // Save current stats as previous stats
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      alert("Failed to fetch stats. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Compare new stats with previous stats to identify changes
  const compareStats = (newStats) => {
    const changes = [];

    for (const key in newStats) {
      if (newStats[key] > previousStats[key]) {
        changes.push({
          id: Date.now() + Math.random(), // Unique ID for each notification
          title: `Increase in ${formatKey(key)}`,
          description: `The value of ${formatKey(
            key
          )} has increased by ${newStats[key] - previousStats[key]}.`,
          read: false,
        });
      }
    }

    if (changes.length > 0) {
      setNotifications((prev) => [...changes, ...prev]);
    }
  };

  // Format keys to readable titles
  const formatKey = (key) => {
    switch (key) {
      case "totalUsers":
        return "Total Users";
      case "totalContacts":
        return "Total Contacts";
      case "totalDatesheets":
        return "Total Datesheets";
      case "totalMessages":
        return "Total Messages";
      case "totalApplications":
        return "Total Applications";
      case "totalSyllabus":
        return "Total Syllabus Uploaded";
      default:
        return key;
    }
  };

  // Handle Refresh Button Click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Handle Notifications Button Click
  const handleOpenNotifications = () => {
    setNotificationModalVisible(true);
    markAllAsRead(); // Mark all notifications as read when modal is opened
  };

  // Mark a single notification as read/unread (optional)
  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  // Count of unread notifications
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Render individual statistic card
  const renderCard = (title, value, icon, color) => (
    <Col xs={24} sm={12} md={8} lg={6} key={title}>
      <Card
        bordered={false}
        style={{
          textAlign: "center",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s, box-shadow 0.3s",
          background: "#ffffff",
        }}
        hoverable
      >
        <Statistic
          title={title}
          value={value}
          prefix={icon}
          valueStyle={{ color, fontWeight: "bold" }}
        />
      </Card>
    </Col>
  );

  // If data is loading, show spinner
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" tip="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <Layout style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Header
        style={{
          background: "#ffffff",
          padding: "0 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px #f0f1f2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://pioneerinstitute.in/assets/images/nav-logo.png"
            alt="Logo"
            style={{ height: "50px", marginRight: "20px" }}
          />
          <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
            Admin Dashboard
          </Title>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh Data
          </Button>
          <Tooltip title="Notifications">
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
              <Button
                shape="circle"
                icon={<BellOutlined />}
                onClick={handleOpenNotifications}
                style={{
                  backgroundColor: "#1890ff",
                  border: "none",
                  color: "#ffffff",
                }}
              />
            </Badge>
          </Tooltip>
        </div>
      </Header>

      {/* Content Section */}
      <Content style={{ padding: "30px 50px" }}>
        <Row gutter={[24, 24]}>
          {renderCard(
            "Total Users",
            stats.totalUsers,
            <UserOutlined style={{ fontSize: "24px" }} />,
            "#1890ff"
          )}
          {renderCard(
            "Total Contacts",
            stats.totalContacts,
            <MessageOutlined style={{ fontSize: "24px" }} />,
            "#52c41a"
          )}
          {renderCard(
            "Total Datesheets",
            stats.totalDatesheets,
            <FileTextOutlined style={{ fontSize: "24px" }} />,
            "#fa8c16"
          )}
          {renderCard(
            "Total Messages",
            stats.totalMessages,
            <MessageOutlined style={{ fontSize: "24px" }} />,
            "#722ed1"
          )}
          {renderCard(
            "Total Applications",
            stats.totalApplications,
            <UserOutlined style={{ fontSize: "24px" }} />,
            "#eb2f96"
          )}
          {renderCard(
            "Total Syllabus Uploaded",
            stats.totalSyllabus,
            <FilePdfOutlined style={{ fontSize: "24px" }} />,
            "#13c2c2"
          )}
        </Row>

        <Divider />

        {/* Notifications Section */}
        <div>
          <Title level={4}>Recent Notifications</Title>
          {notifications.length === 0 ? (
            <Alert
              message="No Notifications"
              description="You are all caught up!"
              type="success"
              showIcon
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={notifications.slice(0, 5)} // Show latest 5 notifications
              renderItem={(item) => (
                <List.Item
                  style={{
                    background: item.read ? "#ffffff" : "#e6f7ff",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    padding: "10px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      item.read ? (
                        <CheckCircleOutlined
                          style={{ color: "#52c41a", fontSize: "20px" }}
                        />
                      ) : (
                        <BellOutlined
                          style={{ color: "#1890ff", fontSize: "20px" }}
                        />
                      )
                    }
                    title={
                      <span style={{ fontWeight: item.read ? "normal" : "bold" }}>
                        {item.title}
                      </span>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Content>

      {/* Footer Section */}
      <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
        Admin Dashboard ©2024 Powered by{" "}
        <a href="https://algodream.in" target="_blank" rel="noopener noreferrer">
          AlgoDream
        </a>
      </Footer>

      {/* Notification Modal */}
      <Modal
        title="Notifications"
        visible={notificationModalVisible}
        footer={[
          <Button
            key="markAll"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setNotificationModalVisible(false)}
          >
            Close
          </Button>,
        ]}
        onCancel={() => setNotificationModalVisible(false)}
      >
        {notifications.length === 0 ? (
          <p>No notifications to display.</p>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.read ? "#f9f9f9" : "#e6f7ff",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  padding: "10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onClick={() => handleNotificationClick(item.id)}
              >
                <List.Item.Meta
                  avatar={
                    item.read ? (
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: "20px" }}
                      />
                    ) : (
                      <BellOutlined
                        style={{ color: "#1890ff", fontSize: "20px" }}
                      />
                    )
                  }
                  title={
                    <span style={{ fontWeight: item.read ? "normal" : "bold" }}>
                      {item.title}
                    </span>
                  }
                  description={item.description}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Dashboard;
