import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Menu, Header, Container, Breadcrumb, Divider } from 'semantic-ui-react';
import { Link } from '../../sagas/router';

class PostsIndex extends Component {
  render() {
    const { posts } = this.props;
    return <Container>
      <Breadcrumb size='big'>
        <Breadcrumb.Section>Home</Breadcrumb.Section>
      </Breadcrumb>

      {posts.map(post =>
        <div>
          <Divider hidden />
          <Header as='h2'>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </Header>
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Menu pagination>
          <Menu.Item disabled>1</Menu.Item>
          <Menu.Item>
            <Link to='/posts?page=2'>2</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to='/posts?page=3'>3</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to='/posts?page=4'>4</Link>
          </Menu.Item>
        </Menu>
      </div>
    </Container>;
  }
}

function select({ posts: { list, entities } }) {
  const posts = list.map(id => entities[id]);
  return { posts };
}

export default connect(select)(PostsIndex);
