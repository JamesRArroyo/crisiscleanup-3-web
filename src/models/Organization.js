import { Model } from '@vuex-orm/core';
import Incident from '@/models/Incident';

export default class Organization extends Model {
  static entity = 'organizations';

  static fields() {
    return {
      id: this.attr(),
      name: this.string(''),
      url: this.string(''),
      facebook: this.string(''),
      twitter: this.string(''),
      affiliates: this.attr([]),
      primary_location: this.attr(null),
      secondary_location: this.attr(null),
      type_t: this.attr(null),
      user_count: this.attr(null),
      incidents: this.attr(null),
      incident_primary_contacts: this.attr(null),
      primary_contacts: this.attr(null),
      files: this.attr(null),
      custom_ops_message: this.attr(null),
      custom_legal_tos: this.attr(null),
      custom_legal_survivor_waiver: this.attr(null),
    };
  }

  get incident_list() {
    return Incident.query()
      .whereIdIn(this.incidents)
      .get();
  }

  static apiConfig = {
    actions: {
      addFile(id, file, type) {
        return this.post(
          `/organizations/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      deleteFile(id, file) {
        return this.delete(
          `/organizations/${id}/files`,
          {
            data: { file },
          },
          { save: false },
        );
      },
      approve(id) {
        return this.post(`/organizations/${id}/approve`, {}, { save: false });
      },

      reject(id) {
        return this.post(`/organizations/${id}/reject`, {}, { save: false });
      },
    },
  };
}
