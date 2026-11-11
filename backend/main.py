from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, rag, documents, mess_menu, announcements, complaints, overview

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HostelIQ AI — Production Backend for University Hostel & Mess Management"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
