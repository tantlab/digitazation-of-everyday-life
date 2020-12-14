import React, { FC } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Doc from "../components/Doc";
import Search from "../components/Search";

const Routing: FC = () => (
  <Router>
    <Switch>
      <Route path="/doc/:docId">
        <Doc />
      </Route>
      <Route path="/">
        <Search />
      </Route>
    </Switch>
  </Router>
);

export default Routing;
