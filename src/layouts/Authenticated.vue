<template>
  <Loader :loading="loading" :class="loading && 'flex layout h-full'">
    <template #content>
      <div class="layout">
        <NavMenu :routes="routes" class="sidebar--grid" />
        <div class="shadow header--grid bg-white">
          <div class="flex justify-between h-full items-center">
            <div class="flex items-center ml-2">
              <div class="h-10 w-10 flex items-center">
                <DisasterIcon
                  v-if="currentIncident && currentIncident.incidentImage"
                  :current-incident="currentIncident"
                />
              </div>
              <div class="flex flex-col ml-2 w-84">
                <form-select
                  :key="currentIncidentId"
                  :value="currentIncident"
                  :options="incidents"
                  :clearable="false"
                  searchable
                  select-classes="h-12"
                  item-key="id"
                  label="name"
                  @input="handleChange"
                />
                <div class="flex ml-2 font-bold">
                  <span>{{ selectedRoute }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center overflow-hidden">
              <v-popover popover-class="menu-popover" placement="bottom-end">
                <div class="flex cursor-pointer items-center">
                  <img
                    :src="currentUser && currentUser.profilePictureUrl"
                    class="rounded-full w-10 h-10"
                  />
                  <span class="p-3">
                    {{ name }}
                    <font-awesome-icon
                      class="cursor-pointer"
                      icon="caret-down"
                    />
                  </span>
                </div>
                <div slot="popover" class="flex flex-col">
                  <router-link
                    to="/profile"
                    class="router-link text-base p-2 hover:bg-crisiscleanup-light-grey"
                    >Profile</router-link
                  >
                  <!--                <button v-can="['update_portal_settings']">New</button>-->
                  <div
                    class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
                    @click="
                      () => {
                        $store.dispatch('auth/logout');
                      }
                    "
                  >
                    Logout
                  </div>
                </div>
              </v-popover>
            </div>
          </div>
        </div>
        <div v-if="ready" class="main--grid overflow-auto">
          <slot />
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import Incident from '@/models/Incident';
import User from '@/models/User';
import WorkType from '@/models/WorkType';
import Organization from '@/models/Organization';
import Status from '@/models/Status';
import Language from '@/models/Language';
import Role from '@/models/Role';
import { i18nService } from '@/services/i18n.service';
import NavMenu from '@/components/navigation/NavMenu';
import Loader from '@/components/Loader';
import Vue from 'vue';
import Acl from 'vue-browser-acl';
import DisasterIcon from '../components/DisasterIcon';

export default {
  name: 'Authenticated',
  components: { DisasterIcon, NavMenu, Loader },
  data() {
    return {
      loading: false,
      ready: false,
    };
  },
  computed: {
    name() {
      if (this.currentUser) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      }
      return '';
    },
    selectedRoute() {
      return this.$t(this.$route.name);
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
    },
    currentIncident() {
      return Incident.find(this.currentIncidentId);
    },
    routes() {
      return [
        {
          key: 'dashboard',
          text: this.$t('nav.dashboard'),
          to: `/incident/${this.currentIncidentId}/dashboard`,
        },
        {
          key: 'cases',
          to: `/incident/${this.currentIncidentId}/cases/new`,
        },
        {
          key: 'my_organization',
          icon: 'organization',
          iconSize: 'large',
          to: '/organization/invitations',
        },
        {
          key: 'phone',
          icon: 'phone',
          text: this.$t('dashboard.phone'),
          to: '/phone',
        },
      ];
    },
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('auth', ['user']),
  },
  watch: {
    '$route.params.incident_id': {
      handler(value) {
        if (value && Number(this.currentIncidentId) !== Number(value)) {
          this.handleChange(value);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    this.loading = true;
    await Promise.all([
      User.api().get('/users/me', {}),
      Incident.api().get(
        '/incidents?fields=id,name,short_name,geofence,locations&limit=150&ordering=-start_at',
        {
          dataKey: 'results',
        },
      ),
      WorkType.api().get('/work_types?limit=100', {
        dataKey: 'results',
      }),
      Status.api().get('/statuses?limit=100', {
        dataKey: 'results',
      }),
      Organization.api().get(
        `/organizations/${this.user.user_claims.organization.id}`,
      ),
      Language.api().get('/languages', {
        dataKey: 'results',
      }),
      Role.api().get('/roles', {
        dataKey: 'results',
      }),
    ]);
    await this.setupLanguage();
    this.setupAcl();

    let incidentId = this.$route.params.incident_id;
    if (!incidentId) {
      const incident = Incident.query()
        .orderBy('id', 'desc')
        .first();
      if (incident) {
        incidentId = incident.id;
      }
    }

    if (this.currentUser.states && this.currentUser.states.incident) {
      incidentId = this.currentUser.states.incident;
    }

    if (incidentId) {
      this.setCurrentIncidentId(incidentId);
    }

    try {
      await Incident.api().fetchById(incidentId);
    } catch (e) {
      this.setCurrentIncidentId(null);
      User.api().updateUserState({
        incident: null,
      });
      await this.$router.push(`/dashboard`);
    }

    this.loading = false;
    this.ready = true;
  },
  methods: {
    async handleChange(value) {
      this.ready = false;
      await Incident.api().fetchById(value);
      this.ready = true;
      User.api().updateUserState({
        incident: value,
      });
      this.setCurrentIncidentId(value);
      await this.$router.push({
        name: this.$route.name,
        params: { ...this.$route.params, incident_id: value },
      });
    },
    async setupLanguage() {
      let currentLanguage = detectBrowserLanguage();
      const userLanguage =
        Language.find(this.currentUser.primary_language) ||
        Language.find(this.currentUser.secondary_language);
      if (userLanguage) {
        currentLanguage = userLanguage.subtag;
      }

      this.setLanguage(currentLanguage);
      if (currentLanguage !== this.$i18n.locale) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            this.$i18n.setLocaleMessage(currentLanguage, translations);
            this.$i18n.locale = currentLanguage;
            this.$http.defaults.headers.common[
              'Accept-Language'
            ] = currentLanguage;
            document
              .querySelector('html')
              .setAttribute('lang', currentLanguage);
          }
        } catch (e) {
          this.$log.error(e);
        }
      }

      this.$moment.locale(currentLanguage.split('-')[0]);
    },
    setupAcl() {
      Vue.use(Acl, this.user, acl => {
        const { permissions } = this.user.user_claims;
        Object.keys(permissions).forEach(permissionKey => {
          acl.rule(
            permissionKey,
            this.user.user_claims.permissions[permissionKey],
          );
        });
      });
    },
    ...mapActions('auth', ['login']),
    ...mapMutations('incident', ['setCurrentIncidentId']),
    ...mapMutations('loading', ['setWorksitesLoading']),
    ...mapMutations('locale', ['setLanguage']),
  },
};
</script>

<style>
body {
  font-family: 'Nunito Sans', sans-serif;
  overflow: hidden;
}

.content {
  max-height: 100%;
}

#app .router-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.router-link:hover {
  text-decoration: none !important;
}

.router-link:active {
  text-decoration: none !important;
}

.router-link {
  text-decoration: none !important;
}

.incident-select .ant-select-selection {
  border: 0;
  box-shadow: none;
}

.menu-popover {
  @apply bg-white text-black outline-none w-full border mt-4 shadow w-48;
  left: 0.75rem !important;
  z-index: 100;
}

.layout {
  height: 100vh;
  display: grid;
  grid-template-columns: 8rem auto;
  grid-template-rows: 4.5rem auto;
  grid-template-areas:
    'sidebar header'
    'sidebar main';
}

.sidebar--grid {
  grid-area: sidebar;
}

.header--grid {
  grid-area: header;
}

.main--grid {
  grid-area: main;
}
</style>
