import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Container } from 'semantic-ui-react';
import { requestCreatePost } from '../../../actions';
import { actions } from '../../../../../src/index';
import Form from './form';

class AdminPostsNew extends Component {
  handleSubmit(post) {
    this.props.dispatch(requestCreatePost(post));
    this.props.dispatch(actions.push(`/admin/posts/create`));
  }

  render() {
    return <Container>
      <Header as='h1'>New Post</Header>
      <Form title='' body='' onSubmit={this.handleSubmit.bind(this)} />
    </Container>;
  }
}

export default connect()(AdminPostsNew);
