from __future__ import annotations

from pymongo import MongoClient
from pymongo.database import Database


class Mongo:
    _client: MongoClient | None = None
    _db: Database | None = None

    def connect(self, mongodb_uri: str) -> None:
        self._client = MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )
        self._db = self._client.get_default_database()

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None
            self._db = None

    @property
    def client(self) -> MongoClient:
        if self._client is None:
            raise RuntimeError("Mongo is not connected")
        return self._client

    @property
    def db(self) -> Database:
        if self._db is None:
            raise RuntimeError("Mongo is not connected")
        return self._db

    def ping(self) -> None:
        self.client.admin.command("ping")


mongo = Mongo()
