const MODEL_META = {
  "feature_order": [
    "Age",
    "PlayTimeHours",
    "InGamePurchases",
    "SessionsPerWeek",
    "AvgSessionDurationMinutes",
    "PlayerLevel",
    "AchievementsUnlocked",
    "Gender_Male",
    "Location_Europe",
    "Location_Other",
    "Location_USA",
    "GameGenre_RPG",
    "GameGenre_Simulation",
    "GameGenre_Sports",
    "GameGenre_Strategy",
    "GameDifficulty_Hard",
    "GameDifficulty_Medium"
  ],
  "categorical_dummy_map": {
    "Gender": {
      "drop": "Female",
      "dummies": [
        "Male"
      ]
    },
    "Location": {
      "drop": "Asia",
      "dummies": [
        "Europe",
        "Other",
        "USA"
      ]
    },
    "GameGenre": {
      "drop": "Action",
      "dummies": [
        "RPG",
        "Simulation",
        "Sports",
        "Strategy"
      ]
    },
    "GameDifficulty": {
      "drop": "Easy",
      "dummies": [
        "Hard",
        "Medium"
      ]
    }
  },
  "class_order": [
    "Low",
    "Medium",
    "High"
  ],
  "test_accuracy": 0.9043337080054952,
  "test_classification_report": {
    "Low": {
      "precision": 0.8912071535022354,
      "recall": 0.8687651331719128,
      "f1-score": 0.8798430603236881,
      "support": 2065.0
    },
    "Medium": {
      "precision": 0.9016189290161893,
      "recall": 0.9341935483870968,
      "f1-score": 0.917617237008872,
      "support": 3875.0
    },
    "High": {
      "precision": 0.9231935320869126,
      "recall": 0.8838896952104499,
      "f1-score": 0.903114186851211,
      "support": 2067.0
    },
    "accuracy": 0.9043337080054952,
    "macro avg": {
      "precision": 0.9053398715351125,
      "recall": 0.8956161255898198,
      "f1-score": 0.9001914947279236,
      "support": 8007.0
    },
    "weighted avg": {
      "precision": 0.9045032037896213,
      "recall": 0.9043337080054952,
      "f1-score": 0.9041313522167164,
      "support": 8007.0
    }
  },
  "test_confusion_matrix": [
    [
      1794,
      219,
      52
    ],
    [
      155,
      3620,
      100
    ],
    [
      64,
      176,
      1827
    ]
  ],
  "model_type": "DecisionTreeClassifier(max_depth=16, min_samples_leaf=15)",
  "trained_on": "100% del dataset (40034 registros) para el modelo de produccion"
};
