<template lang="html">
  <div>
    <v-toolbar app fixed clipped-left><v-toolbar-title>Spotify track preview</v-toolbar-title></v-toolbar>
      <v-container fluid>
        <v-content>
          <v-layout align-center justify-center>
            <v-flex xs12 sm6>
              <v-text-field
                :loading="loadingSearch"
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
      loadingSearch: false,
      searchQuerry: undefined,
      spotify: Spotify,
      searchSpotify: _.throttle((query) => {
        if (query) {
          return Spotify.search(query, ['track', 'artist']).then(data => {
            return data;
          });
        } else {
          return Promise.try(() => { return {}; });
        }
      }, 200, {leading: true, trailing: true})
    };
  },
  computed: {
    accessToken: function () {
      return this.$cookies.get('access_token');
    }
  },
  asyncComputed: {
    searchResults: function () {
      return this.searchSpotify(this.searchQuerry).then((result) => {
        return _.get(result, 'tracks.items');
      });
    }
  },
  mounted: function () {
    if (this.accessToken) {
      this.spotify.setAccessToken(this.accessToken);
    }
  }
};
</script>

<style lang="css" scoped>
</style>
