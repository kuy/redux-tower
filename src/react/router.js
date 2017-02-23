// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import type { Initial } from '../reducer';

export interface RouterProps {
  router: {
    element: React.Element<*>;
  };
}

class Router extends Component {
  props: RouterProps

  render() {
    const { element: RouterElement } = this.props.router;
    if (RouterElement) {
      return RouterElement;
    } else {
      // XXX: should render given something...?
      return <div></div>;
    }
  }
}

function select({ router }: Initial): RouterProps {
  return { router };
}

export default connect(select)(Router);
