import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, List, Grid, Sidebar, Header, Container, Menu, Input, Icon } from 'semantic-ui-react';
import { toggleCart } from '../actions';

class Home extends Component {
  state = { percent: 33 }

  handleCart() {
    this.props.dispatch(toggleCart());
  }

  render() {
    const { cart } = this.props.app;
    const activeItem = 'all';
    return <Sidebar.Pushable>
      <Sidebar
        as={Container}
        animation='overlay'
        width='wide'
        direction='right'
        visible={cart}
        icon='labeled'
      >
        <Header as='h3'>Shopping Cart</Header>
        <List>
          <List.Item>
            <List.Content floated='right'>
              <Button icon='remove' />
            </List.Content>
            <List.Content>
              Guatemala
            </List.Content>
          </List.Item>
        </List>
      </Sidebar>
      <Sidebar.Pusher>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Header as='h1'>Coffee Beans Shop</Header>
              <Menu secondary>
                <Menu.Item name='all' active={activeItem === 'all'} href='#/' />
                <Menu.Menu position='right'>
                  <Menu.Item name='cart' onClick={e => this.handleCart()} />
                  <Menu.Item>
                    <Input icon='search' placeholder='Search...' />
                  </Menu.Item>
                </Menu.Menu>
              </Menu>
              <List>
              </List>
            </Grid.Column>
            <Grid.Column width={4}></Grid.Column>
          </Grid.Row>
        </Grid>
      </Sidebar.Pusher>
    </Sidebar.Pushable>;
  }
}

function select({ app }) {
  return { app };
}

export default connect(select)(Home);
