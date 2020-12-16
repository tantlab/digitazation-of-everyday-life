export default {
  dataTypes: {
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
  },

  docMetadataLabels: {
    participant_i_o_me: "Participant",
    age_i_me: "Age",
    job_i_me: "Job",
    residence_i_me: "Residence",
    analytic_note_i_o: "Analytic note",
  } as Record<string, string>,
};
