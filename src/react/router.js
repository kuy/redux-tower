import React, { Component } from 'react';
import { connect } from 'react-redux';

class Router extends Component {
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

function select({ router }) {
  return { router };
}

export default connect(select)(Router);
