<template lang="html">
  <v-card height="100%">
    <v-layout align-center justify-center fill-height>
      <v-flex xs4>
        <v-layout align-center justify-center fill-height>
          <v-flex>
            <v-card-media
              @click
              :src="albumImage"
              height="125px"
              contain
            ></v-card-media>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs8>
        <v-card-title primary-title>
          <div>
            <div class="title">{{trackName}}</div>
            <div>{{artistNames}}</div>
            <div>{{albumName}}</div>
          </div>
        </v-card-title>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'TrackCard',
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data: function () {
    return {};
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
    trackPreviewUrl: function () {
      return _.get(this.data, 'preview_url', '');
    }
  }
};
</script>

<style lang="css" scoped>
</style>
