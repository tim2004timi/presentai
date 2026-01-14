import pytest
from pathlib import Path
from src.utils import get_password_hash, verify_password, _is_image_file


class TestPasswordHashing:
    """Тесты для функций хеширования паролей"""
    
    def test_get_password_hash_creates_hash(self):
        """Тест: хеш пароля создается и отличается от исходного пароля"""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert isinstance(hashed, str)
    
    def test_get_password_hash_different_hashes(self):
        """Тест: одинаковые пароли дают разные хеши (из-за соли)"""
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
    
    def test_verify_password_correct_password(self):
        """Тест: правильный пароль проходит проверку"""
        password = "correct_password"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect_password(self):
        """Тест: неправильный пароль не проходит проверку"""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty_password(self):
        """Тест: пустой пароль не проходит проверку с непустым хешем"""
        password = "some_password"
        hashed = get_password_hash(password)
        
        assert verify_password("", hashed) is False
    
    def test_verify_password_bytes_input(self):
        """Тест: функция работает с байтовыми строками"""
        password = "test_password"
        hashed = get_password_hash(password)
        
        assert verify_password(password.encode("utf-8"), hashed) is True
        assert verify_password(password, hashed.encode("utf-8")) is True


class TestImageFileDetection:
    """Тесты для функции определения типа файла"""
    
    def test_is_image_file_jpg(self):
        """Тест: JPG файл определяется как изображение"""
        file_path = Path("test.jpg")
        assert _is_image_file(file_path) is True
    
    def test_is_image_file_jpeg(self):
        """Тест: JPEG файл определяется как изображение"""
        file_path = Path("test.jpeg")
        assert _is_image_file(file_path) is True
    
    def test_is_image_file_png(self):
        """Тест: PNG файл определяется как изображение"""
        file_path = Path("test.png")
        assert _is_image_file(file_path) is True
    
    def test_is_image_file_webp(self):
        """Тест: WEBP файл определяется как изображение"""
        file_path = Path("test.webp")
        assert _is_image_file(file_path) is True
    
    def test_is_image_file_pdf(self):
        """Тест: PDF файл не определяется как изображение"""
        file_path = Path("test.pdf")
        assert _is_image_file(file_path) is False
    
    def test_is_image_file_txt(self):
        """Тест: TXT файл не определяется как изображение"""
        file_path = Path("test.txt")
        assert _is_image_file(file_path) is False
    
    def test_is_image_file_pptx(self):
        """Тест: PPTX файл не определяется как изображение"""
        file_path = Path("test.pptx")
        assert _is_image_file(file_path) is False
    
    def test_is_image_file_case_insensitive(self):
        """Тест: функция работает с разным регистром расширений"""
        assert _is_image_file(Path("test.JPG")) is True
        assert _is_image_file(Path("test.PNG")) is True
        assert _is_image_file(Path("test.JPEG")) is True

