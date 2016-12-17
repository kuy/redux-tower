import React, { Component, PropTypes } from 'react';

export default function createLink(history) {
  class Link extends Component {

    handleClick(e) {
      e.preventDefault();

      const { to } = this.props;
      history.push(to);
    }

    render() {
      const { to, external, target, children } = this.props;
      const props = {};
      if (!external) {
        props.onClick = this.handleClick.bind(this);
      }
      return <a href={to} target={target} {...props}>{children}</a>;
    }
  }

  Link.propTypes = {
    to: PropTypes.string.isRequired,
    external: PropTypes.bool,
    target: PropTypes.string,
  };

  Link.defaultProps = {
    external: false,
    target: '_self',
  };

  return Link;
}
