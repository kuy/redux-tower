import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Header, Progress, Segment } from 'semantic-ui-react';
import { Link } from '../sagas/router';

class Layout extends Component {
  render() {
    const { loading, children } = this.props;
    return <div>
      <Segment>
        <Button href='https://github.com/kuy/redux-saga-tower' icon='github' size='huge' color='black' circular floated='right' />
        <Header as='h1' style={{ margin: '.5rem' }}>
          <Icon name='write' />
          My First Blog
          <Link to='/posts?q=Banana'>Posts</Link>
        </Header>
        <Progress color={loading ? 'blue' : 'grey'} disabled={!loading} percent={100} attached='bottom' indicating={loading} />
      </Segment>
      {children}
    </div>;
  }
}

function select({ posts: { status } }) {
  return { loading: status === 'working' };
}

export default connect(select)(Layout);
