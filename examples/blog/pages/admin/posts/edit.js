import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Container } from 'semantic-ui-react';
import { requestStorePosts } from '../../../actions';
import { actions } from '../../../../../src/index';

class AdminPostsEdit extends Component {
  constructor(props) {
    super(props);
    const { post: { id, title, body } } = this.props;
    this.state = { id, title, body };
  }

  handleChangeTitle(e) {
    const title = e.target.value;
    this.setState({ ...this.state, title });
  }

  handleChangeBody(e) {
    const body = e.target.value;
    this.setState({ ...this.state, body });
  }

  handleSubmit(e, { formData: post }) {
    e.preventDefault();
    this.props.dispatch(requestStorePosts(post));
    this.props.dispatch(actions.push(`/admin/posts/${post.id}/update`));
  }

  render() {
    const { id, title, body } = this.state;
    return <Container>
      <Form onSubmit={this.handleSubmit.bind(this)}>
        <input name='id' type='hidden' value={id} />
        <Form.Input
          name='title'
          value={title}
          size='huge'
          onChange={this.handleChangeTitle.bind(this)}
        />
        <Form.TextArea
          name='body'
          value={body}
          rows='16'
          onChange={this.handleChangeBody.bind(this)}
        />
        <Button primary type='submit'>Save</Button>
      </Form>
    </Container>;
  }
}

function select({ posts: { list, entities } }) {
  const posts = list.map(id => entities[id]);
  return { post: posts[0] };
}

export default connect(select)(AdminPostsEdit);
