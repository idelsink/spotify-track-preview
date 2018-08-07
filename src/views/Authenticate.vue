<template lang="html">
  <v-jumbotron>
      <v-container fill-height>
        <v-layout align-center>
          <v-flex>
            <h3 class="display-3">Spotify track preview</h3>

            <v-divider class="my-3"></v-divider>
            <div class="title mb-3">Authenticate this application by clicking the login button below!</div>

            <v-btn color="primary" large :loading="loginLoading" @click="startAuthenticationProcess">Login</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>
</template>

<script>
import _ from 'lodash';
import AppInfo from '../js/app-info';

export default {
  name: 'Authenticate',
  data: () => ({
    loginLoading: false,
    gradient: 'to top right, rgba(63,81,181, .7), rgba(25,32,72, .7)'
  }),
  methods: {
    startAuthenticationProcess: function () {
      const base = 'https://accounts.spotify.com/authorize';
      const params = {
        'response_type': 'token',
        'client_id': AppInfo.spotify.clientId,
        'redirect_uri': window.location.origin, // The URI to redirect to after the user grants/denies permission.
        'state': '', // Cross-Site Request Forgery reduction (https://tools.ietf.org/html/rfc6749#section-10.12)
        'scope': ''
        // 'show_dialog': false // Whether or not to force the user to approve the app again if they’ve already done so.
      };
      const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

      console.log(`params`, params);
      console.log(`URL: ${base}?${query}`);

      window.location.assign(`${base}?${query}`);
    }
  },
  mounted: function () {
    // Parse the redirect URL from spotify
    const redirectedFrom = _.get(this.$route, 'redirectedFrom');
    if (redirectedFrom && _.startsWith(redirectedFrom, '/')) {
      this.loginLoading = true;
      const params = _.flow( // input: /foo=bar&bar=foo
        v => v.substring(1), // Remove the first '/': foo=bar&bar=foo
        v => _.split(v, '&'), // Split the query string in it's segments; ['foo=bar', 'bar=foo']
        v => _.map(v, segment => _.split(segment, '=')), // Split to components at the '='; [['foo', 'bar'], ['bar', 'foo']]
        v => _.map(v, components => _.map(components, component => decodeURIComponent(component))), // decodeURIComponent for all strings
        _.fromPairs // Create an object
      )(redirectedFrom);

      // Verify it has all the members
      // Verify that expires_in is not 0
      if ([
        'access_token',
        'expires_in',
        'state',
        'token_type'
      ].every(k => k in params) && _.get(params, 'expires_in', 0) > 0) {
        console.log('Got access token successfully');
        // Store token in cookie
        document.cookie = `access_token=${_.get(params, 'access_token')}`;
        // Redirect to player
        this.$router.push({ name: 'Player' });
      } else {
        console.warn('The redirectedFrom key did not meet the required criteria', params);
      }
      this.loginLoading = false;
    }
  }
};
</script>

<style lang="css">
</style>
