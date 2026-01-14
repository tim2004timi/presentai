"""Конфигурация pytest и фикстуры для тестов"""
import os


def pytest_configure(config):
    """Устанавливает переменные окружения для тестов до импорта модулей"""
    os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
    os.environ.setdefault("SECRET_KEY", "test_secret_key_for_testing_only")
    os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    os.environ.setdefault("OPENAI_API_KEY", "test_openai_key")
    os.environ.setdefault("OPENAI_MODEL", "gpt-4o-mini")

