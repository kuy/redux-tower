import React, { Component, PropTypes } from 'react';

export default function createLink(history) {
  class Link extends Component {
    handleClick(e) {
      e.preventDefault();

      const { to } = this.props;
      history.push(to);
    }

    render() {
      const { to, external, target, className, children } = this.props;
      let { href } = this.props;

      if (!to && !href) {
        throw new Error(`<Link> component requires either 'to' or 'href' props.`);
      }

      if (to && !href) {
        href = to;
      }

      const props = { href, target, className };
      if (!external) {
        props.onClick = this.handleClick.bind(this);
      }

      return <a {...props}>{children}</a>;
    }
  }

  Link.propTypes = {
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    target: PropTypes.string,
    className: PropTypes.string,
  };

  Link.defaultProps = {
    external: false,
    target: '_self',
  };

  return Link;
}
