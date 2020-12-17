import { toPairs } from "lodash";
import { FilterDef } from "./core/types";

const dataTypes = {
  interview: {
    color: "#815ec5",
    icon: "fas fa-microphone-alt",
    label: "Interview",
  },
  observation: {
    color: "#668f43",
    icon: "fas fa-clipboard",
    label: "Observation",
  },
  diary: {
    color: "#bb4983",
    icon: "fas fa-book",
    label: "Diary",
  },
};

export default {
  dataTypes,

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
      field: "type",
      type: "terms",
      values: toPairs(dataTypes).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
    },
    {
      label: "Tags",
      field: "tags",
      type: "terms",
    },
  ] as FilterDef[],
};
