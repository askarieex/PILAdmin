// src/components/Datesheet.js

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
import axiosInstance from "../axiosInstance"; // Centralized Axios instance

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const Datesheet = () => {
  const [datesheetList, setDatesheetList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDatesheet, setEditingDatesheet] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // New state for form submission loading

  useEffect(() => {
    fetchDatesheets();
  }, []);

  const fetchDatesheets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/datesheet");
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const dataWithSerial = sortedData.map((item, index) => ({
        ...item,
        key: item._id,
        serialNo: index + 1,
      }));
      setDatesheetList(dataWithSerial);
    } catch (error) {
      console.error("Error fetching datesheets:", error);
      AntMessage.error("Failed to load datesheets.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    const { examName, year, className, pdf } = values;

    if (!examName || !year || !className || !pdf?.[0]?.originFileObj) {
      AntMessage.error(
        "Please fill out all required fields and upload a valid PDF."
      );
      return;
    }

    const formData = new FormData();
    formData.append("examName", examName);
    formData.append("year", year);
    formData.append("class", className);

    if (pdf?.length > 0) {
      formData.append("pdf", pdf[0].originFileObj);
    } else {
      AntMessage.error("Please upload a valid PDF file.");
      return;
    }

    setSubmitLoading(true); // Start loading

    try {
      if (editingDatesheet) {
        await axiosInstance.put(
          `/datesheet/${editingDatesheet._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        AntMessage.success("Datesheet updated successfully!");
      } else {
        await axiosInstance.post("/datesheet", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        AntMessage.success("Datesheet created successfully!");
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingDatesheet(null);
      fetchDatesheets();
    } catch (error) {
      console.error("Error saving datesheet:", error.response || error.message);
      AntMessage.error(
        error.response?.data?.error ||
          "Failed to save datesheet. Please try again."
      );
    } finally {
      setSubmitLoading(false); // Stop loading
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this datesheet?",
      icon: <FilePdfOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/datesheet/${id}`);
          AntMessage.success("Datesheet deleted successfully!");
          fetchDatesheets();
        } catch (error) {
          console.error("Error deleting datesheet:", error);
          AntMessage.error("Failed to delete datesheet.");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingDatesheet(record);
    setIsModalVisible(true);

    // Pre-fill the form, including the existing PDF
    form.setFieldsValue({
      examName: record.examName,
      year: record.year,
      className: record.class,
      pdf: [
        {
          uid: "-1", // Unique identifier for the file
          name: "Existing PDF", // Display name of the file
          status: "done", // Mark the file as already uploaded
          url: `https://api-pil.site/${record.pdf.replace(/\\/g, "/")}`, // File URL
        },
      ],
    });
  };

  const columns = [
    {
      title: "Serial No",
      dataIndex: "serialNo",
      key: "serialNo",
      sorter: (a, b) => a.serialNo - b.serialNo,
      width: 80,
      align: "center",
    },
    {
      title: "Exam Name",
      dataIndex: "examName",
      key: "examName",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "PDF",
      dataIndex: "pdf",
      key: "pdf",
      render: (text) => {
        if (!text) {
          return "No File";
        }
        // Construct the full URL
        const fullUrl = `https://api-pil.site/${text.replace(/\\/g, "/")}`;

        return (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            <Button icon={<FilePdfOutlined />} type="link">
              View PDF
            </Button>
          </a>
        );
      },
      width: 120,
      align: "center",
    },
    {
      title: "Uploaded At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout
      style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Content>
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
          Datesheet Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginBottom: "20px" }}
          onClick={() => {
            setIsModalVisible(true);
            setEditingDatesheet(null);
            form.resetFields();
          }}
        >
          Add Datesheet
        </Button>
        <Table
          columns={columns}
          dataSource={datesheetList}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title={editingDatesheet ? "Edit Datesheet" : "Add New Datesheet"}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingDatesheet(null);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Exam Name"
              name="examName"
              rules={[
                { required: true, message: "Please enter the exam name" },
              ]}
            >
              <Input
                placeholder="Enter exam name (e.g., Mid-term, Final Exam)"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: "Please enter the year" }]}
            >
              <Input
                type="number"
                placeholder="Enter year (e.g., 2024)"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="Class"
              name="className"
              rules={[
                { required: true, message: "Please enter the class name" },
              ]}
            >
              <Input
                placeholder="Enter class name (e.g., 10, 12)"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="PDF Upload"
              name="pdf"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
              rules={[
                { required: true, message: "Please upload the datesheet PDF" },
              ]}
            >
              <Upload
                beforeUpload={() => false}
                accept=".pdf"
                maxCount={1}
                disabled={submitLoading} // Disable upload during submission
              >
                <Button
                  icon={<UploadOutlined />}
                  disabled={submitLoading} // Disable button during submission
                >
                  Click to Upload PDF
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading} // Add loading spinner
                  disabled={submitLoading} // Disable button during submission
                >
                  {editingDatesheet ? "Update" : "Create"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingDatesheet(null);
                    form.resetFields();
                  }}
                  disabled={submitLoading} // Disable cancel button during submission
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Datesheet;
