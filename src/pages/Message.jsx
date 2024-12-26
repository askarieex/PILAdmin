// src/pages/Message.jsx

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  Modal,
  Tag,
  message as AntMessage,
  Alert,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MailOutlined,
} from '@ant-design/icons';
import axiosInstance from '../axiosInstance'; // Ensure axiosInstance is correctly configured

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

/**
 * Helper function to truncate text to a specified number of words.
 * @param {string} text - The text to truncate.
 * @param {number} wordLimit - Maximum number of words.
 * @returns {string} - Truncated text.
 */
const truncateText = (text, wordLimit) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(' ')}...`;
};

/**
 * Message Management Component
 */
const MessageManagement = () => {
  // State variables
  const [messageList, setMessageList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // States for viewing full message
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState(null); // State for error handling

  // List of classes from Nursery to 10th
  const classOptions = [
    'Nursery',
    'LKG',
    'UKG',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th',
  ];

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch all messages from the backend.
   */
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/messages');
      if (response.data.success) {
        const sortedData = response.data.data.sort(
          (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
        );
        const dataWithSerial = sortedData.map((item, index) => ({
          ...item,
          key: item._id,
          serialNo: index + 1,
        }));
        setMessageList(dataWithSerial);
      } else {
        throw new Error('Failed to fetch messages.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages.');
      AntMessage.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission for creating or updating a message.
   * @param {Object} values - Form values.
   */
  const onFinish = async (values) => {
    try {
      setSubmitLoading(true); // Start loading

      if (editingMessage) {
        await axiosInstance.put(`/messages/${editingMessage._id}`, values);
        AntMessage.success('Message updated successfully!');
      } else {
        await axiosInstance.post('/messages', values);
        AntMessage.success('Message created successfully!');
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      AntMessage.error('Failed to save message.');
    } finally {
      setSubmitLoading(false); // Stop loading
    }
  };

  /**
   * Handle deletion of a message with confirmation.
   * @param {string} id - Message ID.
   */
  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this message?',
      icon: <MailOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/messages/${id}`);
          AntMessage.success('Message deleted successfully!');
          fetchMessages();
        } catch (error) {
          console.error('Error deleting message:', error);
          AntMessage.error('Failed to delete message.');
        }
      },
    });
  };

  /**
   * Handle opening the edit modal with pre-filled data.
   * @param {Object} record - Message record.
   */
  const handleEdit = (record) => {
    setEditingMessage(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      sentBy: record.sentBy,
      targetAudience: record.targetAudience,
    });
  };

  /**
   * Open the view modal with the selected message.
   * @param {Object} message - The selected message object.
   */
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setViewModalVisible(true);
  };

  /**
   * Close the view modal.
   */
  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setSelectedMessage(null);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      key: 'serialNo',
      sorter: (a, b) => a.serialNo - b.serialNo,
      width: 80,
      align: 'center',
      responsive: ['lg'],
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: 200,
      render: (text) => <Tag color="purple">{text}</Tag>,
      responsive: ['sm'],
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (text, record) => (
        <span>
          {truncateText(text, 20)}
          {' '}
          <Button
            type="link"
            onClick={() => handleViewMessage(record)}
            style={{ padding: 0 }}
            aria-label={`Read more about message titled ${record.title}`}
          >
            Read More
          </Button>
        </span>
      ),
      responsive: ['md'],
    },
    {
      title: 'Sent By',
      dataIndex: 'sentBy',
      key: 'sentBy',
      sorter: (a, b) => a.sentBy.localeCompare(b.sentBy),
      width: 150,
      render: (text) => <Tag color="geekblue">{text}</Tag>,
      responsive: ['sm'],
    },
    {
      title: 'Target Audience',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      filters: [
        { text: 'All', value: 'All' },
        { text: 'Parents', value: 'Parents' },
        { text: 'Boys', value: 'Boys' },
        { text: 'Girls', value: 'Girls' },
        ...classOptions.map((cls) => ({
          text: cls,
          value: cls,
        })),
      ],
      onFilter: (value, record) => record.targetAudience === value,
      width: 180,
      render: (text) => <Tag color="orange">{text}</Tag>,
      responsive: ['sm'],
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      key: 'sentAt',
      sorter: (a, b) => new Date(a.sentAt) - new Date(b.sentAt),
      render: (text) => new Date(text).toLocaleString(),
      width: 180,
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEdit(record)}
            aria-label={`Edit message titled ${record.title}`}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            onClick={() => handleDelete(record._id)}
            aria-label={`Delete message titled ${record.title}`}
          >
            Delete
          </Button>
        </Space>
      ),
      width: 150,
      align: 'center',
      responsive: ['sm'],
    },
  ];

  return (
    <Layout
      style={{
        padding: '24px',
        background: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      <Content>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            Message Management
          </Title>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        {/* Add Message Button */}
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setEditingMessage(null);
              form.resetFields();
            }}
          >
            Add Message
          </Button>
        </div>

        {/* Messages Table */}
        <Table
          columns={columns}
          dataSource={messageList}
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          rowClassName="table-row"
          // Responsive design adjustments
          scroll={{ x: 'max-content' }}
          style={{ background: '#ffffff', borderRadius: '8px' }}
        />

        {/* Modal for Create/Edit Message */}
        <Modal
          title={editingMessage ? 'Edit Message' : 'Add New Message'}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingMessage(null);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
          centered
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              targetAudience: 'All',
            }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter the message title' }]}
            >
              <Input
                placeholder="Enter message title"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: 'Please enter the message content' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter message content"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="Sent By"
              name="sentBy"
              rules={[{ required: true, message: 'Please enter the sender' }]}
            >
              <Input
                placeholder="Enter sender's name"
                disabled={submitLoading} // Disable input during submission
              />
            </Form.Item>
            <Form.Item
              label="Target Audience"
              name="targetAudience"
              rules={[{ required: true, message: 'Please select the target audience' }]}
            >
              <Select disabled={submitLoading}> {/* Disable select during submission */}
                <Option value="All">All</Option>
                <Option value="Parents">Parents</Option>
                <Option value="Boys">Boys</Option>
                <Option value="Girls">Girls</Option>
                {/* Add class options from Nursery to 10th */}
                {classOptions.map((cls) => (
                  <Option key={cls} value={cls}>
                    {cls}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading} // Add loading spinner
                  disabled={submitLoading} // Disable button during submission
                >
                  {editingMessage ? 'Update' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingMessage(null);
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

        {/* Modal for Viewing Full Message */}
        <Modal
          title={selectedMessage ? selectedMessage.title : 'Message Details'}
          visible={viewModalVisible}
          onCancel={handleCloseViewModal}
          footer={[
            <Button key="close" onClick={handleCloseViewModal}>
              Close
            </Button>,
          ]}
          centered
          width={600}
        >
          {selectedMessage && (
            <>
              <p>{selectedMessage.content}</p>
              <div style={{ marginTop: '15px' }}>
                <Tag color="#10b477">Audience: {selectedMessage.targetAudience}</Tag>
                <Tag color="#087f5b">Sent By: {selectedMessage.sentBy}</Tag>
              </div>
              <p style={{ textAlign: 'right', marginTop: '10px', color: '#6c757d' }}>
                Sent At: {new Date(selectedMessage.sentAt).toLocaleString()}
              </p>
            </>
          )}
        </Modal>
      </Content>

      {/* Inline Styles for Hover Effect */}
      <style jsx="true">{`
        .table-row:hover {
          background-color: #e6f7ff !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            font-size: 12px;
          }

          .ant-table-tbody > tr > td {
            font-size: 12px;
          }

          .ant-input,
          .ant-btn,
          .ant-select {
            width: 100% !important;
          }

          /* Adjust modal width on smaller screens */
          .ant-modal {
            width: 90% !important;
          }
        }

        @media (max-width: 576px) {
          .ant-modal-title {
            font-size: 1.3rem;
          }

          .ant-modal-body {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MessageManagement;
