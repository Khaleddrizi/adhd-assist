"""
Database layer: models, connection, repositories.
"""
from backend.database.models import (  # noqa: F401
    Base,
    UserModel,
    SpecialistModel,
    ParentModel,
    PatientModel,
    TrainingProgramModel,
    QuestionModel,
    QuizSessionModel,
)
from backend.database.connection import engine, SessionLocal, init_db, get_db
from backend.database.repositories import (
    UserRepository,
    SpecialistRepository,
    ParentRepository,
    PatientRepository,
    QuestionRepository,
    SessionRepository,
    create_standalone_parent_with_shadow,
)

__all__ = [
    "Base",
    "UserModel",
    "SpecialistModel",
    "ParentModel",
    "PatientModel",
    "TrainingProgramModel",
    "QuestionModel",
    "QuizSessionModel",
    "engine",
    "SessionLocal",
    "init_db",
    "get_db",
    "UserRepository",
    "SpecialistRepository",
    "ParentRepository",
    "PatientRepository",
    "QuestionRepository",
    "SessionRepository",
    "create_standalone_parent_with_shadow",
]
