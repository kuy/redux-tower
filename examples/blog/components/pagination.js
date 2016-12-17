import React, { Component, PropTypes } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../sagas/routes';

class Pagination extends Component {
  render() {
    let { page = 1 } = this.props;
    if (typeof page === 'string') {
      page = parseInt(page, 10);
    }

    const items = [];
    if (0 < page - 1) {
      items.push(<Link to={`/posts?page=${page - 1}`} className='item'>{page - 1}</Link>);
    }
    items.push(<Menu.Item active>{page}</Menu.Item>);
    items.push(<Link to={`/posts?page=${page + 1}`} className='item'>{page + 1}</Link>);

    return <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Menu pagination>{items}</Menu>
    </div>;
  }
}

Pagination.propTypes = {
  page: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]),
};

export default Pagination;
