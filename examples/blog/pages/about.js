import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';

export default class About extends Component {
  static get displayName() {
    return 'About';
  }

  render() {
    return <Container>
      <Header>About</Header>
      <p>I'm <a href="http://twitter.com/kuy">kuy</a>.</p>
    </Container>;
  }
}
