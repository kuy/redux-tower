import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Container, Breadcrumb } from 'semantic-ui-react';
import { Link } from '../../sagas/routes';

class PostsShow extends Component {
  render() {
    const [ post, ..._ ] = this.props.posts;
    return <Container>
      <Breadcrumb size='big'>
        <Breadcrumb.Section>
          <Link to='/'>Home</Link>
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon='right chevron' />
        <Breadcrumb.Section>{post.title}</Breadcrumb.Section>
      </Breadcrumb>
      <Header as='h2'>{post.title}</Header>
      <div dangerouslySetInnerHTML={{ __html: post.body }} />
    </Container>;
  }
}

function select({ posts: { list, entities } }) {
  const posts = list.map(id => entities[id]);
  return { posts };
}

export default connect(select)(PostsShow);
