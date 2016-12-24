import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, Container, Button } from 'semantic-ui-react';
import { Link } from '../../../../../src/react/index';

class AdminPostsIndex extends Component {
  render() {
    const { posts } = this.props;
    return <Container>
      <List>
        {posts.map(post =>
          <List.Item key={post.id}>
            <List.Content floated='right'>
              <Button.Group size='mini' compact>
                <Link className='ui button' to={`/admin/posts/${post.id}/edit`}>Edit</Link>
                <Button>Delete</Button>
              </Button.Group>
            </List.Content>
            <List.Content>
              <Link target='_blank' to={`/posts/${post.id}`}>{post.title}</Link>
            </List.Content>
          </List.Item>
        )}
      </List>
    </Container>;
  }
}

function select({ posts: { list, entities } }) {
  const posts = list.map(id => entities[id]);
  return { posts };
}

export default connect(select)(AdminPostsIndex);
