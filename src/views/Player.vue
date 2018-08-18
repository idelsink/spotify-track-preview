<template lang="html">
  <div>
    <v-toolbar app fixed clipped-left><v-toolbar-title>Spotify track preview</v-toolbar-title></v-toolbar>
    <v-container fluid>
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
        <v-layout align-center justify-center>
          <v-flex xs12 sm6>
            <v-slider
            v-model="volume"
            append-icon="volume_up"
            prepend-icon="volume_down"
            ></v-slider>
          </v-flex>
        </v-layout>
        <v-container :grid-list-sm="true" fluid>
          <v-layout row wrap>
            <v-flex
              v-for="item in searchResults"
              xs12 sm6 md4 lg4 xl3
            >
              <trackCard
                :data="item"
                :eventBus="eventBus"
                :volume="volume"
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
    <v-footer height="auto" absolute>
      <span class="ml-2">
        <code>{{appVersion}}</code>
      </span>
      <v-spacer></v-spacer>
      Made with &nbsp;
      <font-awesome-icon
        color="#B71C1C"
        :scale="1"
        name="heart">
      </font-awesome-icon>
      <v-btn flat icon
        target="_blank"
        href="https://github.com/idelsink/spotify-track-preview"
      >
        <font-awesome-icon
          color="#ffffff"
          :scale="1"
          name="brands/github">
        </font-awesome-icon>
      </v-btn>
    </v-footer>
  </div>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';
import SpotifyWebApi from 'spotify-web-api-js';
import trackCard from '../components/track-card';
import {EventEmitter2} from 'eventemitter2';
import AppInfo from '../js/app-info.js';

export default {
  name: 'Player',
  components: {
    trackCard
  },
  data: () => {
    const Spotify = new SpotifyWebApi();
    return {
      appInfo: AppInfo,
      eventBus: new EventEmitter2({
        wildcard: true,
        maxListeners: 200
      }),
      volume: 40,
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
    appVersion: function () {
      return _.get(this.appInfo, 'gitInfo.tag', '');
    }
  },
  watch: {
    volume: function (newVal) {
      this.$cookie.set('volume', newVal);
    },
    searchQuerry: function (newVal, oldVal) {
      this.searchSpotify(newVal);
      this.eventBus.emit('audio.stop'); // Make sure that all players stop
    }
  },
  asyncComputed: {
  },
  mounted: function () {
    // Restore volume
    const volume = _.toNumber(this.$cookie.get('volume'));
    if (volume && _.inRange(volume, 0, 100)) {
      this.volume = volume;
    }

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
