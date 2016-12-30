import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';

export default class PostForm extends Component {
  constructor(props) {
    super(props);
    const { title, body } = this.props;
    this.state = this.initial = { title, body };
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value }, () => {
      if (!this.isNew()) {
        this.props.onDirty(this.isDirty());
      }
    });
  }

  handleSubmit(e, { formData: post }) {
    e.preventDefault();

    const { onSubmit } = this.props;
    if (typeof onSubmit === 'function') {
      onSubmit(post);
    }
  }

  isDirty() {
    return this.state.title !== this.initial.title || this.state.body !== this.initial.body;
  }

  getSubmitLabel() {
    return this.isNew() ? 'Publish' : 'Update';
  }

  isNew() {
    const { id } = this.props;
    return typeof id === 'undefined';
  }

  render() {
    const { id } = this.props;
    const { title, body } = this.state;

    let hidden;
    if (!this.isNew()) {
      hidden = <input name='id' type='hidden' value={id} />;
    }

    return <Form onSubmit={this.handleSubmit.bind(this)}>
      {hidden}
      <Form.Input
        name='title'
        placeholder='Title'
        value={title}
        size='huge'
        onChange={e => this.handleChange('title', e.target.value)}
      />
      <Form.TextArea
        name='body'
        placeholder='Body'
        value={body}
        rows='16'
        onChange={e => this.handleChange('body', e.target.value)}
      />
      <Button primary type='submit'>{this.getSubmitLabel()}</Button>
    </Form>;
  }
}
