from fastapi import Request
from fastapi.responses import JSONResponse


class RepositoryProcessingError(Exception):
    def __init__(self, message: str):
        self.message = message


class InvalidRequestError(Exception):
    def __init__(self, message: str):
        self.message = message


async def repository_processing_error_handler(request: Request, exc: RepositoryProcessingError):
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": exc.message},
    )


async def invalid_request_error_handler(request: Request, exc: InvalidRequestError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": exc.message},
    )


async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )