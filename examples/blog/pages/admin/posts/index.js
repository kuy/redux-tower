import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, List, Container, Button } from 'semantic-ui-react';
import { actions } from '../../../../../src/index';
import { Link } from '../../../../../src/react/index';
import { requestDeletePost } from '../../../actions';

class AdminPostsIndex extends Component {
  handleDelete(id) {
    this.props.dispatch(requestDeletePost(id));
    this.props.dispatch(actions.push(`/admin/posts/${id}/delete`));
  }

  render() {
    const { posts } = this.props;
    return <Container>
      <div>
        <Header floated='left' as='h1'>Posts</Header>
        <Button floated='right' primary as={Link} to={'/admin/posts/new'}>New Post</Button>
      </div>
      <List style={{ clear: 'both' }}>
        {posts.map(post =>
          <List.Item key={post.id}>
            <List.Content floated='right'>
              <Button.Group size='mini' compact>
                <Link className='ui button' to={`/admin/posts/${post.id}/edit`}>Edit</Link>
                <Button onClick={ e => this.handleDelete(post.id)}>Delete</Button>
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
