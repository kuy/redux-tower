import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Form, Button, Container } from 'semantic-ui-react';
import { requestCreatePost } from '../../../actions';
import { actions } from '../../../../../src/index';

class AdminPostsNew extends Component {
  constructor(props) {
    super(props);
    this.state = { title: '', body: '' };
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleSubmit(e, { formData: post }) {
    e.preventDefault();
    this.props.dispatch(requestCreatePost(post));
    this.props.dispatch(actions.push(`/admin/posts/create`));
  }

  render() {
    const { title, body } = this.state;
    return <Container>
      <Header as='h1'>New Post</Header>
      <Form onSubmit={this.handleSubmit.bind(this)}>
        <Form.Input
          name='title'
          value={title}
          size='huge'
          onChange={e => this.handleChange('title', e.target.value)}
        />
        <Form.TextArea
          name='body'
          value={body}
          rows='16'
          onChange={e => this.handleChange('body', e.target.value)}
        />
        <Button primary type='submit'>Publish</Button>
      </Form>
    </Container>;
  }
}

export default connect()(AdminPostsNew);
