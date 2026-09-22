import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, recall_score
from tensorflow import keras
from tensorflow.keras import layers

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "training_data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "models")
MLP_MODEL_PATH = os.path.join(MODEL_DIR, "bug_predictor_mlp.keras")
RF_MODEL_PATH = os.path.join(MODEL_DIR, "bug_predictor.pkl")

FEATURES = ["complexity_score", "lines_of_code", "import_count", "function_count"]


def build_model(input_dim: int) -> keras.Model:
    model = keras.Sequential([
        keras.Input(shape=(input_dim,)),
        layers.Dense(32, activation="relu"),
        layers.Dropout(0.2),
        layers.Dense(16, activation="relu"),
        layers.Dense(1, activation="sigmoid"),
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    mean = X_train.mean()
    std = X_train.std()
    X_train_scaled = (X_train - mean) / std
    X_test_scaled = (X_test - mean) / std

    class_weight_values = compute_class_weight(
        class_weight="balanced", classes=np.unique(y_train), y=y_train
    )
    class_weight_dict = dict(enumerate(class_weight_values))

    model = build_model(input_dim=len(FEATURES))

    model.fit(
        X_train_scaled,
        y_train,
        epochs=50,
        batch_size=16,
        class_weight=class_weight_dict,
        validation_split=0.1,
        verbose=0,
    )

    mlp_probabilities = model.predict(X_test_scaled, verbose=0).flatten()
    mlp_predictions = (mlp_probabilities >= 0.5).astype(int)

    print("=" * 50)
    print("MLP (Neural Network) Results")
    print("=" * 50)
    print("Accuracy:", round(accuracy_score(y_test, mlp_predictions), 3))
    print()
    print("Classification report:")
    print(classification_report(y_test, mlp_predictions, target_names=["Clean", "Risky"]))
    print("Confusion matrix (rows=actual, cols=predicted):")
    print(confusion_matrix(y_test, mlp_predictions))

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MLP_MODEL_PATH)

    scaler_params = {"mean": mean.to_dict(), "std": std.to_dict()}
    joblib.dump(scaler_params, os.path.join(MODEL_DIR, "mlp_scaler.pkl"))

    print(f"\nModel saved to {MLP_MODEL_PATH}")

    if os.path.exists(RF_MODEL_PATH):
        rf_model = joblib.load(RF_MODEL_PATH)
        rf_predictions = rf_model.predict(X_test)

        rf_accuracy = accuracy_score(y_test, rf_predictions)
        rf_recall = recall_score(y_test, rf_predictions)
        mlp_accuracy = accuracy_score(y_test, mlp_predictions)
        mlp_recall = recall_score(y_test, mlp_predictions)

        print("\n" + "=" * 50)
        print("Comparison: Random Forest vs MLP (same test set)")
        print("=" * 50)
        print(f"{'Metric':<25}{'Random Forest':<18}{'MLP':<18}")
        print(f"{'Accuracy':<25}{round(rf_accuracy, 3):<18}{round(mlp_accuracy, 3):<18}")
        print(f"{'Risky Recall':<25}{round(rf_recall, 3):<18}{round(mlp_recall, 3):<18}")
    else:
        print("\nRandom Forest model not found — skipping comparison. Run train_bug_predictor.py first.")


if __name__ == "__main__":
    main()