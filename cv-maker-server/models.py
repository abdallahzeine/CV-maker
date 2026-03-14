# CV data shapes — mirrors frontend src/types.ts
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class CVHeader(BaseModel):
    name: str
    location: str
    phone: str
    email: str


class SkillGroup(BaseModel):
    id: str
    label: str
    value: str


class CVItem(BaseModel):
    id: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date: Optional[str] = None
    role: Optional[str] = None
    bullets: Optional[list[str]] = None
    skillGroups: Optional[list[SkillGroup]] = None
    body: Optional[str] = None


class CVSection(BaseModel):
    id: str
    type: str
    title: str
    items: list[CVItem]


class CVData(BaseModel):
    header: CVHeader
    sections: list[CVSection]


class AISettings(BaseModel):
    provider: str
    model: str
    apiKey: str
    baseUrl: Optional[str] = None
