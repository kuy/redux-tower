import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Container, Breadcrumb, Divider } from 'semantic-ui-react';
import { Link } from '../../../../src/react/index';
import Pagination from '../../components/pagination';

class PostsIndex extends Component {
  render() {
    const { posts, query } = this.props;
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

      <Divider hidden />
      <Pagination page={query.page} />
    </Container>;
  }
}

function select({ posts: { list, entities }, router }) {
  const posts = list.map(id => entities[id]);
  const { query } = router;
  return { posts, query };
}

export default connect(select)(PostsIndex);
