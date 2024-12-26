import * as actionTypes from "./types";
import * as authService from "@/auth";
import storePersist from "@/redux/storePersist";
import history from "@/utils/history";
import { notification } from "antd";

export const login = (loginAdminData) => async (dispatch) => {
  dispatch({
    type: actionTypes.LOADING_REQUEST,
    payload: { loading: true },
  });

  try {
    const data = await authService.login(loginAdminData);
    console.log(data)
    if (data.success) {
      const authValue = {
        current: data.result.admin,
        loading: false,
        isLoggedIn: true,
      };

      // Store auth value persistently
      storePersist.set("auth", authValue);

      // Dispatch success action
      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: data.result.admin,
      });

      // Show success notification
      notification.success({
        message: "Login Successful",
        description: `Welcome back, ${data.result.admin.name || "Admin"}!`,
      });

      // Redirect to dashboard
      history.push("/");
    } else {
      // Dispatch failure action
      dispatch({
        type: actionTypes.FAILED_REQUEST,
        payload: { msg: data.msg || "Invalid credentials. Please try again." },
      });

      // Show error notification
      notification.error({
        message: "Login Failed",
        description: data.msg || "Invalid credentials. Please try again.",
      });
    }
  } catch (error) {
    // Dispatch failure action for unexpected errors
    dispatch({
      type: actionTypes.FAILED_REQUEST,
      payload: { msg: "An unexpected error occurred. Please try again later." },
    });

    // Show error notification
    notification.error({
      message: "Login Error",
      description: "An unexpected error occurred. Please try again later.",
    });
  }
};

export const logout = () => async (dispatch) => {
  try {
    await authService.logout();

    // Dispatch logout success
    dispatch({
      type: actionTypes.LOGOUT_SUCCESS,
    });

    // Show success notification
    notification.success({
      message: "Logged Out",
      description: "You have been successfully logged out.",
    });

    // Redirect to login
    history.push("/login");
  } catch (error) {
    // Show error notification on logout failure
    notification.error({
      message: "Logout Error",
      description: "An error occurred while logging out. Please try again later.",
    });
  }
};
