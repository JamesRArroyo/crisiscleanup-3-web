<template>
  <div>
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        <img :src="profileSrc" alt="PFP" />
      </div>
      <div class="flex-col justify-between m-3">
        <div class="flex flex-row justify-between">
          <div class="flex flex-col justify-between">
            <base-text variant="h1" class="mr-auto">{{ name }}</base-text>
          </div>
          <div class="flex-col">
            <base-button
              icon-size="md"
              size="md"
              ccu-icon="edit"
              class="hover:bg-crisiscleanup-grey-100 ml-auto"
            />
          </div>
        </div>
        <base-text variant="h2" class="justify-between">{{ mobile }}</base-text>
        <div id="moreinfobtn" class="more-infobtn">
          <base-button
            class="text-crisiscleanup-dark-blue align-right"
            :action="() => (toggleOpen = !toggleOpen)"
            >{{ !toggleOpen ? 'more' : 'less' }} info
          </base-button>
        </div>
      </div>
    </div>
    <!--- info card --->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!--- Buttons --->
    <div class="flex flex-row justify-content">
      <div class="flex-col m-3">
        <base-button
          class="bg-crisiscleanup-dark-red hover:bg-crisiscleanup-red-100 font-bold text-white py-2 px-4 m-3"
          :action="onToggle"
        >
          {{ available ? 'Available' : 'Offline' }}
        </base-button>
      </div>
      <div class="flex-col m-3">
        <base-button
          class="bg-crisiscleanup-dark-500 hover:bg-crisiscleanup-dark-400 font-bold text-white py-2 px-3 m-3"
        >
          DP
        </base-button>
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import ContactMoreInfo from './ContactMoreInfo.vue';

export default {
  name: 'CallerCard',
  components: {
    'more-info': ContactMoreInfo,
  },
  props: {
    name: VueTypes.string,
    mobile: VueTypes.string,
    profileSrc: VueTypes.string,
    available: VueTypes.bool,
    onToggle: VueTypes.func,
  },
  data() {
    return {
      toggleOpen: false,
    };
  },
};
</script>

<style></style>
