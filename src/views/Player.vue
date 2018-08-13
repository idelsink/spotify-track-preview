<template lang="html">
  <div>
    <v-toolbar app fixed clipped-left><v-toolbar-title>Spotify track preview</v-toolbar-title></v-toolbar>
      <v-container fluid>
        <v-content>
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
          <v-layout>
            <v-flex xs12>
              <template v-for="item in searchResults">
                <v-card class="white--text">
                  <v-layout>
                    <v-flex xs5>
                      <v-card-media
                        :src="item.album.images[0].url"
                        height="125px"
                        contain
                      ></v-card-media>
                    </v-flex>
                    <v-flex xs7>
                      <v-card-title primary-title>
                        <div>
                          <div class="headline">{{item.name}}</div>
                          <!-- This is bad and I should feel bad, I will change this later -->
                          <div>{{item.artists[0].name}}</div>
                          <div>{{item.album.name}}</div>
                        </div>
                      </v-card-title>
                    </v-flex>
                  </v-layout>
                  <v-divider light></v-divider>
                </v-card>
              </template>
            </v-flex>
        </v-layout>
      </v-content>
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';
import SpotifyWebApi from 'spotify-web-api-js';

export default {
  name: 'Player',
  components: {
  },
  data: () => {
    const Spotify = new SpotifyWebApi();
    return {
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
    // Verify access token

    this.spotify.setAccessToken(this.getAccessToken());
  }
};
</script>

<style lang="css" scoped>
</style>
