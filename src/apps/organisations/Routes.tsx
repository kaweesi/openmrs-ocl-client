import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import {
  ViewPersonalOrganisationsPage
} from "./pages";

const Routes: React.FC = () => {
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <ViewPersonalOrganisationsPage />
      </Route>
   
    </Switch>
  );
};

export default Routes;
