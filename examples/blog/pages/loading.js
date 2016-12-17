import React, { Component } from 'react';
import { Container, Loader } from 'semantic-ui-react';

export default class Loading extends Component {
  render() {
    return <Container>
      <Loader active size='massive'>Loading...</Loader>
    </Container>;
  }
}
