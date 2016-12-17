import 'semantic-ui-css/semantic.min.css';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Layout from './components/layout';
import Router from './components/router';
import configureStore from './store';

ReactDOM.render(
  <Provider store={configureStore()}>
    <Layout>
      <Router />
    </Layout>
  </Provider>,
document.getElementById('container'));
