import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from '../actions';

function getHref(props, withOffset = false) {
  const { to, offset, external } = props;
  let { href } = props;

  if (!to && !href) {
    throw new Error(`<Link> component requires either 'to' or 'href' props.`);
  }

  if (to && !href) {
    href = to;
  }

  if (withOffset && offset && !external) {
    href = offset + href;
  }

  return href;
}

class Link extends Component {
  handleClick(e) {
    e.preventDefault();

    const { onClick } = this.props;
    if (typeof onClick === 'function') {
      onClick(e);
    }

    const href = getHref(this.props);
    this.props.dispatch(push(href));
  }

  render() {
    const { external, target, className, children } = this.props;
    const href = getHref(this.props, true);

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
  onClick: PropTypes.func,
};

Link.defaultProps = {
  external: false,
  target: '_self',
};

function select({ router: { offset } }) {
  return { offset };
}

export default connect(select)(Link);
