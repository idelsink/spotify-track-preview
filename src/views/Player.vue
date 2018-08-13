<template lang="html">
  <div>
    <v-toolbar app fixed clipped-left><v-toolbar-title>Spotify track preview</v-toolbar-title></v-toolbar>
    <v-container :grid-list-xs="true" fluid>
      <v-content v-if="apiAvailable">
        <v-layout align-center justify-center>
          <v-flex xs12 sm6>
            <v-text-field
              :loading="isSearching"
              clearable
              label="Search Spotify"
              hint="For example, Tracks or Albums"
              v-model="searchQuerry"
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-container :grid-list-xs="true" fill-height fluid>
          <v-layout row wrap>
            <v-flex
              v-for="item in searchResults"
              xs12 sm6 md4 lg4 xl3
            >
              <trackCard
                :data="item"
              ></trackCard>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
      <v-content v-else>
        <v-container fluid>
          <v-layout column align-center justify-center row fill-height>
            <v-flex xs12 sm6 offset-sm3>
              <v-progress-circular
                :size="70"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';
import SpotifyWebApi from 'spotify-web-api-js';
import trackCard from '../components/track-card';

export default {
  name: 'Player',
  components: {
    trackCard
  },
  data: () => {
    const Spotify = new SpotifyWebApi();
    return {
      apiAvailable: false,
      searchQuerry: undefined,
      isSearching: false,
      oldSearchRequest: undefined,
      spotify: Spotify,
      searchResults: [],
      searchSpotify: _.throttle(function (query) {
        this.isSearching = true;
        if (query) {
          _.invoke(this.oldSearchRequest, 'abort'); // Abort old request (if it is still active)
          this.oldSearchRequest = Spotify.search(query, ['track']).then(data => {
            this.searchResults = _.get(data, 'tracks.items', []);
            this.isSearching = false;
          });
        } else {
          this.searchResults = [];
          this.isSearching = false;
        }
      }, 200, {leading: false, trailing: true})
    };
  },
  methods: {
    getAccessToken: function () {
      return this.$cookie.get('access_token');
    },
    getYourselfAuthenticated: function () {
      this.$router.push({ name: 'Authenticate', params: {authenticateNow: true} });
    }
  },
  computed: {
  },
  watch: {
    searchQuerry: function (newVar, oldVar) {
      this.searchSpotify(newVar);
    }
  },
  asyncComputed: {
  },
  mounted: function () {
    // No access token!? Go fix that now!
    if (!this.getAccessToken()) {
      this.getYourselfAuthenticated();
    }
    this.spotify.setAccessToken(this.getAccessToken());

    // Verify access to API
    this.spotify.getMe().then(data => {
      this.apiAvailable = true;
      console.log('result from getMe', data);
    }).catch(err => {
      console.error('Error while calling the API', err);
      if (_.get(err, 'status') === 401) {
        console.warn('Unauthorized');
        this.getYourselfAuthenticated();
      }
    });
  }
};
</script>

<style lang="css" scoped>
</style>
