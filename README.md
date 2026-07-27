# Engagement Scanner — Clasificador de jugadores (Capstone)

Aplicación web estática que clasifica jugadores por **nivel de engagement**
(Low / Medium / High) y los asigna a un **segmento de comportamiento** con una
**acción de monetización sugerida**, usando el modelo entrenado en el notebook
del Capstone.

Todo el modelo corre **100% en el navegador** (JavaScript puro, sin backend):
ideal para publicarlo gratis con **GitHub Pages**. Ningún dato del jugador sale
del dispositivo de quien usa la herramienta.

## ¿Cómo se hizo?

1. En Python se entrenó un `DecisionTreeClassifier` (max_depth=16,
   min_samples_leaf=15) sobre el mismo pipeline de preprocesamiento del
   notebook (one-hot encoding de `Gender`, `Location`, `GameGenre`,
   `GameDifficulty`, con `drop_first=True`). Accuracy en test: **90.4%**
   (comparable al 91.2% del Random Forest de 100 árboles, pero ~600 veces más
   liviano al exportarlo — ideal para un sitio estático).
2. El árbol se exportó a JavaScript puro con [`m2cgen`](https://github.com/BayesWitnessMitanshu/m2cgen)
   (`js/model_rf.js`), sin necesitar TensorFlow.js ni ninguna librería de ML en
   el navegador.
3. El modelo de K-Means (segmentación) se reimplementó a mano en JS
   (`js/cluster_model.js`): solo son un promedio/desviación estándar por
   variable y 3 centroides — clasificar un jugador nuevo es calcular la
   distancia euclidiana a cada centroide.
4. `app.js` arma el vector de features en el mismo orden que el modelo de
   Python, corre ambos modelos, y muestra el resultado.


## Formato esperado del CSV (modo lote)

| Columna | Tipo | Valores válidos |
|---|---|---|
| Age | número | 10–100 |
| Gender | texto | Male, Female |
| Location | texto | USA, Europe, Asia, Other |
| GameGenre | texto | Action, RPG, Simulation, Sports, Strategy |
| GameDifficulty | texto | Easy, Medium, Hard |
| PlayTimeHours | número | horas promedio de juego |
| InGamePurchases | 0 o 1 | si el jugador compra dentro del juego |
| SessionsPerWeek | número entero | sesiones por semana |
| AvgSessionDurationMinutes | número entero | duración promedio de sesión |
| PlayerLevel | número entero | nivel del jugador |
| AchievementsUnlocked | número entero | logros desbloqueados |

No incluyas `PlayerID` ni `EngagementLevel` (esta última es justamente lo que
la herramienta predice).

## Limitaciones a tener en cuenta

- El modelo se entrenó con un dataset sintético/semi-sintético de Kaggle; los
  resultados reflejan patrones de **ese** dataset, no necesariamente los de
  un juego real en producción — antes de usarlo con datos reales, hay que
  reentrenar con datos propios.
- El feature importance del notebook mostró que `SessionsPerWeek` y
  `AvgSessionDurationMinutes` explican la mayoría de la predicción; esto
  sugiere una posible relación casi determinística en el dataset original
  entre esas variables y `EngagementLevel` (ver la revisión del notebook).
- El árbol de decisión (en vez del Random Forest completo) prioriza tamaño de
  archivo y velocidad en el navegador sobre el último punto porcentual de
  accuracy; la diferencia observada en test fue de 0.8 puntos porcentuales
  (90.4% vs 91.2%).
