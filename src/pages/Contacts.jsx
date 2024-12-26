// src/pages/Contacts.jsx

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  message as AntMessage,
  Alert,
} from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axiosInstance from '../axiosInstance'; // Ensure axiosInstance is correctly configured

const { Content } = Layout;
const { Title } = Typography;
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
 * Contacts Management Component
 */
const Contacts = () => {
  // State variables
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true); // For data fetching
  const [error, setError] = useState(null); // For error handling

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  /**
   * Fetch all contacts from the backend.
   */
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/contact'); // Adjust the endpoint if necessary
      if (response.data.success) {
        setContacts(response.data.data);
      } else {
        throw new Error('Failed to fetch contacts.');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts.');
      AntMessage.error('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle deletion of a contact with confirmation.
   * @param {string} id - Contact ID.
   */
  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this contact?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/contact/${id}`); // Adjust the endpoint if necessary
          AntMessage.success('Contact deleted successfully!');
          fetchContacts(); // Refresh the contacts list
        } catch (err) {
          console.error('Error deleting contact:', err);
          AntMessage.error('Failed to delete contact.');
        }
      },
    });
  };

  /**
   * Handle viewing the full message in a modal.
   * @param {Object} contact - The contact object.
   */
  const handleView = (contact) => {
    setSelectedContact(contact);
    setIsModalVisible(true);
  };

  /**
   * Close the modal.
   */
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedContact(null);
  };

  // Define table columns
  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      key: 'serialNo',
      render: (text, record, index) => index + 1,
      width: 80,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <a href={`mailto:${text}`}>{text}</a>,
      width: 200,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      sorter: (a, b) => a.subject.localeCompare(b.subject),
      render: (text) => <Tag color="green">{text}</Tag>,
      width: 200,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text, record) => (
        <span>
          {truncateText(text, 20)}{' '}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            aria-label={`View full message from ${record.name}`}
          >
            View
          </Button>
        </span>
      ),
      width: 300,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (text) => new Date(text).toLocaleString(),
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            aria-label={`Delete contact from ${record.name}`}
          >
            Delete
          </Button>
        </Space>
      ),
      width: 150,
      align: 'center',
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
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            Contacts Management
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
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Contacts Table */}
        <Table
          columns={columns}
          dataSource={contacts}
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          rowKey="_id" // Ensure each row has a unique key
          style={{ background: '#ffffff', borderRadius: '8px' }}
        />

        {/* Modal for Viewing Full Contact Message */}
        <Modal
          title={selectedContact ? `Message from ${selectedContact.name}` : 'Contact Details'}
          visible={isModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>
              Close
            </Button>,
          ]}
          centered
          width={600}
        >
          {selectedContact && (
            <>
              <p><strong>Email:</strong> <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a></p>
              <p><strong>Subject:</strong> {selectedContact.subject}</p>
              <p><strong>Message:</strong></p>
              <p>{selectedContact.message}</p>
              <p style={{ textAlign: 'right', color: '#6c757d' }}>
                <em>Sent At: {new Date(selectedContact.createdAt).toLocaleString()}</em>
              </p>
            </>
          )}
        </Modal>
      </Content>

      {/* Inline Styles for Hover Effects and Responsiveness */}
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

export default Contacts;
