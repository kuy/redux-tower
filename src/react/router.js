import React, { Component } from 'react';
import { connect } from 'react-redux';

class Router extends Component {
  render() {
    const { component: RouterComponent } = this.props.router;
    if (RouterComponent) {
      return <RouterComponent />;
    } else {
      // XXX: should render given something...?
      return <div></div>;
    }
  }
}

function select({ router }) {
  return { router };
}

export default connect(select)(Router);
