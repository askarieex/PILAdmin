import React, { useEffect, useState, Suspense } from "react";
import { Router as RouterHistory } from "react-router-dom";
import { Provider } from "react-redux";
import Router from "@/router";
import history from "@/utils/history";
import store from "@/redux/store";

import { Button, Result } from "antd";


function App() {
 
    return (
      <RouterHistory history={history}>
        <Provider store={store}>
          <Router />
        </Provider>
      </RouterHistory>
    );
  }


export default App;
