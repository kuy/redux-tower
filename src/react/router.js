import React, { Component } from 'react';
import { connect } from 'react-redux';

class Router extends Component {
  render() {
    const { page: PageComponent } = this.props.router;
    if (PageComponent) {
      return <PageComponent />;
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
