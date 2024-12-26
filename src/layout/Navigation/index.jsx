import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

function Navigation() {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        zIndex: 1000,
      }}
    >
      {/* Logo Section */}
      <div
        className="logo"
        style={{
          height: "88px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "26px",
          overflow: "hidden",
          background:"transparent"
        }}
      >
        {/* Add Logo Image */}
        <img
          src="https://pioneerinstitute.in/assets/images/wt-logo.png" // Logo file in the public folder
          alt="Logo"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            transition: "all 0.3s ease-in-out", // Smooth resizing on collapse
          }}
        />
      </div>

      {/* Sidebar Menu */}
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/">Home Page</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<FileSyncOutlined />}>
          <Link to="/admissionApplication">Admission Application</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<SettingOutlined />}>
          <Link to="/syllabus">Syllabus</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<UserOutlined />}>
          <Link to="/message">Message</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<UserOutlined />}>
          <Link to="/datesheet">Datesheet</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<UserOutlined />}>
          <Link to="/contacts">Contacts</Link>
        </Menu.Item>
        <Menu.Item key="8" icon={<FileSyncOutlined />}>
          <Link to="/logout">Logout</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Navigation;
