const CLUSTER_MODEL = {
  "features": [
    "PlayTimeHours",
    "SessionsPerWeek",
    "AvgSessionDurationMinutes",
    "InGamePurchases",
    "AchievementsUnlocked"
  ],
  "mean": [
    12.024365373325825,
    9.471773992106709,
    94.79225158615178,
    0.20085427386721286,
    24.52647749412999
  ],
  "scale": [
    6.914551545226352,
    5.763595140246879,
    49.0107624130006,
    0.40063928231825635,
    14.430545945616899
  ],
  "centroids": [
    [
      -0.0015066461888024272,
      0.876643293022494,
      -0.0009121127630817663,
      -0.5013344490461679,
      0.000806854691905344
    ],
    [
      0.007481778210345132,
      -0.8609876648159275,
      0.003921206642285041,
      -0.5013344490461693,
      -0.0008844871190598815
    ],
    [
      -0.012100793763840543,
      0.010237665939307146,
      -0.006101299702127491,
      1.9946764119302982,
      0.00019471944755392113
    ]
  ],
  "labels": {
    "0": "Frecuencia alta | No-spender",
    "1": "Frecuencia baja | No-spender",
    "2": "Frecuencia media | Spender"
  },
  "actions": {
    "0": "Recompensar retencion: battle pass, contenido exclusivo por racha de sesiones",
    "1": "Reactivacion: notificaciones, misiones cortas, incentivos de bajo costo",
    "2": "Monetizacion directa: bundles VIP, ofertas personalizadas"
  }
};
