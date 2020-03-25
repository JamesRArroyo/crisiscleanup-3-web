<template>
  <Loader :loading="loading" class="h-full overflow-auto">
    <template #content>
      <div class="gateway--container">
        <div class="step">
          <base-text class="title" variant="h1">{{ lang.title }}</base-text>
          <base-text>{{ lang.detail }}</base-text>
        </div>
        <div v-for="s in lang.steps" :key="`step_${s}`" class="step">
          <base-text variant="h1">{{ s.title }}</base-text>
          <base-text>{{ s.body }}</base-text>
        </div>
        <div class="action">
          <base-text variant="h2">{{ lang.action.title }}</base-text>
          <base-button variant="outline" size="large" :action="authenticate">{{
            lang.action.button
          }}</base-button>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { EventBus } from '@/event-bus';
import Loader from '@/components/Loader.vue';

export default {
  name: 'PhoneGateway',
  components: {
    Loader,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    lang() {
      return {
        title: this.$t('phoneGateway.welcome_to_phone_center'),
        detail: this.$t('phoneGateway.system_intro'),
        steps: [
          {
            title: this.$t('phoneGateway.step_one'),
            body: this.$t('phoneGateway.step_one_description'),
          },
          {
            title: this.$t('phoneGateway.step_two'),
            body: this.$t('phoneGateway.step_two_description'),
          },
        ],
        action: {
          title: this.$t('phoneGateway.ready_question'),
          button: this.$t('actions.lets_do_it'),
        },
      };
    },
  },
  methods: {
    authenticate() {
      this.loading = true;
      EventBus.$emit('acs:requestAgent');
    },
  },
};
</script>

<style lang="scss" scoped>
.gateway {
  &--container {
    @apply h-full pb-16;
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;

    p.title {
      @apply text-3xl;
    }

    .step {
      @apply my-8;
      display: flex;
      flex-grow: 1;
      width: 80%;
      flex-direction: column;
      p {
        @apply py-2;
        &:last-child {
          text-align: center;
          align-self: center;
        }
      }
    }

    .action {
      p {
        text-align: center;
        @apply pb-4;
      }
      justify-self: flex-end;
    }
  }
}
</style>
