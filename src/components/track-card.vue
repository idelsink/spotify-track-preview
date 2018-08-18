<template lang="html">
  <v-card class="flex fill-height">
    <v-layout align-center justify-center fill-height>
      <v-flex xs4 >
        <v-layout>
          <v-flex>
            <v-card-media
              :src="albumImage"
              height="125px"
              contain
            >
          </v-card-media>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs7>
        <v-card-title style="padding: 0px;">
          <div>
            <div class="title">{{trackName}}</div>
            <div>{{artistNames}}</div>
            <div>{{albumName}}</div>
          </div>

        </v-card-title>
      </v-flex>
      <v-flex xs1>
        <v-btn
          :disabled="trackPreviewUrl ? false : true"
          :loading="fabLoading"
          style="z-index:1;"
          small
          absolute
          fab
          right
          :color="fabColor"
          @click="clickFab"
        >
          <v-icon>{{fabIcon}}</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';

export default {
  name: 'TrackCard',
  props: {
    data: {
      type: Object,
      default: {}
    },
    volume: {
      type: Number,
      default: 40
    },
    eventBus: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      audioTrackPreview: undefined,
      previewTrackPaused: true,
      trackLoading: false,
      trackPlaying: () => {
        this.previewTrackPaused = false;
      },
      trackPaused: () => {
        this.previewTrackPaused = true;
      },
      trackLoadingStart: () => {
        this.trackLoading = true;
      },
      trackDoneLoading: () => {
        this.trackLoading = false;
      }
    };
  },
  computed: {
    trackName: function () {
      return _.get(this.data, 'name', '');
    },
    artistNames: function () {
      return _.map(_.get(this.data, 'artists', []), artist => _.get(artist, 'name', '')).join(', ');
    },
    albumName: function () {
      return _.get(this.data, 'album.name', '');
    },
    albumImage: function () {
      return _.get(_.first(_.get(this.data, 'album.images', [])), 'url', '');
    },
    fabLoading: function () {
      return this.trackLoading;
    },
    fabColor: function () {
      return this.previewTrackPaused ? 'red darken-3' : 'teal';
    },
    fabIcon: function () {
      return this.previewTrackPaused ? 'play_arrow' : 'pause';
    },
    trackPreviewUrl: function () {
      return _.get(this.data, 'preview_url');
    }
  },
  watch: {
    volume: function (newVal, oldVal) {
      this.setVolume(newVal);
    }
  },
  methods: {
    bindTrackPreviewEvents: function () {
      _.invoke(this.audioTrackPreview, 'addEventListener', 'playing', this.trackPlaying);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'pause', this.trackPaused);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'loadstart', this.trackLoadingStart);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'loadeddata', this.trackDoneLoading);
    },
    unbindTrackPreviewEvents: function () {
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'playing', this.trackPlaying);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'pause', this.trackPaused);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'loadstart', this.trackLoadingStart);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'loadeddata', this.trackDoneLoading);
    },
    clickFab: function () {
      if (_.get(this.audioTrackPreview, 'paused', true)) {
        this.playTrackPreview();
      } else {
        this.stopTrackPreview();
      }
    },
    setVolume: function (value) {
      _.set(this.audioTrackPreview, 'volume', value / 100);
    },
    playTrackPreview: function () {
      this.eventBus.emit('audio.stop'); // Make sure that all player stop
      // Check if audio is already here or needs to be created
      // When the currentSrc is different, a new audio object needs to be constructed
      // This is because vue sometimes reuses created components in lists
      if (!this.audioTrackPreview || this.trackPreviewUrl !== _.get(this.audioTrackPreview, 'currentSrc')) {
        this.audioTrackPreview = new Audio(this.trackPreviewUrl);
        this.setVolume(this.volume);
        this.bindTrackPreviewEvents();
      }
      _.set(this.audioTrackPreview, 'currentTime', 0);

      Promise.resolve(_.invoke(this.audioTrackPreview, 'play')).then(result => {
        // Done loading
        this.trackDoneLoading();
        this.previewTrackPaused = false;
      }).catch((e) => {
        this.stopTrackPreview();
      });
    },
    stopTrackPreview: function () {
      this.trackDoneLoading();
      _.invoke(this.audioTrackPreview, 'pause');
      this.previewTrackPaused = true;
    }
  },
  mounted: function () {
    this.setVolume(this.volume);

    this.eventBus.on('audio.stop', () => {
      this.stopTrackPreview();
    });
  },
  beforeDestroy: function () {
    this.unbindTrackPreviewEvents();
  }
};
</script>

<style lang="css" scoped>
</style>
