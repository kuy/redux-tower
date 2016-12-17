# redux-saga-tower

Saga powered routing engine for React/Redux apps.

## Usage

```js
const routes = {
  // Assign React component directry
  '/': Index,

  // Receive query parameters like '/posts?q=Apple'
  '/posts': function* postsIndexPage({ query }) {
    // Fetch list of posts with search and paging feature
    yield call(fetchPosts, query);

    // Show post index page
    yield PostsIndex;
  },

  // Receive named parameters like '/posts/1'
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    try {
      // Fetch a single post
      yield call(fetchPost);

      // Show post show page
      yield PostsShow;

    } finally {
      if (yield cancelled()) {
        // Cancel something
      }
    }
  },

  // Redirect to other route
  '/about': '/posts/2',

  '/login': function* usersLoginPage() {
    if (yield select(isLoggedIn)) {
      // Nothing to do
    } else {
      // Show login page
      yield UsersLogin;

      // Wait for login
      yield take(...);

      if (/* check auth */) {
        yield '/';
      } else {
        // Already in login page, nothing to do
      }
    }
  },

  '/logout': function* usersLogoutPage() {
    if (yield select(isLoggedIn)) {
      // Logout
      yield put(logout());

      // Show top page
      yield Index;
    } else {
      // Nothing to do
    }
  },
};
```


## License

MIT


## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)
