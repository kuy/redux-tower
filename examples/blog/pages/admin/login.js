import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Form, Button, Message } from 'semantic-ui-react';
import * as actions from '../../../../src/actions';
import { requestLogin } from '../../actions';

class AdminLogin extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
  }

  handleSubmit(e, { formData }) {
    e.preventDefault();
    this.props.dispatch(requestLogin(formData));
    this.props.dispatch(actions.push(`/admin/login/processing`));
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  render() {
    const { processing, error } = this.props;

    let message;
    if (error) {
      message = <Message negative>
        <Message.Header>Login error</Message.Header>
        <p>Invalid username or password.</p>
      </Message>;
    }

    let button;
    if (processing) {
      button = <Button primary loading disabled>Processing</Button>;
    } else {
      button = <Button primary type='submit'>Login</Button>;
    }

    return <Container>
      {message}
      <Form onSubmit={this.handleSubmit.bind(this)}>
        <Form.Group widths='equal'>
          <Form.Input label='Username' name='username' placeholder='admin' onChange={e => this.handleChange('username', e.target.value)} />
          <Form.Input label='Password' name='password' type='password' placeholder='tower' onChange={e => this.handleChange('password', e.target.value)} />
        </Form.Group>
        {button}
      </Form>
    </Container>;
  }
}

function select({ app }) {
  const { status, error } = app;
  return { processing: status !== 'ready', error };
}

export default connect(select)(AdminLogin);
