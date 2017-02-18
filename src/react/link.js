// @flow

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from '../actions';

import type { Dispatch } from 'redux';
import type { Action } from '../actions';
import type { Initial } from '../reducer';

export interface LinkProps {
  to: string;
  href: string;
  children: React.Element<*>;
  dispatch: Dispatch<Action>;
  external: boolean;
  offset: string;
  target: string;
  className: string,
  onClick?: Function;
}

export interface NextProps {
  onClick?: Function;
  href: string;
  target: string;
  className: string;
}

function getHref(props: LinkProps, withOffset: boolean = false): string {
  const { to, offset, external } = props;
  let { href } = props;

  if (!to && !href) {
    throw new Error('<Link> component requires either "to" or "href" props.');
  }

  if (to && !href) {
    href = to;
  }

  if (withOffset && offset && !external) {
    href = offset + href;
  }

  return href;
}

export class Link extends Component {
  props: LinkProps;
  static defaultProps = {
    external: false,
    target: '_self',
  }

  handleClick(e: Event): void {
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

    const props: NextProps = { href, target, className };
    if (external) {
      props.target = '_blank';
    } else {
      props.onClick = this.handleClick.bind(this);
    }

    return <a {...props}>{children}</a>;
  }
}

function select({router: { offset }}: Initial): { offset: string} {
  return { offset };
}

export default connect(select)(Link);
