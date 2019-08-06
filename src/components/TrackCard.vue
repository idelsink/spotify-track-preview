<template lang="html">
  <VCard>
    <VHover v-slot:default="{ hover }">
      <VImg
        :class="{pointer: hasTrackPreviewUrl}"
        :src="albumImage"
        aspect-ratio="1"
        @click="clickFab"
      >
        <VLayout
          align-center
          justify-center
          row
          fill-height
        >
          <VChip
            v-if="!hasTrackPreviewUrl"
            disabled
            small
          >
            Preview not available
          </VChip>
          <VBtn
            v-else
            v-show="hover || isTrackLoading || isTrackPlaying"
            :disabled="!hasTrackPreviewUrl"
            :loading="isTrackLoading"
            large
            fab
            :color="fabColor"
          >
            <VIcon>{{ fabIcon }}</VIcon>
          </VBtn>
        </VLayout>
      </VImg>
    </VHover>

    <VCardText>
      <div class="title">
        {{ trackName }}
      </div>
      <div class="subtitle-2">
        {{ artistNames }}
      </div>
      <div class="subtitle-2 font-weight-light">
        <VIcon
          small
        >
          fas fa-compact-disc
        </VIcon>
        {{ albumName }}
      </div>
    </VCardText>

    <VCardActions>
      <VBtn
        small
        text
        @click="copyTrackUriToClipboard"
      >
        Share
      </VBtn>
      <VSpacer />
      <!-- <VBtn
        small
        icon
        @click="show = !show"
      >
        <VIcon>{{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</VIcon>
      </VBtn> -->
    </VCardActions>

    <!-- <VExpandTransition>
      <div v-show="show">
        <VCardText>
        </VCardText>
      </div>
    </VExpandTransition> -->

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
  </VCard>
</template>

<script>
import _ from 'lodash';
import Promise from 'bluebird';

export default {
  name: 'TrackCard',
  props: {
    data: {
      type: Object,
      default () {
        return {};
      }
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
  data () {
    return {
      show: false,
      overlay: false,
      audioTrackPreview: undefined,
      previewTrackPaused: true,
      trackLoading: false,
      showSnackbar: false,
      snackbarColor: '',
      snackbarText: '',
      trackPlaying: () => { this.previewTrackPaused = false; },
      trackPaused: () => { this.previewTrackPaused = true; },
      trackLoadingStart: () => { this.trackLoading = true; },
      trackDoneLoading: () => { this.trackLoading = false; }
    };
  },
  computed: {
    trackName () { return _.get(this.data, 'name', ''); },
    artistNames () { return _.map(_.get(this.data, 'artists', []), artist => _.get(artist, 'name', '')).join(', '); },
    albumName () { return _.get(this.data, 'album.name', ''); },
    albumImage () { return _.get(_.head(_.get(this.data, 'album.images', [])), 'url', ''); },
    trackUri () { return _.get(this.data, 'uri', ''); },
    fabColor () { return this.isTrackPlaying ? 'teal' : 'red darken-3'; },
    fabIcon () { return this.isTrackPlaying ? 'pause' : 'play_arrow'; },
    trackPreviewUrl () { return _.get(this.data, 'preview_url'); },
    isTrackPlaying () { return !this.previewTrackPaused; },
    isTrackLoading () { return this.trackLoading; },
    hasTrackPreviewUrl () { return !_.isNil(this.trackPreviewUrl); }
  },
  watch: {
    volume: function (newVal, oldVal) {
      this.setVolume(newVal);
    }
  },
  mounted () {
    this.setVolume(this.volume);

    this.eventBus.on('audio.stop', () => {
      this.stopTrackPreview();
    });
  },
  beforeDestroy () {
    this.unbindTrackPreviewEvents();
  },
  methods: {
    bindTrackPreviewEvents () {
      _.invoke(this.audioTrackPreview, 'addEventListener', 'playing', this.trackPlaying);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'pause', this.trackPaused);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'loadstart', this.trackLoadingStart);
      _.invoke(this.audioTrackPreview, 'addEventListener', 'loadeddata', this.trackDoneLoading);
    },
    unbindTrackPreviewEvents () {
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'playing', this.trackPlaying);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'pause', this.trackPaused);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'loadstart', this.trackLoadingStart);
      _.invoke(this.audioTrackPreview, 'removeEventListener', 'loadeddata', this.trackDoneLoading);
    },
    copyTrackUriToClipboard () {
      const shareUrl = window.location.origin + window.location.pathname + '#' + this.$router.currentRoute.path + '?q=' + encodeURIComponent(this.trackUri);
      console.log('shareUrl', shareUrl);
      this.$copyText(shareUrl).then((e) => {
        this.snackbarColor = 'success';
        this.snackbarText = 'Successfully copied song URI';
        this.showSnackbar = true;
      }, (e) => {
        this.snackbarColor = 'error';
        this.snackbarText = 'Failed to copy song URI';
        this.showSnackbar = true;
        console.error('Failed to copy song URI', e);
      });
    },
    clickFab () {
      if (this.hasTrackPreviewUrl) {
        if (_.get(this.audioTrackPreview, 'paused', true)) {
          this.playTrackPreview();
        } else {
          this.stopTrackPreview();
        }
      }
    },
    setVolume: function (value) {
      _.set(this.audioTrackPreview, 'volume', value / 100);
    },
    playTrackPreview () {
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
    stopTrackPreview () {
      this.trackDoneLoading();
      _.invoke(this.audioTrackPreview, 'pause');
      this.previewTrackPaused = true;
    }
  }
};
</script>

<style lang="css" scoped>
.pointer {
  cursor: pointer;
}
</style>
