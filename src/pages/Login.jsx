import React from "react";
import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";

const { Content, Footer } = Layout;

const LoginPage = () => {
  const { loading: isLoading } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const onFinish = (values) => {
    dispatch(login(values));
  };

  return (
    <>
      <Layout className="layout">
        <Row>
          <Col span={12} offset={6}>
            <Content
              style={{
                padding: "50px 0 180px",
                maxWidth: "360px",
                margin: "0 auto",
                textAlign: "center", // Center align the content
              }}
            >
              {/* Logo Section */}
              <div style={{ marginBottom: "20px" ,marginTop:"50px"}}>
                <img
                  src="/nav-logo.png"
                  alt="Logo"
                  style={{ width: "400px", height: "auto" }}
                />
              </div>

              {/* Login Header */}
              <h1>Admin Login</h1>
              <Divider />

              {/* Login Form */}
              <div className="site-layout-content">
                <Form
                  name="normal_login"
                  className="login-form"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                >
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: "Please input your Email!" }]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="admin@demo.com"
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Please input your Password!" }]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="123456"
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                      loading={isLoading}
                    >
                      Log in
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Content>
          </Col>
        </Row>

        <Footer style={{ textAlign: "center" }}>
        Powered by AlgoDream Technical Services | ©2025 <a href="https://algodream.in">ADTS</a>
        </Footer>
      </Layout>
    </>
  );
};

export default LoginPage;
