export const clubs = {
  "geethi-vaadya": {
    label: "Chaitanya Geethi x Vaadya",
    eventName: "Veni, Vidi, Vici.",
    eventSlugs: ["battle-of-the-bands"],
    passwordEnvKey: "GEETHI_VAADYA_PASSWORD",
  },
  udc: {
    label: "UDC",
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
} as const;

export type ClubId = keyof typeof clubs;