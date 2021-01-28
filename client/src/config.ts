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
    job_category_i_me: "Job Cateory",
    residence_i_me: "Residence",
    residence_region_i_me: "Region",
    analytic_note_i_o: "Analytic note",
    duration_observed_o: "Duration observed",
    media_o: "Media",
    extra_o: "Extra",
    notes_o: "Note",
    people_o: "People",
    platform_o: "Platform",
    researcher_i_o: "Researcher",
    quotations_o: "Quotation",
    housemates_i_me: "Housemates",
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
      label: "Job category",
      field: "job_category_i_me",
      type: "terms",
    },
    {
      label: "Housemates",
      field: "housemates_i_me",
      type: "terms",
    },
    {
      label: "Age",
      field: "age_i_me",
      type: "terms",
    },
    {
      label: "Region",
      field: "residence_region_i_me",
      type: "terms",
    },
  ] as FilterDef[],
};
