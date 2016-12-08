import React, { Component } from 'react';
import { connect } from 'react-redux';

class Router extends Component {
  render() {
    const { page: PageComponent } = this.props.route;
    return <PageComponent />;
  }
}

function select({ route }) {
  return { route };
}

export default connect(select)(Router);
