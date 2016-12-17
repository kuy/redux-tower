import React, { Component } from 'react';

export default function createLink(history) {
  return class Link extends Component {
    handleClick(e) {
      e.preventDefault();

      const { to } = this.props;
      history.push(to);
    }

    render() {
      const { to, children } = this.props;
      return <a href={to} onClick={this.handleClick.bind(this)}>{children}</a>;
    }
  };
}
