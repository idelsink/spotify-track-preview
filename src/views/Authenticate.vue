<template lang="html">
  <VResponsive>
    <VContainer fill-height>
      <VLayout
        justify-center
      >
        <VFlex
          xs12
          sm10
          mt-12
        >
          <h3 class="display-2 font-weight-medium">
            Spotify track preview
          </h3>
          <div class="mt-2 subtitle-1">
            Player to play the Spotify song preview
          </div>

          <VDivider class="my-3" />
          <h6 class="title mb-3">
            Authenticate this application by clicking the login button below!
          </h6>

          <VBtn
            color="primary"
            large
            :loading="loginLoading"
            @click="startAuthenticationProcess"
          >
            Login
          </VBtn>
        </VFlex>
      </VLayout>
    </VContainer>
  </VResponsive>
</template>

<script>
import _ from 'lodash';
import AppInfo from '../app-info';

export default {
  name: 'Authenticate',
  data: () => ({
    loginLoading: false,
    gradient: 'to top right, rgba(63,81,181, .7), rgba(25,32,72, .7)'
  }),
  mounted () {
    if (_.get(this.$route, 'params.authenticateNow')) {
      this.startAuthenticationProcess();
    }

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
        // Store token in localstorage
        this.$localStorage.set('access_token', _.get(params, 'access_token'));
        // Redirect to player
        this.$router.push({ name: 'Player' });
      } else {
        console.warn('The redirectedFrom key did not meet the required criteria', params);
      }
      this.loginLoading = false;
    }
  },
  methods: {
    startAuthenticationProcess () {
      const base = 'https://accounts.spotify.com/authorize';
      const params = {
        'response_type': 'token',
        'client_id': AppInfo.spotify.clientId,
        'redirect_uri': window.location.origin + window.location.pathname, // The URI to redirect to after the user grants/denies permission.
        'state': '', // Cross-Site Request Forgery reduction (https://tools.ietf.org/html/rfc6749#section-10.12)
        'scope': [
          'user-top-read' // Read access to a user's top artists and tracks.
        ]
        // 'show_dialog': false // Whether or not to force the user to approve the app again if they’ve already done so.
      };
      const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

      console.log(`params`, params);
      console.log(`URL: ${base}?${query}`);

      window.location.assign(`${base}?${query}`);
    }
  }
};
</script>

<style lang="css">
</style>
