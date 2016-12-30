import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Container } from 'semantic-ui-react';
import { updateDirty, requestStorePosts } from '../../../actions';
import { actions } from '../../../../../src/index';

export default class PostForm extends Component {
  constructor(props) {
    super(props);
    const { post: { id, title, body } } = this.props;
    this.state = { id, title, body };
    this.initial = { title, body };
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value }, () => {
      this.props.dispatch(updateDirty(this.isDirty()));
    });
  }

  handleSubmit(e, { formData: post }) {
    e.preventDefault();
    this.props.dispatch(requestStorePosts(post));
    this.props.dispatch(actions.push(`/admin/posts/${post.id}/update`));
  }

  isDirty() {
    return this.state.title !== this.initial.title || this.state.body !== this.initial.body;
  }

  render() {
    const { id, title, body } = this.state;
    return <Form onSubmit={this.handleSubmit.bind(this)}>
      <input name='id' type='hidden' value={id} />
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
      <Button primary type='submit'>Save</Button>
    </Form>;
  }
}
