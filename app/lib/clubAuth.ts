export const clubs = {
  "geethi-vaadya": {
    label: "Chaitanya Geethi x Vaadya",
    eventName: "Veni, Vidi, Vici.",
    eventSlugs: ["battle-of-the-bands"],
    passwordEnvKey: "GEETHI_VAADYA_PASSWORD",
  },
  udc: {
    label: "United Dance Crew",
    eventName: "3T's",
    eventSlugs: ["hip-hop-dance"],
    passwordEnvKey: "UDC_PASSWORD",
  },
  laasya: {
    label: "Laasya",
    eventName: "Aangikam",
    eventSlugs: ["classical-dance"],
    passwordEnvKey: "LAASYA_PASSWORD",
  },
  main: {
    label: "Main Admin (All Registrations)",
    eventName: "All Events",
    eventSlugs: [],
    passwordEnvKey: "MAIN_ADMIN_PASSWORD",
  },
} as const;

export type ClubId = keyof typeof clubs;