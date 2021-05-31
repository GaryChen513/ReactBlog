import React, { useState } from "react";
import { Modal, Form, Button, Input } from "antd";
import API from "utils/API";

const SignupModal = (props) => {
  const { setUser, loadUser } = props;
  const { visible, setVisible } = props;
  const { type } = props;
  const [form] = Form.useForm();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log(email, password);
    if (type === "log in") {
      API.login({
        email,
        password,
      })
        .then((res) => {
          setUser(res.data);
          loadUser();
        })
        .catch((err) => console.log(err));
    } else {
      API.signup({
        email,
        password,
      })
        .then((res) => {
          setUser(res.data);
          loadUser();
        })
        .catch((err) => console.log(err));
    }
    setVisible(false);
  }

  return (
    <Modal
      width={460}
      title={type}
      visible={visible}
      onCancel={(e) => setVisible(false)}
      footer={null}
    >
      <Form layout="horizontal" form={form}>
        {type === "log in" ? (
          <>
            <Form.Item
              label="Email"
              name="account"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <Input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input
                placeholder="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="Email"
              name="account"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input
                placeholder="username"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="password"
              name="password"
              has
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input
                placeholder="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="confirm"
              name="confirm"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Password is required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input placeholder="confirm" type="password" />
            </Form.Item>
          </>
        )}
      </Form>
      <Button type="primary" block onClick={(e) => handleSubmit(e)}>
        {type}
      </Button>
    </Modal>
  );
};

export default SignupModal;
