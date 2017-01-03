import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';

export default class NotFound extends Component {
  static get displayName() {
    return 'NotFound';
  }

  render() {
    return <Container>
      <Header>Page Not Found</Header>
    </Container>;
  }
}
