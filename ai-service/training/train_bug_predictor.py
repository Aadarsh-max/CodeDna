import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "training_data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "bug_predictor.pkl")

FEATURES = ["complexity_score", "lines_of_code", "import_count", "function_count"]


def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("Accuracy:", round(accuracy_score(y_test, y_pred), 3))
    print()
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=["Clean", "Risky"]))
    print("Confusion matrix (rows=actual, cols=predicted):")
    print(confusion_matrix(y_test, y_pred))

    print()
    print("Feature importance:")
    for feature, importance in zip(FEATURES, model.feature_importances_):
        print(f"  {feature}: {round(importance, 3)}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()