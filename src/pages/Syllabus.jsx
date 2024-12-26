// src/components/Syllabus.js

import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Form,
  Input,
  Upload,
  Button,
  Table,
  Space,
  Modal,
  Tag,
  message as AntMessage,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import axiosInstance from "../axiosInstance";

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const Syllabus = () => {
  const [syllabusList, setSyllabusList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // New state for form submission loading

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/syllabus");
      const sortedData = response.data.data.map((item, index) => ({
        ...item,
        key: item._id,
        serialNo: index + 1,
      }));
      setSyllabusList(sortedData);
    } catch (error) {
      console.error("Error fetching syllabi:", error);
      AntMessage.error("Failed to load syllabi.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    const { className, pdf } = values;

    if (!className || !pdf?.[0]?.originFileObj) {
      AntMessage.error("Please fill out all required fields and upload a valid PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("class", className); // Map 'className' to 'class' as expected by the backend
    formData.append("pdf", pdf[0].originFileObj);

    setSubmitLoading(true); // Start loading

    try {
      if (editingSyllabus) {
        await axiosInstance.put(`/syllabus/${editingSyllabus._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        AntMessage.success("Syllabus updated successfully!");
      } else {
        await axiosInstance.post("/syllabus", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        AntMessage.success("Syllabus created successfully!");
      }
      form.resetFields();
      setIsModalVisible(false);
      fetchSyllabus();
    } catch (error) {
      console.error("Error saving syllabus:", error);
      AntMessage.error("Failed to save syllabus. Please try again.");
    } finally {
      setSubmitLoading(false); // Stop loading
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this syllabus?",
      icon: <FilePdfOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        // Optional: Add loading state for deletion if desired
        try {
          await axiosInstance.delete(`/syllabus/${id}`);
          AntMessage.success("Syllabus deleted successfully!");
          fetchSyllabus();
        } catch (error) {
          console.error("Error deleting syllabus:", error);
          AntMessage.error("Failed to delete syllabus.");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingSyllabus(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      className: record.class,
      pdf: [
        {
          uid: "-1",
          name: "Existing PDF",
          status: "done",
          url: `https://api-pil.site/${record.pdfUrl.replace(/\\/g, "/")}`,
        },
      ],
    });
  };

  const columns = [
    {
      title: "Serial No",
      dataIndex: "serialNo",
      key: "serialNo",
      width: "10%",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: "20%",
    },
    {
      title: "PDF",
      dataIndex: "pdfUrl",
      key: "pdfUrl",
      render: (text) =>
        text ? (
          <a
            href={`https://api-pil.site/${text.replace(/\\/g, "/")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button icon={<FilePdfOutlined />} type="link">
              View PDF
            </Button>
          </a>
        ) : (
          "No File"
        ),
      width: "30%",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
      width: "40%",
    },
  ];

  return (
    <Layout style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Content>
        <Title level={2} style={{ textAlign: "center" }}>
          Syllabus Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalVisible(true);
            form.resetFields();
            setEditingSyllabus(null);
          }}
          style={{ marginBottom: "16px" }}
        >
          Add Syllabus
        </Button>
        <Table
          columns={columns}
          dataSource={syllabusList}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title={editingSyllabus ? "Edit Syllabus" : "Add New Syllabus"}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Class"
              name="className"
              rules={[{ required: true, message: "Please enter the class name" }]}
            >
              <Input placeholder="Enter class name" disabled={submitLoading} />
            </Form.Item>
            <Form.Item
              label="PDF Upload"
              name="pdf"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              rules={[
                {
                  required: !editingSyllabus,
                  message: "Please upload a valid PDF",
                },
              ]}
            >
              <Upload
                beforeUpload={() => false} // Prevent automatic upload
                accept=".pdf"
                listType="text"
                maxCount={1}
                disabled={submitLoading}
              >
                <Button icon={<UploadOutlined />} disabled={submitLoading}>
                  Click to Upload
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitLoading} // Add loading spinner
                disabled={submitLoading} // Disable button during submission
              >
                {editingSyllabus ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Syllabus;
