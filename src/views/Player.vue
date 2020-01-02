<template lang="html">
  <div>
    <VAppBar>
      <VSpacer />
      <VBtn
        icon
        @click="shareSearchQuery"
      >
        <VIcon>share</VIcon>
      </VBtn>

      <VTextField
        v-model="searchQuerry"
        :loading="isSearching"
        clearable
        hide-details
        hint="For example, Tracks or Albums"
        label="Search Spotify"
        single-line
      />

      <VMenu
        bottom
        nudge-bottom="48"
        :open-on-hover="true"
        :close-on-click="true"
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ on }">
          <VBtn
            icon
            v-on="on"
          >
            <VIcon>volume_up</VIcon>
          </VBtn>
        </template>
        <VCard flat>
          <VSlider
            v-model="volume"
            vertical
            hide-details
          />
        </VCard>
      </VMenu>
      <VSpacer />
    </VAppBar>
    <VContainer
      fluid
    >
      <VContent v-if="apiAvailable">
        <!-- Pagination controls -->
        <VRow
          v-if="searchResultPaginationCount"
          align="center"
          justify="center"
        >
          <VCol
            cols="12"
            sm="12"
            md="10"
            lg="8"
          >
            <div class="text-center">
              <VPagination
                circle
                :length="searchResultPaginationCount"
                :value="searchResultPaginationCurrent"
                @input="searchPaginatedPage"
              />
            </div>
          </VCol>
        </VRow>
        <!-- Results -->
        <VRow no-gutters>
          <VCol
            v-for="(item, index) in searchResults"
            :key="index"
            cols="6"
            sm="4"
            md="3"
            lg="2"
            xl="2"
            class="pa-1"
          >
            <TrackCard
              height="100%"
              :data="item"
              :event-bus="eventBus"
              :volume="volume"
            />
          </VCol>
        </VRow>

        <!-- Pagination controls -->
        <VRow
          v-if="searchResultPaginationCount"
          align="center"
          justify="center"
        >
          <VCol
            cols="12"
            sm="12"
            md="10"
            lg="8"
          >
            <div class="text-center">
              <VPagination
                circle
                :length="searchResultPaginationCount"
                :value="searchResultPaginationCurrent"
                @input="searchPaginatedPage"
              />
            </div>
          </VCol>
        </VRow>
      </VContent>
      <VContent v-else>
        <!-- Loading -->
        <VContainer fluid>
          <VRow
            class="fill-height"
            align="center"
            justify="center"
          >
            <VCol
              cols="12"
              sm="6"
              offset-sm="3"
            >
              <VProgressCircular
                :size="70"
                color="primary"
                indeterminate
              />
            </VCol>
          </VRow>
        </VContainer>
      </VContent>
    </VContainer>
    <!-- Footer -->
    <VFooter
      app
      height="auto"
    >
      <span class="ml-2">
        <code>{{ appVersion }}</code>
      </span>
      <VSpacer />
      Made with &nbsp;
      <FontAwesomeIcon
        color="#B71C1C"
        icon="heart"
      />
      <VRow
        class="ml-2 shrink"
        align="center"
      >
        <!-- Limiting the size of the button to fit inside the footer -->
        <VCard
          flat
          max-height="22"
        >
          <GithubButton
            href="https://github.com/idelsink/spotify-track-preview"
            data-show-count="true"
            aria-label="Star idelsink/spotify-track-preview on GitHub"
          >
            Star
          </GithubButton>
        </VCard>
      </VRow>
    </VFooter>
    <VSnackbar
      v-model="showSnackbar"
      :timeout="2000"
      :color="snackbarColor"
      bottom
    >
      {{ snackbarText }}
      <VBtn
        text
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
      volume: 40,
      apiAvailable: false,
      searchResultLimit: 18,
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
          return Spotify.getMyTopTracks(options).then(data => {
            this.searchResult = data;
            this.isSearching = false;
          });
        }
      }, 200, { leading: false, trailing: true })
    };
  },
  computed: {
    appVersion () {
      return _.get(this.appInfo, 'gitInfo.tag', '');
    },
    searchResults () {
      return _.get(this.searchResult, 'items', []);
    },
    searchResultPaginationCount () {
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
    searchResultPaginationCurrent () {
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
  mounted () {
    // Restore volume
    const volume = _.toNumber(this.$localStorage.get('volume'));
    if (volume && _.inRange(volume, 0, 100)) {
      this.volume = volume;
    }
    // Fetch query string
    if (this.$localStorage.get('query')) {
      this.searchQuerry = this.$localStorage.get('query');
      this.$localStorage.remove('query');
    } else if (_.has(this.$route, 'query.q')) {
      // Fetch search query from URL
      this.searchQuerry = _.get(this.$route, 'query.q', '');
      // Remove query from URL
      this.$router.replace({
        name: this.$router.currentRoute.name,
        query: _.omit(this.$router.currentRoute.query, 'q')
      });
    } else {
      this.searchQuerry = ''; // Trigger empty search to load users top tracks
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
  },
  methods: {
    shareSearchQuery () {
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
    getAccessToken () {
      return this.$localStorage.get('access_token');
    },
    getYourselfAuthenticated () {
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
        this.$vuetify.goTo(0); // Go to the top of the screen when switching pages
      }
    }
  },
  asyncComputed: {
  }
};
</script>

<style lang="css" scoped>
</style>
