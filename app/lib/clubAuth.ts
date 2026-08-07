export const clubs = {
  "geethi-vaadya": {
    label: "Chaitanya Geethi x Vaadya",
    eventSlugs: ["battle-of-the-bands"],
    passwordEnvKey: "GEETHI_VAADYA_PASSWORD",
  },
  udc: {
    label: "UDC",
    eventSlugs: ["hip-hop-dance"],
    passwordEnvKey: "UDC_PASSWORD",
  },
  laasya: {
    label: "Laasya",
    eventSlugs: ["classical-dance"],
    passwordEnvKey: "LAASYA_PASSWORD",
  },
} as const;

export type ClubId = keyof typeof clubs;