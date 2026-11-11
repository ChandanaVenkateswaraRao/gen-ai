from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, rag, documents, mess_menu, announcements, complaints, overview

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HostelIQ AI — Production Backend for University Hostel & Mess Management"
)

# CORS Middleware (allows any origin dynamically while supporting credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) or "Internal server error"}
    )

# Register Sub-Routers
app.include_router(auth.router)
app.include_router(rag.router)
app.include_router(documents.router)
app.include_router(mess_menu.router)
app.include_router(announcements.router)
app.include_router(complaints.router)
app.include_router(overview.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HostelIQ AI Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
