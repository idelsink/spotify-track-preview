<template lang="html">
  <div>
    <VToolbar app clipped-left><VToolbarTitle>Spotify track preview</VToolbarTitle></VToolbar>
    <VContainer :grid-list-sm="true" fluid>
      <VContent v-if="apiAvailable">
        <!-- Search input -->
        <VLayout align-center justify-center>
          <VFlex xs12 sm6>
            <VTextField
              :loading="isSearching"
              clearable
              label="Search Spotify"
              hint="For example, Tracks or Albums"
              append-outer-icon="share"
              @click:append-outer="shareSearchQuery"
              v-model="searchQuerry"
            ></VTextField>
          </VFlex>
        </VLayout>
        <!-- Volume slider -->
        <VLayout align-center justify-center>
          <VFlex xs12 sm6>
            <VSlider
            v-model="volume"
            append-icon="volume_up"
            prepend-icon="volume_down"
            ></VSlider>
          </VFlex>
        </VLayout>
        <!-- Pagination controls -->
        <VLayout v-if="searchResultPaginationCount" align-center justify-center>
          <VFlex xs12 sm6>
            <div class="text-xs-center">
              <VPagination circle
              :length="searchResultPaginationCount"
              :value="searchResultPaginationCurrent"
              @input="searchPaginatedPage"
              ></VPagination>
            </div>
          </VFlex>
        </VLayout>
        <!-- Results -->
        <VLayout row wrap>
          <VFlex
            v-for="(item, index) in searchResults"
            :key="index"
            xs12 sm6 md6 lg4 xl3
          >
            <TrackCard
              :data="item"
              :eventBus="eventBus"
              :volume="volume"
            ></TrackCard>
          </VFlex>
        </VLayout>
        <!-- Pagination controls -->
        <VLayout v-if="searchResultPaginationCount" align-center justify-center>
          <VFlex xs12 sm6>
            <div class="text-xs-center">
              <VPagination circle
              :length="searchResultPaginationCount"
              :value="searchResultPaginationCurrent"
              @input="searchPaginatedPage"
              ></VPagination>
            </div>
          </VFlex>
        </VLayout>
      </VContent>
      <VContent v-else>
        <!-- Loading -->
        <VContainer fluid>
          <VLayout column align-center justify-center row fill-height>
            <VFlex xs12 sm6 offset-sm3>
              <VProgressCircular
                :size="70"
                color="primary"
                indeterminate
              ></VProgressCircular>
            </VFlex>
          </VLayout>
        </VContainer>
      </VContent>
    </VContainer>
    <!-- Footer -->
    <VFooter app height="auto" >
      <span class="ml-2">
        <code>{{appVersion}}</code>
      </span>
      <VSpacer></VSpacer>
      Made with &nbsp;
      <FontAwesomeIcon
        color="#B71C1C"
        icon="heart">
      </FontAwesomeIcon>
      <VBtn flat icon
        target="_blank"
        href="https://github.com/idelsink/spotify-track-preview"
      >
        <FontAwesomeIcon
          color="#ffffff"
          :icon="['fab', 'github']">
        </FontAwesomeIcon>
      </VBtn>
    </VFooter>
    <VSnackbar
      :timeout="2000"
      :color="snackbarColor"
      v-model="showSnackbar"
      bottom
    >
      {{ snackbarText }}
      <VBtn
        flat
        @click="showSnackbar = false"
      >
        Close
      </VBtn>
    </VSnackbar>
  </div>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';
import SpotifyWebApi from 'spotify-web-api-js';
import TrackCard from '../components/TrackCard';
import { EventEmitter2 } from 'eventemitter2';
import AppInfo from '../app-info';

export default {
  name: 'Player',
  components: {
    TrackCard
  },
  data: () => {
    const Spotify = new SpotifyWebApi();
    return {
      appInfo: AppInfo,
      showSnackbar: false,
      snackbarColor: '',
      snackbarText: '',
      eventBus: new EventEmitter2({
        wildcard: true,
        maxListeners: 200
      }),
      searchResultLimit: 20,
      volume: 40,
      apiAvailable: false,
      searchQuerry: undefined,
      isSearching: false,
      oldSearchRequest: undefined,
      spotify: Spotify,
      searchResult: {},
      searchSpotify: _.throttle(function (query, types, options) {
        this.isSearching = true;
        if (query) {
          _.invoke(this.oldSearchRequest, 'abort'); // Abort old request (if it is still active)
          // Spotify URI
          this.oldSearchRequest = Promise.try(() => {
            if (_.startsWith(query, 'spotify:track:')) {
              // assume it's a Spotify track ID
              return Spotify.getTrack(_.replace(query, 'spotify:track:', '')).then(data => {
                this.searchResult = _.set({}, 'items', [
                  data
                ]);
                this.isSearching = false;
              });
            } else {
              return Spotify.search(query, types, options).then(data => {
                this.searchResult = _.get(data, 'tracks', {});
                this.isSearching = false;
              });
            }
          }).catch(err => {
            console.error('Error while calling the API', err);
            if (_.get(err, 'status') === 401) {
              console.warn('Unauthorized');
              this.getYourselfAuthenticated();
            }
          });
        } else {
          this.searchResult = {};
          this.isSearching = false;
        }
      }, 200, { leading: false, trailing: true })
    };
  },
  methods: {
    shareSearchQuery: function () {
      let shareUrl;
      if (this.searchQuerry) {
        shareUrl = window.location.origin + window.location.pathname + '#' + this.$router.currentRoute.path + '?q=' + encodeURIComponent(this.searchQuerry);
      } else {
        shareUrl = window.location.origin + window.location.pathname + '#' + this.$router.currentRoute.path;
      }
      this.$copyText(shareUrl).then((e) => {
        this.snackbarColor = 'success';
        this.snackbarText = 'Successfully copied link to this search result';
        this.showSnackbar = true;
      }, (e) => {
        this.snackbarColor = 'error';
        this.snackbarText = 'Failed to copy the search query';
        this.showSnackbar = true;
        console.error(e);
      });
    },
    getAccessToken: function () {
      return this.$localStorage.get('access_token');
    },
    getYourselfAuthenticated: function () {
      // Store (temporary) query
      if (this.searchQuerry) {
        this.$localStorage.set('query', this.searchQuerry, { expires: '10s' });
      }
      this.$router.push({ name: 'Authenticate', params: { authenticateNow: true } });
    },
    searchPaginatedPage: function (page) {
      if (_.isNumber(page) && _.inRange(page, 1, this.searchResultPaginationCount + 1)) {
        page--;
        this.eventBus.emit('audio.stop'); // Make sure that all players stop
        this.searchSpotify(this.searchQuerry, ['track'], { limit: this.searchResultLimit, offset: page * this.searchResultLimit });
      }
    }
  },
  computed: {
    appVersion: function () {
      return _.get(this.appInfo, 'gitInfo.tag', '');
    },
    searchResults: function () {
      return _.get(this.searchResult, 'items', []);
    },
    searchResultPaginationCount: function () {
      const limit = _.get(this.searchResult, 'limit', 0);
      let total = _.get(this.searchResult, 'total', 0);
      // Limit the offet to 10000
      // https://developer.spotify.com/documentation/web-api/reference/search/search/
      // Maximum offset (including limit): 10,000.
      total = total + this.searchResultLimit > 10000 ? 10000 : total;
      if (limit && total) {
        return _.ceil(total / limit);
      } else {
        return 0;
      }
    },
    searchResultPaginationCurrent: function () {
      const limit = _.get(this.searchResult, 'limit', 0);
      const offset = _.get(this.searchResult, 'offset', 0);
      if (limit && offset) {
        return 1 + _.ceil(offset / limit);
      } else {
        return 1;
      }
    }
  },
  watch: {
    '$route' (to, from) {
      const searchQuerry = _.get(to, 'query.q');
      if (searchQuerry) {
        this.searchQuerry = searchQuerry;
        // Remove query from URL
        this.$router.replace({
          name: this.$router.currentRoute.name,
          query: _.omit(this.$router.currentRoute.query, 's')
        });
      }
    },
    volume: function (newVal) {
      this.$localStorage.set('volume', newVal);
    },
    searchQuerry: function (newVal, oldVal) {
      this.eventBus.emit('audio.stop'); // Make sure that all players stop
      this.searchSpotify(newVal, ['track'], { limit: this.searchResultLimit, offset: 0 });
    }
  },
  asyncComputed: {
  },
  mounted: function () {
    // Restore volume
    const volume = _.toNumber(this.$localStorage.get('volume'));
    if (volume && _.inRange(volume, 0, 100)) {
      this.volume = volume;
    }
    // Fetch query string
    if (this.$localStorage.get('query')) {
      this.searchQuerry = this.$localStorage.get('query');
    }
    if (_.has(this.$route, 'query.q')) {
      // Fetch search query from URL
      this.searchQuerry = _.get(this.$route, 'query.q', '');
      // Remove query from URL
      this.$router.replace({
        name: this.$router.currentRoute.name,
        query: _.omit(this.$router.currentRoute.query, 'q')
      });
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
