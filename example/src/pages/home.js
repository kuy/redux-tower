import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Progress } from 'semantic-ui-react';

class Home extends Component {
  state = { percent: 33 }

  handleClick() {
    this.setState({
      percent: this.state.percent >= 100 ? 0 : this.state.percent + 20,
    });
  }

  render() {
    return (
      <div>
        <h1>redux-saga-tower</h1>
        <ul>
          <li><a href="#/">Home</a></li>
          <li><a href="#/cart">Cart</a></li>
        </ul>
        <div>
          <Progress percent={this.state.percent} indicating />
          <Button onClick={e => this.handleClick()}>Increment</Button>
        </div>
      </div>
    );
  }
}

function select({ app }) {
  return { app };
}

export default connect(select)(Home);
