import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';

export default class About extends Component {
  static get displayName() {
    return 'About';
  }

  render() {
    return <Container>
      <Header>About</Header>
      <p>I'm <a href="https://twitter.com/kuy" target="_blank">@kuy</a>.</p>
    </Container>;
  }
}
