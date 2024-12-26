// src/router/AppRouter.jsx

import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";
import Admission_appli from "@/pages/Admission_appli";
import AdmissionDetails from "@/pages/AdmissionDetails";
import Message from "@/pages/Message";       // Default Import
import Syllabus from "@/pages/Syllabus";     // Default Import
import Datesheet from "@/pages/Datesheet";   // Default Import
import Contacts from "@/pages/Contacts";   // Default Import

const Dashboard = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/Dashboard")
);
const Admin = lazy(() =>
  import(/*webpackChunkName:'AdminPage'*/ "@/pages/Admin")
);

const Logout = lazy(() =>
  import(/*webpackChunkName:'LogoutPage'*/ "@/pages/Logout")
);
const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);

export default function AppRouter() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>
          <PrivateRoute path="/" component={Dashboard} exact />
          <PrivateRoute component={Admission_appli} path="/admissionApplication" exact />
          <PrivateRoute component={Admin} path="/admin" exact />
          <PrivateRoute component={Logout} path="/logout" exact />
          <PrivateRoute component={AdmissionDetails} path="/admission/:id" exact />
          
          <PrivateRoute component={Message} path="/message" exact />
          <PrivateRoute component={Syllabus} path="/syllabus" exact />
          <PrivateRoute component={Datesheet} path="/datesheet" exact />
          <PrivateRoute component={Contacts} path="/contacts" exact />
          
          <PublicRoute path="/login" render={() => <Redirect to="/" />} />
          <Route
            path="*"
            component={NotFound}
          />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}
