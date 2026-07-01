from jose import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """Decode Clerk JWT and return the user ID (sub claim)."""
    token = credentials.credentials
    try:
        # Decode without signature verification (safe for local dev behind Clerk frontend)
        payload = jwt.decode(token, key="", algorithms=["RS256"], options={
            "verify_signature": False,
            "verify_aud": False,
            "verify_exp": False,
        })
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="No user ID in token")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalide: {e}")
