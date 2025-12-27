#!/usr/bin/env python3
"""
Helper script to get a valid Home Assistant Access Token for the CLI.
It looks for an existing refresh token named 'GEMINI_CLI' in .storage/auth.
If found, it signs a new JWT.
If not found, it creates the entry, saves it, and then signs the JWT.
"""

import json
import os
import secrets
import time
from datetime import datetime, timezone

import jwt

AUTH_STORAGE_PATH = "config/.storage/auth"
CLIENT_NAME = "GEMINI_CLI"


def get_access_token() -> None:
    if not os.path.exists(AUTH_STORAGE_PATH):
        print(f"Error: {AUTH_STORAGE_PATH} not found.")
        exit(1)

    with open(AUTH_STORAGE_PATH, "r") as f:
        auth_data = json.load(f)

    # 1. Try to find existing token
    refresh_tokens = auth_data["data"]["refresh_tokens"]
    token_entry = next((t for t in refresh_tokens if t.get("client_name") == CLIENT_NAME), None)

    if token_entry:
        # Found existing token, use it
        token_id = token_entry["id"]
        jwt_key = token_entry["jwt_key"]
    else:
        # 2. Create new token
        # Find a valid user (Owner/Admin)
        users = auth_data["data"]["users"]
        user = next((u for u in users if u["is_owner"]), None)
        if not user:
            user = next((u for u in users if u["is_active"]), None)

        if not user:
            print("Error: No active user found in auth storage.")
            exit(1)

        user_id = user["id"]

        # Generate Token Data
        token_id = secrets.token_hex(16)
        token_secret = secrets.token_hex(64)
        jwt_key = secrets.token_hex(64)

        new_token_entry = {
            "id": token_id,
            "user_id": user_id,
            "client_id": None,
            "client_name": CLIENT_NAME,
            "client_icon": None,
            "token_type": "long_lived_access_token",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "access_token_expiration": 315360000.0,  # 10 years
            "token": token_secret,
            "jwt_key": jwt_key,
            "last_used_at": None,
            "last_used_ip": None,
            "expire_at": None,
            "credential_id": None,
            "version": "2025.12.2",
        }

        auth_data["data"]["refresh_tokens"].append(new_token_entry)

        # Save back to storage
        with open(AUTH_STORAGE_PATH, "w") as f:
            json.dump(auth_data, f, indent=2)

    # 3. Mint JWT
    now = int(time.time())
    exp = now + 3600  # 1 hour

    payload = {"iss": token_id, "iat": now, "exp": exp}

    access_token = jwt.encode(payload, jwt_key, algorithm="HS256")
    print(access_token)


if __name__ == "__main__":
    get_access_token()
