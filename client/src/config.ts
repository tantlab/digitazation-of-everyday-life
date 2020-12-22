import { toPairs } from "lodash";
import { FilterDef } from "./core/types";

const dataTypes = {
  interview: {
    color: "#9c6ec2",
    icon: "fas fa-microphone-alt",
    label: "Interview",
  },
  observation: {
    color: "#ba883e",
    icon: "fas fa-clipboard",
    label: "Observation",
  },
  diary: {
    color: "#4cab98",
    icon: "fas fa-book",
    label: "Diary",
  },
  "mobile-ethnography": {
    color: "#cb5362",
    icon: "fas fa-mobile-alt",
    label: "Mobile Ethnography",
  },
};

export default {
  dataTypes,
  api_url: "/api",
  assets_url: "/data/images",
  datesBoundaries: {
    min: "1900-01-01",
    max: "2022-01-01",
  },

  docMetadataLabels: {
    participant_i_o_me: "Participant",
    age_i_me: "Age",
    job_i_me: "Job",
    residence_i_me: "Residence",
    analytic_note_i_o: "Analytic note",
  } as Record<string, string>,

  filters: [
    {
      label: "Date",
      field: "date",
      type: "dates",
    },
    {
      label: "Doc type",
      field: "protocol_type_i_o_me",
      type: "terms",
      values: toPairs(dataTypes).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
    },
    {
      label: "User Tags",
      field: "user_tags",
      type: "terms",
    },
    {
      label: "Machine Tags",
      field: "machine_tags",
      type: "terms",
    },
    {
      label: "Informant job",
      field: "job_i_me",
      type: "terms",
    },
  ] as FilterDef[],
};
