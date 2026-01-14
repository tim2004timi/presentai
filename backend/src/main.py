import asyncio

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Info

from src.auth import router as auth_router
from src.config import settings
from src.database import check_db_connection, create_tables
from src.routers.user import router as user_router
from src.routers.inputform import router as inputform_router
from src.routers.cards import router as cards_router
from src.routers.presentation import router as presentation_router

app_info = Info('fastapi_app_info', 'FastAPI application information')
app_info.info({'app_name': 'presentai-backend', 'version': '1.0.0'})

app = FastAPI(
    title="PresentAI API",
    description="API для работы с PresentAI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

instrumentator = Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=["/metrics"],
    inprogress_name="fastapi_requests_in_progress",
    inprogress_labels=True,
)
instrumentator.instrument(app).expose(app)

@app.on_event("startup")
async def startup_event():
    await create_tables()
    if await check_db_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")

main_router = APIRouter(prefix="/api")
main_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
main_router.include_router(user_router, tags=["Users"])
main_router.include_router(inputform_router, tags=["Input Forms"])
main_router.include_router(cards_router, tags=["Card Lists"])
main_router.include_router(presentation_router, tags=["Presentations"])


app.include_router(main_router)


