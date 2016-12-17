import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Container, Breadcrumb, Divider } from 'semantic-ui-react';
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
    </Container>;
  }
}

function select({ posts: { list, entities } }) {
  const posts = list.map(id => entities[id]);
  return { posts };
}

export default connect(select)(PostsIndex);
